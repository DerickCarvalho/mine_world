(function () {
    function getForm() {
        return document.getElementById('options-form');
    }

    function setFormValues(config) {
        const form = getForm();
        if (!form || !config) {
            return;
        }

        form.elements.render_distance.value = String(config.render_distance ?? 6);
        form.elements.mouse_sensitivity.value = String(config.mouse_sensitivity ?? 1);
        form.elements.master_volume.value = String(config.master_volume ?? 80);
        form.elements.invert_y.checked = Number(config.invert_y ?? 0) === 1;
    }

    function getFormValues() {
        const form = getForm();
        return {
            render_distance: Number(form.elements.render_distance.value),
            mouse_sensitivity: Number(form.elements.mouse_sensitivity.value),
            master_volume: Number(form.elements.master_volume.value),
            invert_y: form.elements.invert_y.checked ? 1 : 0
        };
    }

    function validateConfig(data) {
        if (data.render_distance < 2 || data.render_distance > 10) {
            throw new Error('A distancia de render deve ficar entre 2 e 10.');
        }

        if (data.mouse_sensitivity < 0.1 || data.mouse_sensitivity > 3) {
            throw new Error('A sensibilidade do mouse deve ficar entre 0.1 e 3.0.');
        }

        if (data.master_volume < 0 || data.master_volume > 100) {
            throw new Error('O volume principal deve ficar entre 0 e 100.');
        }
    }

    async function loadConfig() {
        try {
            const payload = await window.ApiRequest.get('configuracoes/buscar.php', {
                loadingMessage: 'Carregando configuracoes...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar as configuracoes.');
            }

            setFormValues(payload.data);
        } catch (error) {
            window.showError(error.message || 'Falha ao carregar configuracoes.');
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const data = getFormValues();
            validateConfig(data);

            const payload = await window.ApiRequest.post('configuracoes/salvar.php', data, {
                loadingMessage: 'Salvando configuracoes...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar as configuracoes.');
            }

            setFormValues(payload.data);
            window.showSuccess(payload.message || 'Configuracoes salvas com sucesso.');
        } catch (error) {
            window.showError(error.message || 'Falha ao salvar configuracoes.');
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        const form = getForm();
        if (!form) {
            return;
        }

        form.addEventListener('submit', handleSubmit);

        window.addEventListener('mineworld:auth-ready', function () {
            void loadConfig();
        }, { once: true });
    });
})();
