import { renderItemIconMarkup } from './ItemIcon.js';

export class InventoryPanel {
    constructor(root) {
        this.root = root;
        this.grid = root ? root.querySelector('[data-inventory-grid]') : null;
        this.title = root ? root.querySelector('[data-inventory-title]') : null;
        this.copy = root ? root.querySelector('[data-inventory-copy]') : null;
        this.craftMode = root ? root.querySelector('[data-inventory-craft-mode]') : null;
        this.craftGrid2x2 = root ? root.querySelector('[data-craft-grid-2x2]') : null;
        this.craftOutput2x2 = root ? root.querySelector('[data-craft-output-2x2]') : null;
        this.creativePanel = root ? root.querySelector('[data-creative-panel]') : null;
        this.creativeList = root ? root.querySelector('[data-inventory-creative]') : null;
        this.cursor = null;

        this.onSlotClick = null;
        this.onCraftGridSlotClick = null;
        this.onCraftOutputClick = null;
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
        if (this.root) this.root.hidden = false;
    }

    hide() {
        if (this.root) this.root.hidden = true;
    }

    isOpen() {
        return Boolean(this.root && !this.root.hidden);
    }

    renderSlotButton(slot, index, extraClass = '', dataset = '') {
        const qty = slot && Number.isFinite(slot.quantity) ? slot.quantity : '';
        const icon = slot && slot.block_id ? renderItemIconMarkup(slot.block_id, 'game-item-icon--inventory') : '';
        const ds = dataset || 'data-inventory-slot="' + index + '"';
        return '<button class="game-inventory__slot' + extraClass + '" type="button" ' + ds + '>'
            + '<span class="game-inventory__slot-body">'
            + icon
            + '<span class="game-inventory__slot-count">' + (qty > 1 ? qty : '') + '</span>'
            + (dataset ? '' : '<span class="game-inventory__slot-index">' + (index + 1) + '</span>')
            + '</span>'
            + '</button>';
    }

    render(slots, selectedSlotIndex, selectedHotbarIndex, cursorStack = null, options = {}) {
        if (!this.grid) return;

        const gameMode = String(options.gameMode || 'survival');
        const creativePalette = Array.isArray(options.creativePalette) ? options.creativePalette : [];
        const craftGridSlots = Array.isArray(options.craftGridSlots) ? options.craftGridSlots : [null, null, null, null];
        const craftOutputSlot = options.craftOutputSlot || null;

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
                : 'Organize recursos, coloque itens na grade 2x2 para craftar itens basicos.';
        }

        if (this.craftGrid2x2) {
            this.craftGrid2x2.innerHTML = craftGridSlots.map((slot, i) =>
                this.renderSlotButton(slot, i, '', 'data-craft2-slot="' + i + '"')
            ).join('');
            this.bindCraftGridEvents();
        }

        if (this.craftOutput2x2) {
            const hasOutput = craftOutputSlot && craftOutputSlot.block_id;
            this.craftOutput2x2.innerHTML = this.renderSlotButton(
                craftOutputSlot,
                -1,
                hasOutput ? ' is-craftable' : ' is-blocked',
                'data-craft2-output'
            );
            this.bindCraftOutputEvent();
        }

        if (this.creativePanel) {
            this.creativePanel.hidden = gameMode !== 'creative';
        }

        if (this.creativeList) {
            this.creativeList.innerHTML = creativePalette.map(block =>
                '<button class="game-inventory__creative-item" type="button" data-creative-block="' + block.key + '">'
                + renderItemIconMarkup(block.key, 'game-item-icon--inventory')
                + '<span>' + block.name + '</span>'
                + '</button>'
            ).join('');
        }

        this.bindEvents();
    }

    bindEvents() {
        if (!this.grid || this.grid.dataset.bound === '1') return;

        this.grid.addEventListener('click', (e) => {
            this.notifySlotClick(e, 'primary');
        });

        this.grid.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-inventory-slot]');
            if (!target) return;
            e.preventDefault();
            this.notifySlotClick(e, 'secondary', target);
        });

        if (this.creativeList) {
            this.creativeList.addEventListener('click', (e) => {
                const target = e.target.closest('[data-creative-block]');
                if (!target || typeof this.onCreativePick !== 'function') return;
                this.onCreativePick(String(target.dataset.creativeBlock || ''));
            });
        }

        this.grid.dataset.bound = '1';
    }

    bindCraftGridEvents() {
        if (!this.craftGrid2x2 || this.craftGrid2x2.dataset.bound === '1') return;

        this.craftGrid2x2.addEventListener('click', (e) => {
            const target = e.target.closest('[data-craft2-slot]');
            if (!target || typeof this.onCraftGridSlotClick !== 'function') return;
            this.onCraftGridSlotClick(Number(target.dataset.craft2Slot), 'primary');
        });

        this.craftGrid2x2.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-craft2-slot]');
            if (!target) return;
            e.preventDefault();
            if (typeof this.onCraftGridSlotClick === 'function') {
                this.onCraftGridSlotClick(Number(target.dataset.craft2Slot), 'secondary');
            }
        });

        this.craftGrid2x2.dataset.bound = '1';
    }

    bindCraftOutputEvent() {
        if (!this.craftOutput2x2 || this.craftOutput2x2.dataset.bound === '1') return;

        this.craftOutput2x2.addEventListener('click', () => {
            if (typeof this.onCraftOutputClick === 'function') this.onCraftOutputClick('primary');
        });

        this.craftOutput2x2.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (typeof this.onCraftOutputClick === 'function') this.onCraftOutputClick('primary');
        });

        this.craftOutput2x2.dataset.bound = '1';
    }

    notifySlotClick(event, click, target = null) {
        const slot = target || event.target.closest('[data-inventory-slot]');
        if (!slot || typeof this.onSlotClick !== 'function') return;
        this.onSlotClick(Number(slot.dataset.inventorySlot), click, event);
    }
}
