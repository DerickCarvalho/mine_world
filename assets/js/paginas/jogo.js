import { GameApp } from '../game/GameApp.js';
import { WorldRepository } from '../game/services/WorldRepository.js';
import { SceneOverlay } from '../game/ui/SceneOverlay.js';
import { Crosshair } from '../game/ui/Crosshair.js';

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

async function bootstrapGame(root, overlay, crosshair) {
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
        destroyActiveGame();

        activeGameApp = new GameApp({
            root: root,
            canvas: root.querySelector('[data-game-canvas]'),
            worldMeta: gameContext.world,
            userConfig: gameContext.config,
            overlay: overlay,
            crosshair: crosshair
        });

        await activeGameApp.start();
    } catch (error) {
        crosshair.hide();
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
    overlay.showLoading('Preparando acesso', 'Validando sessao e aguardando os dados do jogador.');
    crosshair.hide();

    window.addEventListener('mineworld:auth-ready', function () {
        void bootstrapGame(root, overlay, crosshair);
    }, { once: true });

    window.addEventListener('pagehide', destroyActiveGame);
    window.addEventListener('beforeunload', destroyActiveGame);
});
