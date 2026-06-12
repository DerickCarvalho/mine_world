# PRD-TECNICA-014: Sobrevivencia, crafting e mundo vivo

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](./PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Tecnico** | Codex |
| **Versao** | 1.0 proposta |

## Contexto Tecnico

- **Projeto:** MineWorld
- **Stack esperada:** HTML, CSS e JavaScript Vanilla
- **Backend quando necessario:** PHP 8.3.16 + MySQL
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao base obrigatorio:** estrutura inspirada em `C:\laragon\www\dealer-gestao-modulos`

### Convencoes Estruturais Esperadas

- `login.php` para autenticacao publica
- `index.php?page=...` para telas autenticadas
- `layout.php`, `pages/` e `partials/` para composicao de interface
- `assets/js/paginas/` para scripts por tela
- `env.default.js` e `env.deploy.js` para `ENV`
- `assets/js/ApiRequest.js` ou equivalente para chamadas de API
- `api/{dominio}/{acao}.php` para endpoints
- `localStorage` para token e estado de sessao no cliente

## Analise do Estado Atual

### Arquitetura Relevante

- `GameApp` integra loop do mundo, inventario, hotbar, interacoes, UI e persistencia.
- `WorldRepository` normaliza save com `inventory.slots`, `selected_hotbar_index` e rotacao do jogador.
- `InventoryPanel`, `Hotbar`, `FirstPersonHand` e `ItemIcon` definem a experiencia visual do inventario e do item equipado.
- `BlockTypes`, `TerrainGenerator`, `ProceduralSurfaceDecorator`, `MutableWorld` e `ChunkMesher` sustentam o catalogo de blocos e a geracao procedural atual.
- `MobManager` e `CatMob` representam o ecossistema atual de entidades.
- `ChunkMaterials`, `TextureRepository`, `texturas.js` e o CRUD de texturas controlam aplicacao e preview de texturas por face.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/world/BlockTypes.js` | Catalogo de blocos | Alterar |
| `assets/js/game/world/TerrainGenerator.js` | Distribuicao de relevo e biomas | Alterar |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Vegetacao e cobertura superficial | Alterar |
| `assets/js/game/world/MutableWorld.js` | Leitura/escrita do mundo mutavel | Alterar |
| `assets/js/game/world/ChunkMesher.js` | UVs e faces renderizadas | Alterar |
| `assets/js/game/world/ChunkMaterials.js` | Materiais e texturas por face | Alterar |
| `assets/js/game/services/WorldRepository.js` | Save/load do player e inventario | Alterar |
| `assets/js/game/GameApp.js` | Runtime principal e regras de interacao | Alterar |
| `assets/js/game/ui/InventoryPanel.js` | Inventario atual | Alterar |
| `assets/js/game/ui/Hotbar.js` | Hotbar | Alterar |
| `assets/js/game/ui/ItemIcon.js` | Visual dos itens | Alterar |
| `assets/js/game/ui/FirstPersonHand.js` | Mao vazia e held item | Alterar |
| `assets/js/game/entities/MobManager.js` | Spawns e lifecycle de mobs | Alterar |
| `assets/js/game/entities/CatMob.js` | Mob atual | Revisar compatibilidade |
| `assets/js/paginas/texturas.js` | CRUD/preview de texturas | Alterar |
| `api/texturas/` e `api/mundos/` | Persistencia de configuracoes e saves | Revisar e alterar se necessario |
| `assets/js/game/inventory/` | Regras puras de inventario atuais | Expandir |

### Dependencias Tecnicas

- WebGL 2 continua sendo alvo principal do renderer.
- O runtime atual de inventario por pilhas e chunks assincronos precisa ser preservado.
- O save do mundo deve continuar retrocompativel ou possuir normalizacao explicita.

## Solucao Tecnica Proposta

### Abordagem

Executar a expansao em fatias controladas. Primeiro ampliar o catalogo de blocos/minerios e a representacao persistente de modo de jogo e receitas. Depois evoluir o inventario para suportar crafting e lista de receitas. Em seguida introduzir estruturas/vilas e novos mobs respeitando limites de streaming. Por fim consolidar o polimento visual de itens, mao vazia e orientacao de texturas.

### Fluxo Tecnico

```text
world seed + game mode -> TerrainGenerator/Decorator + structures
                       -> MutableWorld + BlockTypes + entities
player input -> GameApp + inventory/crafting rules -> save state
             -> UI inventory/hotbar/hand -> ItemIcon/Texture pipeline
```

### Decisoes Estruturais

- Representar `game_mode` como parte do estado persistente do mundo/jogador.
- Manter regras de crafting em modulos puros separados da UI.
- Tratar estruturas e vilas como decoracao procedural persistivel, nao como entidades efemeras.
- Corrigir orientacao de textura preferencialmente no pipeline de UV; se nao bastar, expor configuracao de direcao por face no CRUD.
- Preservar `playerHeight = 1.95` e raio fino como contrato tecnico bloqueado.

## Implementacao Detalhada

### Componente / Arquivo: catalogo de blocos, minerios e receitas

**Acao:** Modificar e criar modulos auxiliares

**Responsabilidade tecnica:**
Expandir `BlockTypes`, introduzir identificadores de minerio/derivado e criar um catalogo de receitas acessivel por runtime e UI.

**Pontos de atencao:**
- Novos blocos precisam ter cores, texturas e drops coerentes.
- Receitas devem ser deterministicas e validaveis sem depender da UI.

### Componente / Arquivo: modos de jogo e persistencia

**Acao:** Modificar

**Responsabilidade tecnica:**
Adicionar `game_mode` ao estado do mundo/jogador e adaptar as regras de coleta, construcao e disponibilidade de itens.

**Pontos de atencao:**
- Criativo nao pode corromper saves de sobrevivencia.
- Trocas de modo exigem definicao clara de inventario e consumo de item.

### Componente / Arquivo: inventario, crafting e lista de crafts

**Acao:** Modificar e expandir `assets/js/game/inventory/`

**Responsabilidade tecnica:**
Introduzir area de crafting, resolucao de receitas, consumos de insumo e uma UI de lista de crafts dentro do inventario.

**Pontos de atencao:**
- Nenhuma operacao pode duplicar ou perder itens fora das regras.
- A UI precisa permanecer usavel mesmo com catalogo maior.

### Componente / Arquivo: estruturas, vilas e mobs

**Acao:** Modificar

**Responsabilidade tecnica:**
Adicionar geracao deterministica de estruturas/vilas e ampliar o ecossistema de mobs com controle de spawn e custo de runtime.

**Pontos de atencao:**
- Estruturas devem assentar em terreno plausivel.
- Mobs extras nao podem explodir custo de update/render.

### Componente / Arquivo: texturas, itens e mao vazia

**Acao:** Modificar

**Responsabilidade tecnica:**
Refinar a apresentacao de itens no inventario/hotbar, introduzir balanco da mao vazia e corrigir a orientacao das texturas ou permitir ajuste por face no menu.

**Pontos de atencao:**
- Corrigir mundo e UI juntos para evitar divergencia entre preview e runtime.
- Mudancas de UV podem afetar greedy meshing e repeticao de textura em quads grandes.

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| Save do mundo | `player`, `inventory`, `world`, `game_mode` | Evolucao do payload atual |
| Slot de inventario | `block_id`, `quantity`, `meta?` | Base para recursos e derivados |
| Receita | `id`, `inputs`, `output`, `category?` | Pode viver em catalogo local persistivel |
| Estrutura gerada | `type`, `seed fragment`, `bounds` | Deterministica e persistivel por chunk/snapshot |
| Config de textura por face | `rotation`, `flip?` ou equivalente | So se correcao automatica nao bastar |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Modulo | `CraftingRules` | Resolver receitas e consumos |
| Modulo | `GameModeRules` | Aplicar diferencas entre criativo e sobrevivencia |
| Modulo | `StructureGenerator` | Gerar estruturas/vilas deterministicas |
| Modulo | `MobManager` expandido | Coordenar novos spawns |
| Modulo/API | CRUD de texturas | Salvar texturas e orientacao por face, se adotada |

### Regras de Integridade

- O save deve continuar abrindo mundos antigos sem exigir migracao destrutiva.
- Crafting precisa conservar quantidade total de recursos segundo a receita.
- O modo criativo nao deve apagar progresso salvo sem intencao explicita.
- Estruturas geradas nao podem invadir chunks de forma inconsistente quando revisitadas.

## Requisitos de Performance e Escala

- Novos mobs e estruturas devem respeitar o frame pacing consolidado na PRD-012.
- O catalogo ampliado de blocos nao pode degradar severamente meshing, draw calls ou uso de memoria.
- Crafting e lista de receitas precisam ser leves o bastante para abrir o inventario sem engasgos perceptiveis.
- Correcao de textura nao pode introduzir distorcoes sistemicas em quads grandes.

## Seguranca e Validacoes

- Preservar ownership dos mundos e contratos atuais de autenticacao.
- Validar dados persistidos de `game_mode`, receitas e config de textura antes de hidratar runtime.
- Sanitizar uploads de textura e metadados adicionais ligados a orientacao.

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Save crescer e quebrar compatibilidade | Alto | Normalizadores versionados e fixtures de round trip |
| Crafting duplicar/perder itens | Alto | Regras puras testadas exaustivamente |
| Vilas nascerem deformadas em terreno ruim | Alto | Regras de assentamento e smoke multi-seed |
| Muitos mobs degradarem runtime | Medio | Caps, throttling e perfil de spawn por biome |
| Correcao de UV quebrar texturas existentes | Medio | Testes visuais por face e fallback de configuracao manual |

## Plano de Testes

- `node --check` nos modulos alterados.
- `npm test` e `npm run test:harness`.
- Testes puros para receitas, modos e persistencia.
- Smoke em mundos novos e antigos com varias seeds.
- Validacao visual de hotbar, inventario, held item, mao vazia e texturas por face.
- Smoke de estruturas/vilas e mobs extras em sessao prolongada.

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-expandir-blocos-e-minerios.md) | Ampliar catalogo de blocos e recursos | Nenhuma |
| [TASK-002](./tasks/TASK-002-modos-sobrevivencia-e-criativo.md) | Introduzir modos de jogo | TASK-001 |
| [TASK-003](./tasks/TASK-003-inventario-e-crafting.md) | Evoluir inventario e crafting | TASK-001, TASK-002 |
| [TASK-004](./tasks/TASK-004-estruturas-e-vilas.md) | Gerar estruturas e vilas | TASK-001 |
| [TASK-005](./tasks/TASK-005-ecossistema-de-mobs.md) | Expandir ecossistema de mobs | TASK-001, TASK-004 |
| [TASK-006](./tasks/TASK-006-polimento-visual-de-itens-e-texturas.md) | Polir itens, mao vazia e texturas | TASK-003 |
| [TASK-007](./tasks/TASK-007-validacao-integrada-sandbox-2.md) | Validar a integracao completa | TASK-002, TASK-003, TASK-004, TASK-005, TASK-006 |

Cada criterio `CA-NN` da PRD de produto deve aparecer em pelo menos uma task.

## Rollback

Reverter por camadas: restaurar o catalogo anterior de blocos e recursos, remover `game_mode` do fluxo novo caso necessario, desligar crafting/receitas, voltar a geracao sem estruturas extras e retirar configuracoes extras de textura. Como o risco maior esta em save e worldgen, o rollback precisa priorizar compatibilidade e desativacao logica antes de qualquer limpeza destrutiva de dados.
