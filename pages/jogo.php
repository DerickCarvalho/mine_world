<?php

$requestedWorldId = (int) (filter_input(INPUT_GET, 'id_mundo', FILTER_VALIDATE_INT) ?: 0);
?>
<section class="game-screen" data-game-root data-world-id="<?php echo $requestedWorldId; ?>">
    <canvas class="game-screen__canvas" data-game-canvas aria-label="Cena 3D do MineWorld"></canvas>

    <div class="game-hud">
        <div class="game-hud__top">
            <div class="game-chip game-chip--target">
                <span>Alvo</span>
                <strong data-game-target>Nenhum</strong>
            </div>

            <div class="game-chip game-chip--mode">
                <span>Modo</span>
                <strong data-game-mode>SOBREVIVENCIA</strong>
            </div>

            <div class="game-chip game-chip--coords" data-game-coords-chip hidden>
                <span>Posicao</span>
                <strong data-game-coords>X 0.0 | Y 0.0 | Z 0.0</strong>
            </div>
        </div>

        <div class="game-hud__status">
            <div class="game-chip game-chip--wide" data-game-status>Preparando mundo...</div>
        </div>

        <div class="game-hud__bottom">
            <div class="game-hotbar-wrap">
                <div class="game-hotbar-meta">
                    <div class="game-vitals" data-game-health-wrap>
                        <span class="game-vitals__label">Vida</span>
                        <div class="game-vitals__segments" data-game-health aria-label="Barra de vida do jogador"></div>
                        <strong class="game-vitals__value" data-game-health-text>10/10</strong>
                    </div>

                    <div class="game-vitals game-vitals--hunger" data-game-hunger-wrap>
                        <span class="game-vitals__label">Fome</span>
                        <div class="game-vitals__segments" data-game-hunger aria-label="Barra de fome do jogador"></div>
                        <strong class="game-vitals__value" data-game-hunger-text>10/10</strong>
                    </div>

                    <div class="game-flight" data-game-fly data-state="off">
                        <span class="game-flight__label">Fly</span>
                        <strong data-game-fly-text>OFF</strong>
                    </div>
                </div>

                <div class="game-held-item" data-game-hand hidden aria-hidden="true"></div>

                <div class="game-hotbar" data-game-hotbar aria-label="Hotbar do jogador"></div>
            </div>
        </div>
    </div>

    <div class="game-inventory" data-game-inventory hidden>
        <div class="game-inventory__card">
            <div class="game-inventory__header">
                <p class="game-inventory__eyebrow">MineWorld</p>
                <h2 data-inventory-title>Inventario e crafting</h2>
                <p data-inventory-copy>Organize recursos, consulte receitas e mantenha a hotbar pronta para construir.</p>
            </div>

            <div class="game-inventory__layout">
                <div class="game-inventory__main">
                    <div class="game-inventory__grid" data-inventory-grid></div>
                </div>

                <aside class="game-inventory__side">
                    <section class="game-inventory__section">
                        <div class="game-inventory__section-header">
                            <h3>Crafting rapido</h3>
                            <span data-inventory-craft-mode>2x2</span>
                        </div>
                        <div class="game-craft-quick" data-craft-quick>
                            <div class="game-craft-quick__grid" data-craft-grid-2x2></div>
                            <div class="game-craft-quick__arrow">&#8594;</div>
                            <div class="game-craft-quick__output" data-craft-output-2x2></div>
                        </div>
                    </section>

                    <section class="game-inventory__section" data-creative-panel hidden>
                        <div class="game-inventory__section-header">
                            <h3>Catalogo criativo</h3>
                            <span>Escolha um bloco</span>
                        </div>
                        <div class="game-inventory__creative" data-inventory-creative></div>
                    </section>
                </aside>
            </div>

            <div class="game-inventory__hint">
                <span>E</span>
                <p>Fechar inventario</p>
            </div>
        </div>
    </div>

    <div class="game-crafting-table" data-crafting-table hidden>
        <div class="game-crafting-table__card">
            <div class="game-crafting-table__header">
                <p class="game-crafting-table__eyebrow">MineWorld</p>
                <h2>Bancada de trabalho</h2>
            </div>
            <div class="game-crafting-table__main">
                <div class="game-crafting-table__grid" data-craft-grid-3x3></div>
                <div class="game-crafting-table__arrow">&#8594;</div>
                <div class="game-crafting-table__output" data-craft-output-3x3></div>
            </div>
            <div class="game-crafting-table__inventory" data-craft-table-inventory></div>
            <div class="game-crafting-table__hint">
                <span>E</span>
                <p>Fechar bancada (itens devolvidos ao inventario)</p>
            </div>
        </div>
    </div>

    <div class="game-chat" data-game-chat hidden>
        <div class="game-chat__history" data-chat-messages></div>
        <div class="game-chat__suggestions" data-chat-suggestions hidden></div>
        <form class="game-chat__form" data-chat-form novalidate>
            <span class="game-chat__label">Chat</span>
            <input class="game-chat__input" data-chat-input type="text" maxlength="160" autocomplete="off" placeholder="Digite uma mensagem ou /comando">
        </form>
    </div>

    <div class="game-death" data-game-death hidden>
        <div class="game-death__veil" data-game-death-veil></div>
        <div class="game-death__card" data-game-death-card hidden>
            <p class="game-death__eyebrow">MineWorld</p>
            <h2>Voce morreu</h2>
            <p>Renascer leva o jogador para o spawn original do mapa e limpa o inventario atual.</p>
            <div class="game-death__actions">
                <button class="button button--primary" type="button" data-death-respawn>Renascer</button>
                <button class="button button--ghost" type="button" data-death-save-exit>Salvar e voltar ao menu principal</button>
            </div>
        </div>
    </div>

    <div class="game-instruction" data-overlay-instruction hidden>
        Clique na cena para capturar o mouse. Use WASD para andar, espaco para pular, T para chat, C para coordenadas, E para inventario e P para pausar.
    </div>

    <div class="game-crosshair" data-crosshair hidden aria-hidden="true">
        <span class="game-crosshair__horizontal"></span>
        <span class="game-crosshair__vertical"></span>
    </div>

    <div class="game-pause" data-pause-menu hidden>
        <div class="game-pause__card">
            <div class="game-pause__header">
                <div>
                    <p class="game-pause__eyebrow">MineWorld</p>
                    <h2>Jogo pausado</h2>
                    <p data-pause-message>A partida foi pausada. Revise os dados do mundo, ajuste as configuracoes ou salve e volte ao menu principal.</p>
                </div>
            </div>

            <div class="game-pause__body">
                <section class="game-pause__panel">
                    <h3>Dados do mundo</h3>

                    <dl class="game-pause__stats">
                        <div>
                            <dt>Mundo</dt>
                            <dd data-pause-world-name>-</dd>
                        </div>
                        <div>
                            <dt>Seed</dt>
                            <dd data-pause-world-seed>-</dd>
                        </div>
                        <div>
                            <dt>Algoritmo</dt>
                            <dd data-pause-world-algorithm>-</dd>
                        </div>
                        <div>
                            <dt>Chunks carregadas</dt>
                            <dd data-pause-loaded-chunks>0</dd>
                        </div>
                        <div>
                            <dt>Chunks em cache</dt>
                            <dd data-pause-cached-chunks>0</dd>
                        </div>
                        <div>
                            <dt>Posicao atual</dt>
                            <dd data-pause-player-position>-</dd>
                        </div>
                        <div>
                            <dt>Modo</dt>
                            <dd data-pause-game-mode>survival</dd>
                        </div>
                    </dl>

                    <div class="game-pause__mode-actions">
                        <button class="button button--ghost" type="button" data-pause-toggle-mode>Alternar modo</button>
                    </div>
                </section>

                <section class="game-pause__panel">
                    <div class="game-pause__panel-header">
                        <h3>Configuracoes</h3>
                        <p>Alteracoes aplicadas automaticamente durante a partida.</p>
                    </div>

                    <form class="game-pause__settings" data-pause-settings-form novalidate>
                        <label class="field">
                            <span>Distancia de render</span>
                            <input type="number" name="render_distance" min="2" max="10" step="1" required>
                        </label>

                        <label class="field">
                            <span>Sensibilidade do mouse</span>
                            <input type="number" name="mouse_sensitivity" min="0.1" max="3" step="0.1" required>
                        </label>

                        <label class="field">
                            <span>Volume principal</span>
                            <input type="number" name="master_volume" min="0" max="100" step="1" required>
                        </label>

                        <label class="game-pause__toggle">
                            <span>Inverter eixo Y</span>
                            <input type="checkbox" name="invert_y" value="1">
                        </label>
                    </form>

                    <p class="game-pause__settings-status" data-pause-settings-status data-state="idle">
                        Configuracoes aplicadas automaticamente.
                    </p>
                </section>
            </div>

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
            <p data-overlay-message>Buscando metadados, cache inicial de chunks e preparando o terreno.</p>
            <p class="game-overlay__hint">Nesta fase o mundo usa cache persistente de chunks, texturas opcionais por bloco, chat com T e menu contextual completo por P.</p>

            <div class="game-overlay__actions">
                <button class="button button--primary" type="button" data-overlay-action hidden>Voltar ao lobby</button>
            </div>
        </div>
    </div>
</section>
