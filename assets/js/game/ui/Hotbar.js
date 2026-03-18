import { renderItemIconMarkup } from './ItemIcon.js';

export class Hotbar {
    constructor(root) {
        this.root = root;
        this.onSelect = null;
    }

    render(slots, selectedIndex) {
        if (!this.root) {
            return;
        }

        const hotbarSlots = Array.isArray(slots) ? slots.slice(0, 9) : [];
        this.root.innerHTML = hotbarSlots.map((slot, index) => {
            const quantity = slot && Number.isFinite(slot.quantity) ? slot.quantity : '';
            const iconMarkup = slot && slot.block_id ? renderItemIconMarkup(slot.block_id, 'game-item-icon--hotbar') : '';

            return '<button class="game-hotbar__slot'
                + (index === selectedIndex ? ' is-active' : '')
                + '" type="button" data-hotbar-slot="' + index + '">'
                + '<span class="game-hotbar__slot-body">'
                + iconMarkup
                + '<span class="game-hotbar__slot-count">' + quantity + '</span>'
                + '<span class="game-hotbar__slot-index">' + (index + 1) + '</span>'
                + '</span>'
                + '</button>';
        }).join('');

        this.bindEvents();
    }

    bindEvents() {
        if (!this.root || this.root.dataset.bound === '1') {
            return;
        }

        this.root.addEventListener('click', (event) => {
            const target = event.target.closest('[data-hotbar-slot]');
            if (!target || typeof this.onSelect !== 'function') {
                return;
            }

            this.onSelect(Number(target.dataset.hotbarSlot));
        });

        this.root.dataset.bound = '1';
    }
}
