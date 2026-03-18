import { normalizeRuntimeConfig } from '../world/WorldConfig.js';

function setText(node, value, fallback) {
    if (!node) {
        return;
    }

    node.textContent = value || fallback || '-';
}

export class PauseMenu {
    constructor(root) {
        this.root = root;
        this.message = root ? root.querySelector('[data-pause-message]') : null;
        this.resumeButton = root ? root.querySelector('[data-pause-resume]') : null;
        this.saveButton = root ? root.querySelector('[data-pause-save-exit]') : null;
        this.settingsForm = root ? root.querySelector('[data-pause-settings-form]') : null;
        this.settingsStatus = root ? root.querySelector('[data-pause-settings-status]') : null;
        this.worldName = root ? root.querySelector('[data-pause-world-name]') : null;
        this.worldSeed = root ? root.querySelector('[data-pause-world-seed]') : null;
        this.worldAlgorithm = root ? root.querySelector('[data-pause-world-algorithm]') : null;
        this.loadedChunks = root ? root.querySelector('[data-pause-loaded-chunks]') : null;
        this.cachedChunks = root ? root.querySelector('[data-pause-cached-chunks]') : null;
        this.playerPosition = root ? root.querySelector('[data-pause-player-position]') : null;
        this.onResume = null;
        this.onSaveAndExit = null;
        this.onApplySettings = null;
        this.saving = false;
        this.settingsRequestVersion = 0;

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

        if (this.settingsForm) {
            this.settingsForm.addEventListener('submit', (event) => {
                event.preventDefault();
            });

            this.settingsForm.addEventListener('change', () => {
                void this.handleSettingsChange();
            });
        }
    }

    show(message) {
        if (!this.root) {
            return;
        }

        this.root.hidden = false;
        this.root.dataset.state = this.saving ? 'saving' : 'paused';
        this.setMessage(message || 'A partida foi pausada. Revise os dados do mundo, ajuste as configuracoes ou salve e retorne ao menu principal.');
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

    setWorldData(data) {
        const payload = data && typeof data === 'object' ? data : {};
        setText(this.worldName, payload.name, 'Mundo');
        setText(this.worldSeed, payload.seed, '-');
        setText(this.worldAlgorithm, payload.algorithmVersion, '-');
        setText(this.loadedChunks, String(payload.loadedChunks ?? 0), '0');
        setText(this.cachedChunks, String(payload.cachedChunks ?? 0), '0');

        if (this.playerPosition) {
            const position = payload.position && typeof payload.position === 'object'
                ? payload.position
                : null;

            this.playerPosition.textContent = position
                ? 'X ' + Number(position.x || 0).toFixed(1) + ' | Y ' + Number(position.y || 0).toFixed(1) + ' | Z ' + Number(position.z || 0).toFixed(1)
                : '-';
        }
    }

    setConfig(config) {
        if (!this.settingsForm) {
            return;
        }

        const normalized = normalizeRuntimeConfig(config);
        this.settingsForm.elements.render_distance.value = String(normalized.render_distance);
        this.settingsForm.elements.mouse_sensitivity.value = String(normalized.mouse_sensitivity);
        this.settingsForm.elements.master_volume.value = String(normalized.master_volume);
        this.settingsForm.elements.invert_y.checked = Number(normalized.invert_y) === 1;
    }

    readConfig() {
        if (!this.settingsForm) {
            return normalizeRuntimeConfig({});
        }

        return normalizeRuntimeConfig({
            render_distance: Number(this.settingsForm.elements.render_distance.value),
            mouse_sensitivity: Number(this.settingsForm.elements.mouse_sensitivity.value),
            master_volume: Number(this.settingsForm.elements.master_volume.value),
            invert_y: this.settingsForm.elements.invert_y.checked ? 1 : 0
        });
    }

    setSettingsStatus(message, state) {
        if (!this.settingsStatus) {
            return;
        }

        this.settingsStatus.textContent = message;
        this.settingsStatus.dataset.state = state || 'idle';
    }

    async handleSettingsChange() {
        if (this.saving || typeof this.onApplySettings !== 'function') {
            return;
        }

        const requestVersion = this.settingsRequestVersion + 1;
        this.settingsRequestVersion = requestVersion;
        this.setSettingsStatus('Aplicando configuracoes...', 'working');

        try {
            const appliedConfig = await this.onApplySettings(this.readConfig());
            if (requestVersion !== this.settingsRequestVersion) {
                return;
            }

            if (appliedConfig) {
                this.setConfig(appliedConfig);
            }

            this.setSettingsStatus('Configuracoes aplicadas automaticamente.', 'success');
        } catch (error) {
            if (requestVersion !== this.settingsRequestVersion) {
                return;
            }

            this.setSettingsStatus(error && error.message ? error.message : 'Nao foi possivel aplicar as configuracoes.', 'error');
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

        if (!this.settingsForm) {
            return;
        }

        Array.from(this.settingsForm.elements).forEach((element) => {
            element.disabled = this.saving;
        });
    }
}
