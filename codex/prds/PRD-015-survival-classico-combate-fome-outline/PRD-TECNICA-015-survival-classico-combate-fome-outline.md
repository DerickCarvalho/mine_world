# PRD-TECNICA-015: Survival classico, combate e UX voxel madura

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-015-survival-classico-combate-fome-outline.md](./PRD-015-survival-classico-combate-fome-outline.md) |
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

- `assets/js/game/GameApp.js` concentra loop principal, HUD, interacoes, persistencia e estado de gameplay.
- `assets/js/game/player/PlayerController.js`, `InputState.js` e `CollisionResolver.js` controlam camera, pitch, locomocao e base para combate.
- `assets/js/game/world/RaycastPicker.js`, `ChunkMesher.js`, `RendererFactory.js`, `render/webgl/` e `interaction/InteractionController.js` sustentam highlight, colocacao e custo de render.
- `assets/js/game/world/TerrainGenerator.js`, `ProceduralSurfaceDecorator.js`, `MutableWorld.js` e `ChunkManager.js` governam worldgen, chunks e mutacoes.
- `assets/js/game/ui/InventoryPanel.js`, `Hotbar.js`, `ItemIcon.js`, `FirstPersonHand.js` e `GameplayHudController.js` definem a experiencia visual e operacional da UI do jogador.
- `assets/js/game/inventory/InventoryOperations.js` e `CraftingCatalog.js` ja fornecem uma base pura para stacks e craft, mas ainda insuficiente para o escopo pedido.
- `assets/js/game/entities/MobManager.js` e as entidades atuais representam um ecossistema parcial, ainda sem ciclo completo de HP, morte e drop maduro.
- `assets/js/game/services/WorldRepository.js` e `api/mundos/_common.php` ja normalizam save, mas precisarao absorver novos estados survival.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/GameApp.js` | Orquestrador do runtime | Alterar |
| `assets/js/game/player/PlayerController.js` | Pitch, yaw, locomocao | Alterar |
| `assets/js/game/core/CameraMath.js` | Clamp e vetores da camera | Revisar |
| `assets/js/game/world/RaycastPicker.js` | Selecao de bloco | Alterar |
| `assets/js/game/interaction/InteractionController.js` | Regras de quebrar/colocar/feedback | Alterar |
| `assets/js/game/render/webgl/*` | Highlight, outline e composicao visual | Alterar |
| `assets/js/game/world/TerrainGenerator.js` | Relevo e biomas | Alterar |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Arvores, vegetacao e estruturas superficiais | Alterar |
| `assets/js/game/ui/InventoryPanel.js` | Grid, receitas e fluxo do inventario | Alterar |
| `assets/js/game/ui/Hotbar.js` | Estado visual da hotbar | Alterar |
| `assets/js/game/ui/ItemIcon.js` | Render dos itens na UI | Alterar |
| `assets/js/game/ui/FirstPersonHand.js` | Mao vazia e held item | Alterar |
| `assets/js/game/ui/GameplayHudController.js` | Vida, modo, HUD e overlays | Alterar |
| `assets/js/game/entities/MobManager.js` | Lifecycle e spawn de mobs | Alterar |
| `assets/js/game/entities/*.js` | Modelagem dos mobs | Alterar/criar |
| `assets/js/game/services/WorldRepository.js` | Save/load e normalizacao | Alterar |
| `api/mundos/_common.php` | Contrato do save | Alterar |

### Dependencias Tecnicas

- WebGL 2 como alvo principal do renderer
- Runtime de chunks/worker introduzido nas PRDs 012-014
- Save retrocompativel como requisito inegociavel

## Solucao Tecnica Proposta

### Abordagem

Executar a PRD em oito fatias pequenas e verificaveis, comecando pela auditoria e pelos sistemas que mais contaminam a percepcao do jogo: camera, raycast e highlight. Em seguida atacar worldgen e vegetacao, depois UI/crafting, depois fome e ciclo survival, e so entao fechar mobs, drops e polimento visual. Esse sequenciamento reduz o risco de construir camadas novas em cima de leitura de jogo ainda quebrada.

### Fluxo Tecnico

```text
input do jogador -> PlayerController + CameraMath -> RaycastPicker/InteractionController
                  -> GameApp -> HUD / Hotbar / InventoryPanel / FirstPersonHand
                  -> combate / drops / crafting / fome
                  -> MutableWorld / MobManager / WorldRepository / renderer
```

### Decisoes Estruturais

- Nao reescrever o runtime; evoluir `GameApp` e modulos satelites por responsabilidade.
- Tratar outline de bloco como highlight de renderer/interacao, nao como “bloco preview”.
- Manter regras survival em modulos puros sempre que possivel para facilitar teste.
- Integrar fome, drops e combate ao save apenas no que realmente for necessario persistir.
- Reaproveitar o pipeline atual de items/hotbar/hand em vez de criar uma segunda representacao visual.

## Implementacao Detalhada

### Componente / Arquivo: camera, raycast e outline

**Acao:** Modificar

**Responsabilidade tecnica:**
Revisar o clamp de pitch em `PlayerController`/`CameraMath`, garantir alinhamento do raycast com a camera e substituir o destaque atual por outline fino no bloco alvo.

**Pontos de atencao:**
- Nao introduzir inversao vertical ou drift de yaw.
- Manter colocacao de blocos pela face correta.

---

### Componente / Arquivo: worldgen, biomas e vegetacao

**Acao:** Modificar

**Responsabilidade tecnica:**
Refinar `TerrainGenerator` e `ProceduralSurfaceDecorator` para melhorar suavidade de relevo, identidade de biomas e densidade/forma de arvores.

**Pontos de atencao:**
- Evitar relevo serrilhado demais.
- Evitar arvores flutuando e decoracao absurda em chunks limitrofes.

---

### Componente / Arquivo: inventario, hotbar e crafting

**Acao:** Modificar

**Responsabilidade tecnica:**
Melhorar o layout do inventario, estabilizar stacks e cursor, amadurecer a area de crafting e ampliar receitas uteis.

**Pontos de atencao:**
- Proteger contra perda ou duplicacao de itens.
- Preservar sincronia entre inventario, hotbar e held item.

---

### Componente / Arquivo: HUD survival e fome

**Acao:** Modificar e criar regras auxiliares

**Responsabilidade tecnica:**
Adicionar estado de fome ao runtime, integrando HUD, consumo gradual e uso de comida simples.

**Pontos de atencao:**
- Ritmo de fome deve ser calibravel.
- Zero de fome precisa ter penalidade clara sem tornar a build injogavel.

---

### Componente / Arquivo: mobs, combate e morte

**Acao:** Modificar e criar

**Responsabilidade tecnica:**
Modelar pelo menos um mob passivo e um hostil com HP, cooldown, hit reaction, morte e remocao consistente.

**Pontos de atencao:**
- Evitar jitter, teleporte e atravessar blocos sem controle.
- Garantir que entidades mortas parem de colidir/atacar.

---

### Componente / Arquivo: drops e coleta

**Acao:** Criar e integrar

**Responsabilidade tecnica:**
Adicionar itens coletaveis no mundo com pickup por proximidade/toque e integracao com inventario.

**Pontos de atencao:**
- Inventario cheio precisa de fallback claro.
- Remocao de drops coletados ou expirados deve ser barata.

---

### Componente / Arquivo: mao vazia, item na mao e icones

**Acao:** Modificar

**Responsabilidade tecnica:**
Polir `FirstPersonHand`, `ItemIcon` e a HUD para melhorar a coerencia visual entre mao vazia, item equipado e icones do inventario.

**Pontos de atencao:**
- O held item nao pode cobrir o crosshair.
- A UI deve continuar legivel em resolucoes menores.

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `save_state.player` | `position`, `rotation`, `health`, `hunger`, `selected_hotbar_index` | Evolucao do payload atual |
| `inventory.slot` | `block_id`, `quantity`, `meta?` | Base para comida, arma e drops |
| `mob_runtime_state` | `id`, `type`, `hp`, `aggressive`, `position` | Pode permanecer efemero na primeira versao |
| `drop_runtime_state` | `id`, `type`, `quantity`, `position` | Persistencia opcional conforme sessao |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Modulo | `HungerRules` ou equivalente | Drenagem e recuperacao de fome |
| Modulo | `CombatRules` ou equivalente | Dano, alcance e cooldown |
| Modulo | `DropManager` | Criar, atualizar e coletar drops |
| Modulo | `Renderer highlight` | Outline do bloco alvo |
| Save/API | `WorldRepository` + `api/mundos/*` | Persistir estado survival |

### Regras de Integridade

- Saves antigos devem continuar abrindo sem falha.
- Combate e drops nao podem produzir duplicacao de item.
- Estados efemeros nao devem ser serializados sem necessidade clara.
- A remocao do bloco fantasma nao pode quebrar colocacao de bloco.

## Requisitos de Performance e Escala

- Evitar loops caros por frame para buscar drops ou mobs muito distantes.
- Manter caps de spawn e raio de atividade para entidades.
- Reaproveitar meshing/chunk invalidation existente em vez de forcar rebuilds amplos.
- Outline e HUD extra nao podem introduzir draw overhead relevante.

## Seguranca e Validacoes

- Normalizar novos campos do save antes de hidratar o runtime.
- Validar ids de itens, mobs e receitas contra catalogos locais.
- Manter controles atuais de ownership dos mundos.

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Pitch corrigido quebrar input atual | Medio | Testes puros e smoke manual de camera |
| Outline depender de renderer dificil de ajustar | Alto | Separar highlight de preview e validar por etapas |
| Fome e combate poluirem `GameApp` | Medio | Extrair regras puras e manter integracao fina |
| Drops aumentarem custo por frame | Medio | Cap de itens, coleta por proximidade e cleanup |
| Mobs hostis ficarem placeholders ruins | Medio | Definir silhouette simples, animacao minima e IA curta, mas coerente |

## Plano de Testes

- `node --check` nos arquivos JS alterados
- `npm run test:harness`
- `npm test`
- smoke manual de camera para cima/baixo, outline, hotbar e inventario
- smoke multi-seed para worldgen/biomas/arvores
- smoke de combate, morte, drop e coleta

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-auditar-runtime-camera-outline.md) | Auditar runtime e fechar camera, raycast e outline | Nenhuma |
| [TASK-002](./tasks/TASK-002-worldgen-biomas-vegetacao.md) | Refazer worldgen, biomas e vegetacao | TASK-001 |
| [TASK-003](./tasks/TASK-003-inventario-hotbar-crafting.md) | Reconstruir inventario, hotbar e crafting | TASK-001 |
| [TASK-004](./tasks/TASK-004-survival-fome-hud.md) | Adicionar fome, HUD survival e regras de consumo | TASK-003 |
| [TASK-005](./tasks/TASK-005-mobs-combate-morte.md) | Recriar mobs, combate e ciclo de morte | TASK-001, TASK-002 |
| [TASK-006](./tasks/TASK-006-drops-coleta-itens.md) | Implementar drops, coleta e integracao com inventario | TASK-005 |
| [TASK-007](./tasks/TASK-007-polimento-visual-itens-texturas.md) | Polir mao, itens, texturas e coerencia visual | TASK-002, TASK-003, TASK-004 |
| [TASK-008](./tasks/TASK-008-validacao-integrada-performance.md) | Validar integracao, performance e aderencia final | TASK-004, TASK-005, TASK-006, TASK-007 |

Cada criterio `CA-NN` da PRD de produto deve aparecer em pelo menos uma task.

## Rollback

Desfazer por camadas: primeiro desativar fome, drops e combate novo por feature gate logico; depois restaurar o highlight anterior apenas se o outline falhar; por fim recuar ajustes de worldgen/vegetacao e UI caso introduzam regressao. Rollback de save deve priorizar normalizacao tolerante, nao limpeza destrutiva de dados.
