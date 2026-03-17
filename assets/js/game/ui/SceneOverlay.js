export class SceneOverlay {
    constructor(root) {
        this.root = root;
        this.blocking = root.querySelector('[data-scene-overlay]');
        this.title = root.querySelector('[data-overlay-title]');
        this.message = root.querySelector('[data-overlay-message]');
        this.actionButton = root.querySelector('[data-overlay-action]');
        this.instruction = root.querySelector('[data-overlay-instruction]');
        this.worldName = root.querySelector('[data-game-world-name]');
        this.status = root.querySelector('[data-game-status]');
        this.coords = root.querySelector('[data-game-coords]');
        this.chunkCount = root.querySelector('[data-game-chunk-count]');
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

    setWorldName(name) {
        if (this.worldName) {
            this.worldName.textContent = name || 'Mundo';
        }
    }

    setStatus(text) {
        if (this.status) {
            this.status.textContent = text;
        }
    }

    setCoords(position) {
        if (!this.coords || !position) {
            return;
        }

        this.coords.textContent = 'X ' + position.x.toFixed(1) + ' | Y ' + position.y.toFixed(1) + ' | Z ' + position.z.toFixed(1);
    }

    setChunkCount(count) {
        if (this.chunkCount) {
            this.chunkCount.textContent = String(count);
        }
    }
}
