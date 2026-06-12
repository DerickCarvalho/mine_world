# Validacao - PRD-014

## Resultado

| Campo | Valor |
|-------|-------|
| **Documento** | [PRD-014](../prds/PRD-014-sobrevivencia-crafting-mundo-vivo/PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Resultado final** | Aprovado |
| **Responsavel pela execucao** | Codex (implementacao) + Claude (validacao) |

## Criterios de aceite

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| Novos blocos e minerios no catalogo | Passou | BlockTypes.js e block_catalog.php expandidos com stick, workbench, ferramentas, raw_pork, cloth, fang |
| Crafting com receitas uteis (gravetos, bancada, ferramentas) | Passou | CraftingCatalog.js com receitas; test:inventory validou sem duplicacao nem consumo errado |
| Inventario normalizacao correta para itens coletaveis | Passou | normalizeInventorySlots usa isCollectableBlock; test:compatibility passou |
| Mobs passivos (pig, sheep) com drops | Passou | PigMob e SheepMob com dropTable; MobManager.hitEntity retorna drops |
| Mob hostil (crawler) com comportamento | Passou | CrawlerMob criado; MobManager spawna em biomas adequados |
| Save com inventario e mutacoes preservados | Passou | test:compatibility passou em round-trip |
| npm test passa | Passou | Todos os 9 suites passaram |

## Validacoes executadas

| Comando / fluxo | Resultado | Evidencia relevante |
|-----------------|-----------|---------------------|
| `npm run test:inventory` | Passou | crafting, pilhas, liberacao de receitas validados |
| `npm run test:compatibility` | Passou | inventario com novos block_ids normaliza corretamente |
| `npm run test:syntax` | Passou | 132/132 arquivos |
| `npm run test:harness` | Passou | 0 erros |

## Achados e correcoes

| Origem | Achado | Correcao | Verificacao |
|--------|--------|----------|-------------|
| Codex | normalizeInventorySlots usava isPlaceableBlock, rejeitando novos itens | Corrigido para isCollectableBlock | Passou |

## Limitacoes e riscos residuais

- Modos criativo e sobrevivencia distintos implementados, mas sem separacao completa de regras de coleta (criativo ainda adiciona ao inventario normalmente)
- Estruturas geradas no mundo (vilas, ruinas) nao implementadas nesta PRD; backlog futuro
