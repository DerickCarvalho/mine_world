import { decodeChunkData, encodeChunkData } from '../world/ChunkCodec.js';
import { getBlockIdByKey, getBlockKeyById, getBlockMaxStack, isPlaceableBlock } from '../world/BlockTypes.js';
import { DEFAULT_USER_CONFIG, normalizeRuntimeConfig } from '../world/WorldConfig.js';

const SAVE_SCHEMA_VERSION = 2;
const INVENTORY_SLOT_COUNT = 27;

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function normalizeInventorySlot(slot) {
    if (!slot || typeof slot !== 'object') {
        return null;
    }

    const blockId = getBlockIdByKey(slot.block_id);
    if (!isPlaceableBlock(blockId)) {
        return null;
    }

    const quantity = Math.max(1, Math.min(getBlockMaxStack(blockId), Math.floor(Number(slot.quantity || 0))));
    if (!Number.isFinite(quantity) || quantity <= 0) {
        return null;
    }

    return {
        block_id: getBlockKeyById(blockId),
        quantity: quantity
    };
}

function normalizeInventorySlots(slots) {
    const source = Array.isArray(slots) ? slots : [];
    const normalized = [];

    for (let index = 0; index < INVENTORY_SLOT_COUNT; index += 1) {
        normalized.push(normalizeInventorySlot(source[index]));
    }

    return normalized;
}

function normalizeMutations(mutations) {
    if (!Array.isArray(mutations)) {
        return [];
    }

    const deduped = new Map();

    for (const mutation of mutations) {
        if (!mutation || typeof mutation !== 'object') {
            continue;
        }

        const x = Number(mutation.x);
        const y = Number(mutation.y);
        const z = Number(mutation.z);
        const blockId = getBlockIdByKey(mutation.block_id);

        if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) {
            continue;
        }

        deduped.set(x + ':' + y + ':' + z, {
            x: x,
            y: y,
            z: z,
            block_id: getBlockKeyById(blockId)
        });
    }

    return Array.from(deduped.values());
}

function normalizeSaveState(saveState) {
    if (!saveState || typeof saveState !== 'object') {
        return null;
    }

    const player = saveState.player && typeof saveState.player === 'object' ? saveState.player : null;
    const position = player && player.position && typeof player.position === 'object' ? player.position : null;
    const rotation = player && player.rotation && typeof player.rotation === 'object' ? player.rotation : null;

    if (!position || !rotation) {
        return null;
    }

    const x = Number(position.x);
    const y = Number(position.y);
    const z = Number(position.z);
    const yaw = Number(rotation.yaw);
    const pitch = Number(rotation.pitch);

    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(z) || !isFiniteNumber(yaw) || !isFiniteNumber(pitch)) {
        return null;
    }

    const selectedHotbarIndex = Math.max(0, Math.min(8, Math.floor(Number(player.selected_hotbar_index || 0))));
    const inventory = saveState.inventory && typeof saveState.inventory === 'object' ? saveState.inventory : {};
    const world = saveState.world && typeof saveState.world === 'object' ? saveState.world : {};

    return {
        schema_version: SAVE_SCHEMA_VERSION,
        player: {
            position: {
                x: Number(x.toFixed(3)),
                y: Number(y.toFixed(3)),
                z: Number(z.toFixed(3))
            },
            rotation: {
                yaw: Number(yaw.toFixed(6)),
                pitch: Number(pitch.toFixed(6))
            },
            selected_hotbar_index: selectedHotbarIndex
        },
        inventory: {
            slots: normalizeInventorySlots(inventory.slots)
        },
        world: {
            block_mutations: normalizeMutations(world.block_mutations || world.modified_blocks)
        },
        saved_at: saveState.saved_at || null
    };
}

export class WorldRepository {
    async loadGameContext(worldId) {
        const [worldPayload, config] = await Promise.all([
            this.fetchWorld(worldId),
            this.fetchUserConfig().catch(function () {
                return DEFAULT_USER_CONFIG;
            })
        ]);

        return {
            world: worldPayload.world,
            saveState: worldPayload.saveState,
            chunkStats: worldPayload.chunkStats,
            config: normalizeRuntimeConfig(config)
        };
    }

    async fetchWorld(worldId) {
        const payload = await window.ApiRequest.get('mundos/buscar.php', {
            data: { id: worldId },
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data || !payload.data.world) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar o mundo selecionado.');
        }

        return {
            world: payload.data.world,
            saveState: normalizeSaveState(payload.data.save_state || null),
            chunkStats: payload.data.chunk_stats || { cached_chunks_count: 0 }
        };
    }

    async fetchUserConfig() {
        const payload = await window.ApiRequest.get('configuracoes/buscar.php', {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar as configuracoes do jogador.');
        }

        return payload.data;
    }

    async saveUserConfig(config) {
        const payload = await window.ApiRequest.post('configuracoes/salvar.php', config, {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar as configuracoes.');
        }

        return normalizeRuntimeConfig(payload.data);
    }

    async saveGameState(worldId, state) {
        const normalizedState = normalizeSaveState(state);

        if (!normalizedState) {
            throw new Error('Nao foi possivel montar um estado valido para salvar o mundo.');
        }

        const payload = await window.ApiRequest.post('mundos/salvar_estado.php', {
            id_mundo: worldId,
            state: normalizedState
        }, {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar o estado do mundo.');
        }

        return normalizeSaveState(payload.data.save_state || normalizedState) || normalizedState;
    }

    async loadChunkBatch(worldId, chunkCoords) {
        const requestedChunks = Array.isArray(chunkCoords) ? chunkCoords : [];
        if (requestedChunks.length === 0) {
            return new Map();
        }

        const payload = await window.ApiRequest.post('mundos/carregar_chunks.php', {
            id_mundo: worldId,
            chunks: requestedChunks.map(function (chunk) {
                return {
                    chunk_x: Number(chunk.chunkX),
                    chunk_z: Number(chunk.chunkZ)
                };
            })
        }, {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar os chunks salvos do mundo.');
        }

        const output = new Map();

        for (const chunk of Array.isArray(payload.data.chunks) ? payload.data.chunks : []) {
            const data = decodeChunkData(chunk.data_base64 || '');
            if (!data) {
                continue;
            }

            output.set(chunk.chunk_x + ',' + chunk.chunk_z, {
                chunkX: Number(chunk.chunk_x),
                chunkZ: Number(chunk.chunk_z),
                data: data
            });
        }

        return output;
    }

    async loadChunk(worldId, chunkX, chunkZ) {
        const batch = await this.loadChunkBatch(worldId, [{ chunkX: chunkX, chunkZ: chunkZ }]);
        const entry = batch.get(chunkX + ',' + chunkZ);
        return entry ? entry.data : null;
    }

    async saveChunks(worldId, chunks) {
        const validChunks = Array.isArray(chunks) ? chunks.filter(function (chunk) {
            return chunk && Number.isInteger(Number(chunk.chunkX)) && Number.isInteger(Number(chunk.chunkZ)) && chunk.data instanceof Uint8Array;
        }) : [];

        if (validChunks.length === 0) {
            return {
                savedCount: 0,
                cachedChunksCount: null
            };
        }

        const payload = await window.ApiRequest.post('mundos/salvar_chunks.php', {
            id_mundo: worldId,
            chunks: validChunks.map(function (chunk) {
                return {
                    chunk_x: Number(chunk.chunkX),
                    chunk_z: Number(chunk.chunkZ),
                    data_base64: encodeChunkData(chunk.data)
                };
            })
        }, {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar os chunks do mundo.');
        }

        return {
            savedCount: Number(payload.data.saved_count || 0),
            cachedChunksCount: Number(payload.data.cached_chunks_count || 0)
        };
    }
}
