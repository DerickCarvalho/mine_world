<section class="commands-screen">
    <header class="commands-screen__header">
        <div>
            <p class="commands-screen__eyebrow">Automacao do runtime</p>
            <h1>Comandos</h1>
            <p class="commands-screen__copy">Cadastre comandos com descricao obrigatoria. O sistema valida se a capacidade ja existe e so libera no chat aquilo que o jogo realmente sabe executar agora.</p>
        </div>

        <a class="button button--ghost button--small" href="index.php?page=menu">Voltar ao menu</a>
    </header>

    <div class="commands-screen__layout">
        <section class="commands-panel commands-panel--list">
            <div class="commands-panel__header">
                <div>
                    <p class="commands-panel__eyebrow">Cadastro atual</p>
                    <h2>Comandos registrados</h2>
                </div>

                <span class="commands-panel__count" data-command-count>0 comandos</span>
            </div>

            <div class="commands-empty" data-command-empty>
                <strong>Nenhum comando disponivel</strong>
                <p>Use o formulario ao lado para criar o primeiro comando validado.</p>
            </div>

            <div class="commands-list" data-command-list aria-live="polite"></div>
        </section>

        <aside class="commands-panel commands-panel--detail">
            <section class="commands-detail">
                <p class="commands-panel__eyebrow">Detalhe</p>
                <h2 data-command-title>Novo comando</h2>
                <p class="commands-detail__copy" data-command-copy>Comandos aprovados pelo validador ficam disponiveis no chat do jogo quando o jogador iniciar uma mensagem com <code>/</code>.</p>

                <div class="commands-status" data-command-status data-state="idle">
                    <strong>Status de validacao</strong>
                    <span data-command-status-text>Preencha o formulario para criar um comando.</span>
                </div>
            </section>

            <form id="command-form" class="command-form" novalidate>
                <input type="hidden" name="id" value="">

                <label class="field">
                    <span>Identificador</span>
                    <input type="text" name="command_key" maxlength="32" placeholder="Ex.: tp" required>
                </label>

                <label class="field">
                    <span>Rotulo amigavel</span>
                    <input type="text" name="label" maxlength="80" placeholder="Ex.: Teleporte">
                </label>

                <label class="field">
                    <span>Descricao obrigatoria</span>
                    <textarea name="description" rows="7" maxlength="1000" placeholder="Explique claramente o que esse comando deve fazer." required></textarea>
                </label>

                <label class="commands-toggle">
                    <span>Comando ativo</span>
                    <input type="checkbox" name="active" value="1" checked>
                </label>

                <div class="commands-actions">
                    <button class="button button--primary" type="submit">Salvar comando</button>
                    <button class="button button--ghost" type="button" data-action="new-command">Novo</button>
                    <button class="button commands-button--danger" type="button" data-action="delete-command">Excluir</button>
                </div>
            </form>
        </aside>
    </div>
</section>
