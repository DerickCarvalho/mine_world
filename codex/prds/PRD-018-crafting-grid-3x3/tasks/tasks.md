# Tasks — PRD-018: Crafting Grid 3×3

| Task | Título | Dependências |
|------|--------|--------------|
| TASK-001 | Adicionar novos itens ao `BlockTypes.js`: iron/gold/diamond tools, furnace, chest, torch, bowl, bread, leather, feather, arrow, string (coordenar IDs com PRD-017/019) | PRD-017 TASK-001 |
| TASK-002 | Reescrever `CraftingCatalog.js` com suporte a receitas `shaped` (padrão posicionado + espelho) e `shapeless` | TASK-001 |
| TASK-003 | Adicionar grade 2×2 ao `InventoryPanel.js` com output slot e lógica de atualização em tempo real | TASK-002 |
| TASK-004 | Criar `CraftingTableUI.js` com grade 3×3, output slot, shift-click, fechar com ESC/E | TASK-002 |
| TASK-005 | Implementar catálogo completo de receitas MC: todas as ferramentas (madeira, pedra, ferro, ouro, diamante), chest, furnace, torch, bowl, pão, ladder | TASK-002 |
| TASK-006 | Adicionar estilos CSS para grades de crafting em `jogo.css` (craft-grid--2x2, craft-grid--3x3, craft-slot, craft-output) | TASK-003, TASK-004 |
| TASK-007 | Testes unitários de `matchRecipe` e `consumeCraft`; smoke de picareta de pedra, bancada, shift-click | TASK-003, TASK-004, TASK-005 |

**Ordem de execução:** TASK-001 → TASK-002 → TASK-003+004+005 (paralelo) → TASK-006 → TASK-007
