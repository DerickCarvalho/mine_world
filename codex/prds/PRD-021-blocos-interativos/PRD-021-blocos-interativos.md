# PRD-021: Blocos Interativos â€” CraftingTable, Fornalha e BaÃº

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-021 |
| **Harness Version** | 2 |
| **Titulo** | Blocos Interativos â€” CraftingTable, Fornalha e BaÃº |
| **Tipo** | Nova funcionalidade de gameplay |
| **Prioridade** | Alta |
| **Status** | Rascunho |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **DependÃªncias** | PRD-018 (crafting grid 3Ã—3), PRD-016 (texturas de furnace/chest) |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** fazer com que right-click na bancada, fornalha e baÃº abra UIs funcionais â€” exatamente como no Minecraft clÃ¡ssico. Esses trÃªs blocos sÃ£o a base da progressÃ£o do survival
- **Stack alvo:** JavaScript Vanilla
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Problema / Oportunidade

Atualmente, right-click nos blocos nÃ£o faz nada alÃ©m de colocar um bloco na frente. A bancada (workbench) existe como bloco colocÃ¡vel mas sem nenhuma UI de crafting acessÃ­vel por interaÃ§Ã£o. Fornalha e baÃº nem existem como blocos funcionais. O resultado Ã© que o jogo nÃ£o tem nenhum dos "blocos especiais" que definem o loop de progressÃ£o do Minecraft: fundir minÃ©rios, guardar itens, craftar com a grade 3Ã—3.

### Impacto Atual

- **Quem Ã© afetado:** qualquer jogador em modo survival
- **FrequÃªncia:** toda sessÃ£o
- **ConsequÃªncia:** o loop de progressÃ£o mineral Ã© incompleto; nÃ£o Ã© possÃ­vel fundir ferro nem guardar itens de forma organizada

## Objetivo da Funcionalidade

1. **CraftingTable (bancada/workbench):** right-click â†’ abre UI de crafting 3Ã—3 (da PRD-018)
2. **Furnace (fornalha):** right-click â†’ abre UI de fundiÃ§Ã£o com slot de material, slot de combustÃ­vel, slot de output e barra de progresso; funde itens em background
3. **Chest (baÃº):** right-click â†’ abre UI de armazenamento com 27 slots; itens persistem por posiÃ§Ã£o do bloco no mundo

### Resultado Esperado para o UsuÃ¡rio

- Colocar uma bancada no chÃ£o, dar right-click e ver a grade de crafting 3Ã—3
- Colocar uma fornalha, colocar iron_ore no slot de input e coal no combustÃ­vel, ver a barra de progresso encher e o iron_ingot aparecer no output
- Colocar um baÃº, guardar itens, sair do jogo, voltar e os itens ainda estÃ£o lÃ¡
- ESC fecha qualquer uma das UIs e retorna ao jogo

## Fluxo Atual

1. Right-click coloca um bloco na face do bloco alvo (secondaryAction)
2. NÃ£o hÃ¡ detecÃ§Ã£o de tipo de bloco para abrir UI

## Fluxo Desejado

1. Right-click em bloco interativo â†’ `InteractionController` retorna evento `{ type: 'open_block', blockKey, position }`
2. `GameApp` recebe o evento e abre a UI correspondente
3. UI abre como overlay (modal) sobre o jogo; cÃ¢mera e movimento ficam bloqueados
4. ESC fecha a UI e retorna ao jogo com pointer lock

## Escopo IncluÃ­do

- DetecÃ§Ã£o de right-click em bloco interativo no `InteractionController`
- `CraftingTableUI.js` (se nÃ£o criado pela PRD-018): grade 3Ã—3 + output; abre via right-click na bancada
- `FurnaceUI.js`: UI de fundiÃ§Ã£o com 3 slots + barra de progresso; lÃ³gica de smelting em background
- `ChestUI.js`: grade 9Ã—3 (27 slots) de armazenamento
- `BlockEntityManager.js`: gerencia estado de blocos funcionais (fornalha em andamento, itens do baÃº)
- PersistÃªncia do estado de baÃºs e fornalhas no save do mundo
- Receitas de fundiÃ§Ã£o (smelting): iron_ore â†’ iron_ingot, gold_ore â†’ gold_ingot, sand â†’ glass, raw_pork â†’ cooked_pork, raw_beef â†’ cooked_beef, raw_chicken â†’ cooked_chicken
- CombustÃ­veis vÃ¡lidos: coal (8 itens), wood (1.5 itens), planks (1.5 itens), stick (0.5 item)
- Blocos `furnace` e `chest` devem ser adicionados ao `BlockTypes.js` se nÃ£o existirem
- Fornalha com estado visual diferente (ativa vs inativa)
- Duplo baÃº

## Escopo ExcluÃ­do

- BaÃº trancado
- Hoppers, dispensers ou automaÃ§Ã£o
- Crafting de itens dentro do baÃº

## Requisitos Funcionais

### RF-01: Blocos furnace e chest no BlockTypes.js

**Se nÃ£o adicionados pela PRD-017:**
- `furnace` â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 3.5, placeable: true
- `chest` â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 2.5, placeable: true
- `cooked_pork` â€” item comestÃ­vel, nutrition 8, maxStack 16
- `cooked_beef` â€” item comestÃ­vel, nutrition 8, maxStack 16
- `cooked_chicken` â€” item comestÃ­vel, nutrition 6, maxStack 16

### RF-02: DetecÃ§Ã£o de bloco interativo

**DescriÃ§Ã£o:** ao dar right-click com slot vazio ou com item nÃ£o-placeable, verificar se o bloco alvo Ã© interativo.

**Blocos interativos:** `workbench`, `furnace`, `chest`

**Regras:**
- Right-click com bloco/item placeable no slot ativo â†’ coloca bloco (comportamento atual)
- Right-click com slot vazio OU com item nÃ£o-placeable â†’ verificar se bloco alvo Ã© interativo â†’ abrir UI
- Right-click sem nenhum alvo â†’ nenhuma aÃ§Ã£o
- O evento de abertura deve incluir a posiÃ§Ã£o do bloco para identificar o `BlockEntity`

**Em `InteractionController.getInteractiveBlockAction(target, slot)`:**
```js
const INTERACTIVE_BLOCKS = ['workbench', 'furnace', 'chest'];
if (target && target.block && INTERACTIVE_BLOCKS.includes(target.blockKey)) {
  const hasPlaceableItem = slot && slot.block_id && isPlaceableBlock(getBlockIdByKey(slot.block_id));
  if (!hasPlaceableItem) {
    return { type: 'open_block', blockKey: target.blockKey, position: { ...target.block } };
  }
}
return null;
```

### RF-03: CraftingTableUI â€” grid 3Ã—3

**DescriÃ§Ã£o:** bancada abre grid 3Ã—3 de crafting (criado na PRD-018, integrar via right-click).

**Comportamento:**
- Abre como overlay modal centrado
- ESC ou clique no X fecha
- Fechar â†’ itens da grade voltam ao inventÃ¡rio
- CÃ¢mera e movimento bloqueados enquanto aberta

**Ver PRD-018 para implementaÃ§Ã£o da grade em si.**

### RF-04: FurnaceUI â€” fundiÃ§Ã£o

**DescriÃ§Ã£o:** fornalha abre UI com 3 slots e progresso de fundiÃ§Ã£o.

**Layout:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Fornalha                   X â”‚
â”‚                              â”‚
â”‚  [INPUT]          [OUTPUT]  â”‚
â”‚                              â”‚
â”‚  [FUEL]  â–“â–“â–“â–“â–‘â–‘â–‘â–‘â–‘          â”‚
â”‚           progresso          â”‚
â”‚                              â”‚
â”‚  [  inventÃ¡rio do jogador  ] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Comportamento:**
- Slot INPUT: minÃ©rio ou material a fundir
- Slot FUEL: carvÃ£o, madeira, etc.
- Slot OUTPUT: resultado da fundiÃ§Ã£o
- Barra de progresso: 0% a 100% durante a fundiÃ§Ã£o de 1 item (10 segundos base)
- Se INPUT tem item vÃ¡lido E FUEL tem combustÃ­vel: iniciar/continuar fundiÃ§Ã£o
- Ao completar (100%): mover 1 item de OUTPUT, decrementar INPUT em 1, consumir 1 unidade de combustÃ­vel
- FundiÃ§Ã£o continua em background mesmo com UI fechada
- Abrir UI jÃ¡ existente da fornalha: mostrar estado atual

**DuraÃ§Ã£o por combustÃ­vel:**
- coal: 80 segundos (funde 8 itens de 10s cada)
- wood: 15 segundos
- planks: 15 segundos
- stick: 5 segundos

**Receitas de fundiÃ§Ã£o:**
| Input | Output |
|-------|--------|
| iron_ore | iron_ingot |
| gold_ore | gold_ingot |
| sand | glass |
| raw_pork | cooked_pork |
| raw_beef | cooked_beef |
| raw_chicken | cooked_chicken |
| cobblestone | stone |
| clay (futuro) | bricks |

### RF-05: ChestUI â€” armazenamento

**DescriÃ§Ã£o:** baÃº abre grade 9Ã—3 de 27 slots para armazenar itens.

**Layout:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ BaÃº                        X â”‚
â”‚                              â”‚
â”‚ [.][.][.][.][.][.][.][.][.] â”‚
â”‚ [.][.][.][.][.][.][.][.][.] â”‚
â”‚ [.][.][.][.][.][.][.][.][.] â”‚
â”‚                              â”‚
â”‚  [  inventÃ¡rio do jogador  ] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Comportamento:**
- Drag-and-drop de itens entre baÃº e inventÃ¡rio
- Shift-click move item diretamente entre baÃº e inventÃ¡rio
- Fechar com ESC ou X
- Itens permanecem no baÃº ao fechar
- BaÃºs diferentes tÃªm inventÃ¡rios diferentes (identificados pela posiÃ§Ã£o no mundo)

**PersistÃªncia:**
- Estado do baÃº: `{ position: {x, y, z}, slots: [...] }`
- Salvo no `WorldRepository` junto com os chunks ou num campo separado do save

### RF-06: BlockEntityManager

**DescriÃ§Ã£o:** mÃ³dulo que gerencia o estado runtime dos blocos funcionais.

**Responsabilidades:**
- Manter mapa `positionKey â†’ blockEntityState` em memÃ³ria
- `getOrCreate(position, type)` â€” retorna estado existente ou cria novo
- `update(deltaTime)` â€” avanÃ§a todas as fornalhas ativas
- `serialize()` / `deserialize(data)` â€” para save/load

**BlockEntity types:**
```js
// Chest entity
{ type: 'chest', slots: [null Ã— 27] }

// Furnace entity
{ type: 'furnace', inputSlot: null, fuelSlot: null, outputSlot: null,
  smeltingProgress: 0, // 0..1
  fuelRemaining: 0,    // segundos de combustÃ­vel restante
  currentRecipe: null  // receita em andamento
}
```

## Requisitos NÃ£o Funcionais

- **UX:** UIs devem parecer com as do MC: fundo cinza texturizado, slots com borda inset, fontes legÃ­veis
- **Performance:** `BlockEntityManager.update()` itera apenas furnaces ativas; O(n ativos)
- **PersistÃªncia:** baÃºs nunca devem perder itens; serializaÃ§Ã£o validada antes de salvar

## Dados e PersistÃªncia

| Dado | PersistÃªncia | Como |
|------|-------------|------|
| Slots do baÃº | ObrigatÃ³ria | Campo no save do mundo |
| Estado da fornalha | ObrigatÃ³ria | Campo no save do mundo |
| Grade de crafting | NÃ£o | Devolver ao inventÃ¡rio ao fechar |

**Schema de save adicional:**
```json
{
  "block_entities": [
    { "type": "chest",   "x": 10, "y": 35, "z": 5,  "slots": [null, {...}, ...] },
    { "type": "furnace", "x": 12, "y": 35, "z": 5,  "inputSlot": {...}, "fuelSlot": {...}, "outputSlot": null, "fuelRemaining": 42.5, "smeltingProgress": 0.3 }
  ]
}
```

## DependÃªncias e Premissas

- PRD-018 implementa o matching de receitas e a grid UI base
- PRD-016 adiciona texturas de furnace e chest ao BlockTextureMap
- O `WorldRepository.js` deve aceitar o campo `block_entities` no save
- `api/mundos/salvar_estado.php` deve persistir `block_entities`

## CritÃ©rios de Aceite

- [ ] **CA-01:** right-click na bancada abre a UI de crafting 3Ã—3
- [ ] **CA-02:** right-click na fornalha abre a UI de fundiÃ§Ã£o
- [ ] **CA-03:** right-click no baÃº abre a UI de 27 slots
- [ ] **CA-04:** ESC fecha qualquer UI e retorna ao jogo com pointer lock
- [ ] **CA-05:** colocar iron_ore no slot INPUT e coal no FUEL da fornalha â†’ barra progride e iron_ingot aparece em 10s
- [ ] **CA-06:** fornalha continua fundindo mesmo com UI fechada
- [ ] **CA-07:** itens colocados no baÃº estÃ£o lÃ¡ ao fechar e reabrir o jogo
- [ ] **CA-08:** baÃºs diferentes tÃªm inventÃ¡rios independentes
- [ ] **CA-09:** fornalha aceita wood e planks como combustÃ­vel
- [ ] **CA-10:** `npm test` e `npm run test:harness` passam

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tÃ©cnica | [PRD-TECNICA-021-blocos-interativos.md](./PRD-TECNICA-021-blocos-interativos.md) |
| Tasks | [tasks/](./tasks/) |

