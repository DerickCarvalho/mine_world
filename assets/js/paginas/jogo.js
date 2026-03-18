import { GameApp } from '../game/GameApp.js';
import { WorldRepository } from '../game/services/WorldRepository.js';
import { WorldPrebuilder } from '../game/services/WorldPrebuilder.js';
import { TextureRepository } from '../game/services/TextureRepository.js';
import { CommandRepository } from '../game/services/CommandRepository.js';
import { SceneOverlay } from '../game/ui/SceneOverlay.js';
import { Crosshair } from '../game/ui/Crosshair.js';
import { PauseMenu } from '../game/ui/PauseMenu.js';
import { ChatOverlay } from '../game/ui/ChatOverlay.js';

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

function resolvePerformanceProfile() {
    const storageKey = 'mineworld-performance-mode';
    let storedMode = null;

    try {
        storedMode = window.localStorage.getItem(storageKey);
    } catch (error) {
        storedMode = null;
    }

    if (storedMode !== 'turbo' && storedMode !== 'balanced') {
        const turboEnabled = window.confirm('Ativar modo desempenho do MineWorld? Isso aumenta o processamento local, reduz custo das texturas distantes e melhora a fluidez em maquinas mais fortes.');
        storedMode = turboEnabled ? 'turbo' : 'balanced';

        try {
            window.localStorage.setItem(storageKey, storedMode);
        } catch (error) {
            // Ignora navegadores sem armazenamento disponivel.
        }
    }

    return {
        mode: storedMode,
        turboEnabled: storedMode === 'turbo',
        hardwareConcurrency: Math.max(2, Math.floor(Number(navigator.hardwareConcurrency || 4))),
        deviceMemory: Math.max(2, Number(navigator.deviceMemory || 4))
    };
}

async function bootstrapGame(root, overlay, crosshair, pauseMenu, chatOverlay) {
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
    const textureRepository = new TextureRepository();
    const commandRepository = new CommandRepository();
    const performanceProfile = resolvePerformanceProfile();
    overlay.showLoading('Carregando mundo', 'Buscando metadados, configuracoes, comandos e texturas do runtime.');

    try {
        const [gameContext, textureManifest, initialCommands] = await Promise.all([
            repository.loadGameContext(worldId),
            textureRepository.loadManifest().catch(function () {
                return {};
            }),
            commandRepository.listValidated().catch(function () {
                return [];
            })
        ]);

        const prebuilder = new WorldPrebuilder({
            repository: repository,
            worldMeta: gameContext.world,
            saveState: gameContext.saveState,
            radius: performanceProfile.turboEnabled ? 3 : 2,
            batchSize: performanceProfile.turboEnabled ? 10 : 8,
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
            textureManifest: textureManifest,
            initialCommands: initialCommands,
            commandRepository: commandRepository,
            performanceProfile: performanceProfile,
            overlay: overlay,
            crosshair: crosshair,
            pauseMenu: pauseMenu,
            chatOverlay: chatOverlay
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
    const chatOverlay = new ChatOverlay(root.querySelector('[data-game-chat]'));
    overlay.showLoading('Preparando acesso', 'Validando sessao e aguardando os dados do jogador.');
    crosshair.hide();

    window.addEventListener('mineworld:auth-ready', function () {
        void bootstrapGame(root, overlay, crosshair, pauseMenu, chatOverlay);
    }, { once: true });

    window.addEventListener('pagehide', destroyActiveGame);
    window.addEventListener('beforeunload', destroyActiveGame);
});