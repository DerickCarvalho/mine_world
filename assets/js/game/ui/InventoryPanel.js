export class InventoryPanel {
    constructor(root) {
        this.root = root;
        this.grid = root ? root.querySelector('[data-inventory-grid]') : null;
        this.onSlotClick = null;
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

    render(slots, selectedSlotIndex, selectedHotbarIndex) {
        if (!this.grid) {
            return;
        }

        this.grid.innerHTML = slots.map((slot, index) => {
            const label = slot && slot.block_id ? slot.block_id.toUpperCase().slice(0, 3) : '';
            const quantity = slot && Number.isFinite(slot.quantity) ? slot.quantity : '';
            const hotbarClass = index < 9 ? ' is-hotbar' : '';
            const selectedClass = index === selectedSlotIndex ? ' is-selected' : '';
            const activeClass = index === selectedHotbarIndex ? ' is-active-hotbar' : '';

            return '<button class="game-inventory__slot'
                + hotbarClass + selectedClass + activeClass
                + '" type="button" data-inventory-slot="' + index + '">'
                + '<span class="game-inventory__slot-label">' + label + '</span>'
                + '<span class="game-inventory__slot-count">' + quantity + '</span>'
                + '<span class="game-inventory__slot-index">' + (index + 1) + '</span>'
                + '</button>';
        }).join('');

        this.bindEvents();
    }

    bindEvents() {
        if (!this.grid || this.grid.dataset.bound === '1') {
            return;
        }

        this.grid.addEventListener('click', (event) => {
            const target = event.target.closest('[data-inventory-slot]');
            if (!target || typeof this.onSlotClick !== 'function') {
                return;
            }

            this.onSlotClick(Number(target.dataset.inventorySlot));
        });

        this.grid.dataset.bound = '1';
    }
}
