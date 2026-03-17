import { SoftwareRenderer } from './render/SoftwareRenderer.js';
import { PlayerController } from './player/PlayerController.js';
import { ChunkManager } from './world/ChunkManager.js';
import { ChunkMesher } from './world/ChunkMesher.js';
import { ChunkStore } from './world/ChunkStore.js';
import { TerrainGenerator } from './world/TerrainGenerator.js';
import { normalizeRuntimeConfig } from './world/WorldConfig.js';

const POINTER_LOCK_HINT = 'Clique na cena para capturar o mouse. Use WASD para andar, espaco para pular e ESC para liberar o cursor.';

export class GameApp {
    constructor(options) {
        this.root = options.root;
        this.canvas = options.canvas;
        this.worldMeta = options.worldMeta;
        this.userConfig = normalizeRuntimeConfig(options.userConfig);
        this.overlay = options.overlay;
        this.crosshair = options.crosshair;
        this.running = false;
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

        const spawnPoint = this.terrain.findSpawnPoint();
        this.player = new PlayerController({
            terrain: this.terrain,
            canvas: this.canvas,
            config: this.userConfig,
            spawn: spawnPoint
        });

        this.player.onPointerLockChange = (locked) => {
            if (locked) {
                this.overlay.hideInstruction();
                this.overlay.setStatus('Explorando o terreno procedural.');
                return;
            }

            this.overlay.showInstruction(POINTER_LOCK_HINT);
            this.overlay.setStatus('Clique na cena para capturar o mouse.');
        };

        this.player.attach();
        this.chunkManager.primeInitialChunks(spawnPoint, 18);
        this.overlay.setCoords(spawnPoint);
        this.overlay.setChunkCount(this.chunkManager.getLoadedChunkCount());
        this.overlay.hideBlocking();
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.show();

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        this.running = true;
        this.lastFrameTime = performance.now();
        this.frameHandle = window.requestAnimationFrame(this.loop);
    }

    loop(timestamp) {
        if (!this.running) {
            return;
        }

        const deltaTime = Math.min(0.033, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
        this.lastFrameTime = timestamp;
        this.hudElapsed += deltaTime;

        this.player.update(deltaTime);
        const feetPosition = this.player.getFeetPosition();
        this.chunkManager.update(feetPosition);
        this.chunkManager.drainQueue(2);
        this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks());

        if (this.hudElapsed >= 0.12) {
            this.overlay.setCoords(feetPosition);
            this.overlay.setChunkCount(this.chunkManager.getLoadedChunkCount());
            this.hudElapsed = 0;
        }

        this.frameHandle = window.requestAnimationFrame(this.loop);
    }

    handleResize() {
        if (this.renderer) {
            this.renderer.resize();
        }
    }

    handleVisibilityChange() {
        this.lastFrameTime = performance.now();
    }

    destroy() {
        if (!this.running && !this.player && !this.renderer) {
            return;
        }

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

        if (this.crosshair) {
            this.crosshair.hide();
        }

        if (this.overlay) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Cena encerrada.');
        }
    }
}
