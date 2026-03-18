export class SceneOverlay {
    constructor(root) {
        this.root = root;
        this.blocking = root ? root.querySelector('[data-scene-overlay]') : null;
        this.title = root ? root.querySelector('[data-overlay-title]') : null;
        this.message = root ? root.querySelector('[data-overlay-message]') : null;
        this.actionButton = root ? root.querySelector('[data-overlay-action]') : null;
        this.instruction = root ? root.querySelector('[data-overlay-instruction]') : null;
        this.status = root ? root.querySelector('[data-game-status]') : null;
        this.coords = root ? root.querySelector('[data-game-coords]') : null;
        this.coordsChip = root ? root.querySelector('[data-game-coords-chip]') : null;
        this.target = root ? root.querySelector('[data-game-target]') : null;
        this.actionHandler = null;

        if (this.actionButton) {
            this.actionButton.addEventListener('click', () => {
                if (typeof this.actionHandler === 'function') {
                    this.actionHandler();
                }
            });
        }
    }

    showLoading(title, message) {
        if (this.blocking) {
            this.blocking.hidden = false;
        }

        if (this.title) {
            this.title.textContent = title;
        }

        if (this.message) {
            this.message.textContent = message;
        }

        if (this.actionButton) {
            this.actionButton.hidden = true;
        }

        this.actionHandler = null;
    }

    hideBlocking() {
        if (this.blocking) {
            this.blocking.hidden = true;
        }
    }

    showError(title, message, action) {
        if (this.blocking) {
            this.blocking.hidden = false;
        }

        if (this.title) {
            this.title.textContent = title;
        }

        if (this.message) {
            this.message.textContent = message;
        }

        if (!this.actionButton) {
            return;
        }

        if (!action) {
            this.actionButton.hidden = true;
            this.actionHandler = null;
            return;
        }

        this.actionButton.hidden = false;
        this.actionButton.textContent = action.label || 'Voltar';
        this.actionHandler = typeof action.onClick === 'function' ? action.onClick : null;
    }

    showInstruction(text) {
        if (!this.instruction) {
            return;
        }

        this.instruction.textContent = text;
        this.instruction.hidden = false;
    }

    hideInstruction() {
        if (this.instruction) {
            this.instruction.hidden = true;
        }
    }

    setStatus(text) {
        if (this.status) {
            this.status.textContent = text;
        }
    }

    setTarget(text) {
        if (this.target) {
            this.target.textContent = text || 'Nenhum';
        }
    }

    setCoords(position) {
        if (!this.coords || !position) {
            return;
        }

        this.coords.textContent = 'X ' + position.x.toFixed(1) + ' | Y ' + position.y.toFixed(1) + ' | Z ' + position.z.toFixed(1);
    }

    setCoordsVisible(visible) {
        if (this.coordsChip) {
            this.coordsChip.hidden = !visible;
        }
    }
}
