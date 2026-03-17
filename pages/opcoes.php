<section class="options-screen">
    <header class="options-screen__header">
        <div>
            <p class="options-screen__eyebrow">Preferencias do jogador</p>
            <h1>Opcoes</h1>
            <p class="options-screen__copy">Ajuste os parametros reais que ja possuem persistencia e serao reutilizados no bootstrap da experiencia 3D.</p>
        </div>

        <a class="button button--ghost button--small" href="index.php?page=menu">Voltar ao menu</a>
    </header>

    <form id="options-form" class="options-form" novalidate>
        <section class="options-card">
            <div class="options-card__header">
                <p class="options-card__eyebrow">Configuracoes persistentes</p>
                <h2>Controles e renderizacao</h2>
                <p>Os valores abaixo sao validados pelo backend e salvos na conta autenticada.</p>
            </div>

            <div class="options-grid">
                <label class="field">
                    <span>Distancia de render</span>
                    <input type="number" name="render_distance" min="2" max="10" step="1" required>
                    <small class="options-field__hint">Faixa permitida: 2 a 10.</small>
                </label>

                <label class="field">
                    <span>Sensibilidade do mouse</span>
                    <input type="number" name="mouse_sensitivity" min="0.1" max="3" step="0.1" required>
                    <small class="options-field__hint">Faixa permitida: 0.1 a 3.0.</small>
                </label>

                <label class="field">
                    <span>Volume principal</span>
                    <input type="number" name="master_volume" min="0" max="100" step="1" required>
                    <small class="options-field__hint">Faixa permitida: 0 a 100.</small>
                </label>

                <label class="options-toggle">
                    <span class="options-toggle__text">Inverter eixo Y</span>
                    <input type="checkbox" name="invert_y" value="1">
                    <span class="options-toggle__switch" aria-hidden="true"></span>
                </label>
            </div>
        </section>

        <div class="options-actions">
            <button class="button button--primary" type="submit">Salvar configuracoes</button>
            <a class="button button--ghost" href="index.php?page=menu">Cancelar</a>
        </div>
    </form>
</section>
