import { DEFAULT_USER_CONFIG, normalizeRuntimeConfig } from '../world/WorldConfig.js';

export class WorldRepository {
    async loadGameContext(worldId) {
        const [world, config] = await Promise.all([
            this.fetchWorld(worldId),
            this.fetchUserConfig().catch(function () {
                return DEFAULT_USER_CONFIG;
            })
        ]);

        return {
            world: world,
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

        return payload.data.world;
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
}
