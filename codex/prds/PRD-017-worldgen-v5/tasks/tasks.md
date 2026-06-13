# Tasks — PRD-017: World Generation v5

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Adicionar ids 27–38 ao `BlockTypes.js`: gravel, snow, red_sand, cactus, flower, tall_grass, diamond_ore, lapis_ore, coal, iron_ingot, gold_ingot, diamond | Nenhuma |
| TASK-002 | Reescrever `TerrainGenerator.computeHeight()` com blend suave entre biomas e parâmetros por bioma | TASK-001 |
| TASK-003 | Reescrever `TerrainGenerator.getBlockTypeAt()` com blocos de superfície por bioma (snow, red_sand, sand beach) | TASK-001, TASK-002 |
| TASK-004 | Reescrever `TerrainGenerator.getSubsurfaceBlockIdAt()` com diamond_ore, lapis_ore e distribuição realista | TASK-001 |
| TASK-005 | Reescrever `ProceduralSurfaceDecorator`: remover village/ruins, melhorar oak/pine, adicionar birch, adicionar decoração de solo (flores, grama, cacto) | TASK-001, TASK-002 |
| TASK-006 | Atualizar `WorldConfig.algorithmVersion` para `v5.0`; verificar que mundos antigos continuam carregando | TASK-002 |
| TASK-007 | Validação: smoke multi-seed (pelo menos 3 seeds), verificar biomas, árvores, decoração, sem vila/ruína | TASK-002–006 |

**Ordem de execução:** TASK-001 → TASK-002 → TASK-003+004+005 (paralelo) → TASK-006 → TASK-007
