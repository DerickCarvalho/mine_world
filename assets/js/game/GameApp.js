import { createRenderer } from './render/RendererFactory.js';
import { PlayerController } from './player/PlayerController.js';
import { ChunkManager } from './world/ChunkManager.js';
import { ChunkMesher } from './world/ChunkMesher.js';
import { ChunkStore } from './world/ChunkStore.js';
import { TerrainGenerator } from './world/TerrainGenerator.js';
import { MutableWorld } from './world/MutableWorld.js';
import { RaycastPicker } from './world/RaycastPicker.js';
import { BLOCK_TYPES, getBlockDefinitionById, getBlockIdByKey, getBlockKeyById, getBlockMaxStack, getBlockName, isCollectableBlock, isEdibleBlock, getBlockNutrition, isPlaceableBlock, listPlaceableBlockDefinitions } from './world/BlockTypes.js';
import { setBlockTextureCatalog } from './world/ChunkMaterials.js';
import { WORLD_CONFIG, normalizeRuntimeConfig } from './world/WorldConfig.js';
import { Hotbar } from './ui/Hotbar.js';
import { InventoryPanel } from './ui/InventoryPanel.js';
import { GameplayHudController } from './ui/GameplayHudController.js';
import { applyInventoryClick, INVENTORY_CLICK } from './inventory/InventoryOperations.js';
import { craftRecipe, getRecipeById, listRecipeStates } from './inventory/CraftingCatalog.js';
import { FirstPersonHand } from './ui/FirstPersonHand.js';
import { MobManager } from './entities/MobManager.js';
import { EntityPicker } from './entities/EntityPicker.js';
import { GameAudio } from './audio/GameAudio.js';
import { RuntimeTelemetry } from './telemetry/RuntimeTelemetry.js';
import { ChunkWorkerClient } from './workers/ChunkWorkerClient.js';
import { InteractionController } from './interaction/InteractionController.js';
import { isCreativeMode, normalizeGameMode } from './core/GameModeRules.js';

const SESSION_STATES = Object.freeze({
    BOOTING: 'booting',
    RUNNING: 'running',
    PAUSED: 'paused',
    DYING: 'dying',
    DEAD: 'dead',
    SAVING: 'saving',
    DESTROYED: 'destroyed'
});

const POINTER_LOCK_HINT = 'Clique na cena para capturar o mouse. Use WASD para andar, espaco para pular, T para chat, C para coordenadas, E para inventario e P para pausa.';
const INVENTORY_HINT = 'Inventario aberto. Clique para reorganizar os slots, use E para fechar e clique na cena para retomar o mouse.';
const CHAT_HINT = 'Chat aberto. Digite uma mensagem ou use / para ver os comandos validados.';
const INITIAL_CHUNK_TARGET = 12;
const INVENTORY_SLOT_COUNT = 27;

function createEmptyInventorySlots() {
    return new Array(INVENTORY_SLOT_COUNT).fill(null);
}

function cloneInventorySlots(slots) {
    return slots.map(function (slot) {
        return slot ? { block_id: slot.block_id, quantity: slot.quantity } : null;
    });
}

function normalizeInventorySlots(slots) {
    const source = Array.isArray(slots) ? slots : [];
    const normalized = createEmptyInventorySlots();

    for (let index = 0; index < INVENTORY_SLOT_COUNT; index += 1) {
        const slot = source[index];
        const blockId = slot ? getBlockIdByKey(slot.block_id) : 0;
        const quantity = slot ? Math.floor(Number(slot.quantity || 0)) : 0;

        if (isCollectableBlock(blockId) && Number.isFinite(quantity) && quantity > 0) {
            normalized[index] = {
                block_id: getBlockKeyById(blockId),
                quantity: Math.max(1, Math.min(getBlockMaxStack(blockId), quantity))
            };
        }
    }

    return normalized;
}

function normalizeBooleanFlag(value) {
    return value === true || value === 1 || value === '1';
}

function normalizeHealthValue(value) {
    const numeric = Math.floor(Number(value));
    if (!Number.isFinite(numeric)) {
        return WORLD_CONFIG.maxHealth;
    }

    return Math.max(0, Math.min(WORLD_CONFIG.maxHealth, numeric));
}

function normalizeHungerValue(value) {
    const numeric = Math.floor(Number(value));
    if (!Number.isFinite(numeric)) {
        return WORLD_CONFIG.maxHunger;
    }

    return Math.max(0, Math.min(WORLD_CONFIG.maxHunger, numeric));
}

function normalizeSavedPosition(position) {
    if (!position || typeof position !== 'object') {
        return null;
    }

    const x = Number(position.x);
    const y = Number(position.y);
    const z = Number(position.z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        return null;
    }

    return {
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        z: Number(z.toFixed(3))
    };
}

function normalizeWorldDropsForApp(drops) {
    if (!Array.isArray(drops)) {
        return [];
    }

    let sequence = 0;
    const result = [];

    for (const drop of drops) {
        if (!drop || typeof drop !== 'object' || !drop.block_id) {
            continue;
        }

        const x = Number(drop.x);
        const y = Number(drop.y);
        const z = Number(drop.z);
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
            continue;
        }

        sequence += 1;
        result.push({
            id: 'rd-' + sequence,
            block_id: String(drop.block_id),
            quantity: Math.max(1, Math.min(64, Math.floor(Number(drop.quantity || 1)))),
            x: x,
            y: y,
            z: z
        });

        if (result.length >= 128) {
            break;
        }
    }

    return result;
}

function makeDropFace(vertices, normal, color, shade) {
    const center = { x: 0, y: 0, z: 0 };
    for (const v of vertices) {
        center.x += v.x;
        center.y += v.y;
        center.z += v.z;
    }
    center.x /= vertices.length;
    center.y /= vertices.length;
    center.z /= vertices.length;
    return { vertices: vertices, normal: normal, center: center, color: color, shade: shade, alpha: 1 };
}

function buildDropRenderable(drop, bobY) {
    const s = 0.22;
    const ox = drop.x;
    const oy = drop.y + 0.4 + bobY;
    const oz = drop.z;
    const x0 = ox - s, x1 = ox + s;
    const y0 = oy - s, y1 = oy + s;
    const z0 = oz - s, z1 = oz + s;
    const col = { r: 255, g: 200, b: 60 };
    const faces = [
        makeDropFace([{x:x0,y:y1,z:z0},{x:x1,y:y1,z:z0},{x:x1,y:y1,z:z1},{x:x0,y:y1,z:z1}],{x:0,y:1,z:0},col,1),
        makeDropFace([{x:x0,y:y0,z:z1},{x:x1,y:y0,z:z1},{x:x1,y:y0,z:z0},{x:x0,y:y0,z:z0}],{x:0,y:-1,z:0},col,0.58),
        makeDropFace([{x:x0,y:y0,z:z0},{x:x1,y:y0,z:z0},{x:x1,y:y1,z:z0},{x:x0,y:y1,z:z0}],{x:0,y:0,z:-1},col,0.82),
        makeDropFace([{x:x1,y:y0,z:z1},{x:x0,y:y0,z:z1},{x:x0,y:y1,z:z1},{x:x1,y:y1,z:z1}],{x:0,y:0,z:1},col,0.92),
        makeDropFace([{x:x1,y:y0,z:z0},{x:x1,y:y1,z:z0},{x:x1,y:y1,z:z1},{x:x1,y:y0,z:z1}],{x:1,y:0,z:0},col,0.82),
        makeDropFace([{x:x0,y:y0,z:z1},{x:x0,y:y1,z:z1},{x:x0,y:y1,z:z0},{x:x0,y:y0,z:z0}],{x:-1,y:0,z:0},col,0.72)
    ];
    return { key: 'wdrop-' + drop.id, chunkX: null, chunkZ: null, faces: faces, center: { x: ox, y: oy, z: oz } };
}

export class GameApp {
    constructor(options) {
        this.root = options.root;
        this.canvas = options.canvas;
        this.worldMeta = options.worldMeta;
        this.userConfig = normalizeRuntimeConfig(options.userConfig);
        this.overlay = options.overlay;
        this.crosshair = options.crosshair;
        this.pauseMenu = options.pauseMenu;
        this.chatOverlay = options.chatOverlay || null;
        this.repository = options.repository;
        this.commandRepository = options.commandRepository || null;
        this.textureManifest = options.textureManifest || {};
        this.initialCommands = Array.isArray(options.initialCommands) ? options.initialCommands : [];
        this.initialSaveState = options.saveState || null;
        this.chunkStats = options.chunkStats || { cached_chunks_count: 0 };
        this.performanceProfile = options.performanceProfile || {};
        this.running = false;
        this.sessionState = SESSION_STATES.BOOTING;
        this.frameHandle = null;
        this.lastFrameTime = 0;
        this.hudElapsed = 0;
        this.qualityElapsed = 0;
        this.frameTimeAccumulator = 0;
        this.frameSampleCount = 0;
        this.healthFlashTime = 0;
        this.deathElapsed = 0;
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.primaryActionHeld = false;
        this.inventoryOpen = false;
        this.chatOpen = false;
        this.inventorySelectedSlotIndex = null;
        this.inventoryCursorStack = null;
        this.coordsVisible = false;
        this.chunkLoadInFlight = null;
        this.chunkSaveInFlight = null;
        this.cachedChunkCount = Number(this.chunkStats.cached_chunks_count || 0);
        this.availableCommands = this.initialCommands.slice();
        this.inventorySlots = normalizeInventorySlots(this.initialSaveState && this.initialSaveState.inventory ? this.initialSaveState.inventory.slots : []);
        this.selectedHotbarIndex = Math.max(0, Math.min(8, Math.floor(Number(this.initialSaveState && this.initialSaveState.player ? this.initialSaveState.player.selected_hotbar_index || 0 : 0))));
        const savedPlayer = this.initialSaveState && this.initialSaveState.player ? this.initialSaveState.player : {};
        const savedWorld = this.initialSaveState && this.initialSaveState.world ? this.initialSaveState.world : {};
        this.health = normalizeHealthValue(savedPlayer.health);
        this.hunger = normalizeHungerValue(savedPlayer.hunger);
        this.worldDrops = normalizeWorldDropsForApp(savedWorld.item_drops);
        this.dropSpinTime = 0;
        this.dropSequence = 0;
        this.dead = normalizeBooleanFlag(savedPlayer.dead) || this.health <= 0;
        this.gameMode = normalizeGameMode(this.initialSaveState && this.initialSaveState.game_mode);
        if (this.dead) {
            this.health = 0;
        }
        this.spawnPosition = normalizeSavedPosition(savedPlayer.spawn_position);
        this.uiDirty = true;
        this.telemetry = new RuntimeTelemetry();
        this.interaction = new InteractionController();
        this.creativePalette = listPlaceableBlockDefinitions();

        this.hotbar = new Hotbar(this.root.querySelector('[data-game-hotbar]'));
        this.inventoryPanel = new InventoryPanel(this.root.querySelector('[data-game-inventory]'));
        this.hand = new FirstPersonHand(this.root.querySelector('[data-game-hand]'));
        this.audio = new GameAudio(this.userConfig.master_volume);
        this.healthBar = this.root.querySelector('[data-game-health]');
        this.healthText = this.root.querySelector('[data-game-health-text]');
        this.hungerBar = this.root.querySelector('[data-game-hunger]');
        this.hungerText = this.root.querySelector('[data-game-hunger-text]');
        this.flyChip = this.root.querySelector('[data-game-fly]');
        this.flyText = this.root.querySelector('[data-game-fly-text]');
        this.deathOverlay = this.root.querySelector('[data-game-death]');
        this.deathCard = this.root.querySelector('[data-game-death-card]');
        this.deathRespawnButton = this.root.querySelector('[data-death-respawn]');
        this.deathSaveExitButton = this.root.querySelector('[data-death-save-exit]');
        this.hud = new GameplayHudController({
            hotbar: this.hotbar,
            inventoryPanel: this.inventoryPanel,
            hand: this.hand,
            healthBar: this.healthBar,
            healthText: this.healthText,
            hungerBar: this.hungerBar,
            hungerText: this.hungerText,
            flyChip: this.flyChip,
            flyText: this.flyText,
            modeChip: this.root.querySelector('[data-game-mode]'),
            overlay: this.overlay,
            crosshair: this.crosshair,
            pauseMenu: this.pauseMenu
        });

        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.loop = this.loop.bind(this);
    }

    async start() {
        if (!this.canvas) {
            throw new Error('A pagina do jogo nao encontrou o canvas principal para iniciar a cena.');
        }

        this.overlay.setStatus('Carregando mundo...');
        this.overlay.setTarget('Nenhum');
        this.overlay.setCoordsVisible(this.coordsVisible);

        setBlockTextureCatalog(this.textureManifest);
        this.renderer = createRenderer(this.canvas, {
            onFallback: () => {
                this.overlay.setStatus('WebGL 2 indisponivel; renderer compativel ativado.');
            }
        });
        this.telemetry.observeLongTasks();
        this.renderer.setPerformanceProfile(this.performanceProfile);
        await this.renderer.setTextureCatalog(this.textureManifest);
        this.terrain = new TerrainGenerator(this.worldMeta.seed, this.worldMeta.algorithm_version);
        this.world = new MutableWorld(this.terrain);
        this.world.applySerializedMutations(this.initialSaveState && this.initialSaveState.world ? this.initialSaveState.world.block_mutations : []);
        this.raycast = new RaycastPicker(this.world);
        this.entityPicker = new EntityPicker();
        this.chunkStore = new ChunkStore();
        this.chunkMesher = new ChunkMesher(this.world);
        this.chunkWorkerClient = new ChunkWorkerClient({
            seed: this.worldMeta.seed,
            algorithmVersion: this.worldMeta.algorithm_version,
            textureCatalog: this.textureManifest,
            onResult: (result) => this.chunkManager.handleWorkerResult(result),
            onError: (error, context) => this.chunkManager.handleWorkerError(error, context)
        });
        this.chunkManager = new ChunkManager({
            store: this.chunkStore,
            mesher: this.chunkMesher,
            world: this.world,
            renderDistance: this.userConfig.render_distance,
            workerClient: this.chunkWorkerClient,
            telemetry: this.telemetry
        });
        this.mobManager = new MobManager(this.world);

        this.worldSpawnPose = this.resolveWorldSpawnPose();
        this.spawnPosition = this.resolveSpawnAnchor(this.initialSaveState);
        const savedPlayer = this.initialSaveState && this.initialSaveState.player ? this.initialSaveState.player : {};
        const spawnPose = this.resolveSpawnPose(this.initialSaveState);
        this.player = new PlayerController({
            world: this.world,
            canvas: this.canvas,
            config: this.userConfig,
            spawn: spawnPose,
            flyEnabled: normalizeBooleanFlag(savedPlayer.fly_enabled),
            flying: normalizeBooleanFlag(savedPlayer.fly_active)
        });

        this.configureUi();
        this.player.onPointerLockChange = (locked) => {
            this.handlePointerLockChange(locked);
        };
        this.player.attach();
        this.player.setGameplayEnabled(!this.dead);

        await this.prepareInitialChunks(spawnPose);
        await this.loadAvailableCommands(false);

        if (this.chatOverlay) {
            this.chatOverlay.pushMessage('system', 'Chat pronto. Digite / para listar comandos disponiveis.');
            if (this.performanceProfile.turboEnabled) {
                this.chatOverlay.pushMessage('system', 'Modo desempenho ativo para priorizar fluidez e texturas proximas.');
            }
        }

        this.overlay.setCoords(this.player.getFeetPosition());
        this.overlay.hideBlocking();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.renderUi();
        this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks(), null, this.mobManager.getRenderableEntities().concat(this.getDropRenderables()));

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        this.running = true;
        this.sessionState = SESSION_STATES.RUNNING;
        this.lastFrameTime = performance.now();
        this.frameHandle = window.requestAnimationFrame(this.loop);

        if (this.dead) {
            this.enterDeathMenu(true);
            return;
        }

        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
    }

    configureUi() {
        if (this.pauseMenu) {
            this.pauseMenu.onResume = () => {
                this.resume(true);
            };
            this.pauseMenu.onSaveAndExit = () => {
                void this.saveAndExit();
            };
            this.pauseMenu.onApplySettings = (config) => this.applySettingsFromPause(config);
            this.pauseMenu.onToggleGameMode = () => {
                this.toggleGameMode();
            };
            this.pauseMenu.setConfig(this.userConfig);
            this.pauseMenu.hide();
        }

        if (this.hotbar) {
            this.hotbar.onSelect = (index) => {
                this.setSelectedHotbarIndex(index);
            };
        }

        if (this.inventoryPanel) {
            this.inventoryPanel.onSlotClick = (index, click) => {
                this.handleInventorySlotClick(index, click);
            };
            this.inventoryPanel.onRecipeCraft = (recipeId) => {
                this.attemptCraftRecipe(recipeId);
            };
            this.inventoryPanel.onCreativePick = (blockKey) => {
                this.fillSelectedSlotFromCreative(blockKey);
            };
            this.inventoryPanel.hide();
        }

        if (this.chatOverlay) {
            this.chatOverlay.onSubmit = (value) => {
                void this.handleChatSubmit(value);
            };
            this.chatOverlay.onInputChange = (value) => {
                this.handleChatInputChange(value);
            };
            this.chatOverlay.onCancel = () => {
                this.closeChat(true);
            };
            this.chatOverlay.hide();
        }

        if (this.deathRespawnButton) {
            this.deathRespawnButton.addEventListener('click', () => {
                void this.respawnAfterDeath();
            });
        }

        if (this.deathSaveExitButton) {
            this.deathSaveExitButton.addEventListener('click', () => {
                void this.saveAndExitFromDeath();
            });
        }
    }

    resolveWorldSpawnPose() {
        const spawn = this.world.findSpawnPoint();
        return { x: spawn.x, y: spawn.y, z: spawn.z, yaw: 0, pitch: -0.12 };
    }

    resolveSpawnAnchor(saveState) {
        const savedPlayer = saveState && saveState.player ? saveState.player : null;
        const savedAnchor = savedPlayer ? normalizeSavedPosition(savedPlayer.spawn_position) : null;
        if (savedAnchor && this.world.isInsideWorld(savedAnchor.x, savedAnchor.z)) {
            return savedAnchor;
        }

        return { x: this.worldSpawnPose.x, y: this.worldSpawnPose.y, z: this.worldSpawnPose.z };
    }

    resolveSpawnPose(saveState) {
        const fallbackPose = Object.assign({}, this.worldSpawnPose);
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

        if (!this.world.isInsideWorld(x, z)) {
            return fallbackPose;
        }

        const supportHeight = this.world.getTopSolidYAt(x, z) + 1;
        return { x: x, y: Math.max(y, supportHeight), z: z, yaw: yaw, pitch: pitch };
    }

    async prepareInitialChunks(spawnPose) {
        this.overlay.showLoading('Preparando terreno', 'Carregando a janela inicial de chunks do mundo.');
        this.chunkManager.update(spawnPose, true);

        let guard = 0;
        while (this.chunkManager.getLoadedChunkCount() < INITIAL_CHUNK_TARGET && this.chunkManager.getPendingCount() > 0 && guard < 240) {
            await this.loadNextChunkBatch(this.performanceProfile.turboEnabled ? 6 : 4);
            const result = this.chunkManager.drainQueue(this.performanceProfile.turboEnabled ? 4 : 3);
            if (result.processed === 0 && this.chunkManager.getPendingCount() > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, 12));
            }
            if (result.processed === 0 && this.chunkManager.getPendingCount() === 0) {
                break;
            }
            try {
                await this.flushPendingChunkSaves(true);
            } catch (error) {
                console.warn('Chunks iniciais geradas localmente; o salvamento sera retomado durante a sessao.', error);
                break;
            }
            guard += 1;
        }

        this.overlay.setStatus('Chunks iniciais prontas.');
    }

    async loadNextChunkBatch(maxBatchSize = 8) {
        if (!this.repository) {
            return false;
        }

        if (this.chunkLoadInFlight) {
            await this.chunkLoadInFlight;
            return true;
        }

        const batch = this.chunkManager.takeLoadBatch(maxBatchSize);
        if (batch.length === 0) {
            return false;
        }

        this.chunkLoadInFlight = this.repository.loadChunkBatch(this.worldMeta.id, batch)
            .then((loadedMap) => {
                this.chunkManager.resolveLoadBatch(batch, loadedMap);
            })
            .catch(() => {
                this.chunkManager.resolveLoadBatch(batch, new Map());
            })
            .finally(() => {
                this.chunkLoadInFlight = null;
            });

        await this.chunkLoadInFlight;
        return true;
    }

    async flushPendingChunkSaves(forceWait) {
        if (!this.repository) {
            return false;
        }

        if (this.chunkSaveInFlight) {
            if (forceWait) {
                await this.chunkSaveInFlight;
            }
            return true;
        }

        const batch = this.chunkManager.takeSaveBatch(4);
        if (batch.length === 0) {
            return false;
        }

        this.chunkSaveInFlight = this.repository.saveChunks(this.worldMeta.id, batch)
            .then((result) => {
                if (Number.isFinite(Number(result.cachedChunksCount))) {
                    this.cachedChunkCount = Number(result.cachedChunksCount);
                }
            })
            .catch((error) => {
                this.chunkManager.requeueSaveBatch(batch);
                if (forceWait) {
                    throw error;
                }
            })
            .finally(() => {
                this.chunkSaveInFlight = null;
            });

        if (forceWait) {
            await this.chunkSaveInFlight;
        }

        return true;
    }

    applyRuntimeConfig(config) {
        this.userConfig = normalizeRuntimeConfig(config);
        this.audio.setVolume(this.userConfig.master_volume);

        if (this.player) {
            this.player.applyConfig(this.userConfig);
        }

        if (this.chunkManager) {
            this.chunkManager.setRenderDistance(this.userConfig.render_distance);
            if (this.player) {
                this.chunkManager.update(this.player.getFeetPosition(), true);
                void this.loadNextChunkBatch(4);
            }
        }

        if (this.pauseMenu) {
            this.pauseMenu.setConfig(this.userConfig);
        }
    }

    async applySettingsFromPause(config) {
        const appliedConfig = await this.repository.saveUserConfig(config);
        this.applyRuntimeConfig(appliedConfig);
        return appliedConfig;
    }

    async loadAvailableCommands(forceRefresh) {
        if (!this.commandRepository) {
            return this.availableCommands;
        }

        if (!forceRefresh && this.availableCommands.length > 0) {
            return this.availableCommands;
        }

        try {
            this.availableCommands = await this.commandRepository.listValidated();
        } catch (error) {
            if (forceRefresh) {
                throw error;
            }
        }

        return this.availableCommands;
    }

    renderUi() {
        this.hud.render({
            inventorySlots: this.inventorySlots,
            selectedHotbarIndex: this.selectedHotbarIndex,
            inventorySelectedSlotIndex: this.inventorySelectedSlotIndex,
            inventoryCursorStack: this.inventoryCursorStack,
            gameMode: this.gameMode,
            recipes: listRecipeStates(this.inventorySlots),
            creativePalette: this.creativePalette,
            health: this.health,
            hunger: this.hunger,
            healthFlashTime: this.healthFlashTime,
            player: this.player
        });
        this.uiDirty = false;
    }
    updatePauseMenuData() {
        this.worldMeta.gameMode = this.gameMode;
        this.hud.updatePauseMenu(this.worldMeta, this.player, this.chunkManager, this.cachedChunkCount);
    }

    handlePointerLockChange(locked) {
        const state = this.hud.handlePointerLockChange(locked, {
            sessionState: this.sessionState,
            sessionStates: SESSION_STATES,
            chatOpen: this.chatOpen,
            inventoryOpen: this.inventoryOpen,
            pointerLockHint: POINTER_LOCK_HINT,
            inventoryHint: INVENTORY_HINT,
            chatHint: CHAT_HINT
        });
        if (state === 'locked') {
            void this.audio.unlock();
        }
    }

    getChunkDrainBudget(deltaTime) {
        let budget = deltaTime > 0.02 ? 1 : 2;
        if (this.performanceProfile.turboEnabled && deltaTime < 0.014) {
            budget += 1;
        }
        return Math.max(1, Math.min(2, budget));
    }

    setSelectedHotbarIndex(index) {
        const normalized = Math.max(0, Math.min(8, Math.floor(Number(index || 0))));
        if (normalized === this.selectedHotbarIndex) {
            return;
        }

        this.selectedHotbarIndex = normalized;
        this.uiDirty = true;
    }

    setGameMode(gameMode) {
        this.gameMode = normalizeGameMode(gameMode);
        this.worldMeta.gameMode = this.gameMode;
        this.uiDirty = true;
        this.updatePauseMenuData();
    }

    toggleGameMode() {
        const nextMode = isCreativeMode(this.gameMode) ? 'survival' : 'creative';
        this.setGameMode(nextMode);
        this.overlay.setStatus(nextMode === 'creative' ? 'Modo criativo ativo.' : 'Modo sobrevivencia ativo.');
    }

    shiftHotbarSelection(delta) {
        if (!delta) {
            return;
        }

        let nextIndex = this.selectedHotbarIndex;
        const steps = Math.abs(delta);
        for (let index = 0; index < steps; index += 1) {
            nextIndex = delta > 0 ? (nextIndex + 1) % 9 : (nextIndex + 8) % 9;
        }

        this.setSelectedHotbarIndex(nextIndex);
    }

    returnInventoryCursor() {
        if (!this.inventoryCursorStack) {
            return true;
        }

        let remaining = { ...this.inventoryCursorStack };
        const maxStack = getBlockMaxStack(remaining.block_id) || 64;
        for (let index = 0; index < this.inventorySlots.length && remaining; index += 1) {
            const slot = this.inventorySlots[index];
            if (!slot || slot.block_id !== remaining.block_id || slot.quantity >= maxStack) {
                continue;
            }

            const moved = Math.min(maxStack - slot.quantity, remaining.quantity);
            slot.quantity += moved;
            remaining.quantity -= moved;
            if (remaining.quantity <= 0) {
                remaining = null;
            }
        }
        for (let index = 0; index < this.inventorySlots.length && remaining; index += 1) {
            if (!this.inventorySlots[index]) {
                this.inventorySlots[index] = remaining;
                remaining = null;
            }
        }

        this.inventoryCursorStack = remaining;
        this.inventorySelectedSlotIndex = remaining ? this.inventorySelectedSlotIndex : null;
        this.uiDirty = true;
        return remaining === null;
    }

    toggleCoords() {
        this.coordsVisible = !this.coordsVisible;
        this.overlay.setCoordsVisible(this.coordsVisible);
        if (this.coordsVisible && this.player) {
            this.overlay.setCoords(this.player.getFeetPosition());
        }
    }

    toggleInventory() {
        if (this.sessionState !== SESSION_STATES.RUNNING || this.chatOpen || this.dead) {
            return;
        }

        if (this.inventoryOpen) {
            if (!this.returnInventoryCursor()) {
                this.overlay.setStatus('Libere um slot para guardar o item que esta na mao.');
                return;
            }
            this.inventoryOpen = false;
            this.inventorySelectedSlotIndex = null;
            this.inventoryPanel.hide();
            this.player.setGameplayEnabled(true);
            this.overlay.showInstruction(POINTER_LOCK_HINT);
            this.overlay.setStatus('Clique na cena para capturar o mouse.');
            this.uiDirty = true;
            return;
        }

        this.inventoryOpen = true;
        this.inventorySelectedSlotIndex = null;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.inventoryPanel.show();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.overlay.showInstruction(INVENTORY_HINT);
        this.overlay.setStatus('Inventario aberto.');
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.uiDirty = true;
    }

    toggleChat() {
        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen || this.dead) {
            return;
        }

        if (this.chatOpen) {
            this.closeChat(true);
            return;
        }

        this.openChat();
    }

    openChat() {
        if (!this.chatOverlay || this.chatOpen) {
            return;
        }

        this.chatOpen = true;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.chatOverlay.show();
        this.chatOverlay.clearInput();
        this.chatOverlay.setSuggestions(this.availableCommands);
        this.overlay.showInstruction(CHAT_HINT);
        this.overlay.setStatus('Chat aberto.');
        void this.loadAvailableCommands(true).then(() => {
            this.chatOverlay.setSuggestions(this.availableCommands);
        }).catch(() => {
            // Mantem a lista atual se a recarga falhar.
        });
    }

    closeChat(requestPointerLock) {
        if (!this.chatOpen) {
            return;
        }

        this.chatOpen = false;
        if (this.chatOverlay) {
            this.chatOverlay.hide();
            this.chatOverlay.clearInput();
        }

        this.player.setGameplayEnabled(true);
        this.player.resetTransientInput();
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        if (requestPointerLock) {
            this.player.requestPointerLock();
        }
    }

    handleChatInputChange(value) {
        if (!this.chatOverlay) {
            return;
        }

        const trimmed = String(value || '').trim();
        if (!trimmed.startsWith('/')) {
            this.chatOverlay.setSuggestions([]);
            return;
        }

        const query = trimmed.slice(1).toLowerCase();
        const suggestions = this.availableCommands.filter(function (command) {
            return command.command_key.toLowerCase().startsWith(query);
        });
        this.chatOverlay.setSuggestions(suggestions);
    }

    async handleChatSubmit(value) {
        if (!this.chatOverlay) {
            return;
        }

        const text = String(value || '').trim();
        if (text === '') {
            this.closeChat(true);
            return;
        }

        if (!text.startsWith('/')) {
            this.chatOverlay.pushMessage('system', 'Voce: ' + text);
            this.closeChat(true);
            return;
        }

        try {
            const message = await this.executeChatCommand(text);
            this.chatOverlay.pushMessage('success', message);
            this.closeChat(true);
        } catch (error) {
            this.chatOverlay.pushMessage('error', error && error.message ? error.message : 'Falha ao executar o comando.');
        }
    }

    async executeChatCommand(text) {
        const tokens = String(text || '').trim().slice(1).split(/\s+/).filter(Boolean);
        const commandKey = (tokens.shift() || '').toLowerCase();
        const command = this.availableCommands.find(function (entry) {
            return entry.command_key.toLowerCase() === commandKey;
        });

        if (!command) {
            throw new Error('Comando nao encontrado. Digite / para ver a lista atual.');
        }

        if (command.capability_key === 'teleport') {
            return this.executeTeleportCommand(command, tokens);
        }
        if (command.capability_key === 'toggle_fly') {
            return this.executeToggleFlyCommand(command);
        }
        if (command.capability_key === 'spawn_mob') {
            return this.executeSpawnMobCommand(command, tokens);
        }

        throw new Error('Esse comando ainda nao possui executor no runtime.');
    }

    async executeTeleportCommand(command, args) {
        if (args.length < 3) {
            throw new Error(command.definition && command.definition.usage ? 'Uso: ' + command.definition.usage : 'Uso: /tp x y z');
        }

        const x = Number(args[0]);
        const y = Number(args[1]);
        const z = Number(args[2]);

        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
            throw new Error('Informe coordenadas numericas validas.');
        }
        if (!this.world.isInsideWorld(x, z)) {
            throw new Error('As coordenadas informadas estao fora dos limites do mundo.');
        }
        if (y < 0 || y >= WORLD_CONFIG.height) {
            throw new Error('A coordenada Y precisa ficar dentro da altura do mundo.');
        }

        this.overlay.setStatus('Executando /' + command.command_key + '...');
        this.player.teleportTo({ x: x, y: y, z: z });
        this.chunkManager.update(this.player.getFeetPosition(), true);
        await this.loadNextChunkBatch(6);
        this.chunkManager.drainQueue(4);
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        if (this.coordsVisible) {
            this.overlay.setCoords(this.player.getFeetPosition());
        }
        this.overlay.setStatus('Teleporte executado.');
        return 'Teleporte executado para X ' + x.toFixed(1) + ' | Y ' + y.toFixed(1) + ' | Z ' + z.toFixed(1);
    }

    async executeToggleFlyCommand(command) {
        const nextEnabled = !this.player.isFlyEnabled();
        this.player.setFlyEnabled(nextEnabled);
        this.player.toggleFlightMode(nextEnabled);
        this.uiDirty = true;
        this.overlay.setStatus('Executando /' + command.command_key + '...');
        return nextEnabled
            ? 'Fly habilitado e ativo. Use espaco para subir e Shift para descer.'
            : 'Fly desativado.';
    }
    async executeSpawnMobCommand(command, args) {
        const mobType = (args[0] || 'gato').toLowerCase();
        const created = this.mobManager.spawnCommandMob(mobType, this.player.getFeetPosition(), this.player.getRotation());
        if (!created) {
            throw new Error(command.definition && command.definition.usage ? 'Uso: ' + command.definition.usage : 'Uso: /spawnmob gato');
        }

        this.overlay.setStatus('Executando /' + command.command_key + '...');
        return 'Um gato apareceu perto do jogador.';
    }
    handleInventorySlotClick(index, click = INVENTORY_CLICK.PRIMARY) {
        if (!this.inventoryOpen) {
            return;
        }

        const slot = this.inventorySlots[index];
        const stackForLimit = this.inventoryCursorStack || slot;
        const maxStack = stackForLimit ? getBlockMaxStack(stackForLimit.block_id) : 64;
        const result = applyInventoryClick(this.inventorySlots, this.inventoryCursorStack, index, click, maxStack);
        this.inventorySlots = result.slots;
        this.inventoryCursorStack = result.cursorStack;
        this.inventorySelectedSlotIndex = this.inventoryCursorStack ? index : null;
        this.uiDirty = true;
    }

    fillSelectedSlotFromCreative(blockKey) {
        if (!isCreativeMode(this.gameMode)) {
            return;
        }

        const blockId = getBlockIdByKey(blockKey);
        if (!isPlaceableBlock(blockId)) {
            return;
        }

        this.inventorySlots[this.selectedHotbarIndex] = {
            block_id: getBlockKeyById(blockId),
            quantity: getBlockMaxStack(blockId) || 64
        };
        this.uiDirty = true;
    }

    attemptCraftRecipe(recipeId) {
        const recipe = getRecipeById(recipeId);
        if (!recipe) {
            this.overlay.setStatus('Receita invalida.');
            return;
        }

        if (isCreativeMode(this.gameMode)) {
            const craftedStack = {
                block_id: recipe.output.block_id,
                quantity: recipe.output.quantity
            };
            const maxStack = getBlockMaxStack(craftedStack.block_id) || 64;
            this.inventorySlots[this.selectedHotbarIndex] = {
                block_id: craftedStack.block_id,
                quantity: Math.min(maxStack, craftedStack.quantity)
            };
            this.uiDirty = true;
            this.overlay.setStatus('Item criativo preparado: ' + recipe.name + '.');
            return;
        }

        const result = craftRecipe(this.inventorySlots, recipe);
        if (!result.crafted) {
            this.overlay.setStatus('Recursos insuficientes para esse craft.');
            return;
        }

        this.inventorySlots = result.slots;
        this.uiDirty = true;
        this.overlay.setStatus('Craft concluido: ' + recipe.name + '.');
    }

    addBlockToInventory(blockId) {
        if (!this.world.canCollectBlock(blockId)) {
            return false;
        }

        const blockKey = getBlockKeyById(blockId);
        const maxStack = getBlockMaxStack(blockId);
        for (let index = 0; index < this.inventorySlots.length; index += 1) {
            const slot = this.inventorySlots[index];
            if (slot && slot.block_id === blockKey && slot.quantity < maxStack) {
                slot.quantity += 1;
                this.uiDirty = true;
                return true;
            }
        }

        for (let index = 0; index < this.inventorySlots.length; index += 1) {
            if (!this.inventorySlots[index]) {
                this.inventorySlots[index] = { block_id: blockKey, quantity: 1 };
                this.uiDirty = true;
                return true;
            }
        }

        return false;
    }

    canAddBlockToInventory(blockId) {
        if (!this.world.canCollectBlock(blockId)) {
            return false;
        }

        const blockKey = getBlockKeyById(blockId);
        const maxStack = getBlockMaxStack(blockId);
        return this.inventorySlots.some((slot) => !slot || (slot.block_id === blockKey && slot.quantity < maxStack));
    }

    getSelectedSlot() {
        return this.inventorySlots[this.selectedHotbarIndex] || null;
    }

    getHeldAttackDamage() {
        const slot = this.getSelectedSlot();
        if (!slot) {
            return 1;
        }

        switch (slot.block_id) {
        case 'wood_sword':
            return 4;
        case 'stone_sword':
            return 5;
        case 'wood_axe':
            return 3;
        case 'stone_axe':
            return 4;
        case 'wood_pickaxe':
            return 2;
        case 'stone_pickaxe':
            return 3;
        default:
            return 1;
        }
    }

    consumeSelectedFood() {
        const slot = this.getSelectedSlot();
        if (!slot || !isEdibleBlock(slot.block_id) || this.hunger >= WORLD_CONFIG.maxHunger) {
            return false;
        }

        const nutrition = Math.max(1, getBlockNutrition(slot.block_id));
        this.hunger = Math.min(WORLD_CONFIG.maxHunger, this.hunger + nutrition);
        this.hungerElapsed = 0;
        this.starvationElapsed = 0;
        this.decrementSelectedSlot();
        this.hand.triggerUse();
        this.overlay.setStatus('Voce comeu ' + getBlockName(slot.block_id) + '.');
        this.uiDirty = true;
        return true;
    }

    updateWorldDropPickups(deltaTime) {
        this.dropSpinTime += deltaTime;

        if (!this.worldDrops.length) {
            return;
        }

        const feetPos = this.player.getFeetPosition();
        const pickupRange = 1.5;
        const remaining = [];

        for (const drop of this.worldDrops) {
            const dist = Math.hypot(drop.x - feetPos.x, drop.y - feetPos.y, drop.z - feetPos.z);
            if (dist <= pickupRange) {
                const blockId = getBlockIdByKey(drop.block_id);
                if (blockId) {
                    for (let q = 0; q < drop.quantity; q += 1) {
                        this.addBlockToInventory(blockId);
                    }
                    this.uiDirty = true;
                    if (this.chatOverlay) {
                        this.chatOverlay.pushMessage('system', 'Coletou ' + drop.block_id + (drop.quantity > 1 ? ' x' + drop.quantity : '') + '.');
                    }
                }
            } else {
                remaining.push(drop);
            }
        }

        this.worldDrops = remaining;
    }

    getDropRenderables() {
        if (!this.worldDrops.length) {
            return [];
        }

        const bobY = Math.sin(this.dropSpinTime * 2.5) * 0.1;
        return this.worldDrops.map(function (drop) {
            return buildDropRenderable(drop, bobY);
        });
    }

    updateHunger(deltaTime, movementState) {
        if (this.dead || isCreativeMode(this.gameMode)) {
            return;
        }

        const speed = movementState && Number.isFinite(movementState.speed) ? movementState.speed : 0;
        const moving = movementState && movementState.grounded === true && speed > 0.1;
        const multiplier = moving ? (speed > WORLD_CONFIG.baseMoveSpeed ? 1.75 : 1) : 0.18;
        this.hungerElapsed = (this.hungerElapsed || 0) + deltaTime * multiplier;

        if (this.hungerElapsed >= WORLD_CONFIG.hungerDrainInterval) {
            this.hungerElapsed = 0;
            this.hunger = Math.max(0, this.hunger - 1);
            this.uiDirty = true;
        }

        this.starvationElapsed = (this.starvationElapsed || 0) + deltaTime;
        if (this.hunger <= 0 && this.starvationElapsed >= WORLD_CONFIG.starvationDamageInterval) {
            this.starvationElapsed = 0;
            this.applyDamage(1, 'fome', null);
        }
    }

    decrementSelectedSlot() {
        if (isCreativeMode(this.gameMode)) {
            this.uiDirty = true;
            return;
        }

        const slot = this.inventorySlots[this.selectedHotbarIndex];
        if (!slot) {
            return;
        }

        slot.quantity -= 1;
        if (slot.quantity <= 0) {
            this.inventorySlots[this.selectedHotbarIndex] = null;
        }
        this.uiDirty = true;
    }

    updateTarget() {
        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen || this.chatOpen || this.dead) {
            this.currentBlockTarget = null;
            this.currentEntityTarget = null;
            this.resetBreakingProgress();
            this.overlay.setTarget('Nenhum');
            this.crosshair.setTargetActive(false);
            return;
        }

        const cameraState = this.player.getCameraState();
        const blockTarget = this.raycast.pick(cameraState);
        const entityTarget = this.entityPicker.pick(cameraState, this.mobManager.getEntities());

        if (entityTarget && (!blockTarget || entityTarget.distance <= blockTarget.distance)) {
            this.currentEntityTarget = entityTarget;
            this.currentBlockTarget = null;
            this.resetBreakingProgress();
            this.overlay.setTarget(entityTarget.entity.getDisplayName() + ' | ' + entityTarget.entity.getBehaviorLabel());
            this.crosshair.setTargetActive(true);
            return;
        }

        this.currentEntityTarget = null;
        this.currentBlockTarget = blockTarget;
        if (!blockTarget) {
            this.resetBreakingProgress();
            this.overlay.setTarget('Nenhum');
            this.crosshair.setTargetActive(false);
            return;
        }

        const targetKey = this.getBlockTargetKey(blockTarget);
        if (this.interaction.breakingTargetKey && this.interaction.breakingTargetKey !== targetKey) {
            this.resetBreakingProgress();
        }

        const targetParts = [getBlockName(blockTarget.blockId), blockTarget.distance.toFixed(1) + 'm'];
        const breakingProgress = this.interaction.getBreakingProgress(blockTarget);
        if (breakingProgress > 0) {
            targetParts.push('Quebrando ' + Math.floor(breakingProgress * 100) + '%');
        }

        this.overlay.setTarget(targetParts.join(' | '));
        this.crosshair.setTargetActive(true);
    }

    getBlockTargetKey(target = this.currentBlockTarget) {
        if (!target || !target.block) {
            return null;
        }

        return this.interaction.getTargetKey(target);
    }

    resetBreakingProgress() {
        this.interaction.resetBreaking();
    }

    getPlacementPreview(target = this.currentBlockTarget) {
        return this.interaction.getPlacementPreview(
            this.world,
            target,
            this.inventorySlots[this.selectedHotbarIndex],
            this.player ? this.player.getBodyAabb() : null
        );
    }


    getSurfaceBlockIdUnderPlayer() {
        if (!this.player || !this.world) {
            return 0;
        }

        const feet = this.player.getFeetPosition();
        const blockX = Math.floor(feet.x);
        const blockZ = Math.floor(feet.z);
        const topY = this.world.getTopSolidYAt(feet.x, feet.z);
        if (topY < 0) {
            return 0;
        }

        return this.world.getBlockIdAtBlock(blockX, topY, blockZ);
    }

    getBlockSoundKey(blockId) {
        const key = getBlockDefinitionById(blockId).key;
        if (key === 'grass') {
            return 'grass';
        }
        if (key === 'dirt') {
            return 'dirt';
        }
        if (key === 'stone' || key === 'bedrock') {
            return 'stone';
        }
        if (key === 'sand') {
            return 'sand';
        }
        if (key === 'wood') {
            return 'wood';
        }
        if (key === 'leaves') {
            return 'leaves';
        }
        return 'default';
    }

    updateFootsteps(deltaTime, movementState) {
        if (!movementState || movementState.flying || !movementState.grounded || movementState.speed < 1.1) {
            this.footstepElapsed = 0;
            return;
        }

        this.footstepElapsed += deltaTime;
        const interval = movementState.speed > 4.2 ? 0.34 : 0.43;
        if (this.footstepElapsed < interval) {
            return;
        }

        this.footstepElapsed = 0;
        this.lastFootstepMaterial = this.getBlockSoundKey(this.getSurfaceBlockIdUnderPlayer());
        this.audio.playFootstep(this.lastFootstepMaterial);
    }
    breakTargetBlock() {
        if (!this.currentBlockTarget || !this.currentBlockTarget.breakable) {
            return;
        }

        if (!isCreativeMode(this.gameMode) && !this.canAddBlockToInventory(this.currentBlockTarget.blockId)) {
            this.overlay.setStatus('Inventario cheio. Libere espaco antes de quebrar esse bloco.');
            this.resetBreakingProgress();
            return;
        }

        const removedBlockId = this.world.breakBlockAt(this.currentBlockTarget.block.x, this.currentBlockTarget.block.y, this.currentBlockTarget.block.z);
        if (removedBlockId === null) {
            return;
        }

        if (!isCreativeMode(this.gameMode) && !this.addBlockToInventory(removedBlockId)) {
            this.world.placeBlockAt(
                this.currentBlockTarget.block.x,
                this.currentBlockTarget.block.y,
                this.currentBlockTarget.block.z,
                removedBlockId,
                null
            );
            this.resetBreakingProgress();
            return;
        }
        this.chunkManager.markBlockDirty(this.currentBlockTarget.block.x, this.currentBlockTarget.block.y, this.currentBlockTarget.block.z);
        this.hand.triggerUse();
        this.audio.playBlockBreak(this.getBlockSoundKey(removedBlockId));
        this.currentBlockTarget = null;
        this.resetBreakingProgress();
    }

    updateBreaking(deltaTime) {
        if (isCreativeMode(this.gameMode) && this.primaryActionHeld && !this.currentEntityTarget && this.currentBlockTarget && this.currentBlockTarget.breakable) {
            this.breakTargetBlock();
            return;
        }

        if (this.interaction.updateBreaking({
            held: this.primaryActionHeld,
            hasEntityTarget: Boolean(this.currentEntityTarget),
            target: this.currentBlockTarget,
            deltaTime: deltaTime
        })) {
            this.breakTargetBlock();
        }
    }

    attackTargetEntity() {
        if (!this.currentEntityTarget) {
            return;
        }

        const damage = this.getHeldAttackDamage();
        const result = this.mobManager.hitEntity(this.currentEntityTarget.entity.id, this.player.getFeetPosition(), damage);
        if (!result) {
            return;
        }

        this.hand.triggerUse();
        this.audio.playCatHurt();

        if (result.died) {
            this.overlay.setStatus(result.entity.getDisplayName() + ' derrotado.');
            if (this.chatOverlay) {
                this.chatOverlay.pushMessage('system', 'Voce derrotou ' + result.entity.getDisplayName().toLowerCase() + '.');
            }
            if (Array.isArray(result.drops)) {
                result.drops.forEach((drop) => {
                    if (!drop || !drop.block_id) {
                        return;
                    }

                    this.dropSequence += 1;
                    this.worldDrops.push({
                        id: 'rd-' + this.dropSequence,
                        block_id: drop.block_id,
                        quantity: Math.max(1, Number(drop.quantity || 1)),
                        x: result.entity.position.x,
                        y: result.entity.position.y,
                        z: result.entity.position.z
                    });
                });
            }
            this.currentEntityTarget = null;
            this.uiDirty = true;
            return;
        }

        this.overlay.setStatus(result.entity.getDisplayName() + ' sofreu dano.');
        if (this.chatOverlay) {
            this.chatOverlay.pushMessage('system', 'Voce acertou ' + result.entity.getDisplayName().toLowerCase() + '.');
        }
    }

    placeSelectedBlock() {
        if (!this.currentBlockTarget || !this.currentBlockTarget.place) {
            return;
        }

        const slot = this.inventorySlots[this.selectedHotbarIndex];
        if (!slot) {
            return;
        }

        const blockId = getBlockIdByKey(slot.block_id);
        if (!isPlaceableBlock(blockId)) {
            return;
        }

        const placeCell = this.currentBlockTarget.place;
        const placed = this.world.placeBlockAt(placeCell.x, placeCell.y, placeCell.z, blockId, this.player.getBodyAabb());
        if (!placed) {
            return;
        }

        this.decrementSelectedSlot();
        this.chunkManager.markBlockDirty(placeCell.x, placeCell.y, placeCell.z);
        this.hand.triggerUse();
        this.audio.playBlockPlace(this.getBlockSoundKey(blockId));
        this.currentBlockTarget = null;
    }

    toggleEntityFollow() {
        if (!this.currentEntityTarget) {
            return;
        }

        const result = this.mobManager.toggleFollow(this.currentEntityTarget.entity.id);
        if (!result || !this.chatOverlay) {
            return;
        }

        if (result.blocked) {
            this.chatOverlay.pushMessage('system', result.message || 'Esse mob nao pode obedecer agora.');
            return;
        }

        const label = result.entity && typeof result.entity.getDisplayName === 'function'
            ? result.entity.getDisplayName()
            : 'Esse mob';
        this.chatOverlay.pushMessage('system', result.following ? (label + ' agora vai seguir voce.') : (label + ' voltou a vagar normalmente.'));
    }

    handlePlayerEvents(events) {
        if (!Array.isArray(events)) {
            return;
        }

        events.forEach((event) => {
            if (!event || event.type !== 'fall_damage') {
                return;
            }

            const damage = Math.max(1, Math.floor(Number(event.distance || 0)) - (WORLD_CONFIG.fallDamageStart - 1));
            this.applyDamage(damage, 'queda', null);
        });
    }

    handleMobEvents(events) {
        if (!Array.isArray(events)) {
            return;
        }

        events.forEach((event) => {
            if (!event || event.type !== 'player_hit') {
                return;
            }

            this.applyDamage(Number(event.damage || 1), event.cause || event.entityType || 'mob', event.source || null);
        });
    }

    applyDamage(amount, cause, sourcePosition) {
        if (this.sessionState === SESSION_STATES.DYING || this.sessionState === SESSION_STATES.DEAD || this.sessionState === SESSION_STATES.SAVING) {
            return;
        }

        const damage = Math.max(1, Math.floor(Number(amount || 0)));
        this.health = Math.max(0, this.health - damage);
        this.healthFlashTime = 0.32;
        this.uiDirty = true;
        void this.audio.unlock();
        this.audio.playDamage();

        if (sourcePosition) {
            this.player.applyKnockback(sourcePosition);
        }

        if (cause === 'queda') {
            this.overlay.setStatus('Voce sofreu dano de queda.');
        } else if (cause === 'cat') {
            this.overlay.setStatus('O gato acertou voce.');
        } else if (cause === 'hostile' || cause === 'crawler') {
            this.overlay.setStatus('Uma criatura hostil acertou voce.');
        } else if (cause === 'pig' || cause === 'sheep') {
            this.overlay.setStatus('O mob revidou o ataque.');
        } else if (cause === 'fome') {
            this.overlay.setStatus('Voce esta sofrendo com a fome.');
        } else {
            this.overlay.setStatus('Voce sofreu dano.');
        }

        if (this.health <= 0) {
            this.beginDeathSequence();
        }
    }

    showDeathOverlay(ready) {
        if (!this.deathOverlay) {
            return;
        }

        this.deathOverlay.hidden = false;
        this.deathOverlay.classList.add('is-visible');
        if (this.deathCard) {
            this.deathCard.hidden = false;
        }

        if (ready) {
            this.deathOverlay.classList.add('is-ready');
        } else {
            this.deathOverlay.classList.remove('is-ready');
        }
    }

    hideDeathOverlay() {
        if (!this.deathOverlay) {
            return;
        }

        this.deathOverlay.hidden = true;
        this.deathOverlay.classList.remove('is-visible');
        this.deathOverlay.classList.remove('is-ready');
        if (this.deathCard) {
            this.deathCard.hidden = true;
        }
    }

    beginDeathSequence() {
        this.dead = true;
        this.health = 0;
        this.sessionState = SESSION_STATES.DYING;
        this.deathElapsed = 0;
        this.uiDirty = true;

        if (this.inventoryOpen) {
            this.returnInventoryCursor();
            this.inventoryOpen = false;
            this.inventorySelectedSlotIndex = null;
            this.inventoryPanel.hide();
        }
        if (this.chatOpen) {
            this.closeChat(false);
        }

        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.overlay.hideInstruction();
        this.overlay.setStatus('Voce morreu.');
        this.showDeathOverlay(false);
    }

    enterDeathMenu(immediate) {
        this.dead = true;
        this.health = 0;
        this.sessionState = SESSION_STATES.DEAD;
        this.deathElapsed = immediate ? 1 : 0;
        this.uiDirty = true;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.overlay.hideInstruction();
        this.overlay.setStatus('Voce morreu.');
        this.showDeathOverlay(true);
    }
    updateDeathState(deltaTime) {
        if (this.sessionState !== SESSION_STATES.DYING) {
            return;
        }

        this.deathElapsed += deltaTime;
        if (this.deathElapsed >= 1) {
            this.sessionState = SESSION_STATES.DEAD;
            this.showDeathOverlay(true);
        }
    }

    async respawnAfterDeath() {
        if (this.sessionState !== SESSION_STATES.DEAD) {
            return;
        }

        this.dead = false;
        this.health = WORLD_CONFIG.maxHealth;
        this.hunger = WORLD_CONFIG.maxHunger;
        this.inventorySlots = createEmptyInventorySlots();
        this.selectedHotbarIndex = 0;
        this.inventorySelectedSlotIndex = null;
        this.hideDeathOverlay();
        this.mobManager.resetAfterRespawn();

        if (this.player.isFlying()) {
            this.player.toggleFlightMode();
        }

        this.player.teleportTo(this.worldSpawnPose);
        this.chunkManager.update(this.player.getFeetPosition(), true);
        await this.loadNextChunkBatch(6);
        this.chunkManager.drainQueue(4);

        this.sessionState = SESSION_STATES.RUNNING;
        this.player.setGameplayEnabled(true);
        this.player.resetTransientInput();
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        if (this.coordsVisible) {
            this.overlay.setCoords(this.player.getFeetPosition());
        }
        this.uiDirty = true;
        this.player.requestPointerLock();
    }

    buildSaveState() {
        const pose = this.player.getSavePose();
        return {
            schema_version: 3,
            game_mode: this.gameMode,
            player: Object.assign({}, pose, {
                selected_hotbar_index: this.selectedHotbarIndex,
                health: this.health,
                hunger: this.hunger,
                max_health: WORLD_CONFIG.maxHealth,
                dead: this.dead ? 1 : 0,
                spawn_position: this.spawnPosition || {
                    x: Number(this.worldSpawnPose.x.toFixed(3)),
                    y: Number(this.worldSpawnPose.y.toFixed(3)),
                    z: Number(this.worldSpawnPose.z.toFixed(3))
                }
            }),
            inventory: {
                slots: cloneInventorySlots(this.inventorySlots)
            },
            world: {
                block_mutations: this.world.getSerializedMutations(),
                item_drops: this.worldDrops.map(function (drop) {
                    return {
                        block_id: drop.block_id,
                        quantity: drop.quantity,
                        x: Number(drop.x.toFixed(3)),
                        y: Number(drop.y.toFixed(3)),
                        z: Number(drop.z.toFixed(3))
                    };
                })
            }
        };
    }

    pause() {
        if (this.sessionState !== SESSION_STATES.RUNNING || this.dead) {
            return;
        }

        if (this.inventoryOpen) {
            this.returnInventoryCursor();
            this.inventoryOpen = false;
            this.inventorySelectedSlotIndex = null;
            this.inventoryPanel.hide();
        }
        if (this.chatOpen) {
            this.closeChat(false);
        }

        this.sessionState = SESSION_STATES.PAUSED;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.overlay.hideInstruction();
        this.overlay.setStatus('Jogo pausado.');
        this.updatePauseMenuData();

        if (this.pauseMenu) {
            this.pauseMenu.setSaving(false);
            this.pauseMenu.show('A partida foi pausada. Revise os dados do mundo, ajuste as configuracoes ou salve e volte ao menu principal.');
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
        this.crosshair.setTargetActive(false);
        if (requestPointerLock) {
            this.player.requestPointerLock();
        }
    }

    async saveAndExit() {
        if (this.sessionState !== SESSION_STATES.PAUSED || !this.repository) {
            return;
        }

        await this.persistWorldAndExit('Salvando mundo e saindo...', SESSION_STATES.PAUSED);
    }

    async saveAndExitFromDeath() {
        if (this.sessionState !== SESSION_STATES.DEAD || !this.repository) {
            return;
        }

        await this.persistWorldAndExit('Salvando estado de morte e retornando ao menu...', SESSION_STATES.DEAD);
    }

    async persistWorldAndExit(statusMessage, returnState) {
        this.sessionState = SESSION_STATES.SAVING;
        this.player.setGameplayEnabled(false);
        this.player.resetTransientInput();
        this.player.releasePointerLock();
        this.overlay.hideInstruction();
        this.overlay.setStatus(statusMessage);
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);

        if (this.pauseMenu && returnState === SESSION_STATES.PAUSED) {
            this.pauseMenu.show(statusMessage);
            this.pauseMenu.setSaving(true, statusMessage);
        }

        try {
            await this.loadNextChunkBatch(6);

            let settleGuard = 0;
            while (settleGuard < 8 && this.chunkManager.getPendingCount() > 0) {
                await this.loadNextChunkBatch(6);
                const drained = this.chunkManager.drainQueue(4);
                if (drained.processed === 0) {
                    break;
                }
                settleGuard += 1;
            }

            if (this.chunkLoadInFlight) {
                await this.chunkLoadInFlight;
            }

            while (await this.flushPendingChunkSaves(true)) {
                if (this.chunkManager.getPendingSaveCount() === 0) {
                    break;
                }
            }

            await this.repository.saveGameState(this.worldMeta.id, this.buildSaveState());
            this.destroy();
            window.location.href = window.ENV.DOMAIN + '/index.php?page=menu';
        } catch (error) {
            this.overlay.setStatus('Falha ao salvar o mundo.');

            if (returnState === SESSION_STATES.PAUSED) {
                this.sessionState = SESSION_STATES.PAUSED;
                if (this.pauseMenu) {
                    this.pauseMenu.setSaving(false, error && error.message ? error.message : 'Nao foi possivel salvar o estado do mundo.');
                }
                return;
            }

            this.sessionState = SESSION_STATES.DEAD;
            this.showDeathOverlay(true);
        }
    }
    handleRuntimeActions(actions) {
        if (actions.hotbarIndex !== null && actions.hotbarIndex !== undefined) {
            this.setSelectedHotbarIndex(actions.hotbarIndex);
        }
        if (actions.hotbarScrollDelta) {
            this.shiftHotbarSelection(actions.hotbarScrollDelta);
        }
        if (actions.toggleCoords) {
            this.toggleCoords();
        }

        if (actions.togglePause) {
            if (this.sessionState === SESSION_STATES.RUNNING) {
                this.pause();
            } else if (this.sessionState === SESSION_STATES.PAUSED) {
                this.resume(false);
            }
        }

        if (actions.toggleChat && this.sessionState === SESSION_STATES.RUNNING) {
            this.toggleChat();
        }
        if (actions.toggleInventory && this.sessionState === SESSION_STATES.RUNNING) {
            this.toggleInventory();
        }
        if (actions.toggleFlight && this.sessionState === SESSION_STATES.RUNNING && !this.inventoryOpen && !this.chatOpen && this.player.isFlyEnabled()) {
            const flying = this.player.toggleFlightMode();
            this.overlay.setStatus(flying ? 'Voo ativo.' : 'Voo desativado.');
            this.uiDirty = true;
        }

        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen || this.chatOpen || this.dead) {
            return;
        }

        if (actions.primaryAction) {
            if (this.currentEntityTarget) {
                this.attackTargetEntity();
            }
        }

        if (actions.secondaryAction) {
            if (this.currentEntityTarget) {
                this.toggleEntityFollow();
            } else {
                const consumed = this.consumeSelectedFood();
                if (!consumed) {
                    this.placeSelectedBlock();
                }
            }
        }
    }

    updateAdaptiveQuality(deltaTime) {
        this.qualityElapsed += deltaTime;
        this.frameTimeAccumulator += deltaTime;
        this.frameSampleCount += 1;

        if (!this.renderer || this.qualityElapsed < 1.2 || this.frameSampleCount === 0) {
            return;
        }

        const averageFrame = this.frameTimeAccumulator / this.frameSampleCount;
        this.qualityElapsed = 0;
        this.frameTimeAccumulator = 0;
        this.frameSampleCount = 0;

        if (averageFrame > 0.028 && this.renderer.renderScale > this.renderer.minRenderScale + 0.02) {
            this.renderer.setRenderScale(this.renderer.renderScale - 0.1);
        } else if (averageFrame < 0.017 && this.renderer.renderScale < 1) {
            this.renderer.setRenderScale(this.renderer.renderScale + 0.05);
        }
    }

    getTelemetrySnapshot() {
        const memory = typeof performance !== 'undefined' && performance.memory
            ? {
                usedHeapBytes: performance.memory.usedJSHeapSize,
                totalHeapBytes: performance.memory.totalJSHeapSize,
                heapLimitBytes: performance.memory.jsHeapSizeLimit
            }
            : null;

        return this.telemetry.snapshot({
            worldId: this.worldMeta.id_mundo || this.worldMeta.id || null,
            algorithmVersion: this.worldMeta.algorithm_version || null,
            viewport: this.canvas ? this.canvas.width + 'x' + this.canvas.height : null,
            renderDistance: this.userConfig.render_distance,
            renderer: this.renderer ? this.renderer.constructor.name : null,
            loadedChunks: this.chunkManager ? this.chunkManager.getLoadedChunkCount() : 0,
            pendingChunks: this.chunkManager ? this.chunkManager.getPendingCount() : 0,
            memory: memory
        });
    }

    exportTelemetryJSON() {
        return JSON.stringify(this.getTelemetrySnapshot(), null, 2);
    }

    async settleChunkWindow(batchSize = 6, drainBudget = 4) {
        await this.loadNextChunkBatch(batchSize);

        let guard = 0;
        while (guard < 8 && this.chunkManager.getPendingCount() > 0) {
            await this.loadNextChunkBatch(batchSize);
            const drained = this.chunkManager.drainQueue(drainBudget);
            if (drained.processed === 0) {
                break;
            }
            guard += 1;
        }

        if (this.chunkLoadInFlight) {
            await this.chunkLoadInFlight;
        }

        while (await this.flushPendingChunkSaves(true)) {
            if (this.chunkManager.getPendingSaveCount() === 0) {
                break;
            }
        }
    }

    findNearbyWaterPose(radius = 160) {
        const origin = this.player.getFeetPosition();
        let biomeFallback = null;
        for (let offset = 8; offset <= radius; offset += 8) {
            for (let x = -offset; x <= offset; x += 8) {
                for (let z = -offset; z <= offset; z += 8) {
                    const sampleX = Math.floor(origin.x + x);
                    const sampleZ = Math.floor(origin.z + z);
                    const topY = this.world.getTopSolidYAt(sampleX + 0.5, sampleZ + 0.5);
                    if (topY < 0) {
                        continue;
                    }

                    const waterBlockId = this.world.getBlockIdAtBlock(sampleX, topY + 1, sampleZ);
                    if (waterBlockId === BLOCK_TYPES.water) {
                        return { x: sampleX + 0.5, y: topY + 1.2, z: sampleZ + 0.5 };
                    }

                    if (!biomeFallback) {
                        const biome = this.world.getSurfaceBiome(sampleX, sampleZ);
                        if (biome && (biome.key === 'river' || biome.key === 'lake')) {
                            biomeFallback = { x: sampleX + 0.5, y: topY + 1.2, z: sampleZ + 0.5 };
                        }
                    }
                }
            }
        }

        return biomeFallback;
    }

    findNearbyBuildSpot(radius = 8) {
        const origin = this.player.getFeetPosition();
        for (let offsetX = -radius; offsetX <= radius; offsetX += 2) {
            for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 2) {
                const blockX = Math.floor(origin.x + offsetX);
                const blockZ = Math.floor(origin.z + offsetZ);
                const topY = this.world.getTopSolidYAt(blockX + 0.5, blockZ + 0.5);
                if (topY < 0 || topY + 1 >= WORLD_CONFIG.height) {
                    continue;
                }

                if (this.world.canPlaceBlockAt(blockX, topY + 1, blockZ, BLOCK_TYPES.dirt, null)) {
                    return { x: blockX, y: topY + 1, z: blockZ };
                }
            }
        }

        return null;
    }

    async runIntegratedSmokeScenario() {
        const report = {
            inventory: false,
            placement: false,
            breaking: false,
            water: false,
            saveResume: false,
            deathRespawn: false
        };

        this.toggleInventory();
        if (this.inventoryOpen) {
            this.toggleInventory();
            report.inventory = !this.inventoryOpen;
        }

        this.addBlockToInventory(BLOCK_TYPES.dirt);
        const selectedSlot = this.inventorySlots[this.selectedHotbarIndex];
        const buildSpot = selectedSlot ? this.findNearbyBuildSpot() : null;
        if (buildSpot) {
            if (this.world.placeBlockAt(buildSpot.x, buildSpot.y, buildSpot.z, getBlockIdByKey(selectedSlot.block_id), null)) {
                this.decrementSelectedSlot();
                this.chunkManager.markBlockDirty(buildSpot.x, buildSpot.y, buildSpot.z);
                report.placement = true;
                const removed = this.world.breakBlockAt(buildSpot.x, buildSpot.y, buildSpot.z);
                if (removed !== null) {
                    this.addBlockToInventory(removed);
                    this.chunkManager.markBlockDirty(buildSpot.x, buildSpot.y, buildSpot.z);
                    report.breaking = true;
                }
            }
        }

        let waterPose = this.findNearbyWaterPose();
        if (!waterPose) {
            const fallbackSpot = this.findNearbyBuildSpot(4);
            if (fallbackSpot && fallbackSpot.y + 1 < WORLD_CONFIG.height) {
                this.world.setMutation(fallbackSpot.x, fallbackSpot.y, fallbackSpot.z, BLOCK_TYPES.water, true);
                this.chunkManager.markBlockDirty(fallbackSpot.x, fallbackSpot.y, fallbackSpot.z);
                waterPose = { x: fallbackSpot.x + 0.5, y: fallbackSpot.y + 0.2, z: fallbackSpot.z + 0.5 };
            }
        }

        if (waterPose) {
            this.player.teleportTo(waterPose);
            this.chunkManager.update(this.player.getFeetPosition(), true);
            await this.settleChunkWindow();
            report.water = true;
        }

        await this.settleChunkWindow();
        if (this.repository) {
            const saveState = this.buildSaveState();
            await this.repository.saveGameState(this.worldMeta.id, saveState);
            const reloaded = await this.repository.loadGameContext(this.worldMeta.id);
            report.saveResume = Boolean(
                reloaded
                && reloaded.saveState
                && reloaded.saveState.player
                && Array.isArray(reloaded.saveState.inventory && reloaded.saveState.inventory.slots)
            );
        }

        this.enterDeathMenu(true);
        await this.respawnAfterDeath();
        report.deathRespawn = this.sessionState === SESSION_STATES.RUNNING && this.health === WORLD_CONFIG.maxHealth;

        return report;
    }

    async runChunkTraversalBenchmark(chunkCount = 20, stepDelayMs = 350) {
        const count = Math.max(1, Math.floor(Number(chunkCount || 20)));
        const delay = Math.max(50, Math.floor(Number(stepDelayMs || 350)));
        const origin = this.player.getFeetPosition();
        this.telemetry.reset();

        for (let index = 1; index <= count; index += 1) {
            const x = Math.min(WORLD_CONFIG.maxX - 2, origin.x + index * WORLD_CONFIG.chunkSize);
            const topY = this.world.getTopSolidYAt(x, origin.z) + 1;
            this.player.teleportTo({ x: x, y: Math.max(1, topY), z: origin.z });
            this.chunkManager.update(this.player.getFeetPosition(), true);
            await new Promise((resolve) => window.setTimeout(resolve, delay));
        }

        this.player.teleportTo(origin);
        return this.getTelemetrySnapshot();
    }

    loop(timestamp) {
        if (!this.running) {
            return;
        }

        const deltaTime = Math.min(0.033, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
        if (this.sessionState === SESSION_STATES.RUNNING && !this.inventoryOpen && !this.chatOpen && !this.dead) {
            this.telemetry.recordFrame(timestamp - this.lastFrameTime);
        }
        this.lastFrameTime = timestamp;

        const actions = this.player ? this.player.consumeInputActions() : {};
        this.primaryActionHeld = Boolean(actions.primaryHeld);
        this.handleRuntimeActions(actions);

        const previousFlash = this.healthFlashTime;
        this.healthFlashTime = Math.max(0, this.healthFlashTime - deltaTime);
        if ((previousFlash > 0 && this.healthFlashTime === 0) || (previousFlash === 0 && this.healthFlashTime > 0)) {
            this.uiDirty = true;
        }

        let chunkWindowChanged = false;
        let chunkResult = { processed: 0, generated: 0, rebuilt: 0 };
        let movementState = this.player.getMovementState();

        if (this.sessionState === SESSION_STATES.RUNNING) {
            if (!this.inventoryOpen && !this.chatOpen) {
                this.hudElapsed += deltaTime;
                this.handlePlayerEvents(this.player.update(deltaTime));
                movementState = this.player.getMovementState();
                this.updateFootsteps(deltaTime, movementState);
                this.updateHunger(deltaTime, movementState);
            }

            this.handleMobEvents(this.mobManager.update(deltaTime, this.player.getFeetPosition()));
            this.updateWorldDropPickups(deltaTime);
            chunkWindowChanged = this.chunkManager.update(this.player.getFeetPosition(), false);
            chunkResult = this.telemetry.measureChunkJob(
                'chunk-drain',
                () => this.chunkManager.drainQueue(this.getChunkDrainBudget(deltaTime)),
                { pending: this.chunkManager.getPendingCount() }
            );

            if (chunkWindowChanged || this.chunkManager.getPendingCount() > 0) {
                void this.loadNextChunkBatch(this.performanceProfile.turboEnabled ? 3 : 2);
            }

            if (chunkResult.generated > 0 || chunkResult.rebuilt > 0 || this.chunkManager.getPendingSaveCount() > 0) {
                void this.flushPendingChunkSaves(false);
            }
        } else if (this.sessionState === SESSION_STATES.DYING) {
            this.updateDeathState(deltaTime);
        }

        const feetPosition = this.player.getFeetPosition();
        this.updateTarget();
        this.updateBreaking(deltaTime);
        this.updateAdaptiveQuality(deltaTime);

        if (this.uiDirty) {
            this.renderUi();
        }

        this.hand.update(deltaTime, movementState, this.sessionState === SESSION_STATES.RUNNING && !this.inventoryOpen && !this.chatOpen && !this.dead);
        this.renderer.render(
            this.player.getCameraState(),
            this.chunkManager.getRenderableChunks(),
            this.currentBlockTarget,
            this.mobManager.getRenderableEntities().concat(this.getDropRenderables())
        );

        if (this.hudElapsed >= 0.1 || chunkWindowChanged || chunkResult.processed > 0) {
            if (this.coordsVisible) {
                this.overlay.setCoords(feetPosition);
            }
            this.hudElapsed = 0;
        }

        this.frameHandle = window.requestAnimationFrame(this.loop);
    }

    handleResize() {
        if (this.renderer) {
            this.renderer.resize();
        }

        if (this.renderer && this.player) {
            this.renderer.render(
                this.player.getCameraState(),
                this.chunkManager.getRenderableChunks(),
                this.currentBlockTarget,
                this.mobManager.getRenderableEntities().concat(this.getDropRenderables())
            );
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
        if (this.telemetry) {
            this.telemetry.destroy();
        }
        if (this.chunkWorkerClient) {
            this.chunkWorkerClient.destroy();
        }
        if (this.pauseMenu) {
            this.pauseMenu.hide();
        }
        if (this.inventoryPanel) {
            this.inventoryPanel.hide();
        }
        if (this.chatOverlay) {
            this.chatOverlay.hide();
        }
        if (this.crosshair) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
        }
        if (this.hand) {
            this.hand.hide();
        }

        this.hideDeathOverlay();

        if (this.overlay) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Cena encerrada.');
            this.overlay.setTarget('Nenhum');
        }
    }
}
