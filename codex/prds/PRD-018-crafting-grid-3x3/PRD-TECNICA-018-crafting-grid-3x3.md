# PRD-TECNICA-018: Crafting Grid 3×3 — sistema de crafting como o Minecraft

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-018-crafting-grid-3x3.md](./PRD-018-crafting-grid-3x3.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Técnico** | Codex |
| **Versão** | 1.0 proposta |

## Contexto Técnico

- **Projeto:** MineWorld
- **Stack:** JavaScript Vanilla, sem framework
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Análise do Estado Atual

| Arquivo | Papel atual | Impacto esperado |
|---------|-------------|------------------|
| `assets/js/game/inventory/CraftingCatalog.js` | Receitas shapeless simples | Reescrever completamente |
| `assets/js/game/ui/InventoryPanel.js` | Inventário do jogador | Adicionar grid 2×2 |
| `assets/js/game/world/BlockTypes.js` | Definição de itens | Adicionar novos itens |
| `assets/js/game/interaction/InteractionController.js` | Interação de blocos | Expor evento openBlock (PRD-021) |
| `assets/css/custom/pages/jogo.css` | Estilos do jogo | Adicionar estilos da grade |

## Solução Técnica Proposta

### Arquitetura do sistema

```
CraftingCatalog.js        — catálogo de receitas puras (sem DOM)
  ↳ matchShapedRecipe(grid, recipes)
  ↳ matchShapelessRecipe(grid, recipes)
  
InventoryPanel.js         — grade 2×2 embutida
  ↳ this.craftGrid = [[null,null],[null,null]]
  ↳ this.craftOutput = null
  ↳ updateCraftOutput() — chama CraftingCatalog.matchAny(grid2x2)

CraftingTableUI.js (novo) — grade 3×3 standalone
  ↳ this.craftGrid = [9 slots]
  ↳ this.craftOutput = null
  ↳ updateCraftOutput() — chama CraftingCatalog.matchAny(grid3x3)
  ↳ open(bancadaPosition) / close()
```

### Estrutura de dados de receita

```js
// shaped recipe
{
  id: 'stone_pickaxe',
  type: 'shaped',
  pattern: [
    ['cobblestone', 'cobblestone', 'cobblestone'],
    [null,          'stick',       null          ],
    [null,          'stick',       null          ]
  ],
  output: { block_id: 'stone_pickaxe', quantity: 1 }
}

// shapeless recipe
{
  id: 'planks_from_wood',
  type: 'shapeless',
  inputs: [{ block_id: 'wood', quantity: 1 }],
  output: { block_id: 'planks', quantity: 4 }
}
```

### Algoritmo de matching

#### matchShapedRecipe(grid, recipe)

1. Extrair bounding box dos slots não-null da grade (recortar espaços em branco nas bordas)
2. Extrair bounding box do padrão da receita
3. Se dimensões não batem → nenhuma das orientações pode bater → retornar false
4. Testar as 4 posições possíveis de deslocamento (em grade 3×3 com pattern 2×2: offset X 0 ou 1, offset Z 0 ou 1)
5. Para cada posição: testar padrão normal e padrão espelhado horizontalmente
6. Se bateu: retornar `{ recipe, positions: [] }` (quais slots foram consumidos)

```js
function normalizePattern(pattern) {
  // Remove linhas/colunas null das bordas
  let minRow = pattern.length, maxRow = 0, minCol = pattern[0].length, maxCol = 0;
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      if (pattern[r][c]) { minRow = Math.min(minRow, r); maxRow = Math.max(maxRow, r); minCol = Math.min(minCol, c); maxCol = Math.max(maxCol, c); }
    }
  }
  return pattern.slice(minRow, maxRow+1).map(row => row.slice(minCol, maxCol+1));
}

function patternMatches(grid, gridW, gridH, pattern, offsetR, offsetC, mirror) {
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      const expected = mirror ? pattern[r][pattern[r].length - 1 - c] : pattern[r][c];
      const gi = (r + offsetR) * gridW + (c + offsetC);
      const slot = grid[gi];
      const got = slot ? slot.block_id : null;
      if (expected !== got) return false;
    }
  }
  return true;
}
```

#### matchShapelessRecipe(grid, recipe)

1. Flatten da grade em array de slots não-null
2. Contar items por block_id
3. Verificar que todos os inputs da receita estão satisfeitos e que não há itens extras

### CraftingCatalog.js — reescrita

Exportar:
- `CRAFTING_RECIPES` — array de receitas (shaped + shapeless)
- `matchRecipe(grid: Array<slot|null>, gridWidth: number): { recipe, output } | null`
- `consumeCraft(slots, grid, gridWidth, recipe): { nextSlots, nextGrid }` — consome ingredientes e retorna novos estados

Manter retrocompatibilidade: a função `listCraftingRecipes()` pode retornar o array completo para outros usos.

### InventoryPanel.js — adicionar grid 2×2

Adicionar estado:
```js
this.craftingGrid = [null, null, null, null]; // 4 slots da grade 2×2
this.craftingOutput = null; // slot de output calculado
```

HTML da grade (dentro do painel de inventário):
```html
<div class="craft-area craft-area--2x2">
  <div class="craft-grid craft-grid--2x2">
    <div class="craft-slot" data-craft-index="0"></div>
    <div class="craft-slot" data-craft-index="1"></div>
    <div class="craft-slot" data-craft-index="2"></div>
    <div class="craft-slot" data-craft-index="3"></div>
  </div>
  <div class="craft-arrow">→</div>
  <div class="craft-output" data-craft-output></div>
</div>
```

Lógica:
- Sempre que um slot da grade muda: chamar `updateCraftOutput()`
- `updateCraftOutput()`: chama `matchRecipe(this.craftingGrid, 2)` e atualiza `craftingOutput`
- Click no output: `consumeCraft()`, adicionar output ao inventário, limpar grade
- Shift-click no output: repetir `consumeCraft` até esgotar ingredientes
- Fechar inventário: devolver itens da grade ao inventário

### CraftingTableUI.js — novo arquivo

```js
export class CraftingTableUI {
  constructor(inventoryState, onClose) {
    this.inventoryState = inventoryState;
    this.onClose = onClose;
    this.craftingGrid = new Array(9).fill(null);
    this.craftingOutput = null;
    this.root = null;
  }

  open() { /* criar DOM, bind events, mostrar */ }
  close() { /* devolver itens da grade ao inventário, esconder DOM, chamar onClose */ }
  updateCraftOutput() { /* matchRecipe(this.craftingGrid, 3) */ }
  handleOutputClick(event) { /* consumeCraft, entregar ao inventário */ }
}
```

O `GameApp.js` instancia `CraftingTableUI` uma vez e chama `open()`/`close()` conforme evento de `InteractionController`.

### Catálogo de receitas

Todas as receitas em `CRAFTING_RECIPES` — shaped e shapeless. Ver PRD de produto para lista completa.

Exemplos de código:
```js
// Picareta de pedra
{ id: 'stone_pickaxe', type: 'shaped', pattern: [
  ['cobblestone','cobblestone','cobblestone'],
  [null,'stick',null],
  [null,'stick',null]
], output: { block_id: 'stone_pickaxe', quantity: 1 } },

// Tabuas (shapeless)
{ id: 'planks_from_wood', type: 'shapeless', inputs: [{ block_id: 'wood', quantity: 1 }], output: { block_id: 'planks', quantity: 4 } },

// Bancada (shaped 2×2)
{ id: 'workbench', type: 'shaped', pattern: [
  ['planks','planks'],
  ['planks','planks']
], output: { block_id: 'workbench', quantity: 1 } },

// Baú
{ id: 'chest', type: 'shaped', pattern: [
  ['planks','planks','planks'],
  ['planks',null,'planks'],
  ['planks','planks','planks']
], output: { block_id: 'chest', quantity: 1 } },

// Fornalha
{ id: 'furnace', type: 'shaped', pattern: [
  ['cobblestone','cobblestone','cobblestone'],
  ['cobblestone',null,'cobblestone'],
  ['cobblestone','cobblestone','cobblestone']
], output: { block_id: 'furnace', quantity: 1 } },
```

### Estilos CSS

Adicionar a `assets/css/custom/pages/jogo.css`:

```css
.craft-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}

.craft-grid {
  display: grid;
  gap: 2px;
}
.craft-grid--2x2 { grid-template-columns: repeat(2, 36px); }
.craft-grid--3x3 { grid-template-columns: repeat(3, 36px); }

.craft-slot {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.5);
  border: 1px solid #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.craft-slot:hover { background: rgba(255,255,255,0.1); }

.craft-output {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.4);
  border: 2px solid #888;
  cursor: pointer;
}

.crafting-table-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #c6c6c6;
  border: 2px solid #555;
  padding: 16px;
  z-index: 500;
  min-width: 300px;
}
.crafting-table-overlay__title {
  font-size: 14px;
  font-weight: bold;
  color: #404040;
  margin-bottom: 12px;
}
```

## Dados, Persistência e Contratos

- Grade de crafting (pessoal e bancada): estado efêmero, não persistido
- Itens devolvidos ao fechar → inventário já é persistido
- Novos block_ids em `BlockTypes.js` precisam estar no `BLOCK_SAVE_KEYS` para save/load correto

## Requisitos de Performance e Escala

- Matching de receitas: executado a cada mudança na grade; ~60 receitas × verificação simples = <1ms
- DOM: grade renderizada uma vez; apenas output atualiza via `innerHTML`

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Algoritmo de matching espelhado incorreto | Médio | Testar shaped_pickaxe, shaped_axe (assimétrica) |
| Conflito de IDs com PRD-017 | Médio | Coordenar IDs antes de executar; usar IDs > 50 para esta PRD |
| CraftingTableUI não fechar ao ESC | Médio | Bind keydown no open(); unbind no close() |
| Itens perdidos ao fechar sem salvar grid | Alto | Sempre devolver ao inventário antes de destruir DOM |

## Plano de Testes

- Testes unitários puros para `matchRecipe` e `consumeCraft` (sem DOM)
- Smoke: craftar picareta de pedra na bancada
- Smoke: craftar tabuas no inventário pessoal (shapeless)
- Smoke: fechar bancada → itens voltam ao inventário
- Smoke: shift-click no output consome múltiplas rodadas
- `npm test`, `npm run test:harness`

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-novos-itens-block-types.md) | Adicionar novos itens ao BlockTypes.js | PRD-017 TASK-001 |
| [TASK-002](./tasks/TASK-002-reescrever-crafting-catalog.md) | Reescrever CraftingCatalog com shaped/shapeless | TASK-001 |
| [TASK-003](./tasks/TASK-003-grid-2x2-inventario.md) | Adicionar grade 2×2 ao InventoryPanel | TASK-002 |
| [TASK-004](./tasks/TASK-004-crafting-table-ui.md) | Criar CraftingTableUI com grade 3×3 | TASK-002 |
| [TASK-005](./tasks/TASK-005-estilos-crafting.md) | Estilos CSS para grades de crafting | TASK-003, TASK-004 |
| [TASK-006](./tasks/TASK-006-receitas-completas.md) | Implementar catálogo completo de receitas | TASK-002 |
| [TASK-007](./tasks/TASK-007-validar-crafting.md) | Testes e smoke de crafting | TASK-003, TASK-004, TASK-006 |

## Rollback

- Reverter `CraftingCatalog.js` para a versão shapeless anterior (git)
- Remover grade 2×2 do `InventoryPanel.js`
- Remover `CraftingTableUI.js`
- Os novos itens em `BlockTypes.js` são inofensivos se não forem usados
