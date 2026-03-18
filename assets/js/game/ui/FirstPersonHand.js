export class FirstPersonHand {
    constructor(root) {
        this.root = root;
        this.motion = 0;
        this.useTime = 0;
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

    triggerUse() {
        this.useTime = 0.16;
    }

    update(deltaTime, movementState, isVisible) {
        if (!this.root) {
            return;
        }

        if (!isVisible) {
            this.hide();
            return;
        }

        this.show();
        const speed = movementState && Number.isFinite(movementState.speed) ? movementState.speed : 0;
        const walkFactor = Math.min(1, speed / 4.6);
        this.motion += deltaTime * (3.5 + walkFactor * 6.5);
        this.useTime = Math.max(0, this.useTime - deltaTime);

        const swingX = Math.sin(this.motion) * 8 * walkFactor;
        const swingY = Math.abs(Math.cos(this.motion * 0.82)) * 6 * walkFactor;
        const useFactor = this.useTime > 0 ? Math.sin((1 - this.useTime / 0.16) * Math.PI) : 0;
        const useX = -18 * useFactor;
        const useY = 14 * useFactor;
        const rotation = -9 + swingX * 0.16 - useFactor * 12;

        this.root.style.transform = 'translate3d(' + (swingX + useX) + 'px, ' + (swingY + useY) + 'px, 0) rotate(' + rotation + 'deg)';
    }
}
