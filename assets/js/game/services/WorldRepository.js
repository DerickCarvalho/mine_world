import { DEFAULT_USER_CONFIG, normalizeRuntimeConfig } from '../world/WorldConfig.js';

const SAVE_SCHEMA_VERSION = 1;

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
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

    const world = saveState.world && typeof saveState.world === 'object' ? saveState.world : {};
    const modifiedBlocks = Array.isArray(world.modified_blocks) ? world.modified_blocks : [];

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
            }
        },
        world: {
            modified_blocks: modifiedBlocks
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
            saveState: normalizeSaveState(payload.data.save_state || null)
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
}
