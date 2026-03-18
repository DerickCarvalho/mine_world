import { renderItemIconMarkup } from './ItemIcon.js';

export class FirstPersonHand {
    constructor(root) {
        this.root = root;
        this.motion = 0;
        this.useTime = 0;
        this.currentKey = '';
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

    setItem(slot) {
        if (!this.root) {
            return;
        }

        const nextKey = slot && slot.block_id ? String(slot.block_id) : '';
        if (nextKey === this.currentKey) {
            return;
        }

        this.currentKey = nextKey;
        this.root.innerHTML = nextKey
            ? '<div class="game-held-item__model">' + renderItemIconMarkup(nextKey, 'game-item-icon--held') + '</div>'
            : '';
    }

    triggerUse() {
        this.useTime = 0.18;
    }

    update(deltaTime, movementState, isVisible) {
        if (!this.root) {
            return;
        }

        if (!isVisible || !this.currentKey) {
            this.hide();
            return;
        }

        this.show();
        const speed = movementState && Number.isFinite(movementState.speed) ? movementState.speed : 0;
        const flying = movementState && movementState.flying === true;
        const walking = movementState && movementState.grounded === true && speed > 0.08;
        const walkFactor = walking ? Math.min(1, speed / 4.8) : 0;

        this.motion += deltaTime * (2.2 + walkFactor * 5.2);
        this.useTime = Math.max(0, this.useTime - deltaTime);

        const bobX = Math.sin(this.motion) * 8 * walkFactor;
        const bobY = Math.abs(Math.cos(this.motion * 0.86)) * 7 * walkFactor;
        const useFactor = this.useTime > 0 ? Math.sin((1 - this.useTime / 0.18) * Math.PI) : 0;
        const translateX = 8 + bobX - useFactor * 16;
        const translateY = -4 + bobY + useFactor * 12 + (flying ? -4 : 0);
        const rotateZ = -18 + bobX * 0.16 - useFactor * 10;
        const rotateX = -12 - useFactor * 6;

        this.root.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) rotateZ(' + rotateZ + 'deg) rotateX(' + rotateX + 'deg)';
    }
}
