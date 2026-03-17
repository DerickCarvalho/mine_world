<section class="worlds-screen">
    <header class="worlds-screen__header">
        <div>
            <p class="worlds-screen__eyebrow">Lobby de mundos</p>
            <h1>Seus mundos</h1>
            <p class="worlds-screen__copy">Selecione um save existente ou crie um novo mundo para preparar a proxima etapa do jogo.</p>
        </div>

        <a class="button button--ghost button--small" href="index.php?page=menu">Voltar ao menu</a>
    </header>

    <div class="worlds-screen__layout">
        <section class="worlds-panel worlds-panel--list">
            <div class="worlds-panel__header">
                <div>
                    <p class="worlds-panel__eyebrow">Saves da conta</p>
                    <h2>Lista de mundos</h2>
                </div>

                <span class="worlds-panel__count" data-world-count>0 mundos</span>
            </div>

            <div class="worlds-empty" data-world-empty>
                <strong>Nenhum mundo criado ainda</strong>
                <p>Use o painel ao lado para criar o primeiro mundo desta conta.</p>
            </div>

            <div class="worlds-list" data-world-list aria-live="polite"></div>
        </section>

        <aside class="worlds-panel worlds-panel--side">
            <section class="worlds-detail" data-world-detail>
                <p class="worlds-panel__eyebrow">Selecao atual</p>
                <h2 data-world-detail-name>Nenhum mundo selecionado</h2>
                <p class="worlds-detail__copy" data-world-detail-copy>Selecione um mundo da lista para revisar os metadados e liberar a exclusao definitiva.</p>

                <dl class="worlds-detail__meta">
                    <div>
                        <dt>Seed</dt>
                        <dd data-world-detail-seed>-</dd>
                    </div>
                    <div>
                        <dt>Algoritmo</dt>
                        <dd data-world-detail-algorithm>-</dd>
                    </div>
                    <div>
                        <dt>Criado em</dt>
                        <dd data-world-detail-created>-</dd>
                    </div>
                    <div>
                        <dt>Ultima atividade</dt>
                        <dd data-world-detail-updated>-</dd>
                    </div>
                </dl>

                <div class="worlds-detail__banner">
                    O mundo selecionado sera usado como base para a tela 3D da PRD-003.
                </div>
            </section>

            <section class="worlds-create">
                <div class="worlds-panel__header worlds-panel__header--compact">
                    <div>
                        <p class="worlds-panel__eyebrow">Novo save</p>
                        <h2>Criar novo mundo</h2>
                    </div>
                </div>

                <form id="world-create-form" class="world-create-form" novalidate>
                    <label class="field">
                        <span>Nome do mundo</span>
                        <input type="text" name="nome" maxlength="80" placeholder="Ex.: Vale Verde" required>
                    </label>

                    <label class="field">
                        <span>Seed opcional</span>
                        <input type="text" name="seed" maxlength="32" placeholder="Deixe em branco para gerar automaticamente">
                    </label>

                    <button class="button button--primary button--block" type="submit">Criar novo mundo</button>
                </form>
            </section>

            <div class="worlds-actions">
                <button class="button button--primary button--small" type="button" data-action="play-world" disabled>Entrar no mundo</button>
                <button class="button button--ghost button--small" type="button" data-action="refresh-worlds">Atualizar</button>
                <button class="button worlds-button--danger button--small" type="button" data-action="delete-world" disabled>Excluir mundo</button>
            </div>
        </aside>
    </div>
</section>
