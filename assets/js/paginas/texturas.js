(function () {
    const state = {
        blocks: [],
        selectedBlockKey: null,
        maxTextureBytes: 5120
    };

    function getElements() {
        return {
            list: document.querySelector('[data-texture-list]'),
            empty: document.querySelector('[data-texture-empty]'),
            count: document.querySelector('[data-texture-count]'),
            title: document.querySelector('[data-texture-title]'),
            copy: document.querySelector('[data-texture-copy]'),
            form: document.getElementById('texture-form'),
            maxSize: document.querySelector('[data-texture-max-size]'),
            removeButton: document.querySelector('[data-action="remove-textures"]')
        };
    }

    function getSelectedBlock() {
        return state.blocks.find(function (block) {
            return block.block_key === state.selectedBlockKey;
        }) || null;
    }

    function syncSelection() {
        if (!state.blocks.length) {
            state.selectedBlockKey = null;
            return;
        }

        const exists = state.blocks.some(function (block) {
            return block.block_key === state.selectedBlockKey;
        });

        if (!exists) {
            state.selectedBlockKey = state.blocks[0].block_key;
        }
    }

    function formatCount(total) {
        return total === 1 ? '1 bloco' : total + ' blocos';
    }

    function formatMaxSize(bytes) {
        return (bytes / 1024).toFixed(0) + ' KB';
    }

    function buildAssetUrl(path) {
        return new URL(path, window.ENV.DOMAIN + '/').toString();
    }

    function countTextures(block) {
        return ['top', 'side', 'bottom'].filter(function (face) {
            return Boolean(block.textures && block.textures[face]);
        }).length;
    }

    function getFaceColor(block, face) {
        const color = block.base_colors && block.base_colors[face] ? block.base_colors[face] : { r: 120, g: 120, b: 120 };
        return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    }

    function applyPreview(block, face) {
        const preview = document.querySelector('[data-face-preview="' + face + '"]');
        const meta = document.querySelector('[data-face-meta="' + face + '"]');
        if (!preview || !meta) {
            return;
        }

        const texture = block && block.textures ? block.textures[face] : null;
        preview.style.backgroundImage = texture ? 'url("' + buildAssetUrl(texture.path) + '")' : 'none';
        preview.style.backgroundColor = block ? getFaceColor(block, face) : 'rgba(255,255,255,0.08)';
        meta.textContent = texture ? texture.filename : 'Sem textura';
    }

    function renderDetail() {
        const elements = getElements();
        const selectedBlock = getSelectedBlock();

        elements.maxSize.textContent = formatMaxSize(state.maxTextureBytes);

        if (!selectedBlock) {
            elements.title.textContent = 'Nenhum bloco selecionado';
            elements.copy.textContent = 'Selecione um bloco para revisar as texturas atuais e enviar novos arquivos.';
            elements.form.elements.block_key.value = '';
            applyPreview(null, 'top');
            applyPreview(null, 'side');
            applyPreview(null, 'bottom');
            elements.removeButton.disabled = true;
            return;
        }

        elements.title.textContent = selectedBlock.block_name + ' (' + selectedBlock.block_key + ')';
        elements.copy.textContent = 'Este bloco possui ' + countTextures(selectedBlock) + ' face(s) com textura salva. Os uploads abaixo substituem apenas os arquivos enviados.';
        elements.form.elements.block_key.value = selectedBlock.block_key;
        applyPreview(selectedBlock, 'top');
        applyPreview(selectedBlock, 'side');
        applyPreview(selectedBlock, 'bottom');
        elements.removeButton.disabled = countTextures(selectedBlock) === 0;
    }

    function renderList() {
        const elements = getElements();
        const selectedBlock = getSelectedBlock();

        elements.list.innerHTML = '';
        elements.empty.hidden = state.blocks.length > 0;
        elements.count.textContent = formatCount(state.blocks.length);

        state.blocks.forEach(function (block) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'texture-item';

            if (selectedBlock && selectedBlock.block_key === block.block_key) {
                button.classList.add('is-selected');
            }

            button.innerHTML = [
                '<span class="texture-item__thumb"></span>',
                '<span class="texture-item__body">',
                '  <span class="texture-item__title"></span>',
                '  <span class="texture-item__meta"></span>',
                '</span>'
            ].join('');

            button.querySelector('.texture-item__thumb').style.backgroundColor = getFaceColor(block, 'top');
            button.querySelector('.texture-item__title').textContent = block.block_name;
            button.querySelector('.texture-item__meta').textContent = block.block_key + ' | ' + countTextures(block) + '/3 faces com textura';
            button.addEventListener('click', function () {
                state.selectedBlockKey = block.block_key;
                render();
            });
            elements.list.appendChild(button);
        });

        renderDetail();
    }

    function render() {
        syncSelection();
        renderList();
    }

    function mergeBlock(updatedBlock) {
        state.blocks = state.blocks.map(function (block) {
            return block.block_key === updatedBlock.block_key ? updatedBlock : block;
        });
    }

    async function loadBlocks() {
        try {
            const payload = await window.ApiRequest.get('texturas/listar.php', {
                loadingMessage: 'Carregando texturas...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar as texturas.');
            }

            state.blocks = Array.isArray(payload.data.blocks) ? payload.data.blocks : [];
            state.maxTextureBytes = Number(payload.data.max_texture_bytes || 5120);
            render();
        } catch (error) {
            window.showError(error.message || 'Falha ao carregar as texturas.');
        }
    }

    function validateFiles(form) {
        ['top_image', 'side_image', 'bottom_image'].forEach(function (fieldName) {
            const field = form.elements[fieldName];
            const file = field && field.files ? field.files[0] : null;
            if (file && file.size > state.maxTextureBytes) {
                throw new Error('Cada imagem deve ter no maximo ' + formatMaxSize(state.maxTextureBytes) + '.');
            }
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const elements = getElements();
        const selectedBlock = getSelectedBlock();
        if (!selectedBlock) {
            window.showAlert('Selecione um bloco antes de salvar texturas.');
            return;
        }

        try {
            validateFiles(elements.form);
            const formData = new FormData(elements.form);
            const payload = await window.ApiRequest.request({
                url: 'texturas/salvar.php',
                method: 'POST',
                data: formData,
                loadingMessage: 'Salvando texturas...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel salvar as texturas.');
            }

            mergeBlock(payload.data);
            render();
            elements.form.reset();
            elements.form.elements.block_key.value = payload.data.block_key;
            window.showSuccess(payload.message || 'Texturas salvas com sucesso.');
        } catch (error) {
            window.showError(error.message || 'Falha ao salvar as texturas.');
        }
    }

    function handleRemoveClick() {
        const selectedBlock = getSelectedBlock();
        if (!selectedBlock) {
            window.showAlert('Selecione um bloco antes de remover texturas.');
            return;
        }

        if (countTextures(selectedBlock) === 0) {
            window.showAlert('Esse bloco ainda nao possui texturas salvas.');
            return;
        }

        window.showConfirm(
            'Remover texturas',
            'Tem certeza que deseja remover as texturas cadastradas para ' + selectedBlock.block_name + '?',
            'Remover',
            function () {
                void removeSelectedBlockTextures();
            }
        );
    }

    async function removeSelectedBlockTextures() {
        const selectedBlock = getSelectedBlock();
        const elements = getElements();
        if (!selectedBlock) {
            return;
        }

        try {
            const payload = await window.ApiRequest.delete('texturas/excluir.php', {
                block_key: selectedBlock.block_key
            }, {
                loadingMessage: 'Removendo texturas...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data) {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel remover as texturas.');
            }

            mergeBlock(payload.data);
            render();
            elements.form.reset();
            elements.form.elements.block_key.value = payload.data.block_key;
            window.showSuccess(payload.message || 'Texturas removidas com sucesso.');
        } catch (error) {
            window.showError(error.message || 'Falha ao remover as texturas.');
        }
    }

    function bindEvents() {
        const elements = getElements();

        if (elements.form) {
            elements.form.addEventListener('submit', handleSubmit);
        }

        if (elements.removeButton) {
            elements.removeButton.addEventListener('click', handleRemoveClick);
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        bindEvents();

        window.addEventListener('mineworld:auth-ready', function () {
            void loadBlocks();
        }, { once: true });
    });
})();
