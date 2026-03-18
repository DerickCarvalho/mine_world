(function () {
    const state = {
        commands: [],
        selectedCommandId: null
    };

    function getElements() {
        return {
            list: document.querySelector('[data-command-list]'),
            empty: document.querySelector('[data-command-empty]'),
            count: document.querySelector('[data-command-count]'),
            title: document.querySelector('[data-command-title]'),
            copy: document.querySelector('[data-command-copy]'),
            status: document.querySelector('[data-command-status]'),
            statusText: document.querySelector('[data-command-status-text]'),
            form: document.getElementById('command-form'),
            newButton: document.querySelector('[data-action="new-command"]'),
            deleteButton: document.querySelector('[data-action="delete-command"]')
        };
    }

    function formatCount(total) {
        return total === 1 ? '1 comando' : total + ' comandos';
    }

    function getSelectedCommand() {
        return state.commands.find(function (command) {
            return command.id === state.selectedCommandId;
        }) || null;
    }

    function syncSelectedCommand() {
        if (state.selectedCommandId === null) {
            return;
        }

        const exists = state.commands.some(function (command) {
            return command.id === state.selectedCommandId;
        });

        if (!exists) {
            state.selectedCommandId = null;
        }
    }

    function setStatus(command) {
        const elements = getElements();

        if (!command) {
            elements.status.dataset.state = 'idle';
            elements.statusText.textContent = 'Preencha o formulario para criar um comando.';
            return;
        }

        elements.status.dataset.state = command.validation_status || 'idle';
        elements.statusText.textContent = command.validation_reason || 'Comando sem retorno do validador.';
    }

    function fillForm(command) {
        const elements = getElements();
        if (!elements.form) {
            return;
        }

        elements.form.elements.id.value = command ? String(command.id) : '';
        elements.form.elements.command_key.value = command ? command.command_key : '';
        elements.form.elements.label.value = command ? command.label : '';
        elements.form.elements.description.value = command ? command.description : '';
        elements.form.elements.active.checked = command ? Number(command.active) === 1 : true;
    }

    function renderDetail() {
        const elements = getElements();
        const selectedCommand = getSelectedCommand();

        if (!selectedCommand) {
            elements.title.textContent = 'Novo comando';
            elements.copy.textContent = 'Comandos aprovados pelo validador ficam disponiveis no chat do jogo quando o jogador iniciar uma mensagem com /.';
            fillForm(null);
            setStatus(null);
            elements.deleteButton.disabled = true;
            return;
        }

        elements.title.textContent = '/' + selectedCommand.command_key;
        elements.copy.textContent = selectedCommand.definition && selectedCommand.definition.usage
            ? 'Uso esperado: ' + selectedCommand.definition.usage
            : 'Comando sem definicao de uso detalhada.';
        fillForm(selectedCommand);
        setStatus(selectedCommand);
        elements.deleteButton.disabled = false;
    }

    function renderList() {
        const elements = getElements();
        const selectedCommand = getSelectedCommand();

        elements.list.innerHTML = '';
        elements.empty.hidden = state.commands.length > 0;
        elements.count.textContent = formatCount(state.commands.length);

        state.commands.forEach(function (command) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'commands-card';

            if (selectedCommand && selectedCommand.id === command.id) {
                button.classList.add('is-selected');
            }

            button.innerHTML = [
                '<span class="commands-card__title">',
                '  <span></span>',
                '  <span class="commands-card__chip"></span>',
                '</span>',
                '<span class="commands-card__meta"></span>',
                '<span class="commands-card__meta"></span>'
            ].join('');

            button.querySelector('.commands-card__title span').textContent = '/' + command.command_key;
            const chip = button.querySelector('.commands-card__chip');
            chip.dataset.state = command.validation_status || 'idle';
            chip.textContent = command.validation_status || 'idle';
            button.querySelectorAll('.commands-card__meta')[0].textContent = command.label || 'Sem rotulo';
            button.querySelectorAll('.commands-card__meta')[1].textContent = (command.active ? 'Ativo' : 'Inativo') + ' | ' + (command.definition && command.definition.usage ? command.definition.usage : 'Sem uso definido');
            button.addEventListener('click', function () {
                state.selectedCommandId = command.id;
                render();
            });
            elements.list.appendChild(button);
        });

        renderDetail();
    }

    function render() {
        syncSelectedCommand();
        renderList();
    }

    async function loadCommands() {
        try {
            const payload = await window.ApiRequest.get('comandos/listar.php', {
                loadingMessage: 'Carregando comandos...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar os comandos.');
            }

            state.commands = Array.isArray(payload.data.commands) ? payload.data.commands : [];
            render();
        } catch (error) {
            window.showError(error.message || 'Falha ao carregar os comandos.');
        }
    }

    function resetToNewCommand() {
        state.selectedCommandId = null;
        render();
    }

    function collectFormData() {
        const form = getElements().form;
        return {
            id: Number(form.elements.id.value || 0),
            command_key: String(form.elements.command_key.value || '').trim(),
            label: String(form.elements.label.value || '').trim(),
            description: String(form.elements.description.value || '').trim(),
            active: form.elements.active.checked ? 1 : 0
        };
    }

    function validateCommandData(data) {
        if (data.command_key.length < 2 || data.command_key.length > 32) {
            throw new Error('Informe um identificador de comando entre 2 e 32 caracteres.');
        }

        if (data.description.length < 8) {
            throw new Error('Descreva com mais detalhes o que o comando deve fazer.');
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const data = collectFormData();
            validateCommandData(data);
            const isEditing = data.id > 0;
            const endpoint = isEditing ? 'comandos/editar.php' : 'comandos/cadastrar.php';
            const payload = await window.ApiRequest.post(endpoint, data, {
                loadingMessage: isEditing ? 'Atualizando comando...' : 'Criando comando...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar o comando.');
            }

            state.selectedCommandId = payload.data.id;
            await loadCommands();
            window.showSuccess(payload.message || 'Comando salvo com sucesso.');
        } catch (error) {
            window.showError(error.message || 'Falha ao salvar o comando.');
        }
    }

    function handleDeleteClick() {
        const selectedCommand = getSelectedCommand();
        if (!selectedCommand) {
            window.showAlert('Selecione um comando antes de excluir.');
            return;
        }

        window.showConfirm(
            'Excluir comando',
            'Tem certeza que deseja excluir /' + selectedCommand.command_key + '?',
            'Excluir',
            function () {
                void deleteSelectedCommand();
            }
        );
    }

    async function deleteSelectedCommand() {
        const selectedCommand = getSelectedCommand();
        if (!selectedCommand) {
            return;
        }

        try {
            const payload = await window.ApiRequest.delete('comandos/excluir.php', {
                id: selectedCommand.id
            }, {
                loadingMessage: 'Excluindo comando...'
            });

            if (!payload || payload.status !== 'OK') {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel excluir o comando.');
            }

            state.selectedCommandId = null;
            await loadCommands();
            window.showSuccess(payload.message || 'Comando excluido com sucesso.');
        } catch (error) {
            window.showError(error.message || 'Falha ao excluir o comando.');
        }
    }

    function bindEvents() {
        const elements = getElements();

        if (elements.form) {
            elements.form.addEventListener('submit', handleSubmit);
        }

        if (elements.newButton) {
            elements.newButton.addEventListener('click', resetToNewCommand);
        }

        if (elements.deleteButton) {
            elements.deleteButton.addEventListener('click', handleDeleteClick);
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        bindEvents();

        window.addEventListener('mineworld:auth-ready', function () {
            void loadCommands();
        }, { once: true });
    });
})();
