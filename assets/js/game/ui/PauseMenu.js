export class PauseMenu {
    constructor(root) {
        this.root = root;
        this.message = root ? root.querySelector('[data-pause-message]') : null;
        this.resumeButton = root ? root.querySelector('[data-pause-resume]') : null;
        this.saveButton = root ? root.querySelector('[data-pause-save-exit]') : null;
        this.onResume = null;
        this.onSaveAndExit = null;
        this.saving = false;

        if (this.resumeButton) {
            this.resumeButton.addEventListener('click', () => {
                if (this.saving || typeof this.onResume !== 'function') {
                    return;
                }

                this.onResume();
            });
        }

        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => {
                if (this.saving || typeof this.onSaveAndExit !== 'function') {
                    return;
                }

                this.onSaveAndExit();
            });
        }
    }

    show(message) {
        if (!this.root) {
            return;
        }

        this.root.hidden = false;
        this.root.dataset.state = this.saving ? 'saving' : 'paused';
        this.setMessage(message || 'A partida foi pausada. Retorne ao jogo ou salve e volte ao menu principal.');
        this.updateButtons();
    }

    hide() {
        if (!this.root) {
            return;
        }

        this.root.hidden = true;
        this.root.dataset.state = 'hidden';
        this.saving = false;
        this.updateButtons();
    }

    setSaving(isSaving, message) {
        this.saving = Boolean(isSaving);

        if (this.root) {
            this.root.dataset.state = this.saving ? 'saving' : 'paused';
        }

        if (message) {
            this.setMessage(message);
        }

        this.updateButtons();
    }

    setMessage(message) {
        if (this.message) {
            this.message.textContent = message;
        }
    }

    updateButtons() {
        if (this.resumeButton) {
            this.resumeButton.disabled = this.saving;
        }

        if (this.saveButton) {
            this.saveButton.disabled = this.saving;
            this.saveButton.textContent = this.saving ? 'Salvando...' : 'Salvar e sair';
        }
    }
}
