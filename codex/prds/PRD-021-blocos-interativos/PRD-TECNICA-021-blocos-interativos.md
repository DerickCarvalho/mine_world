# PRD-TECNICA-021: Blocos Interativos — CraftingTable, Fornalha e Baú

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-021-blocos-interativos.md](./PRD-021-blocos-interativos.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Técnico** | Codex |
| **Versão** | 1.0 proposta |

## Contexto Técnico

- **Projeto:** MineWorld
- **Stack:** JavaScript Vanilla; PHP/MySQL para backend
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Análise do Estado Atual

| Arquivo | Papel atual | Impacto esperado |
|---------|-------------|------------------|
| `assets/js/game/interaction/InteractionController.js` | Quebra/coloca blocos | Adicionar detecção de right-click interativo |
| `assets/js/game/GameApp.js` | Loop principal, processa actions | Adicionar abertura de UIs de bloco |
| `assets/js/game/world/BlockTypes.js` | Definição de blocos | Adicionar furnace, chest, cooked_pork, etc. |
| `assets/js/game/services/WorldRepository.js` | Save/load do mundo | Adicionar serialização de block_entities |
| `api/mundos/salvar_estado.php` | Backend de save | Adicionar campo block_entities |
| `assets/css/custom/pages/jogo.css` | Estilos do jogo | Adicionar estilos das UIs de bloco |

## Solução Técnica Proposta

### Arquitetura

```
InteractionController.getInteractiveBlockAction()
  → { type: 'open_block', blockKey, position }

GameApp (secondaryAction handler)
  → if open_block → BlockUIManager.open(blockKey, position)

BlockUIManager (novo)
  → map de blockKey → UI class
  → open(blockKey, pos) → get/create BlockEntity, open UI
  → close() → release pointer lock

CraftingTableUI (PRD-018 ou novo)
FurnaceUI (novo)
ChestUI (novo)

BlockEntityManager (novo)
  → Map<posKey, BlockEntity>
  → update(deltaTime) → avançar smelting
  → serialize() / deserialize()

WorldRepository
  → incluir block_entities no save/load
```

### Detecção de right-click interativo

**Em `InteractionController.js`:**

```js
const INTERACTIVE_BLOCK_KEYS = new Set(['workbench', 'furnace', 'chest']);

getInteractiveBlockAction(target, slot) {
  if (!target || !target.blockKey) return null;
  if (!INTERACTIVE_BLOCK_KEYS.has(target.blockKey)) return null;
  
  // Se o jogador está segurando um bloco colocável, prefere colocar
  if (slot && slot.block_id && isPlaceableBlock(getBlockIdByKey(slot.block_id))) {
    return null;
  }
  
  return {
    type: 'open_block',
    blockKey: target.blockKey,
    position: { x: target.block.x, y: target.block.y, z: target.block.z }
  };
}
```

Chamar este método no `GameApp` ao processar `secondaryAction`, **antes** de tentar colocar bloco.

### BlockEntityManager.js (novo)

```js
const SMELTING_RECIPES = Object.freeze({
  iron_ore:    { output: 'iron_ingot',    time: 10 },
  gold_ore:    { output: 'gold_ingot',    time: 10 },
  sand:        { output: 'glass',         time: 10 },
  raw_pork:    { output: 'cooked_pork',   time: 10 },
  raw_beef:    { output: 'cooked_beef',   time: 10 },
  raw_chicken: { output: 'cooked_chicken',time: 10 },
  cobblestone: { output: 'stone',         time: 10 },
});

const FUEL_VALUES = Object.freeze({
  coal:   80, coal_ore: 80,
  wood:   15, planks:   15,
  stick:   5,
});

export class BlockEntityManager {
  constructor() { this.entities = new Map(); }

  posKey(pos) { return `${pos.x}:${pos.y}:${pos.z}`; }

  getOrCreate(pos, type) {
    const k = this.posKey(pos);
    if (!this.entities.has(k)) {
      const entity = type === 'chest'
        ? { type: 'chest', pos, slots: new Array(27).fill(null) }
        : { type: 'furnace', pos, inputSlot: null, fuelSlot: null, outputSlot: null,
            smeltingProgress: 0, fuelRemaining: 0, currentRecipe: null };
      this.entities.set(k, entity);
    }
    return this.entities.get(k);
  }

  remove(pos) { this.entities.delete(this.posKey(pos)); }

  update(deltaTime) {
    for (const entity of this.entities.values()) {
      if (entity.type === 'furnace') this._updateFurnace(entity, deltaTime);
    }
  }

  _updateFurnace(f, dt) {
    // Determinar receita
    const input = f.inputSlot;
    const recipe = input ? SMELTING_RECIPES[input.block_id] : null;
    if (!recipe) { f.currentRecipe = null; f.smeltingProgress = 0; return; }

    // Consumir combustível se necessário
    if (f.fuelRemaining <= 0 && f.fuelSlot && FUEL_VALUES[f.fuelSlot.block_id]) {
      f.fuelRemaining += FUEL_VALUES[f.fuelSlot.block_id];
      f.fuelSlot.quantity--;
      if (f.fuelSlot.quantity <= 0) f.fuelSlot = null;
    }

    if (f.fuelRemaining <= 0) { f.smeltingProgress = 0; return; } // sem combustível

    f.fuelRemaining -= dt;
    f.smeltingProgress += dt / recipe.time;

    if (f.smeltingProgress >= 1) {
      f.smeltingProgress = 0;
      // Mover para output se possível
      const outputId = recipe.output;
      if (!f.outputSlot) {
        f.outputSlot = { block_id: outputId, quantity: 1 };
      } else if (f.outputSlot.block_id === outputId && f.outputSlot.quantity < 64) {
        f.outputSlot.quantity++;
      } else {
        f.smeltingProgress = 0; return; // output cheio
      }
      // Consumir input
      f.inputSlot.quantity--;
      if (f.inputSlot.quantity <= 0) f.inputSlot = null;
    }
  }

  serialize() {
    const result = [];
    for (const entity of this.entities.values()) {
      result.push(JSON.parse(JSON.stringify(entity))); // deep clone
    }
    return result;
  }

  deserialize(data) {
    if (!Array.isArray(data)) return;
    for (const entity of data) {
      if (entity && entity.pos && entity.type) {
        this.entities.set(this.posKey(entity.pos), entity);
      }
    }
  }
}
```

### FurnaceUI.js (novo)

```js
export class FurnaceUI {
  constructor(entity, inventorySlots, onClose, onInventoryChange) {
    this.entity = entity; // BlockEntity do tipo furnace
    this.inventorySlots = inventorySlots;
    this.onClose = onClose;
    this.onInventoryChange = onInventoryChange;
    this.root = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  open() {
    // Criar DOM
    this.root = document.createElement('div');
    this.root.className = 'block-ui block-ui--furnace';
    this.root.innerHTML = `
      <div class="block-ui__header">
        <span>Fornalha</span>
        <button class="block-ui__close">×</button>
      </div>
      <div class="block-ui__content">
        <div class="furnace-slots">
          <div class="furnace-slot furnace-slot--input" data-slot="input"></div>
          <div class="furnace-slot furnace-slot--fuel"  data-slot="fuel"></div>
          <div class="furnace-progress"><div class="furnace-progress__bar"></div></div>
          <div class="furnace-slot furnace-slot--output" data-slot="output"></div>
        </div>
        <div class="furnace-inventory"><!-- inventário do jogador --></div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.root.querySelector('.block-ui__close').addEventListener('click', () => this.close());
    window.addEventListener('keydown', this._handleKeyDown);
    this._render();
  }

  _handleKeyDown(e) { if (e.code === 'KeyE' || e.code === 'Escape') { e.preventDefault(); this.close(); } }

  update() {
    // Chamado no loop do GameApp quando UI está aberta
    this._render();
  }

  _render() {
    // Atualizar visual dos slots e barra de progresso
    const bar = this.root.querySelector('.furnace-progress__bar');
    if (bar) bar.style.width = (this.entity.smeltingProgress * 100) + '%';
    // Renderizar slots
    this._renderSlot('input', this.entity.inputSlot);
    this._renderSlot('fuel', this.entity.fuelSlot);
    this._renderSlot('output', this.entity.outputSlot);
  }

  _renderSlot(name, slot) {
    const el = this.root.querySelector(`[data-slot="${name}"]`);
    if (!el) return;
    el.innerHTML = slot
      ? `<img src="${getItemTexturePath(slot.block_id)}" alt="${slot.block_id}">
         <span class="slot-qty">${slot.quantity > 1 ? slot.quantity : ''}</span>`
      : '';
  }

  close() {
    window.removeEventListener('keydown', this._handleKeyDown);
    this.root && this.root.remove();
    this.root = null;
    this.onClose();
  }
}
```

### ChestUI.js (novo)

```js
export class ChestUI {
  constructor(entity, inventorySlots, onClose, onInventoryChange) {
    this.entity = entity; // { slots: [27] }
    this.inventorySlots = inventorySlots;
    this.onClose = onClose;
    this.onInventoryChange = onInventoryChange;
    this.root = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  open() {
    this.root = document.createElement('div');
    this.root.className = 'block-ui block-ui--chest';
    this.root.innerHTML = `
      <div class="block-ui__header"><span>Baú</span><button class="block-ui__close">×</button></div>
      <div class="block-ui__content">
        <div class="chest-grid">
          ${this.entity.slots.map((_, i) => `<div class="chest-slot" data-chest-index="${i}"></div>`).join('')}
        </div>
        <div class="chest-inventory"></div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.root.querySelector('.block-ui__close').addEventListener('click', () => this.close());
    window.addEventListener('keydown', this._handleKeyDown);
    // bind drag-and-drop nos slots
    this._bindSlotEvents();
    this._render();
  }

  _handleKeyDown(e) { if (e.code === 'KeyE' || e.code === 'Escape') { e.preventDefault(); this.close(); } }

  _bindSlotEvents() {
    this.root.querySelectorAll('.chest-slot').forEach(el => {
      el.addEventListener('click', (e) => {
        const i = Number(el.dataset.chestIndex);
        // Lógica de drag: se cursor tem item → colocar; se slot tem item → pegar
        // Usar o mesmo sistema de cursor do InventoryPanel
        this._handleSlotClick(i, e.shiftKey);
      });
    });
  }

  _handleSlotClick(index, shift) {
    if (shift && this.entity.slots[index]) {
      // Shift-click: mover para inventário do jogador
      const moved = this._moveToInventory(this.entity.slots[index]);
      if (moved) this.entity.slots[index] = null;
    }
    // ... lógica de swap com cursor
    this._render();
    this.onInventoryChange();
  }

  _moveToInventory(slot) {
    // Tentar empilhar em slot existente do inventário
    for (let i = 0; i < this.inventorySlots.length; i++) {
      const s = this.inventorySlots[i];
      if (s && s.block_id === slot.block_id && s.quantity < 64) {
        const moved = Math.min(64 - s.quantity, slot.quantity);
        s.quantity += moved;
        slot.quantity -= moved;
        if (slot.quantity <= 0) return true;
      }
    }
    // Tentar slot vazio
    for (let i = 0; i < this.inventorySlots.length; i++) {
      if (!this.inventorySlots[i]) {
        this.inventorySlots[i] = { ...slot };
        slot.quantity = 0;
        return true;
      }
    }
    return false;
  }

  _render() {
    this.entity.slots.forEach((slot, i) => {
      const el = this.root.querySelector(`[data-chest-index="${i}"]`);
      if (!el) return;
      el.innerHTML = slot
        ? `<img src="${getItemTexturePath(slot.block_id)}" alt="${slot.block_id}">
           <span class="slot-qty">${slot.quantity > 1 ? slot.quantity : ''}</span>`
        : '';
    });
  }

  close() {
    window.removeEventListener('keydown', this._handleKeyDown);
    this.root && this.root.remove();
    this.root = null;
    this.onClose();
  }
}
```

### BlockUIManager.js (novo — orquestrador)

```js
export class BlockUIManager {
  constructor(blockEntityManager, getInventorySlots, onInventoryChange, setGameplayEnabled) {
    this.bem = blockEntityManager;
    this.getInventorySlots = getInventorySlots;
    this.onInventoryChange = onInventoryChange;
    this.setGameplayEnabled = setGameplayEnabled;
    this.activeUI = null;
  }

  open(blockKey, position) {
    if (this.activeUI) return; // já tem UI aberta
    
    const slots = this.getInventorySlots();
    const onClose = () => { this.setGameplayEnabled(true); this.activeUI = null; };

    if (blockKey === 'workbench') {
      this.activeUI = new CraftingTableUI(slots, onClose, this.onInventoryChange);
    } else if (blockKey === 'furnace') {
      const entity = this.bem.getOrCreate(position, 'furnace');
      this.activeUI = new FurnaceUI(entity, slots, onClose, this.onInventoryChange);
    } else if (blockKey === 'chest') {
      const entity = this.bem.getOrCreate(position, 'chest');
      this.activeUI = new ChestUI(entity, slots, onClose, this.onInventoryChange);
    }

    if (this.activeUI) {
      this.setGameplayEnabled(false);
      this.activeUI.open();
    }
  }

  update() {
    if (this.activeUI && typeof this.activeUI.update === 'function') {
      this.activeUI.update();
    }
  }

  isOpen() { return this.activeUI !== null; }
}
```

### Persistência no WorldRepository

**Adicionar ao save payload:**
```js
// Em WorldRepository.saveWorld():
const blockEntities = this.blockEntityManager.serialize();
payload.block_entities = blockEntities;

// Em WorldRepository.loadWorld():
if (data.block_entities) {
  this.blockEntityManager.deserialize(data.block_entities);
}
```

**Backend — `api/mundos/salvar_estado.php`:**
- Aceitar campo `block_entities` no JSON de estado
- Salvar como JSON em coluna `block_entities TEXT` (adicionar via migration se necessário)

**Migration necessária:**
```sql
ALTER TABLE mundos ADD COLUMN IF NOT EXISTS block_entities LONGTEXT NULL DEFAULT NULL;
```

Ou melhor, usar a tabela/campo de save existente que já salva o estado do mundo como JSON blob; verificar e expandir conforme necessário.

### CSS — estilos das UIs de bloco

```css
.block-ui {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #c6c6c6;
  border: 3px solid #555;
  border-radius: 2px;
  padding: 12px;
  z-index: 600;
  min-width: 350px;
  font-family: monospace;
  color: #404040;
  box-shadow: 4px 4px 0 #000;
}

.block-ui__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.block-ui__close {
  background: #888;
  border: 1px solid #555;
  color: white;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Fornalha */
.furnace-slots {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.furnace-slot {
  width: 40px;
  height: 40px;
  background: #8b8b8b;
  border: 2px inset #555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}
.furnace-progress {
  width: 60px;
  height: 16px;
  background: #555;
  border: 1px solid #333;
}
.furnace-progress__bar {
  height: 100%;
  background: #f80;
  transition: width 0.5s linear;
}

/* Baú */
.chest-grid {
  display: grid;
  grid-template-columns: repeat(9, 40px);
  gap: 2px;
  margin-bottom: 12px;
}
.chest-slot {
  width: 40px;
  height: 40px;
  background: #8b8b8b;
  border: 2px inset #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.chest-slot:hover, .furnace-slot:hover {
  background: #999;
}
.slot-qty {
  position: absolute;
  bottom: 2px;
  right: 3px;
  font-size: 9px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 0 #000;
}
```

## Dados, Persistência e Contratos

| Entidade | Campo | Persistência | Schema |
|----------|-------|-------------|--------|
| Chest | 27 slots | Sim — coluna block_entities | JSON array |
| Furnace | 3 slots + progress + fuel | Sim — coluna block_entities | JSON |
| CraftingTable grid | temporário | Não | — |

### Contrato de serialização

```json
{
  "block_entities": [
    {
      "type": "chest",
      "pos": {"x": 10, "y": 35, "z": 5},
      "slots": [null, {"block_id": "planks", "quantity": 24}, null, ...]
    },
    {
      "type": "furnace",
      "pos": {"x": 12, "y": 35, "z": 5},
      "inputSlot": {"block_id": "iron_ore", "quantity": 3},
      "fuelSlot": {"block_id": "coal", "quantity": 2},
      "outputSlot": null,
      "fuelRemaining": 37.5,
      "smeltingProgress": 0.42
    }
  ]
}
```

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Baú com itens sendo destruído → itens perdidos | Alto | Ao quebrar bloco interativo: devolver itens ao inventário e remover BlockEntity |
| Duas fornalhas na mesma posição | Baixo | posKey garante unicidade |
| UI de baú aberta ao salvar → estado desync | Médio | Serializar sempre o estado atual do entity (em memória, não o DOM) |
| Migration de BD falhar em produção | Médio | Usar `ADD COLUMN IF NOT EXISTS`; testar em dev primeiro |
| FurnaceUI.update() não sendo chamado → barra congelada | Médio | BlockUIManager.update() no loop do GameApp |

## Plano de Testes

- Smoke: colocar bancada, right-click → UI de crafting 3×3 abre
- Smoke: colocar furnace, right-click → UI de fornalha abre
- Smoke: colocar baú, right-click → UI de baú abre
- Smoke: ESC fecha qualquer UI
- Smoke: colocar iron_ore na fornalha + coal → em 10s aparece iron_ingot
- Smoke: guardar items no baú → sair do jogo → voltar → itens ainda lá
- Smoke: quebrar baú com itens → itens caem ou voltam ao inventário
- `npm test`, `npm run test:harness`

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-blocos-block-types.md) | Adicionar furnace, chest, cooked items ao BlockTypes | PRD-017 TASK-001 |
| [TASK-002](./tasks/TASK-002-block-entity-manager.md) | Criar BlockEntityManager | TASK-001 |
| [TASK-003](./tasks/TASK-003-interaction-open-block.md) | Adicionar detecção de right-click interativo ao InteractionController | Nenhuma |
| [TASK-004](./tasks/TASK-004-furnace-ui.md) | Criar FurnaceUI e receitas de smelting | TASK-002 |
| [TASK-005](./tasks/TASK-005-chest-ui.md) | Criar ChestUI com 27 slots e drag-and-drop | TASK-002 |
| [TASK-006](./tasks/TASK-006-block-ui-manager.md) | Criar BlockUIManager e integrar ao GameApp | TASK-003, TASK-004, TASK-005 |
| [TASK-007](./tasks/TASK-007-persistencia-block-entities.md) | Persistência de block_entities no save | TASK-002 |
| [TASK-008](./tasks/TASK-008-css-estilos.md) | Estilos CSS das UIs de bloco | TASK-004, TASK-005 |
| [TASK-009](./tasks/TASK-009-validar-interativos.md) | Smoke e testes de blocos interativos | Todas anteriores |

## Rollback

- Remover BlockEntityManager, FurnaceUI, ChestUI, BlockUIManager
- Reverter InteractionController para versão sem `getInteractiveBlockAction`
- Reverter GameApp para versão sem abertura de UIs
- Reverter WorldRepository para versão sem block_entities
- Migration de BD: campo extra não causa problemas se não usado
