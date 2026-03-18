import { SoftwareRenderer } from './render/SoftwareRenderer.js';
import { PlayerController } from './player/PlayerController.js';
import { ChunkManager } from './world/ChunkManager.js';
import { ChunkMesher } from './world/ChunkMesher.js';
import { ChunkStore } from './world/ChunkStore.js';
import { TerrainGenerator } from './world/TerrainGenerator.js';
import { normalizeRuntimeConfig } from './world/WorldConfig.js';

const SESSION_STATES = Object.freeze({
    BOOTING: 'booting',
    RUNNING: 'running',
    PAUSED: 'paused',
    SAVING: 'saving',
    DESTROYED: 'destroyed'
});

const POINTER_LOCK_HINT = 'Clique na cena para capturar o mouse. Use WASD para andar, espaco para pular, P para pausar e ESC para liberar o cursor.';

export class GameApp {
    constructor(options) {
        this.root = options.root;
        this.canvas = options.canvas;
        this.worldMeta = options.worldMeta;
        this.userConfig = normalizeRuntimeConfig(options.userConfig);
        this.overlay = options.overlay;
        this.crosshair = options.crosshair;
        this.pauseMenu = options.pauseMenu;
        this.repository = options.repository;
        this.initialSaveState = options.saveState || null;
        this.running = false;
        this.sessionState = SESSION_STATES.BOOTING;
        this.frameHandle = null;
        this.lastFrameTime = 0;
        this.hudElapsed = 0;
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.loop = this.loop.bind(this);
    }

    async start() {
        if (!this.canvas) {
            throw new Error('A pagina do jogo nao encontrou o canvas principal para iniciar a cena.');
        }

        this.overlay.setWorldName(this.worldMeta.nome || 'Mundo');
        this.overlay.setStatus('Gerando chunks iniciais...');
        this.overlay.setChunkCount(0);

        this.renderer = new SoftwareRenderer(this.canvas);
        this.terrain = new TerrainGenerator(this.worldMeta.seed, this.worldMeta.algorithm_version);
        this.chunkStore = new ChunkStore();
        this.chunkMesher = new ChunkMesher(this.terrain);
        this.chunkManager = new ChunkManager({
            store: this.chunkStore,
            mesher: this.chunkMesher,
            renderDistance: this.userConfig.render_distance
        });

        const spawnPose = this.resolveSpawnPose(this.initialSaveState);
        this.player = new PlayerController({
            terrain: this.terrain,
            canvas: this.canvas,
            config: this.userConfig,
            spawn: spawnPose
        });

        if (this.pauseMenu) {
            this.pauseMenu.onResume = () => {
                this.resume(true);
            };

            this.pauseMenu.onSaveAndExit = () => {
                void this.saveAndExit();
            };

            this.pauseMenu.hide();
        }

        this.player.onPointerLockChange = (locked) => {
            this.handlePointerLockChange(locked);
        };

        this.player.attach();
        this.player.setGameplayEnabled(true);
        this.chunkManager.primeInitialChunks(spawnPose, 10);
        this.overlay.setCoords(this.player.getFeetPosition());
        this.overlay.setChunkCount(this.chunkManager.getLoadedChunkCount());
        this.overlay.hideBlocking();
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.hide();
        this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks());

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        this.running = true;
        this.sessionState = SESSION_STATES.RUNNING;
        this.lastFrameTime = performance.now();
        this.frameHandle = window.requestAnimationFrame(this.loop);
    }

    resolveSpawnPose(saveState) {
        const proceduralSpawn = this.terrain.findSpawnPoint();
        const fallbackPose = {
            x: proceduralSpawn.x,
            y: proceduralSpawn.y,
            z: proceduralSpawn.z,
            yaw: 0,
            pitch: -0.12
        };

        if (!saveState || !saveState.player || !saveState.player.position || !saveState.player.rotation) {
            return fallbackPose;
        }

        const position = saveState.player.position;
        const rotation = saveState.player.rotation;
        const x = Number(position.x);
        const y = Number(position.y);
        const z = Number(position.z);
        const yaw = Number(rotation.yaw);
        const pitch = Number(rotation.pitch);

        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z) || !Number.isFinite(yaw) || !Number.isFinite(pitch)) {
            return fallbackPose;
        }

        if (!this.terrain.isInsideWorld(x, z)) {
            return fallbackPose;
        }

        const supportHeight = this.terrain.getSurfaceHeightAt(x, z);

        return {
            x: x,
            y: Math.max(y, supportHeight),
            z: z,
            yaw: yaw,
            pitch: pitch
        };
    }

    handlePointerLockChange(locked) {
        if (!this.overlay || !this.crosshair) {
            return;
        }

        if (this.sessionState !== SESSION_STATES.RUNNING) {
            this.crosshair.hide();
            this.overlay.hideInstruction();
            return;
        }

        if (locked) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Explorando o terreno procedural.');
            this.crosshair.show();
            return;
        }

        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.hide();
    }

    getChunkDrainBudget(deltaTime) {
        if (deltaTime > 0.024) {
            return 1;
        }

        if (this.chunkManager.getPendingCount() > 18 && deltaTime < 0.014) {
            return 3;
        }

        return 2;
    }

    loop(timestamp) {
        if (!this.running) {
            return;
        }

        const deltaTime = Math.min(0.033, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
        this.lastFrameTime = timestamp;

        const actions = this.player ? this.player.consumeInputActions() : { togglePause: false };

        if (actions.togglePause) {
            if (this.sessionState === SESSION_STATES.RUNNING) {
                this.pause();
            } else if (this.sessionState === SESSION_STATES.PAUSED) {
                this.resume(false);
            }
        }

        if (this.sessionState === SESSION_STATES.RUNNING) {
            this.hudElapsed += deltaTime;
            this.player.update(deltaTime);

            const feetPosition = this.player.getFeetPosition();
            const chunkWindowChanged = this.chunkManager.update(feetPosition);
            const generatedChunks = this.chunkManager.drainQueue(this.getChunkDrainBudget(deltaTime));

            this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks());

            if (this.hudElapsed >= 0.12 || chunkWindowChanged || generatedChunks > 0) {
                this.overlay.setCoords(feetPosition);
                this.overlay.setChunkCount(this.chunkManager.getLoadedChunkCount());
                this.hudElapsed = 0;
            }
        }

        this.frameHandle = window.requestAnimationFrame(this.loop);
    }

    pause() {
        if (this.sessionState !== SESSION_STATES.RUNNING) {
            return;
        }

        this.sessionState = SESSION_STATES.PAUSED;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.crosshair.hide();
        this.overlay.hideInstruction();
        this.overlay.setStatus('Jogo pausado.');

        if (this.pauseMenu) {
            this.pauseMenu.setSaving(false);
            this.pauseMenu.show('A partida foi pausada. Retorne ao jogo ou salve e volte ao menu principal.');
        }
    }

    resume(requestPointerLock) {
        if (this.sessionState !== SESSION_STATES.PAUSED) {
            return;
        }

        this.sessionState = SESSION_STATES.RUNNING;
        this.player.setGameplayEnabled(true);
        this.player.resetTransientInput();
        this.lastFrameTime = performance.now();

        if (this.pauseMenu) {
            this.pauseMenu.hide();
        }

        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.crosshair.hide();

        if (requestPointerLock) {
            this.player.requestPointerLock();
        }
    }

    async saveAndExit() {
        if (this.sessionState !== SESSION_STATES.PAUSED || !this.repository) {
            return;
        }

        this.sessionState = SESSION_STATES.SAVING;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.overlay.hideInstruction();
        this.overlay.setStatus('Salvando mundo e saindo...');

        if (this.pauseMenu) {
            this.pauseMenu.show('Salvando mundo e retornando ao menu principal.');
            this.pauseMenu.setSaving(true, 'Salvando mundo e retornando ao menu principal.');
        }

        try {
            await this.repository.saveGameState(this.worldMeta.id, this.player.getSaveState());
            this.destroy();
            window.location.href = window.ENV.DOMAIN + '/index.php?page=menu';
        } catch (error) {
            this.sessionState = SESSION_STATES.PAUSED;
            this.overlay.setStatus('Falha ao salvar o mundo.');

            if (this.pauseMenu) {
                this.pauseMenu.setSaving(false, error && error.message ? error.message : 'Nao foi possivel salvar o estado do mundo.');
            }
        }
    }

    handleResize() {
        if (this.renderer) {
            this.renderer.resize();
        }

        if (this.renderer && this.player) {
            this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks());
        }
    }

    handleVisibilityChange() {
        this.lastFrameTime = performance.now();
    }

    destroy() {
        if (!this.running && !this.player && !this.renderer) {
            return;
        }

        this.sessionState = SESSION_STATES.DESTROYED;
        this.running = false;

        if (this.frameHandle !== null) {
            window.cancelAnimationFrame(this.frameHandle);
            this.frameHandle = null;
        }

        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        if (this.player) {
            this.player.detach();
        }

        if (this.renderer) {
            this.renderer.destroy();
        }

        if (this.pauseMenu) {
            this.pauseMenu.hide();
        }

        if (this.crosshair) {
            this.crosshair.hide();
        }

        if (this.overlay) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Cena encerrada.');
        }
    }
}
