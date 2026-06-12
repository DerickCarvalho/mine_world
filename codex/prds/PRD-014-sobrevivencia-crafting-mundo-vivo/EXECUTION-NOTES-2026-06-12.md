# PRD-014 - Execucao em 2026-06-12

## Entregue nesta rodada

- modo de jogo persistido no save (`survival` / `creative`)
- crafting catalogado com receitas base e integracao na UI
- palette criativa para preencher a hotbar no modo criativo
- novos blocos e recursos: `coal_ore`, `iron_ore`, `gold_ore`, `planks`, `cobblestone`, `bricks`, `glass`
- geracao subterranea de minerios
- expansao do terreno com novos biomas logicos: `taiga`, `meadow`, `badlands`
- decoracao procedural com pinheiros, vilarejos simples e ruinas
- variedade de mobs com `PigMob` e `SheepMob`, mantendo `CatMob`
- melhoria visual inicial para receitas/catalogo criativo e modo de jogo no HUD

## Pendente de validacao em runtime

- confirmar visual final do inventario/crafting no navegador
- confirmar spawn dos novos mobs em diferentes biomas
- revisar densidade de vilas/ruinas em seeds reais
- rodar os scripts de teste apos normalizacao do shell local

## Bloqueio desta rodada

Nao foi possivel executar testes automatizados nem leituras adicionais via shell por falha do sandbox Windows (`spawn setup refresh`).
