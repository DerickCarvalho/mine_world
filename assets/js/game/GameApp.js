import { SoftwareRenderer } from './render/SoftwareRenderer.js';
import { PlayerController } from './player/PlayerController.js';
import { ChunkManager } from './world/ChunkManager.js';
import { ChunkMesher } from './world/ChunkMesher.js';
import { ChunkStore } from './world/ChunkStore.js';
import { TerrainGenerator } from './world/TerrainGenerator.js';
import { MutableWorld } from './world/MutableWorld.js';
import { RaycastPicker } from './world/RaycastPicker.js';
import { getBlockIdByKey, getBlockKeyById, getBlockMaxStack, getBlockName, isPlaceableBlock } from './world/BlockTypes.js';
import { setBlockTextureCatalog } from './world/ChunkMaterials.js';
import { WORLD_CONFIG, normalizeRuntimeConfig } from './world/WorldConfig.js';
import { Hotbar } from './ui/Hotbar.js';
import { InventoryPanel } from './ui/InventoryPanel.js';
import { FirstPersonHand } from './ui/FirstPersonHand.js';
import { MobManager } from './entities/MobManager.js';
import { EntityPicker } from './entities/EntityPicker.js';

const SESSION_STATES = Object.freeze({
    BOOTING: 'booting',
    RUNNING: 'running',
    PAUSED: 'paused',
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

        if (isPlaceableBlock(blockId) && Number.isFinite(quantity) && quantity > 0) {
            normalized[index] = {
                block_id: getBlockKeyById(blockId),
                quantity: Math.max(1, Math.min(getBlockMaxStack(blockId), quantity))
            };
        }
    }

    return normalized;
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
        this.running = false;
        this.sessionState = SESSION_STATES.BOOTING;
        this.frameHandle = null;
        this.lastFrameTime = 0;
        this.hudElapsed = 0;
        this.qualityElapsed = 0;
        this.frameTimeAccumulator = 0;
        this.frameSampleCount = 0;
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;
        this.inventoryOpen = false;
        this.chatOpen = false;
        this.inventorySelectedSlotIndex = null;
        this.coordsVisible = false;
        this.chunkLoadInFlight = null;
        this.chunkSaveInFlight = null;
        this.cachedChunkCount = Number(this.chunkStats.cached_chunks_count || 0);
        this.availableCommands = this.initialCommands.slice();
        this.inventorySlots = normalizeInventorySlots(this.initialSaveState && this.initialSaveState.inventory ? this.initialSaveState.inventory.slots : []);
        this.selectedHotbarIndex = Math.max(0, Math.min(8, Math.floor(Number(this.initialSaveState && this.initialSaveState.player ? this.initialSaveState.player.selected_hotbar_index || 0 : 0))));
        this.uiDirty = true;

        this.hotbar = new Hotbar(this.root.querySelector('[data-game-hotbar]'));
        this.inventoryPanel = new InventoryPanel(this.root.querySelector('[data-game-inventory]'));
        this.hand = new FirstPersonHand(this.root.querySelector('[data-game-hand]'));

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
        this.renderer = new SoftwareRenderer(this.canvas);
        await this.renderer.setTextureCatalog(this.textureManifest);
        this.terrain = new TerrainGenerator(this.worldMeta.seed, this.worldMeta.algorithm_version);
        this.world = new MutableWorld(this.terrain);
        this.world.applySerializedMutations(this.initialSaveState && this.initialSaveState.world ? this.initialSaveState.world.block_mutations : []);
        this.raycast = new RaycastPicker(this.world);
        this.entityPicker = new EntityPicker();
        this.chunkStore = new ChunkStore();
        this.chunkMesher = new ChunkMesher(this.world);
        this.chunkManager = new ChunkManager({
            store: this.chunkStore,
            mesher: this.chunkMesher,
            world: this.world,
            renderDistance: this.userConfig.render_distance
        });
        this.mobManager = new MobManager(this.world);

        const spawnPose = this.resolveSpawnPose(this.initialSaveState);
        this.player = new PlayerController({
            world: this.world,
            canvas: this.canvas,
            config: this.userConfig,
            spawn: spawnPose
        });

        this.configureUi();

        this.player.onPointerLockChange = (locked) => {
            this.handlePointerLockChange(locked);
        };

        this.player.attach();
        this.player.setGameplayEnabled(true);

        await this.prepareInitialChunks(spawnPose);
        await this.loadAvailableCommands(false);

        if (this.chatOverlay) {
            this.chatOverlay.pushMessage('system', 'Chat pronto. Digite / para listar comandos disponiveis.');
        }

        this.overlay.setCoords(this.player.getFeetPosition());
        this.overlay.hideBlocking();
        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        this.renderUi();
        this.renderer.render(this.player.getCameraState(), this.chunkManager.getRenderableChunks(), null, this.mobManager.getRenderableEntities());

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        this.running = true;
        this.sessionState = SESSION_STATES.RUNNING;
        this.lastFrameTime = performance.now();
        this.frameHandle = window.requestAnimationFrame(this.loop);
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
            this.pauseMenu.setConfig(this.userConfig);
            this.pauseMenu.hide();
        }

        if (this.hotbar) {
            this.hotbar.onSelect = (index) => {
                this.setSelectedHotbarIndex(index);
            };
        }

        if (this.inventoryPanel) {
            this.inventoryPanel.onSlotClick = (index) => {
                this.handleInventorySlotClick(index);
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
    }
    resolveSpawnPose(saveState) {
        const proceduralSpawn = this.world.findSpawnPoint();
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

        if (!this.world.isInsideWorld(x, z)) {
            return fallbackPose;
        }

        const supportHeight = this.world.getTopSolidYAt(x, z) + 1;

        return {
            x: x,
            y: Math.max(y, supportHeight),
            z: z,
            yaw: yaw,
            pitch: pitch
        };
    }

    async prepareInitialChunks(spawnPose) {
        this.overlay.showLoading('Preparando terreno', 'Carregando a janela inicial de chunks do mundo.');
        this.chunkManager.update(spawnPose, true);

        let guard = 0;
        while (this.chunkManager.getLoadedChunkCount() < INITIAL_CHUNK_TARGET && this.chunkManager.getPendingCount() > 0 && guard < 24) {
            await this.loadNextChunkBatch(10);
            const result = this.chunkManager.drainQueue(8);

            if (result.processed === 0 && this.chunkManager.getPendingCount() === 0) {
                break;
            }

            await this.flushPendingChunkSaves(true);
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

        const batch = this.chunkManager.takeSaveBatch(forceWait ? 12 : 4);
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

        if (this.player) {
            this.player.applyConfig(this.userConfig);
        }

        if (this.chunkManager) {
            this.chunkManager.setRenderDistance(this.userConfig.render_distance);

            if (this.player) {
                this.chunkManager.update(this.player.getFeetPosition(), true);
                void this.loadNextChunkBatch(10);
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
        if (this.hotbar) {
            this.hotbar.render(this.inventorySlots, this.selectedHotbarIndex);
        }

        if (this.inventoryPanel) {
            this.inventoryPanel.render(this.inventorySlots, this.inventorySelectedSlotIndex, this.selectedHotbarIndex);
        }

        this.uiDirty = false;
    }

    updatePauseMenuData() {
        if (!this.pauseMenu || !this.player) {
            return;
        }

        this.pauseMenu.setWorldData({
            name: this.worldMeta.nome || 'Mundo',
            seed: this.worldMeta.seed || '-',
            algorithmVersion: this.worldMeta.algorithm_version || 'v1',
            loadedChunks: this.chunkManager ? this.chunkManager.getLoadedChunkCount() : 0,
            cachedChunks: this.cachedChunkCount,
            position: this.player.getFeetPosition()
        });
    }

    handlePointerLockChange(locked) {
        if (!this.overlay || !this.crosshair) {
            return;
        }

        if (this.sessionState !== SESSION_STATES.RUNNING) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.hideInstruction();
            return;
        }

        if (this.chatOpen) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.showInstruction(CHAT_HINT);
            this.overlay.setStatus('Chat aberto.');
            return;
        }

        if (this.inventoryOpen) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.showInstruction(INVENTORY_HINT);
            this.overlay.setStatus('Inventario aberto.');
            return;
        }

        if (locked) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Explorando o terreno.');
            this.crosshair.show();
            return;
        }

        this.overlay.showInstruction(POINTER_LOCK_HINT);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
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

    setSelectedHotbarIndex(index) {
        const normalized = Math.max(0, Math.min(8, Math.floor(Number(index || 0))));
        if (normalized === this.selectedHotbarIndex) {
            return;
        }

        this.selectedHotbarIndex = normalized;
        this.uiDirty = true;
    }

    shiftHotbarSelection(delta) {
        if (!delta) {
            return;
        }

        let nextIndex = this.selectedHotbarIndex;
        const steps = Math.abs(delta);

        for (let index = 0; index < steps; index += 1) {
            if (delta > 0) {
                nextIndex = (nextIndex + 1) % 9;
            } else {
                nextIndex = (nextIndex + 8) % 9;
            }
        }

        this.setSelectedHotbarIndex(nextIndex);
    }

    toggleCoords() {
        this.coordsVisible = !this.coordsVisible;
        this.overlay.setCoordsVisible(this.coordsVisible);

        if (this.coordsVisible && this.player) {
            this.overlay.setCoords(this.player.getFeetPosition());
        }
    }

    toggleInventory() {
        if (this.sessionState !== SESSION_STATES.RUNNING || this.chatOpen) {
            return;
        }

        if (this.inventoryOpen) {
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
        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen) {
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
        await this.loadNextChunkBatch(16);
        this.chunkManager.drainQueue(12);
        this.currentBlockTarget = null;
        this.currentEntityTarget = null;

        if (this.coordsVisible) {
            this.overlay.setCoords(this.player.getFeetPosition());
        }

        this.overlay.setStatus('Teleporte executado.');
        return 'Teleporte executado para X ' + x.toFixed(1) + ' | Y ' + y.toFixed(1) + ' | Z ' + z.toFixed(1);
    }

    handleInventorySlotClick(index) {
        if (!this.inventoryOpen) {
            return;
        }

        if (index >= 0 && index < 9) {
            this.setSelectedHotbarIndex(index);
        }

        if (this.inventorySelectedSlotIndex === null) {
            if (this.inventorySlots[index]) {
                this.inventorySelectedSlotIndex = index;
                this.uiDirty = true;
            }
            return;
        }

        if (this.inventorySelectedSlotIndex === index) {
            this.inventorySelectedSlotIndex = null;
            this.uiDirty = true;
            return;
        }

        const previous = this.inventorySlots[this.inventorySelectedSlotIndex];
        this.inventorySlots[this.inventorySelectedSlotIndex] = this.inventorySlots[index];
        this.inventorySlots[index] = previous;
        this.inventorySelectedSlotIndex = null;
        this.uiDirty = true;
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
                this.inventorySlots[index] = {
                    block_id: blockKey,
                    quantity: 1
                };
                this.uiDirty = true;
                return true;
            }
        }

        return false;
    }

    decrementSelectedSlot() {
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
        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen || this.chatOpen) {
            this.currentBlockTarget = null;
            this.currentEntityTarget = null;
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
            this.overlay.setTarget(entityTarget.entity.getDisplayName() + ' | ' + (entityTarget.entity.following ? 'seguindo' : 'vagando'));
            this.crosshair.setTargetActive(true);
            return;
        }

        this.currentEntityTarget = null;
        this.currentBlockTarget = blockTarget;
        if (!blockTarget) {
            this.overlay.setTarget('Nenhum');
            this.crosshair.setTargetActive(false);
            return;
        }

        this.overlay.setTarget(getBlockName(blockTarget.blockId) + ' | ' + blockTarget.distance.toFixed(1) + 'm');
        this.crosshair.setTargetActive(true);
    }

    breakTargetBlock() {
        if (!this.currentBlockTarget || !this.currentBlockTarget.breakable) {
            return;
        }

        const removedBlockId = this.world.breakBlockAt(this.currentBlockTarget.block.x, this.currentBlockTarget.block.y, this.currentBlockTarget.block.z);
        if (removedBlockId === null) {
            return;
        }

        this.addBlockToInventory(removedBlockId);
        this.chunkManager.markBlockDirty(this.currentBlockTarget.block.x, this.currentBlockTarget.block.y, this.currentBlockTarget.block.z);
        this.hand.triggerUse();
        this.currentBlockTarget = null;
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

        this.chatOverlay.pushMessage('system', result.following ? 'O gato agora vai seguir voce.' : 'O gato voltou a vagar normalmente.');
    }

    buildSaveState() {
        return {
            schema_version: 2,
            player: Object.assign({}, this.player.getSavePose(), {
                selected_hotbar_index: this.selectedHotbarIndex
            }),
            inventory: {
                slots: cloneInventorySlots(this.inventorySlots)
            },
            world: {
                block_mutations: this.world.getSerializedMutations()
            }
        };
    }

    pause() {
        if (this.sessionState !== SESSION_STATES.RUNNING) {
            return;
        }

        if (this.inventoryOpen) {
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
            await this.loadNextChunkBatch(16);

            let settleGuard = 0;
            while (settleGuard < 8 && this.chunkManager.getPendingCount() > 0) {
                await this.loadNextChunkBatch(16);
                const drained = this.chunkManager.drainQueue(16);

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
            this.sessionState = SESSION_STATES.PAUSED;
            this.overlay.setStatus('Falha ao salvar o mundo.');

            if (this.pauseMenu) {
                this.pauseMenu.setSaving(false, error && error.message ? error.message : 'Nao foi possivel salvar o estado do mundo.');
            }
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

        if (this.sessionState !== SESSION_STATES.RUNNING || this.inventoryOpen || this.chatOpen) {
            return;
        }

        if (actions.primaryAction) {
            this.breakTargetBlock();
        }

        if (actions.secondaryAction) {
            if (this.currentEntityTarget) {
                this.toggleEntityFollow();
            } else {
                this.placeSelectedBlock();
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

        if (averageFrame > 0.028 && this.renderer.renderScale > 0.7) {
            this.renderer.setRenderScale(this.renderer.renderScale - 0.1);
        } else if (averageFrame < 0.017 && this.renderer.renderScale < 1) {
            this.renderer.setRenderScale(this.renderer.renderScale + 0.05);
        }
    }

    loop(timestamp) {
        if (!this.running) {
            return;
        }

        const deltaTime = Math.min(0.033, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
        this.lastFrameTime = timestamp;

        const actions = this.player ? this.player.consumeInputActions() : {};
        this.handleRuntimeActions(actions);

        let chunkWindowChanged = false;
        let chunkResult = { processed: 0, generated: 0, rebuilt: 0 };

        if (this.sessionState === SESSION_STATES.RUNNING) {
            if (!this.inventoryOpen && !this.chatOpen) {
                this.hudElapsed += deltaTime;
                this.player.update(deltaTime);
            }

            this.mobManager.update(deltaTime, this.player.getFeetPosition());
            chunkWindowChanged = this.chunkManager.update(this.player.getFeetPosition(), false);
            chunkResult = this.chunkManager.drainQueue(this.getChunkDrainBudget(deltaTime));

            if (chunkWindowChanged || this.chunkManager.getPendingCount() > 0) {
                void this.loadNextChunkBatch(8);
            }

            if (chunkResult.generated > 0 || chunkResult.rebuilt > 0 || this.chunkManager.getPendingSaveCount() > 0) {
                void this.flushPendingChunkSaves(false);
            }
        }

        const feetPosition = this.player.getFeetPosition();
        this.updateTarget();
        this.updateAdaptiveQuality(deltaTime);

        if (this.uiDirty) {
            this.renderUi();
        }

        this.hand.update(deltaTime, this.player.getMovementState(), this.sessionState === SESSION_STATES.RUNNING && !this.inventoryOpen && !this.chatOpen);
        this.renderer.render(
            this.player.getCameraState(),
            this.chunkManager.getRenderableChunks(),
            this.currentBlockTarget,
            this.mobManager.getRenderableEntities()
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
                this.mobManager.getRenderableEntities()
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

        if (this.overlay) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Cena encerrada.');
            this.overlay.setTarget('Nenhum');
        }
    }
}
