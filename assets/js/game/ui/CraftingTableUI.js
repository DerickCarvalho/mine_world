import { renderItemIconMarkup } from './ItemIcon.js';

export class CraftingTableUI {
    constructor(root) {
        this.root = root;
        this.grid3x3 = root ? root.querySelector('[data-craft-grid-3x3]') : null;
        this.output3x3 = root ? root.querySelector('[data-craft-output-3x3]') : null;
        this.inventoryMirror = root ? root.querySelector('[data-craft-table-inventory]') : null;

        this.onGridSlotClick = null;
        this.onOutputClick = null;
        this.onClose = null;

        if (this.root) {
            document.addEventListener('keydown', (e) => {
                if ((e.key === 'e' || e.key === 'E' || e.key === 'Escape') && this.isOpen()) {
                    e.preventDefault();
                    if (typeof this.onClose === 'function') this.onClose();
                }
            });
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

    renderSlot(slot, dataset, extraClass = '') {
        const qty = slot && Number.isFinite(slot.quantity) ? slot.quantity : '';
        const icon = slot && slot.block_id ? renderItemIconMarkup(slot.block_id, 'game-item-icon--inventory') : '';
        return '<button class="game-inventory__slot' + extraClass + '" type="button" ' + dataset + '>'
            + '<span class="game-inventory__slot-body">'
            + icon
            + '<span class="game-inventory__slot-count">' + (qty > 1 ? qty : '') + '</span>'
            + '</span>'
            + '</button>';
    }

    render(gridSlots, outputSlot, inventorySlots) {
        if (this.grid3x3) {
            this.grid3x3.innerHTML = gridSlots.map((slot, i) =>
                this.renderSlot(slot, 'data-craft-grid-slot="' + i + '"')
            ).join('');
            this.bindGridEvents();
        }

        if (this.output3x3) {
            const hasOutput = outputSlot && outputSlot.block_id;
            this.output3x3.innerHTML = this.renderSlot(
                outputSlot,
                'data-craft-output-btn',
                hasOutput ? ' is-craftable' : ' is-blocked'
            );
            this.bindOutputEvent();
        }

        if (this.inventoryMirror && Array.isArray(inventorySlots)) {
            this.inventoryMirror.innerHTML = inventorySlots.map((slot, i) =>
                this.renderSlot(slot, 'data-craft-inv-slot="' + i + '"', i < 9 ? ' is-hotbar' : '')
            ).join('');
        }
    }

    bindGridEvents() {
        if (!this.grid3x3 || this.grid3x3.dataset.bound === '1') return;

        this.grid3x3.addEventListener('click', (e) => {
            const target = e.target.closest('[data-craft-grid-slot]');
            if (!target || typeof this.onGridSlotClick !== 'function') return;
            this.onGridSlotClick(Number(target.dataset.craftGridSlot), 'primary');
        });

        this.grid3x3.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-craft-grid-slot]');
            if (!target) return;
            e.preventDefault();
            if (typeof this.onGridSlotClick === 'function') {
                this.onGridSlotClick(Number(target.dataset.craftGridSlot), 'secondary');
            }
        });

        this.grid3x3.dataset.bound = '1';
    }

    bindOutputEvent() {
        if (!this.output3x3 || this.output3x3.dataset.bound === '1') return;

        this.output3x3.addEventListener('click', () => {
            if (typeof this.onOutputClick === 'function') this.onOutputClick('primary');
        });

        this.output3x3.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (typeof this.onOutputClick === 'function') this.onOutputClick('primary');
        });

        this.output3x3.dataset.bound = '1';
    }
}
