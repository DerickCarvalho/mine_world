# PRD-018: Crafting Grid 3Ã—3 â€” sistema de crafting como o Minecraft

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-018 |
| **Harness Version** | 2 |
| **Titulo** | Crafting Grid 3Ã—3 â€” sistema de crafting como o Minecraft |
| **Tipo** | Melhoria de gameplay |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **DependÃªncias** | PRD-017 (novos itens como iron_ingot, diamond, coal) |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** substituir o sistema atual de crafting por lista (sem posiÃ§Ã£o) por um sistema de grade 3Ã—3 com receitas posicionadas, exatamente como o Minecraft; adicionar todo o arsenal de receitas do MC clÃ¡ssico
- **Stack alvo:** JavaScript Vanilla
- **Ambiente de referÃªncia:** Windows + Laragon em `C:\laragon\www\mine_world`

## Problema / Oportunidade

O sistema de crafting atual em `CraftingCatalog.js` usa um array de inputs sem posiÃ§Ã£o â€” qualquer combinaÃ§Ã£o de materiais em qualquer slot cria o item. NÃ£o Ã© como o Minecraft funciona: no MC, a posiÃ§Ã£o na grade importa (3 pedras na linha de cima = pickaxe de pedra). AlÃ©m disso, existem apenas 13 receitas bÃ¡sicas. O inventÃ¡rio nÃ£o tem a grade 2Ã—2 de crafting pessoal. NÃ£o hÃ¡ bancada com grade 3Ã—3 acessÃ­vel com right-click.

### Impacto Atual

- **Quem Ã© afetado:** qualquer jogador que tente avanÃ§ar no jogo
- **FrequÃªncia:** a cada sessÃ£o de crafting
- **ConsequÃªncia:** o sistema de crafting Ã© genÃ©rico demais e nÃ£o reproduz a mecÃ¢nica central do MC

## Objetivo da Funcionalidade

1. Implementar sistema de crafting shaped com grade 3Ã—3 (posiÃ§Ã£o dos itens importa)
2. Adicionar grade 2Ã—2 pessoal no inventÃ¡rio do jogador
3. Adicionar tela de bancada (CraftingTable) com grade 3Ã—3 acessÃ­vel via right-click
4. Expandir catÃ¡logo de receitas para cobrir todas as ferramentas, blocos e itens essenciais do MC
5. Adicionar itens necessÃ¡rios para as receitas: iron_pickaxe, iron_axe, iron_sword, iron_shovel, gold_ingot tools, diamond tools, furnace, chest, torch, ladder, bowl, etc.

### Resultado Esperado para o UsuÃ¡rio

- Abrir inventÃ¡rio e ver uma grade 2Ã—2 para crafting bÃ¡sico (tabuas, gravetos, workbench)
- Clicar direito na bancada e ver uma grade 3Ã—3 para crafting avanÃ§ado
- Colocar 3 cobblestones na linha de cima + 2 gravetos abaixo = picareta de pedra
- Ter acesso a todo o arsenal de receitas do MC clÃ¡ssico (ferramentas de ferro, ouro, diamante; baÃº; fornalha; tochas)
- Output slot que mostra o item resultado e ao clicar consome os materiais

## Fluxo Atual

1. InventÃ¡rio mostra lista de receitas disponÃ­veis
2. Clicar numa receita consome qualquer combinaÃ§Ã£o de inputs sem posiÃ§Ã£o
3. NÃ£o hÃ¡ grade visual de crafting

## Fluxo Desejado

1. InventÃ¡rio mostra grade 2Ã—2 + output slot no canto
2. Bancada (right-click) abre janela com grade 3Ã—3 + output slot
3. Jogador coloca itens nos slots da grade
4. Sistema verifica se o padrÃ£o bate com alguma receita shaped ou shapeless
5. Output slot mostra o resultado
6. Shift-click ou click no output consome os ingredientes e entrega o resultado

## Escopo IncluÃ­do

- Redesenho completo de `CraftingCatalog.js` com receitas shaped (posiÃ§Ã£o importa) e shapeless
- Grid component 2Ã—2 no painel de inventÃ¡rio
- Grid component 3Ã—3 para bancada (novo `CraftingTableUI.js`)
- Output slot em ambas as grades
- Novos itens em `BlockTypes.js`: iron_pickaxe, iron_axe, iron_sword, iron_shovel, iron_hoe, gold tools, diamond tools, furnace, chest, torch, bowl, bread, leather_helmet, etc.
- CatÃ¡logo completo de receitas do MC clÃ¡ssico
- Receitas shapeless (pilhas de inputs sem posiÃ§Ã£o exata, ex: bowl de madeira = qualquer 3 pedaÃ§os)
- Livro de receitas (recipe book) com busca
- Crafting com durabilidade de ferramenta
- Banco de dados de receitas em servidor

## Escopo ExcluÃ­do

- Receitas de enchantment (anvil, enchanting table)
- Crafting de armaduras (helmet, chestplate, leggings, boots) â€” ficam para PRD futura

## Requisitos Funcionais

### RF-01: Novos itens e blocos em BlockTypes.js

**Ferramentas de ferro:** iron_pickaxe (id:39), iron_axe (id:40), iron_sword (id:41), iron_shovel (id:42), iron_hoe (id:43)
**Ferramentas de ouro:** gold_pickaxe (id:44), gold_axe (id:45), gold_sword (id:46)
**Ferramentas de diamante:** diamond_pickaxe (id:47), diamond_axe (id:48), diamond_sword (id:49)
**Blocos funcionais:** furnace (id:50) se nÃ£o existir, chest (id:51) se nÃ£o existir, torch (id:52)
**Outros itens:** bowl (id:53), bread (id:54), leather (id:55), feather (id:56), bone (id:57), arrow (id:58), string (id:59)

> Nota: furnace e chest podem jÃ¡ ter sido adicionados pela PRD-016/017; verificar conflito de IDs antes de executar.

**Hardness de ferramentas de ferro/ouro/diamante:**
- Todas sÃ£o itens nÃ£o-sÃ³lidos, nÃ£o-opacos, nÃ£o-quebraveis, maxStack=1

**Torch:** bloco nÃ£o-sÃ³lido, nÃ£o-opaco, placeable: true, hardness 0.0, emite luz (propriedade `luminance: 14` â€” implementar depois)

### RF-02: Sistema de receitas shaped

**DescriÃ§Ã£o:** `CraftingCatalog.js` deve suportar receitas shaped com posiÃ§Ã£o de slot.

**Estrutura de receita shaped:**
```js
{
  id: 'stone_pickaxe',
  type: 'shaped',
  width: 3,
  height: 3,
  pattern: [
    ['cobblestone', 'cobblestone', 'cobblestone'],
    [null,          'stick',       null         ],
    [null,          'stick',       null         ]
  ],
  output: { block_id: 'stone_pickaxe', quantity: 1 }
}
```

**Estrutura de receita shapeless:**
```js
{
  id: 'mushroom_stew',
  type: 'shapeless',
  inputs: [{ block_id: 'bowl', quantity: 1 }], // + qualquer cogumelo
  output: { block_id: 'mushroom_stew', quantity: 1 }
}
```

**Matching rules:**
- Shaped: o padrÃ£o pode ser colocado em qualquer posiÃ§Ã£o da grade que caiba (esquerda/direita, cima/baixo)
- Shaped: o padrÃ£o pode ser espelhado horizontalmente (como no MC)
- Shapeless: qualquer combinaÃ§Ã£o de ingredientes sem posiÃ§Ã£o importar

### RF-03: Grid 2Ã—2 no inventÃ¡rio pessoal

**DescriÃ§Ã£o:** o painel de inventÃ¡rio deve ter uma grade 2Ã—2 de crafting com output slot.

**Layout visual (referÃªncia MC):**
```
[ slot ] [craft 1] [craft 2] [ â†’ ] [ output ]
         [craft 3] [craft 4]
```

**Comportamento:**
- Items colocados na grade 2Ã—2 sÃ£o verificados contra receitas shaped de tamanho â‰¤2Ã—2 e receitas shapeless
- Output aparece quando hÃ¡ receita vÃ¡lida
- Fechar inventÃ¡rio com itens na grade: devolver os itens ao inventÃ¡rio
- Grade 2Ã—2 sÃ³ pode fazer receitas bÃ¡sicas; receitas 3Ã—3 exigem bancada

### RF-04: Tela de bancada (CraftingTableUI)

**DescriÃ§Ã£o:** ao dar right-click na bancada (workbench), abrir uma janela de crafting 3Ã—3.

**Layout visual (referÃªncia MC):**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [C1][C2][C3]                        â”‚
â”‚  [C4][C5][C6]  [â†’]  [ OUTPUT ]      â”‚
â”‚  [C7][C8][C9]                        â”‚
â”‚                                      â”‚
â”‚  [  inventÃ¡rio do jogador  ]         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Comportamento:**
- ESC fecha a janela e devolve os itens da grade ao inventÃ¡rio
- Click no output: consome uma "rodada" de ingredientes, entrega output
- Shift-click no output: repete atÃ© acabar os ingredientes ou o stack ficar cheio
- A grade NÃƒO persiste quando a bancada Ã© fechada (diferente do baÃº)
- Tecla E tambÃ©m abre/fecha

### RF-05: CatÃ¡logo completo de receitas MC

**Receitas obrigatÃ³rias (shaped 3Ã—3):**

| Receita | Pattern | Output |
|---------|---------|--------|
| Picareta de madeira | PPP / _S_ / _S_ | wood_pickaxe |
| Machado de madeira | PP_ / PS_ / _S_ | wood_axe |
| Espada de madeira | _P_ / _P_ / _S_ | wood_sword |
| PÃ¡ de madeira | _P_ / _S_ / _S_ | wood_shovel |
| Enxada de madeira | PP_ / _S_ / _S_ | wood_hoe |
| (repete para stone, iron, gold, diamond) | mesma forma com material diferente | |
| Bancada | PP / PP (2Ã—2) | workbench |
| BaÃº | PPP/P_P/PPP (sem meio) | chest |
| Fornalha | CCC/C_C/CCC (cobblestone) | furnace |
| Tocha | _C_ / _S_ (2Ã—2 shapeless) | torch Ã—4 |
| Escada | P_P/PPP/P_P | ladder Ã—3 |
| Tigela | P_P/\_P\_ (2Ã—2) | bowl Ã—4 |
| PÃ£o | WWW (3Ã—1) | bread |
| Porta (madeira) | PP/PP/PP (2Ã—3) | door |

Onde P = planks, S = stick, C = coal/cobblestone conforme receita, W = wheat.

**Receitas shapeless:**
- Tabuas de madeira: 1 wood â†’ 4 planks
- Gravetos: 2 planks â†’ 4 sticks
- Coal do ore: 1 coal_ore (drop) â†’ coalÃ© o drop; nÃ£o Ã© receita de crafting

**Nota:** trigo (wheat) pode ser placeholder por ora, pois agricultura nÃ£o estÃ¡ implementada. Adicionar `wheat` como item obtÃ­vel via /give.

## Requisitos NÃ£o Funcionais

- **Performance:** matching de receitas Ã© O(receitas Ã— tamanho_padrÃ£o); para ~60 receitas Ã© imperceptÃ­vel
- **Integridade:** crafting nunca pode duplicar itens nem consumir alÃ©m do necessÃ¡rio
- **UX:** o output slot deve atualizar em tempo real conforme o jogador coloca itens na grade

## Dados e PersistÃªncia

- O estado da grade de crafting pessoal (2Ã—2) nÃ£o Ã© persistido â€” devolve ao fechar
- O estado da grade da bancada (3Ã—3) nÃ£o Ã© persistido â€” devolve ao fechar
- Apenas o inventÃ¡rio principal Ã© persistido (sem alteraÃ§Ã£o no schema)

## DependÃªncias e Premissas

- PRD-017 deve ter adicionado `iron_ingot`, `gold_ingot`, `diamond`, `coal` ao `BlockTypes.js` antes desta PRD
- PRD-021 (blocos interativos) depende desta PRD para a lÃ³gica de crafting da bancada
- A tela de bancada (CraftingTableUI) Ã© criada aqui mas ativada via right-click implementado na PRD-021

## CritÃ©rios de Aceite

- [x] **CA-01:** grid 2Ã—2 visÃ­vel no inventÃ¡rio do jogador com output slot
- [x] **CA-02:** colocar padrÃ£o de tabuas 2Ã—2 na grade pessoal resulta em workbench no output
- [x] **CA-03:** bancada abre ao dar right-click nela e mostra grade 3Ã—3
- [x] **CA-04:** picareta de pedra Ã© craftÃ¡vel na bancada com padrÃ£o correto (3 cobblestone cima + 2 sticks)
- [x] **CA-05:** picareta de ferro Ã© craftÃ¡vel com 3 iron_ingot + 2 sticks
- [x] **CA-06:** fechar bancada ou inventÃ¡rio devolve itens da grade ao inventÃ¡rio
- [x] **CA-07:** shift-click no output consome mÃºltiplas rodadas
- [x] **CA-08:** nenhum craft duplica ou perde itens
- [x] **CA-09:** receitas espelhadas funcionam (machado pode ficar de qualquer lado)
- [x] **CA-10:** `npm test` e `npm run test:harness` passam

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tÃ©cnica | [PRD-TECNICA-018-crafting-grid-3x3.md](./PRD-TECNICA-018-crafting-grid-3x3.md) |
| Tasks | [tasks/](./tasks/) |

