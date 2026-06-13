# PRD-016: Texturas Minecraft Classic — integração completa e remoção do menu

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-016 |
| **Harness Version** | 2 |
| **Titulo** | Texturas Minecraft Classic — integração completa e remoção do menu |
| **Tipo** | Melhoria visual e limpeza de sistema legado |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-015 |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** substituir todas as cores sólidas de blocos, itens e mobs por texturas PNG reais do Minecraft Classic Edition; remover o menu de gerenciamento de texturas; exibir o braço do Steve quando o jogador não segura nenhum item
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL no backend quando necessário
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Fonte de texturas:** `C:\Users\DerickCarvalho\Downloads\Texturas\Minecraft Classic Edition\assets\minecraft\textures\`

## Problema / Oportunidade

Atualmente todos os blocos são renderizados com cores sólidas definidas em `BlockTypes.js` (`baseColors`). O sistema de texturas existente em `api/texturas/` e `pages/texturas.php` foi criado para upload manual pelo usuário, mas nunca foi utilizado na prática e polui a UI. Os mobs são renderizados como caixas coloridas sem nenhuma textura. A mão vazia do jogador é feita com CSS puro, sem qualquer identidade visual do personagem. O resultado visual é um jogo que parece primitivo mesmo tendo toda a mecânica funcionando.

### Impacto Atual

- **Quem é afetado:** todo jogador — a experiência visual é de protótipo técnico, não de jogo
- **Frequência:** sempre que o jogo roda
- **Consequência:** reduz drasticamente a imersão; o menu de texturas confunde e ocupa espaço no nav sem entregar valor

## Objetivo da Funcionalidade

1. Copiar as texturas do Minecraft Classic Edition para `assets/textures/mc/` dentro do projeto
2. Criar um mapa estático que associa cada block key, item key e mob type ao(s) arquivo(s) PNG correto(s)
3. Carregar todas as texturas no WebGL renderer como atlas ou texturas individuais
4. Renderizar todos os blocos com as texturas corretas (faces top/side/bottom distintas onde aplicável)
5. Renderizar todos os itens na hotbar/inventário com as texturas corretas
6. Renderizar todos os mobs com a textura de entidade correspondente aplicada ao modelo box
7. Exibir o braço/mão do Steve (skin `entity/steve.png`) quando o slot ativo estiver vazio
8. Remover completamente o menu de gerenciamento de texturas (`pages/texturas.php`, `api/texturas/`, link no nav)

### Resultado Esperado para o Usuário

- O mundo tem aparência visual de Minecraft: grama verde com topo texturizado, pedra cinza com detalhes, areia com granulação, troncos de madeira com fibras
- Itens na hotbar mostram os ícones reais do MC em vez de quadrados coloridos
- Mobs têm a skin correspondente aplicada ao modelo (porco rosa, ovelha branca, creeper verde)
- Segurar nenhum item mostra o braço direito do Steve, com animação de balanço
- O menu de "Texturas" desapareceu da navegação

## Fluxo Atual

1. Blocos são renderizados com `baseColors` sólidos por face em `BlockTypes.js`
2. `ChunkMaterials.js` tenta usar `textureCatalog` mas retorna `null` quando não há nada configurado
3. O WebGLRenderer usa cor plana + shading direcional como fallback
4. Itens na UI usam `ItemIcon.js` que renderiza uma caixa colorida
5. A mão vazia usa 3 spans CSS (palm, thumb, sleeve) sem textura
6. O menu de texturas permite upload mas nunca integrou ao runtime

## Fluxo Desejado

1. Na inicialização do jogo, `StaticTextureLoader` carrega as texturas PNG de `assets/textures/mc/` como objetos WebGL
2. `BlockTextureMap.js` fornece os caminhos de face para cada block key
3. `ChunkMaterials.js` usa `BlockTextureMap` em vez do catálogo dinâmico da API
4. O WebGLRenderer usa a textura carregada em vez da cor sólida
5. `ItemTextureMap.js` fornece o caminho PNG para cada item; `ItemIcon.js` usa como `<img src>`
6. `EntityTextureMap.js` fornece o PNG de cada mob type; o renderer de entidades aplica UV mapping
7. `FirstPersonHand.js` exibe um canvas/elemento que mostra o braço recortado da skin steve.png
8. `pages/texturas.php`, `api/texturas/*.php` e o link no nav são removidos

## Escopo Incluído

- Cópia das texturas de `C:\Users\DerickCarvalho\Downloads\...` para `assets/textures/mc/`
- `assets/js/game/world/BlockTextureMap.js` — mapeamento de block key → { top, side, bottom } paths
- `assets/js/game/world/ItemTextureMap.js` — mapeamento de item/block key → path PNG do item
- `assets/js/game/entities/EntityTextureMap.js` — mapeamento de mob type → path PNG de entidade
- Atualização de `ChunkMaterials.js` para usar `BlockTextureMap` estaticamente
- Atualização de `TextureRepository.js` para carregar de paths estáticos (sem API)
- Atualização de `WebGLRenderer.js` para usar WebGL textures nos blocos
- Atualização de `ItemIcon.js` para usar `<img>` com o path do `ItemTextureMap`
- Atualização de `FirstPersonHand.js` para exibir o braço do Steve via canvas 2D recortando `entity/steve.png`
- Atualização dos renderers de mobs para aplicar a textura de entidade ao modelo box
- Remoção de `pages/texturas.php`
- Remoção dos links de texturas no nav/menu
- Remoção de `assets/js/paginas/texturas.js` (se existir)
- Remoção de `assets/css/pages/texturas.css` (se existir)
- Texturas animadas (água, lava com .mcmeta)
- Blocos com múltiplas variações de face
- Texturas de partícula ou efeitos visuais

## Escopo Excluído

- Geração de atlas automático — usar texturas individuais por bloco inicialmente
- Texturização de armaduras sobre o modelo do jogador

## Requisitos Funcionais

### RF-01: Cópia e organização das texturas

**Descrição:** as texturas do MC Classic devem estar disponíveis como arquivos estáticos dentro do projeto, servidas pelo Laragon.

**Regras de negócio:**
- Copiar apenas as subpastas `block/`, `item/` e `entity/` para `assets/textures/mc/`
- Manter os nomes de arquivo originais (snake_case como no MC)
- Não modificar ou reprocessar os arquivos PNG
- A pasta `assets/textures/mc/` deve ser acessível via `GET /assets/textures/mc/block/grass_block_top.png`

**Saída esperada:** arquivos PNG servidos pelo servidor local

### RF-02: Mapeamento de blocos para texturas

**Descrição:** cada block key deve ter faces mapeadas para os arquivos PNG corretos.

**Regras de negócio:**
- Faces `top`, `side` e `bottom` configuradas individualmente quando diferirem
- Blocos sem textura mapeada continuam usando `baseColor` como fallback (sem crash)
- O mapeamento é estático (arquivo JS), não dinâmico

**Mapeamentos obrigatórios:**

| Block key | top | side | bottom |
|-----------|-----|------|--------|
| grass | `grass_block_top.png` | `grass_block_side.png` | `dirt.png` |
| dirt | `dirt.png` | `dirt.png` | `dirt.png` |
| stone | `stone.png` | `stone.png` | `stone.png` |
| sand | `sand.png` | `sand.png` | `sand.png` |
| water | `water_still.png` | `water_still.png` | `water_still.png` |
| wood (oak_log) | `oak_log_top.png` | `oak_log.png` | `oak_log_top.png` |
| leaves | `oak_leaves.png` | `oak_leaves.png` | `oak_leaves.png` |
| bedrock | `bedrock.png` | `bedrock.png` | `bedrock.png` |
| coal_ore | `coal_ore.png` | `coal_ore.png` | `coal_ore.png` |
| iron_ore | `iron_ore.png` | `iron_ore.png` | `iron_ore.png` |
| gold_ore | `gold_ore.png` | `gold_ore.png` | `gold_ore.png` |
| planks | `oak_planks.png` | `oak_planks.png` | `oak_planks.png` |
| cobblestone | `cobblestone.png` | `cobblestone.png` | `cobblestone.png` |
| bricks | `bricks.png` | `bricks.png` | `bricks.png` |
| glass | `glass.png` | `glass.png` | `glass.png` |
| workbench | `crafting_table_top.png` | `crafting_table_side.png` | `oak_planks.png` |
| furnace | `furnace_top.png` | `furnace_side.png` | `furnace_side.png` |
| chest | `oak_planks.png` | `oak_planks.png` | `oak_planks.png` |

**Saída esperada:** bloco com faces corretas no WebGL renderer

### RF-03: Texturas de itens na UI

**Descrição:** cada item/bloco no inventário, hotbar e painel de crafting deve exibir o ícone PNG real.

**Regras de negócio:**
- `ItemTextureMap` retorna o caminho absoluto (`/assets/textures/mc/item/<nome>.png` ou `block/<nome>.png`) para cada `block_id`
- Itens sem mapeamento exibem o ícone colorido anterior como fallback
- Os `<img>` gerados devem ter `alt` com o nome do item

**Mapeamentos obrigatórios para itens:**
- wood_pickaxe → `item/wooden_pickaxe.png`
- stone_pickaxe → `item/stone_pickaxe.png`
- wood_axe → `item/wooden_axe.png`
- stone_axe → `item/stone_axe.png`
- wood_sword → `item/wooden_sword.png`
- stone_sword → `item/stone_sword.png`
- stick → `item/stick.png`
- raw_pork → `item/porkchop.png`
- cloth/wool → `item/white_wool.png`
- fang → `item/bone.png`
- Todos os blocos colocáveis → `block/<nome>.png` ou `item/<nome>.png`

**Saída esperada:** hotbar e inventário com ícones PNG reais

### RF-04: Texturas de entidades (mobs)

**Descrição:** cada mob deve ter a textura PNG da entidade aplicada ao modelo box.

**Regras de negócio:**
- `EntityTextureMap` mapeia mob type string para path PNG
- O renderer de entidades usa UV mapping padrão (face do modelo → região da textura)
- UV mapping simplificado: face frontal centralizada na textura, demais faces uniformes

**Mapeamentos:**
- pig → `entity/pig/pig.png`
- sheep → `entity/sheep/sheep.png`
- cow → `entity/cow/cow.png`
- chicken → `entity/chicken.png`
- creeper → `entity/creeper/creeper.png`
- zombie → `entity/zombie/zombie.png`
- skeleton → `entity/skeleton/skeleton.png`
- spider → `entity/spider/spider.png`

**Saída esperada:** mobs com aparência MC reconhecível

### RF-05: Mão do Steve quando slot vazio

**Descrição:** quando nenhum item está equipado, a mão direita do Steve deve ser exibida usando a skin PNG.

**Regras de negócio:**
- Carregar `entity/steve.png` (64×64) uma vez na inicialização
- Recortar a região do braço direito (pixels 40–55, 16–31 na UV da skin 1.8)
- Exibir o recorte escalado em `FirstPersonHand` em vez dos spans CSS
- Manter animação de balanço ao caminhar e de uso ao atacar
- Jogador feminino (Alex) fica para backlog

**Saída esperada:** braço texturizado do Steve visível no canto inferior direito durante jogo

### RF-06: Remoção do menu de texturas

**Descrição:** remover completamente o sistema de upload/gerenciamento de texturas.

**Regras de negócio:**
- Remover `pages/texturas.php`
- Remover link "Texturas" do menu de navegação (`partials/nav.php` ou equivalente)
- Remover arquivos `api/texturas/*.php` ou manter apenas como arquivos sem link ativo
- Remover `assets/js/paginas/texturas.js` e `assets/css/pages/texturas.css` se existirem
- Não remover a tabela de BD (pode ser feita em migration futura)

**Saída esperada:** menu sem opção de texturas; navegação para `/index.php?page=texturas` retorna 404 ou redireciona

## Requisitos Não Funcionais

- **Performance:** cada textura PNG deve ser carregada uma única vez e reutilizada via cache; nenhuma textura deve ser buscada por frame
- **Fallback:** bloco sem textura mapeada não pode causar crash — usar cor sólida anterior
- **Compatibilidade:** manter WebGL 2 como alvo; sem uso de WebGL extensions exóticas
- **Tamanho:** o build final com texturas não deve exceder 20 MB (as texturas MC Classic têm ~2 MB)

## Dados e Persistência

Nenhum dado novo precisa ser persistido. O sistema de texturas passa a ser 100% estático (arquivos servidos pelo servidor). Remover as rotas da API de texturas não quebra saves existentes.

## Dependências e Premissas

- As texturas estão disponíveis em `C:\Users\DerickCarvalho\Downloads\Texturas\Minecraft Classic Edition\assets\minecraft\textures\`
- O executor deve copiar `block/`, `item/` e `entity/` para `assets/textures/mc/`
- PRD-019 (mobs do MC) depende do `EntityTextureMap` criado aqui
- PRD-021 (blocos interativos) usa as texturas de furnace/chest mapeadas aqui
- A skin `entity/steve.png` existe no pacote de texturas

## Riscos e Perguntas em Aberto

- A skin do Steve usa formato 1.8 (64×64) — confirmar que é esse formato no pacote
- UV mapping simplificado de mobs pode parecer "errado" em faces específicas — aceitável para esta versão
- Remover `api/texturas/` pode quebrar algum endpoint não mapeado — auditar antes de remover

## Critérios de Aceite

- [x] **CA-01:** todos os blocos listados em RF-02 são renderizados com textura PNG correta no WebGL
- [x] **CA-02:** blocos sem mapeamento continuam renderizando com cor sólida sem crash
- [x] **CA-03:** hotbar e inventário exibem ícones PNG para todos os itens listados em RF-03
- [x] **CA-04:** mobs pig, sheep, creeper e zombie exibem a textura de entidade no modelo box
- [x] **CA-05:** slot vazio exibe o braço do Steve texturizado com animação de balanço funcional
- [x] **CA-06:** o link "Texturas" desaparece do menu de navegação
- [x] **CA-07:** navegar para `?page=texturas` redireciona ou retorna erro 404
- [x] **CA-08:** `npm test` e `npm run test:harness` passam sem regressão
- [x] **CA-09:** o FPS médio não regride mais que 10% em relação ao estado anterior (medir com telemetria)
- [x] **CA-10:** nenhuma textura é carregada mais de uma vez por sessão (verificar network tab)

## Histórico de Requisitos

| Requisito / Decisão | Estado | Substitui | Substituído por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Sistema de upload de texturas | Removido | sistema dinâmico via API | mapeamento estático | nunca foi usado; texturas estáticas são suficientes e mais simples |
| Cores sólidas nos blocos | Substituído | baseColors | texturas PNG MC | elevar visual ao nível do MC |

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD técnica | [PRD-TECNICA-016-texturas-mc-classic.md](./PRD-TECNICA-016-texturas-mc-classic.md) |
| Tasks | [tasks/](./tasks/) |
