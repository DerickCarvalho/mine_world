(function () {
    const state = {
        worlds: [],
        selectedWorldId: null
    };

    function getElements() {
        return {
            list: document.querySelector('[data-world-list]'),
            empty: document.querySelector('[data-world-empty]'),
            count: document.querySelector('[data-world-count]'),
            detailName: document.querySelector('[data-world-detail-name]'),
            detailCopy: document.querySelector('[data-world-detail-copy]'),
            detailSeed: document.querySelector('[data-world-detail-seed]'),
            detailAlgorithm: document.querySelector('[data-world-detail-algorithm]'),
            detailCreated: document.querySelector('[data-world-detail-created]'),
            detailUpdated: document.querySelector('[data-world-detail-updated]'),
            createForm: document.getElementById('world-create-form'),
            playButton: document.querySelector('[data-action="play-world"]'),
            refreshButton: document.querySelector('[data-action="refresh-worlds"]'),
            deleteButton: document.querySelector('[data-action="delete-world"]')
        };
    }

    function formatCount(total) {
        return total === 1 ? '1 mundo' : total + ' mundos';
    }

    function formatDate(value) {
        if (!value) {
            return 'Ainda nao registrado';
        }

        const normalized = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T');
        const date = new Date(normalized);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    }

    function getSelectedWorld() {
        return state.worlds.find(function (world) {
            return world.id === state.selectedWorldId;
        }) || null;
    }

    function syncSelectedWorld() {
        if (!state.worlds.length) {
            state.selectedWorldId = null;
            return;
        }

        const hasSelection = state.worlds.some(function (world) {
            return world.id === state.selectedWorldId;
        });

        if (!hasSelection) {
            state.selectedWorldId = state.worlds[0].id;
        }
    }

    function renderWorldDetail() {
        const elements = getElements();
        const selectedWorld = getSelectedWorld();

        if (!selectedWorld) {
            elements.detailName.textContent = 'Nenhum mundo selecionado';
            elements.detailCopy.textContent = 'Selecione um mundo da lista para revisar os metadados e liberar a exclusao definitiva.';
            elements.detailSeed.textContent = '-';
            elements.detailAlgorithm.textContent = '-';
            elements.detailCreated.textContent = '-';
            elements.detailUpdated.textContent = '-';
            return;
        }

        elements.detailName.textContent = selectedWorld.nome;
        elements.detailCopy.textContent = 'Mundo vinculado a sua conta. O save permanece disponivel para as proximas etapas do projeto.';
        elements.detailSeed.textContent = selectedWorld.seed || '-';
        elements.detailAlgorithm.textContent = selectedWorld.algorithm_version || 'v1';
        elements.detailCreated.textContent = formatDate(selectedWorld.criado_em);
        elements.detailUpdated.textContent = formatDate(selectedWorld.ultimo_jogado_em || selectedWorld.atualizado_em);
    }

    function renderWorldList() {
        const elements = getElements();
        const selectedWorld = getSelectedWorld();

        elements.list.innerHTML = '';
        elements.empty.hidden = state.worlds.length > 0;
        elements.count.textContent = formatCount(state.worlds.length);
        elements.playButton.disabled = !selectedWorld;
        elements.deleteButton.disabled = !selectedWorld;

        state.worlds.forEach(function (world) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'world-card';
            button.dataset.worldId = String(world.id);

            if (selectedWorld && selectedWorld.id === world.id) {
                button.classList.add('is-selected');
            }

            const lastActivity = world.ultimo_jogado_em || world.atualizado_em || world.criado_em;
            button.innerHTML = [
                '<span class="world-card__title"></span>',
                '<span class="world-card__meta"></span>',
                '<span class="world-card__meta"></span>'
            ].join('');
            button.querySelector('.world-card__title').textContent = world.nome;
            button.querySelectorAll('.world-card__meta')[0].textContent = 'Seed: ' + (world.seed || '-');
            button.querySelectorAll('.world-card__meta')[1].textContent = 'Atividade: ' + formatDate(lastActivity);
            button.addEventListener('click', function () {
                state.selectedWorldId = world.id;
                render();
                void loadWorldDetail(world.id);
            });
            elements.list.appendChild(button);
        });

        renderWorldDetail();
    }

    function render() {
        syncSelectedWorld();
        renderWorldList();
    }

    function mergeWorld(updatedWorld) {
        state.worlds = state.worlds.map(function (world) {
            if (world.id !== updatedWorld.id) {
                return world;
            }

            return Object.assign({}, world, updatedWorld);
        });
    }

    async function loadWorldDetail(worldId) {
        try {
            const payload = await window.ApiRequest.get('mundos/buscar.php', {
                data: { id: worldId },
                showLoading: false
            });

            if (payload && payload.status === 'OK' && payload.data && payload.data.world) {
                mergeWorld(payload.data.world);
                render();
            }
        } catch (error) {
            window.showError(error.message || 'Nao foi possivel carregar os detalhes do mundo.');
        }
    }

    async function loadWorlds(options) {
        const settings = Object.assign({
            loadingMessage: 'Carregando mundos...'
        }, options || {});

        try {
            const payload = await window.ApiRequest.get('mundos/listar.php', {
                loadingMessage: settings.loadingMessage
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar os mundos.');
            }

            state.worlds = Array.isArray(payload.data.worlds) ? payload.data.worlds : [];
            render();

            if (state.selectedWorldId !== null) {
                void loadWorldDetail(state.selectedWorldId);
            }
        } catch (error) {
            window.showError(error.message || 'Falha ao carregar os mundos.');
        }
    }

    async function handleCreateSubmit(event) {
        event.preventDefault();

        const elements = getElements();
        const formData = new FormData(elements.createForm);
        const data = {
            nome: String(formData.get('nome') || '').trim(),
            seed: String(formData.get('seed') || '').trim()
        };

        if (data.nome.length < 3) {
            window.showError('Informe um nome de mundo com pelo menos 3 caracteres.');
            return;
        }

        try {
            const payload = await window.ApiRequest.post('mundos/cadastrar.php', data, {
                loadingMessage: 'Criando novo mundo...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data || !payload.data.world) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel criar o mundo.');
            }

            state.selectedWorldId = payload.data.world.id;
            elements.createForm.reset();
            window.showSuccess(payload.message || 'Mundo criado com sucesso.');
            await loadWorlds({ loadingMessage: 'Atualizando lista de mundos...' });
        } catch (error) {
            window.showError(error.message || 'Falha ao criar o mundo.');
        }
    }

    async function deleteSelectedWorld() {
        const selectedWorld = getSelectedWorld();

        if (!selectedWorld) {
            window.showAlert('Selecione um mundo antes de tentar excluir.');
            return;
        }

        try {
            const payload = await window.ApiRequest.delete('mundos/excluir.php', {
                id: selectedWorld.id
            }, {
                loadingMessage: 'Excluindo mundo...'
            });

            if (!payload || payload.status !== 'OK') {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel excluir o mundo.');
            }

            state.selectedWorldId = null;
            window.showSuccess(payload.message || 'Mundo excluido com sucesso.');
            await loadWorlds({ loadingMessage: 'Atualizando lista de mundos...' });
        } catch (error) {
            window.showError(error.message || 'Falha ao excluir o mundo.');
        }
    }

    function handleDeleteClick() {
        const selectedWorld = getSelectedWorld();

        if (!selectedWorld) {
            window.showAlert('Selecione um mundo antes de tentar excluir.');
            return;
        }

        window.showConfirm(
            'Excluir mundo',
            'Tem certeza que deseja excluir "' + selectedWorld.nome + '"? Esta acao e definitiva.',
            'Excluir definitivamente',
            function () {
                void deleteSelectedWorld();
            }
        );
    }

    function enterSelectedWorld() {
        const selectedWorld = getSelectedWorld();

        if (!selectedWorld) {
            window.showAlert('Selecione um mundo antes de tentar jogar.');
            return;
        }

        window.location.href = window.ENV.DOMAIN + '/index.php?page=jogo&id_mundo=' + encodeURIComponent(selectedWorld.id);
    }

    function bindEvents() {
        const elements = getElements();

        if (elements.createForm) {
            elements.createForm.addEventListener('submit', handleCreateSubmit);
        }

        if (elements.playButton) {
            elements.playButton.addEventListener('click', enterSelectedWorld);
        }

        if (elements.refreshButton) {
            elements.refreshButton.addEventListener('click', function () {
                void loadWorlds({ loadingMessage: 'Atualizando mundos...' });
            });
        }

        if (elements.deleteButton) {
            elements.deleteButton.addEventListener('click', handleDeleteClick);
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        bindEvents();

        window.addEventListener('mineworld:auth-ready', function () {
            void loadWorlds();
        }, { once: true });
    });
})();
