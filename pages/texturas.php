<section class="texture-screen">
    <header class="texture-screen__header">
        <div>
            <p class="texture-screen__eyebrow">Biblioteca visual</p>
            <h1>Texturas de blocos</h1>
            <p class="texture-screen__copy">Envie texturas opcionais de topo, laterais e fundo. Quando nao houver imagem salva, o jogo continua usando a cor base do bloco.</p>
        </div>

        <a class="button button--ghost button--small" href="index.php?page=menu">Voltar ao menu</a>
    </header>

    <div class="texture-screen__layout">
        <section class="texture-panel texture-panel--list">
            <div class="texture-panel__header">
                <div>
                    <p class="texture-panel__eyebrow">Catalogo atual</p>
                    <h2>Blocos disponiveis</h2>
                </div>

                <span class="texture-panel__count" data-texture-count>0 blocos</span>
            </div>

            <div class="texture-empty" data-texture-empty>
                <strong>Nenhum bloco carregado</strong>
                <p>Assim que a sessao for validada, o catalogo de blocos aparecera aqui.</p>
            </div>

            <div class="texture-list" data-texture-list aria-live="polite"></div>
        </section>

        <aside class="texture-panel texture-panel--detail">
            <div class="texture-detail" data-texture-detail>
                <p class="texture-panel__eyebrow">Selecao atual</p>
                <h2 data-texture-title>Nenhum bloco selecionado</h2>
                <p class="texture-detail__copy" data-texture-copy>Selecione um bloco para revisar as texturas atuais e enviar novos arquivos.</p>

                <div class="texture-preview-grid">
                    <article class="texture-face-card">
                        <header>
                            <strong>Topo</strong>
                            <span data-face-meta="top">Sem textura</span>
                        </header>
                        <div class="texture-face-card__preview" data-face-preview="top"></div>
                    </article>

                    <article class="texture-face-card">
                        <header>
                            <strong>Laterais</strong>
                            <span data-face-meta="side">Sem textura</span>
                        </header>
                        <div class="texture-face-card__preview" data-face-preview="side"></div>
                    </article>

                    <article class="texture-face-card">
                        <header>
                            <strong>Fundo</strong>
                            <span data-face-meta="bottom">Sem textura</span>
                        </header>
                        <div class="texture-face-card__preview" data-face-preview="bottom"></div>
                    </article>
                </div>
            </div>

            <form id="texture-form" class="texture-form" novalidate>
                <input type="hidden" name="block_key" value="">

                <label class="field">
                    <span>Imagem do topo</span>
                    <input type="file" name="top_image" accept="image/png,image/webp,image/jpeg,image/gif">
                </label>

                <label class="field">
                    <span>Imagem das laterais</span>
                    <input type="file" name="side_image" accept="image/png,image/webp,image/jpeg,image/gif">
                </label>

                <label class="field">
                    <span>Imagem do fundo</span>
                    <input type="file" name="bottom_image" accept="image/png,image/webp,image/jpeg,image/gif">
                </label>

                <p class="texture-form__hint">Limite por arquivo: <strong data-texture-max-size>5 KB</strong>.</p>

                <div class="texture-actions">
                    <button class="button button--primary" type="submit">Salvar texturas</button>
                    <button class="button button--ghost" type="button" data-action="remove-textures">Remover texturas</button>
                </div>
            </form>
        </aside>
    </div>
</section>
