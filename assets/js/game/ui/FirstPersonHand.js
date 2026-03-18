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
        this.useTime = 0.18;
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
        const flying = movementState && movementState.flying === true;
        const walkFactor = flying ? 0.08 : Math.min(1, speed / 4.8);
        this.motion += deltaTime * (2.8 + walkFactor * 6.6);
        this.useTime = Math.max(0, this.useTime - deltaTime);

        const swingX = Math.sin(this.motion) * 10 * walkFactor;
        const swingY = Math.abs(Math.cos(this.motion * 0.84)) * 8 * walkFactor;
        const useFactor = this.useTime > 0 ? Math.sin((1 - this.useTime / 0.18) * Math.PI) : 0;
        const translateX = 4 + swingX - useFactor * 24;
        const translateY = swingY + useFactor * 16 + (flying ? -4 : 0);
        const rotation = 14 + swingX * 0.26 - useFactor * 18 - (flying ? 4 : 0);

        this.root.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) rotate(' + rotation + 'deg)';
    }
}