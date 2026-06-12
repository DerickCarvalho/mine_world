# Validacao - PRD-012

## Resultado

| Campo | Valor |
|-------|-------|
| **Documento** | [PRD-012](../prds/PRD-012-experiencia-sandbox-v1/PRD-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Data** | 11/06/2026 |
| **Resultado final** | Aprovado para conclusao |
| **Responsavel pela execucao** | Jarvis |
| **Investigacao** | Connor |
| **Validacao final** | Ned |

## Criterios de aceite

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| CA-01 | Passou | Benchmark headless de 5 minutos em 1920x1080/distancia 6 registrou P95 sustentado de 16,8 ms |
| CA-02 | Passou | Travessia de 20 chunks registrou frame maximo de 50,1 ms e nenhum congelamento acima de 100 ms |
| CA-03 | Passou | Janela de 5 minutos registrou 0,2 long task/min acima de 50 ms |
| CA-04 | Passou | Testes deterministas cobrem sprint, agachamento, borda, agua e fly |
| CA-05 | Passou | Controller/testes cobrem dureza, cancelamento e bedrock |
| CA-06 | Passou | Preview e regras de colocacao validados; smoke WebGL aprovado |
| CA-07 | Passou | Teste puro de inventario cobre combinar, dividir, trocar e conservacao |
| CA-08 | Passou | Round-trip legado/v3, save autenticado e reload no smoke integrado aprovados |
| CA-09 | Passou | Smoke headless de 15 minutos cobriu inventario, construcao, quebra, agua, save/reload e morte/respawn |
| CA-10 | Passou | `npm test`, `node --check` e benchmark/browser smoke aprovados |

## Validacoes executadas

| Comando / fluxo | Resultado | Evidencia relevante |
|-----------------|-----------|---------------------|
| `npm test` | Passou | Harness 0 erros/48 avisos legados; sintaxe 126/126; suites de gameplay, worker, compatibilidade, prebuilder e smoke aprovadas |
| `npm run test:inventory` | Passou | Cliques primario/secundario conservaram itens e respeitaram pilhas de 64 |
| `npm run test:telemetry` | Passou | Percentis, FPS, long tasks, chunk jobs e exportacao JSON validados |
| Smoke HTTP | Passou | Login/menu responderam 200 e API protegida respondeu 401 |
| `npm run test:browser` | Passou | WebGL abriu em 1920x1080, smoke integrado passou e screenshot foi gerada |
| `npm run test:benchmark` | Passou | Janela estrita de 5 minutos: P95 16,8 ms, frame maximo 83,5 ms e 0,2 long task/min |
| Smoke browser 15 min | Passou | Janela de 15 minutos manteve WebGL ativo, 36.000 frames e smoke integrado completo |
| `npm run test:worker` | Passou | Equivalencia de snapshots, descarte obsoleto, retencao e fallback fatal |
| `npm run test:compatibility` | Passou | Save legado/v3, pose, inventario, mutacoes e chunks preservados |

## Achados e correcoes

| Origem | Achado | Correcao | Verificacao |
|--------|--------|----------|-------------|
| Connor | `Ctrl+W` durante sprint podia fechar a aba | Inputs com `Ctrl` bloqueiam atalhos conflitantes durante gameplay | Sintaxe e suite aprovadas |
| Connor | Quebra com inventario cheio perdia o item | Capacidade validada antes da quebra e rollback defensivo | Sintaxe e suite aprovadas |
| Connor | Cursor stack deslocava a grade | Indicador movido para fora da grade e estilizado | Sintaxe aprovada |
| Connor | Fallback WebGL silencioso sem suporte | Factory agora informa fallback tambem quando WebGL2 nao existe | Suite aprovada |
| Browser smoke | Inventario impedia abertura por `insertBefore` no pai errado | Cursor inserido ao lado da grade pelo `parentNode` correto | Smoke WebGL aprovado |
| Connor | Falha fatal do Worker abandonava jobs | Todos os jobs pendentes retornam ao fallback | Teste dedicado aprovado |
| Connor | Ordenacao descartava versao e requeue podia sobrescrever save novo | Metadados preservados e snapshot novo tem precedencia | Teste Worker aprovado |
| Connor | Worker ainda dependia de chunks ausentes gerados na main thread | Snapshot passou a transferir apenas chunks conhecidas; Worker recompõe o mundo procedural com seed, algoritmo e mutacoes | Benchmark e suite worker aprovados |
| Jarvis | HUD acumulava estilos duplicados e orquestracao visual ainda estava presa ao `GameApp` | `GameplayHudController` assumiu HUD/pausa/pointer-lock e `jogo.css` foi consolidado | `test-gameplay-hud-controller.mjs` e smoke browser aprovados |

## Limitacoes e riscos residuais

- A validacao principal foi feita em headless/SwiftShader; ainda vale acompanhar `npm run benchmark:visible` em GPU real quando houver mudanca grande no renderer.
- O smoke de 15 minutos atual e automatizado e cobre os fluxos essenciais, mas continua valendo observacao visual manual em navegadores alvo antes de grandes mudancas de UX.
