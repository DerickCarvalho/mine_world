export class Crosshair {
    constructor(element) {
        this.element = element;
    }

    show() {
        if (this.element) {
            this.element.hidden = false;
        }
    }

    hide() {
        if (this.element) {
            this.element.hidden = true;
        }
    }

    setTargetActive(active) {
        if (!this.element) {
            return;
        }

        this.element.dataset.target = active ? 'active' : 'idle';
    }
}
