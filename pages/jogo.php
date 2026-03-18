<?php

$requestedWorldId = (int) (filter_input(INPUT_GET, 'id_mundo', FILTER_VALIDATE_INT) ?: 0);
?>
<section class="game-screen" data-game-root data-world-id="<?php echo $requestedWorldId; ?>">
    <canvas class="game-screen__canvas" data-game-canvas aria-label="Cena 3D do MineWorld"></canvas>

    <div class="game-hud">
        <div class="game-hud__top">
            <div class="game-chip">
                <span>Mundo</span>
                <strong data-game-world-name>Carregando...</strong>
            </div>

            <div class="game-chip">
                <span>Chunks</span>
                <strong data-game-chunk-count>0</strong>
            </div>

            <div class="game-chip">
                <span>Pausa</span>
                <strong>P para abrir menu</strong>
            </div>
        </div>

        <div class="game-hud__bottom">
            <div class="game-chip game-chip--wide" data-game-status>Preparando mundo procedural...</div>

            <div class="game-chip game-chip--wide">
                <span>Posicao</span>
                <strong data-game-coords>X 0.0 | Y 0.0 | Z 0.0</strong>
            </div>
        </div>
    </div>

    <div class="game-instruction" data-overlay-instruction hidden>
        Clique na cena para capturar o mouse. Use WASD para andar, espaco para pular, P para pausar e ESC para liberar o cursor.
    </div>

    <div class="game-crosshair" data-crosshair hidden aria-hidden="true">
        <span class="game-crosshair__horizontal"></span>
        <span class="game-crosshair__vertical"></span>
    </div>

    <div class="game-pause" data-pause-menu hidden>
        <div class="game-pause__card">
            <p class="game-pause__eyebrow">MineWorld</p>
            <h2>Jogo pausado</h2>
            <p data-pause-message>A partida foi pausada. Retorne ao jogo ou salve e volte ao menu principal.</p>

            <div class="game-pause__actions">
                <button class="button button--ghost" type="button" data-pause-resume>Retornar ao jogo</button>
                <button class="button button--primary" type="button" data-pause-save-exit>Salvar e sair</button>
            </div>
        </div>
    </div>

    <div class="game-overlay" data-scene-overlay>
        <div class="game-overlay__card">
            <p class="game-overlay__eyebrow">MineWorld</p>
            <h1 data-overlay-title>Carregando mundo</h1>
            <p data-overlay-message>Buscando metadados e preparando o terreno procedural inicial.</p>
            <p class="game-overlay__hint">Primeira versao jogavel: terreno procedural, camera em primeira pessoa, pause com P e retomada do ultimo save.</p>

            <div class="game-overlay__actions">
                <button class="button button--primary" type="button" data-overlay-action hidden>Voltar ao lobby</button>
            </div>
        </div>
    </div>
</section>
