# PRD-011 - Tecnica

## Diagnostico

O congelamento principal estava alinhado ao ciclo de unload de chunks. O `MutableWorld` mantinha chamadas para cache dormant sem inicializar nem reidratar esse cache corretamente. Quando o runtime descarregava chunks antigas, o estado interno podia entrar em inconsistencia.

## Decisoes tecnicas

- reintroduzir `dormantChunkCache` e `dormantChunkLimit` no `MutableWorld`;
- reidratar chunks primeiro do cache dormant antes de regenerar do zero;
- manter snapshots dormant sincronizadas quando uma mutacao de bloco atingir uma chunk ja descarregada;
- reduzir lotes de preload, load batch e meshing por frame para evitar picos no main thread;
- evoluir o `TerrainGenerator` para `v4.0` sem trocar o contrato das chamadas publicas;
- ajustar o `ProceduralSurfaceDecorator` para acompanhar a nova distribuicao de relevo e densidade de arvores;
- aplicar um override final de CSS para garantir centralizacao real da hotbar.

## Arquivos principais

- `assets/js/game/world/MutableWorld.js`
- `assets/js/game/world/TerrainGenerator.js`
- `assets/js/game/world/ProceduralSurfaceDecorator.js`
- `assets/js/game/GameApp.js`
- `assets/js/game/services/WorldPrebuilder.js`
- `assets/css/custom/pages/jogo.css`
- `api/mundos/cadastrar.php`

## Riscos residuais

- o renderer continua sendo software renderer em `canvas 2D`, entao ainda existe teto de performance estrutural;
- a geracao de chunks continua na main thread, apenas mais contida;
- a validacao visual final ainda depende de smoke test no navegador.
