import { WORLD_CONFIG } from '../world/WorldConfig.js';

export class GameplayHudController {
    constructor(options) {
        this.hotbar = options.hotbar || null;
        this.inventoryPanel = options.inventoryPanel || null;
        this.hand = options.hand || null;
        this.healthBar = options.healthBar || null;
        this.healthText = options.healthText || null;
        this.hungerBar = options.hungerBar || null;
        this.hungerText = options.hungerText || null;
        this.flyChip = options.flyChip || null;
        this.flyText = options.flyText || null;
        this.modeChip = options.modeChip || null;
        this.overlay = options.overlay || null;
        this.crosshair = options.crosshair || null;
        this.pauseMenu = options.pauseMenu || null;
    }

    render(runtime) {
        if (this.hotbar) {
            this.hotbar.render(runtime.inventorySlots, runtime.selectedHotbarIndex);
        }
        if (this.inventoryPanel) {
            this.inventoryPanel.render(
                runtime.inventorySlots,
                runtime.inventorySelectedSlotIndex,
                runtime.selectedHotbarIndex,
                runtime.inventoryCursorStack,
                {
                    gameMode: runtime.gameMode,
                    recipes: runtime.recipes,
                    creativePalette: runtime.creativePalette
                }
            );
        }

        this.renderHealthBar(runtime.health, runtime.healthFlashTime);
        this.renderHungerBar(runtime.hunger);
        this.renderFlightIndicator(runtime.player);
        this.renderGameMode(runtime.gameMode);

        if (this.hand) {
            this.hand.setItem(runtime.inventorySlots[runtime.selectedHotbarIndex] || null, runtime.gameMode);
        }
    }

    renderHealthBar(health, healthFlashTime) {
        if (!this.healthBar) {
            return;
        }

        const recentIndex = health > 0 ? health - 1 : -1;
        this.healthBar.innerHTML = new Array(WORLD_CONFIG.maxHealth).fill(null).map((_, index) => {
            const active = index < health;
            const recent = active && healthFlashTime > 0 && index === recentIndex;
            return '<span class="game-vitals__segment' + (active ? ' is-active' : '') + (recent ? ' is-recent' : '') + '"></span>';
        }).join('');

        if (this.healthText) {
            this.healthText.textContent = health + '/' + WORLD_CONFIG.maxHealth;
        }
    }

    renderHungerBar(hunger) {
        if (!this.hungerBar) {
            return;
        }

        this.hungerBar.innerHTML = new Array(WORLD_CONFIG.maxHunger).fill(null).map((_, index) => {
            const active = index < hunger;
            return '<span class="game-vitals__segment game-vitals__segment--hunger' + (active ? ' is-active' : '') + '"></span>';
        }).join('');

        if (this.hungerText) {
            this.hungerText.textContent = hunger + '/' + WORLD_CONFIG.maxHunger;
        }
    }

    renderFlightIndicator(player) {
        if (!this.flyChip || !this.flyText || !player) {
            return;
        }

        let state = 'off';
        let text = 'OFF';
        if (player.isFlyEnabled()) {
            state = player.isFlying() ? 'active' : 'on';
            text = player.isFlying() ? 'ATIVO' : 'ON';
        }

        this.flyChip.dataset.state = state;
        this.flyText.textContent = text;
    }

    renderGameMode(gameMode) {
        if (!this.modeChip) {
            return;
        }

        this.modeChip.textContent = String(gameMode || 'survival').toUpperCase();
    }

    updatePauseMenu(worldMeta, player, chunkManager, cachedChunkCount) {
        if (!this.pauseMenu || !player) {
            return;
        }

        this.pauseMenu.setWorldData({
            name: worldMeta.nome || 'Mundo',
            seed: worldMeta.seed || '-',
            algorithmVersion: worldMeta.algorithm_version || 'v2',
            loadedChunks: chunkManager ? chunkManager.getLoadedChunkCount() : 0,
            cachedChunks: cachedChunkCount,
            position: player.getFeetPosition(),
            gameMode: worldMeta.gameMode || 'survival'
        });
    }

    handlePointerLockChange(locked, runtime) {
        if (!this.overlay || !this.crosshair) {
            return 'noop';
        }

        if (runtime.sessionState === runtime.sessionStates.DEAD
            || runtime.sessionState === runtime.sessionStates.DYING
            || runtime.sessionState === runtime.sessionStates.SAVING) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.hideInstruction();
            return 'hidden';
        }

        if (runtime.sessionState !== runtime.sessionStates.RUNNING) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.hideInstruction();
            return 'hidden';
        }

        if (runtime.chatOpen) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.showInstruction(runtime.chatHint);
            this.overlay.setStatus('Chat aberto.');
            return 'chat';
        }

        if (runtime.inventoryOpen) {
            this.crosshair.hide();
            this.crosshair.setTargetActive(false);
            this.overlay.showInstruction(runtime.inventoryHint);
            this.overlay.setStatus('Inventario aberto.');
            return 'inventory';
        }

        if (locked) {
            this.overlay.hideInstruction();
            this.overlay.setStatus('Explorando o terreno.');
            this.crosshair.show();
            return 'locked';
        }

        this.overlay.showInstruction(runtime.pointerLockHint);
        this.overlay.setStatus('Clique na cena para capturar o mouse.');
        this.crosshair.hide();
        this.crosshair.setTargetActive(false);
        return 'idle';
    }
}
