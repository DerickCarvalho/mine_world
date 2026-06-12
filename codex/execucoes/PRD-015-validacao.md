# Validacao - PRD-015

## Resultado

| Campo | Valor |
|-------|-------|
| **Documento** | [PRD-015](../prds/PRD-015-survival-classico-combate-fome-outline/PRD-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Resultado final** | Aprovado |
| **Responsavel pela execucao** | Codex (implementacao) + Claude (validacao final + RF-08) |

## Criterios de aceite

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| CA-01: Auditoria inicial documentada | Passou | Mapeamento feito via leitura do repositorio antes da execucao |
| CA-02: Camera completa para cima e para baixo | Passou | CameraMath.js + WebGLRenderer.js atualizados |
| CA-03: Outline fino no bloco mirado, sem cubo fantasma | Passou | Preview fantasma removido de GameApp.js e WebGLRenderer.js |
| CA-04: Mundo com planicie, floresta, deserto e montanhas/colinas | Passou | ProceduralSurfaceDecorator.js com biomas distintos |
| CA-05: Arvores respeitam bioma | Passou | Vegetacao por bioma no ProceduralSurfaceDecorator |
| CA-06: Hotbar e inventario corretos, slot ativo claro, stacks legiveis | Passou | test:inventory passou; ItemIcon refeito |
| CA-07: Crafts sem duplicacao ou consumo incorreto | Passou | test:inventory validou todos os cenarios |
| CA-08: HUD exibe fome que muda durante a sessao | Passou | hunger em WorldConfig.js, GameApp.js, pages/jogo.php, GameplayHudController.js |
| CA-09: Slot vazio mostra mao vazia; slot com item mostra item coerente | Passou | FirstPersonHand.js + ItemIcon.js |
| CA-10: Mob passivo e hostil com HP, dano, morte e remocao | Passou | PassiveMob com maxHealth/health/attackDamage; CrawlerMob hostil; MobManager.hitEntity remove ao morrer |
| CA-11: Matar mob gera drop coletavel que entra no inventario | Passou | worldDrops no GameApp: drops aparecem no mundo como cubos dourados bobbing; coletados por proximidade (1.5u) e entram no inventario; persistidos no save |
| CA-12: Combate com alcance curto, cooldown e dano por arma | Passou | getHeldAttackDamage() em GameApp; EntityPicker com range limitado |
| CA-13: Performance sem regressao evidente | Passou | test:telemetry passou; pipeline de chunks inalterado |
| CA-14: npm test e test:harness passam | Passou | Todos os 9 suites passaram (132/132 sintaxe OK) |

## Validacoes executadas

| Comando / fluxo | Resultado | Evidencia relevante |
|-----------------|-----------|---------------------|
| `npm test` (suite completo) | Passou | harness, syntax, inventory, telemetry, gameplay, worker, compatibility, world-prebuilder, smoke |
| `npm run test:compatibility` | Passou | item_drops normalizado e persistido no round-trip de save |
| `npm run test:syntax` | Passou | 132/132 arquivos — GameApp.js, WorldRepository.js, _common.php sintaticamente validos |

## Achados e correcoes

| Origem | Achado | Correcao | Verificacao |
|--------|--------|----------|-------------|
| Codex | drops iam direto ao inventario, sem item fisico no chao | Claude: implementou worldDrops (array), buildDropRenderable (cubo dourado 0.44x bobbing), updateWorldDropPickups (pickup por proximidade 1.5u), persistencia em buildSaveState/WorldRepository/PHP | npm test passou |
| Codex | normalizeInventorySlots usava isPlaceableBlock | Corrigido para isCollectableBlock | test:inventory passou |
| Codex | test:inventory fixture sand: 1 insuficiente para glass_from_sand_and_coal | Corrigido para sand: 3 | test:inventory passou |
| Codex | test:compatibility: flatTerrain sem getSubsurfaceBlockIdAt | Metodo adicionado ao stub do teste | test:compatibility passou |

## Limitacoes e riscos residuais

- Audio de hit ainda usa `playCatHurt()` para todos os mobs; polimento de audio pode vir em PRD futura
- Drops persistem no save mas nao sobrevivem a reload de sessao quando o jogador sai sem coletar (normalizado e salvo corretamente via item_drops no estado)
- Drop renderizado como cubo dourado generico; icone especifico por item tipo pode vir em PRD de polimento
