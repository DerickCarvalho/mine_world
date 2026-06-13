# Relatorio de Validacao — PRD-018 Crafting Grid 3x3

| Campo | Valor |
|-------|-------|
| **PRD** | PRD-018 |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Executor** | Codex |

## Resumo

PRD-018 implementada com sistema de crafting shaped 3x3 completo:
- 21 novos items em BlockTypes.js (ids 39-59): ferramentas de ferro/ouro/diamante, furnace, chest, torch, bowl, bread, wheat, shovel, hoe
- CraftingCatalog.js reescrito: motor de matching shaped com shift + espelhamento horizontal, shapeless, 29 receitas MC Classic
- Grade 2x2 no inventario com output slot em tempo real
- Bancada 3x3 aberta por right-click em workbench (CraftingTableUI.js)
- Fechar inventario/bancada devolve itens da grade

## Resultados por Criterio de Aceite

| CA | Status | Evidencia |
|----|--------|-----------|
| CA-01 | OK | [data-craft-quick] visivel no inventario; grid 2x2 + output slot renderizados pelo InventoryPanel |
| CA-02 | OK | matchShapedRecipe() detecta planks 2x2 → workbench; output slot mostra resultado |
| CA-03 | OK | secondaryAction detecta BLOCK_TYPES.workbench → openCraftingTable(); CraftingTableUI abre com grade 3x3 |
| CA-04 | OK | stone_pickaxe recipe: 3 cobblestone linha 1 + 2 sticks em coluna central |
| CA-05 | OK | iron_pickaxe recipe: 3 iron_ingot + 2 sticks (id 39 adicionado ao BlockTypes) |
| CA-06 | OK | toggleInventory() e closeCraftingTable() chamam returnGridToInventory() antes de fechar |
| CA-07 | OK | handleCraftOutput(click) consome uma rodada; loop externo pode repetir |
| CA-08 | OK | consumeGridIngredients() decrementa exatamente 1 por slot nao-nulo; addOutputToInventory() nao duplica |
| CA-09 | OK | tryMatchAt(mirror=true) inverte coluna do pattern; machado funciona dos dois lados |
| CA-10 | OK | npm test passa com 0 erros |

## Arquivos Modificados

| Arquivo | Modificacao |
|---------|-------------|
| assets/js/game/world/BlockTypes.js | IDs 39-59 adicionados (ferramentas, furnace, chest, torch, bowl, bread, wheat, shovel/hoe) |
| assets/js/game/world/BlockTextureMap.js | torch adicionado |
| assets/js/game/world/ItemTextureMap.js | bread, bowl, torch, furnace, chest, stone/wood shovel+hoe adicionados |
| assets/js/game/inventory/CraftingCatalog.js | Reescrito: shaped engine + 29 receitas + APIs legado mantidas |
| assets/js/game/ui/InventoryPanel.js | Grade 2x2 + output slot com callbacks |
| assets/js/game/ui/CraftingTableUI.js | Novo: UI da bancada 3x3 |
| assets/js/game/ui/GameplayHudController.js | Passa craftGridSlots e craftOutputSlot ao InventoryPanel |
| assets/js/game/GameApp.js | craftGrid2x2/3x3, handlers, openCraftingTable, workbench right-click |
| pages/jogo.php | data-craft-quick, data-crafting-table HTML adicionados |
| assets/css/custom/pages/jogo.css | Estilos para craft-quick e crafting-table |
