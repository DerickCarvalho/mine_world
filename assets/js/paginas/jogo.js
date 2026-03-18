import { GameApp } from '../game/GameApp.js';
import { WorldRepository } from '../game/services/WorldRepository.js';
import { WorldPrebuilder } from '../game/services/WorldPrebuilder.js';
import { SceneOverlay } from '../game/ui/SceneOverlay.js';
import { Crosshair } from '../game/ui/Crosshair.js';
import { PauseMenu } from '../game/ui/PauseMenu.js';

let activeGameApp = null;

function redirectToWorldList() {
    window.location.href = window.ENV.DOMAIN + '/index.php?page=mundos';
}

function destroyActiveGame() {
    if (!activeGameApp) {
        return;
    }

    activeGameApp.destroy();
    activeGameApp = null;
}

function readWorldId(root) {
    const rawValue = root.dataset.worldId || new URLSearchParams(window.location.search).get('id_mundo') || '0';
    const parsed = Number(rawValue);
    return Number.isInteger(parsed) ? parsed : 0;
}

async function bootstrapGame(root, overlay, crosshair, pauseMenu) {
    const worldId = readWorldId(root);

    if (worldId <= 0) {
        overlay.showError(
            'Mundo invalido',
            'Nao foi possivel identificar o mundo solicitado para abrir a cena.',
            {
                label: 'Voltar ao lobby',
                onClick: redirectToWorldList
            }
        );
        return;
    }

    const repository = new WorldRepository();
    overlay.showLoading('Carregando mundo', 'Buscando metadados, configuracoes e preparando o runtime.');

    try {
        const gameContext = await repository.loadGameContext(worldId);
        const prebuilder = new WorldPrebuilder({
            repository: repository,
            worldMeta: gameContext.world,
            saveState: gameContext.saveState,
            radius: 2,
            batchSize: 8,
            onProgress: function (title, message) {
                overlay.showLoading(title, message);
            }
        });
        const prebuildResult = await prebuilder.ensureInitialChunkWindow();

        destroyActiveGame();

        activeGameApp = new GameApp({
            root: root,
            canvas: root.querySelector('[data-game-canvas]'),
            worldMeta: gameContext.world,
            userConfig: gameContext.config,
            saveState: gameContext.saveState,
            chunkStats: {
                cached_chunks_count: Math.max(
                    Number(gameContext.chunkStats && gameContext.chunkStats.cached_chunks_count || 0),
                    Number(prebuildResult.cachedChunksCount || 0)
                )
            },
            repository: repository,
            overlay: overlay,
            crosshair: crosshair,
            pauseMenu: pauseMenu
        });

        await activeGameApp.start();
    } catch (error) {
        crosshair.hide();

        if (pauseMenu) {
            pauseMenu.hide();
        }

        overlay.showError(
            'Falha ao abrir mundo',
            error && error.message ? error.message : 'Nao foi possivel iniciar o mundo 3D.',
            {
                label: 'Voltar ao lobby',
                onClick: redirectToWorldList
            }
        );
    }
}

window.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-game-root]');
    if (!root) {
        return;
    }

    const overlay = new SceneOverlay(root);
    const crosshair = new Crosshair(root.querySelector('[data-crosshair]'));
    const pauseMenu = new PauseMenu(root.querySelector('[data-pause-menu]'));
    overlay.showLoading('Preparando acesso', 'Validando sessao e aguardando os dados do jogador.');
    crosshair.hide();

    window.addEventListener('mineworld:auth-ready', function () {
        void bootstrapGame(root, overlay, crosshair, pauseMenu);
    }, { once: true });

    window.addEventListener('pagehide', destroyActiveGame);
    window.addEventListener('beforeunload', destroyActiveGame);
});
