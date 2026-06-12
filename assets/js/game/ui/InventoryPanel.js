import { renderItemIconMarkup } from './ItemIcon.js';

export class InventoryPanel {
    constructor(root) {
        this.root = root;
        this.grid = root ? root.querySelector('[data-inventory-grid]') : null;
        this.title = root ? root.querySelector('[data-inventory-title]') : null;
        this.copy = root ? root.querySelector('[data-inventory-copy]') : null;
        this.recipeList = root ? root.querySelector('[data-inventory-recipes]') : null;
        this.craftMode = root ? root.querySelector('[data-inventory-craft-mode]') : null;
        this.creativePanel = root ? root.querySelector('[data-creative-panel]') : null;
        this.creativeList = root ? root.querySelector('[data-inventory-creative]') : null;
        this.cursor = null;
        this.onSlotClick = null;
        this.onRecipeCraft = null;
        this.onCreativePick = null;

        if (this.root && this.grid && this.grid.parentNode) {
            this.cursor = document.createElement('div');
            this.cursor.className = 'game-inventory__cursor';
            this.cursor.setAttribute('aria-live', 'polite');
            this.cursor.hidden = true;
            this.grid.parentNode.insertBefore(this.cursor, this.grid);
        }
    }

    show() {
        if (this.root) {
            this.root.hidden = false;
        }
    }

    hide() {
        if (this.root) {
            this.root.hidden = true;
        }
    }

    isOpen() {
        return Boolean(this.root && !this.root.hidden);
    }

    render(slots, selectedSlotIndex, selectedHotbarIndex, cursorStack = null, options = {}) {
        if (!this.grid) {
            return;
        }

        const gameMode = String(options.gameMode || 'survival');
        const recipes = Array.isArray(options.recipes) ? options.recipes : [];
        const creativePalette = Array.isArray(options.creativePalette) ? options.creativePalette : [];

        if (this.cursor) {
            this.cursor.hidden = !cursorStack;
            this.cursor.innerHTML = cursorStack
                ? 'Na mao: ' + renderItemIconMarkup(cursorStack.block_id, 'game-item-icon--inventory')
                    + '<strong>' + cursorStack.quantity + '</strong>'
                : '';
        }

        this.grid.innerHTML = slots.map((slot, index) => {
            const quantity = slot && Number.isFinite(slot.quantity) ? slot.quantity : '';
            const hotbarClass = index < 9 ? ' is-hotbar' : '';
            const selectedClass = index === selectedSlotIndex ? ' is-selected' : '';
            const activeClass = index === selectedHotbarIndex ? ' is-active-hotbar' : '';
            const iconMarkup = slot && slot.block_id ? renderItemIconMarkup(slot.block_id, 'game-item-icon--inventory') : '';

            return '<button class="game-inventory__slot'
                + hotbarClass + selectedClass + activeClass
                + '" type="button" data-inventory-slot="' + index + '">'
                + '<span class="game-inventory__slot-body">'
                + iconMarkup
                + '<span class="game-inventory__slot-count">' + quantity + '</span>'
                + '<span class="game-inventory__slot-index">' + (index + 1) + '</span>'
                + '</span>'
                + '</button>';
        }).join('');

        if (this.title) {
            this.title.textContent = gameMode === 'creative' ? 'Inventario criativo e crafting' : 'Inventario e crafting';
        }

        if (this.copy) {
            this.copy.textContent = gameMode === 'creative'
                ? 'Escolha blocos no catalogo criativo, organize a hotbar e use a lista de crafts como referencia.'
                : 'Organize recursos, consulte receitas e mantenha a hotbar pronta para construir.';
        }

        if (this.craftMode) {
            this.craftMode.textContent = gameMode === 'creative' ? 'Criativo' : 'Sobrevivencia';
        }

        if (this.recipeList) {
            this.recipeList.innerHTML = recipes.map(function (recipe) {
                const inputs = recipe.inputs.map(function (input) {
                    return input.quantity + 'x ' + input.block_id;
                }).join(' + ');
                const stateClass = recipe.craftable ? ' is-craftable' : ' is-blocked';
                const disabled = recipe.craftable ? '' : ' disabled';
                return '<article class="game-inventory__recipe' + stateClass + '">'
                    + '<div class="game-inventory__recipe-copy">'
                    + '<strong>' + recipe.name + '</strong>'
                    + '<span>' + recipe.description + '</span>'
                    + '<small>' + inputs + ' -> ' + recipe.output.quantity + 'x ' + recipe.output.block_id + '</small>'
                    + '</div>'
                    + '<button class="button button--ghost game-inventory__recipe-action" type="button" data-craft-recipe="' + recipe.id + '"' + disabled + '>Craftar</button>'
                    + '</article>';
            }).join('');
        }

        if (this.creativePanel) {
            this.creativePanel.hidden = gameMode !== 'creative';
        }

        if (this.creativeList) {
            this.creativeList.innerHTML = creativePalette.map(function (block) {
                return '<button class="game-inventory__creative-item" type="button" data-creative-block="' + block.key + '">'
                    + renderItemIconMarkup(block.key, 'game-item-icon--inventory')
                    + '<span>' + block.name + '</span>'
                    + '</button>';
            }).join('');
        }

        this.bindEvents();
    }

    bindEvents() {
        if (!this.grid || this.grid.dataset.bound === '1') {
            return;
        }

        this.grid.addEventListener('click', (event) => {
            this.notifySlotClick(event, 'primary');
        });

        this.grid.addEventListener('contextmenu', (event) => {
            const target = event.target.closest('[data-inventory-slot]');
            if (!target) {
                return;
            }

            event.preventDefault();
            this.notifySlotClick(event, 'secondary', target);
        });

        if (this.recipeList) {
            this.recipeList.addEventListener('click', (event) => {
                const target = event.target.closest('[data-craft-recipe]');
                if (!target || typeof this.onRecipeCraft !== 'function') {
                    return;
                }

                this.onRecipeCraft(String(target.dataset.craftRecipe || ''));
            });
        }

        if (this.creativeList) {
            this.creativeList.addEventListener('click', (event) => {
                const target = event.target.closest('[data-creative-block]');
                if (!target || typeof this.onCreativePick !== 'function') {
                    return;
                }

                this.onCreativePick(String(target.dataset.creativeBlock || ''));
            });
        }

        this.grid.dataset.bound = '1';
    }

    notifySlotClick(event, click, target = null) {
        const slot = target || event.target.closest('[data-inventory-slot]');
        if (!slot || typeof this.onSlotClick !== 'function') {
            return;
        }

        this.onSlotClick(Number(slot.dataset.inventorySlot), click, event);
    }
}
