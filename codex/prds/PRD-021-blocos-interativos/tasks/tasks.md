# Tasks — PRD-021: Blocos Interativos

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Adicionar ao `BlockTypes.js` (se não existirem): furnace, chest, cooked_pork, cooked_beef, cooked_chicken | PRD-017+018 TASK-001 |
| TASK-002 | Criar `BlockEntityManager.js`: mapa por posição, `getOrCreate()`, `update()` com smelting, `serialize()`/`deserialize()` | TASK-001 |
| TASK-003 | Atualizar `InteractionController.js`: método `getInteractiveBlockAction()` que detecta right-click em workbench/furnace/chest | Nenhuma |
| TASK-004 | Criar `FurnaceUI.js`: 3 slots (input/fuel/output), barra de progresso, fechar com ESC/E, `update()` para progresso visual | TASK-002 |
| TASK-005 | Criar `ChestUI.js`: 27 slots (grid 9×3), drag-and-drop, shift-click para mover entre baú e inventário, fechar com ESC/E | TASK-002 |
| TASK-006 | Criar `BlockUIManager.js` e integrar ao `GameApp.js`: abrir UI correta via evento `open_block`, bloquear gameplay enquanto aberta | TASK-003, TASK-004, TASK-005, PRD-018 TASK-004 |
| TASK-007 | Persistência: atualizar `WorldRepository.js` para incluir `block_entities` no save; adicionar migration SQL com coluna `block_entities` | TASK-002 |
| TASK-008 | Adicionar estilos CSS para UIs de bloco: `.block-ui`, `.furnace-*`, `.chest-*`, `.slot-qty` | TASK-004, TASK-005 |
| TASK-009 | Smoke completo: bancada abre 3×3, fornalha funde iron_ore em 10s, baú persiste itens entre sessões | TASK-006, TASK-007, TASK-008 |

**Ordem de execução:** TASK-001 → TASK-002+003 (paralelo) → TASK-004+005 (paralelo) → TASK-006+007 (paralelo) → TASK-008 → TASK-009
