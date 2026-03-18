# PRD-TECNICA-005: Loop sandbox com inventario e superficie viva

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-005-loop-sandbox-inventario-superficie.md](./PRD-005-loop-sandbox-inventario-superficie.md) |
| **Data** | 17/03/2026 |
| **Autor Tecnico** | Codex |
| **Versao** | 1.0 |

---

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

---

## Analise do Estado Atual

### Arquitetura Relevante

O runtime atual da PRD-004 ja possui locomocao em primeira pessoa, pausa por `P`, save do jogador e retomada do ultimo ponto salvo. O mundo, porem, ainda e somente leitura: `TerrainGenerator.js` define um terreno deterministico com `grass`, `dirt` e `stone`, enquanto `ChunkManager.js`, `ChunkMesher.js` e `SoftwareRenderer.js` so conhecem essa base procedural.

Hoje nao existe camada de mundo mutavel, nao existe selecao de bloco por raycast, nao existe inventario, e o payload de save salvo em `mundos_estado` so cobre pose do jogador e uma lista vazia de `modified_blocks`. A cena tambem ainda nao possui UI propria de hotbar/inventario nem um elemento de mao em primeira pessoa.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/GameApp.js` | Orquestra loop, pausa, save e runtime da gameplay | Modificar |
| `assets/js/game/services/WorldRepository.js` | Le e salva contexto do mundo | Modificar |
| `assets/js/game/world/TerrainGenerator.js` | Gera terreno base por seed | Modificar |
| `assets/js/game/world/BlockTypes.js` | Catalogo minimo de blocos | Modificar |
| `assets/js/game/world/ChunkManager.js` | Carrega chunks e controla fila de geracao | Modificar |
| `assets/js/game/world/ChunkMesher.js` | Converte blocos em faces renderizaveis | Modificar |
| `assets/js/game/render/SoftwareRenderer.js` | Renderiza a cena em canvas com fog basica | Modificar |
| `pages/jogo.php` | Estrutura HTML da gameplay | Modificar |
| `assets/css/custom/pages/jogo.css` | HUD e overlays da gameplay | Modificar |
| `api/mundos/_common.php` | Normaliza e valida estado salvo do mundo | Modificar |
| `api/mundos/buscar.php` | Retorna mundo e save atual | Modificar |
| `api/mundos/salvar_estado.php` | Persiste o estado do mundo | Modificar |
| `assets/js/game/world/MutableWorld.js` | Camada de leitura/escrita do mundo mutavel | Criar |
| `assets/js/game/world/RaycastPicker.js` | Localiza bloco alvo e face adjacente | Criar |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Calcula agua, areia e arvores por seed | Criar |
| `assets/js/game/ui/Hotbar.js` | HUD de selecao rapida | Criar |
| `assets/js/game/ui/InventoryPanel.js` | Inventario simples de 27 slots | Criar |
| `assets/js/game/ui/FirstPersonHand.js` | Mao em primeira pessoa e animacoes basicas | Criar |

### Dependencias Tecnicas

- Runtime da PRD-004 implementado e funcional
- Navegador desktop moderno com ES modules, Canvas 2D e Pointer Lock API
- Persistencia em MySQL ja disponivel via `mundos_estado`
- Reuso do wrapper `ApiRequest.js` para leitura e escrita do estado salvo

---

## Solucao Tecnica Proposta

### Abordagem

Introduzir uma camada de sandbox mutavel acima da geracao procedural atual. Em vez de alterar diretamente o `TerrainGenerator`, o runtime passara a compor tres fontes de verdade:

1. **Base procedural deterministica:** altura, pedra, agua, areia e arvores calculadas por seed.
2. **Decoracao superficial deterministica:** regras auxiliares para arvores, agua e transicao de materiais na superficie.
3. **Mutacoes persistidas do jogador:** blocos quebrados e blocos colocados, indexados por coordenada.

Sobre essa base entram o sistema de raycast para alvo de bloco, o inventario simples com hotbar e a mao em primeira pessoa. O save atual evolui para `schema_version = 2`, mantendo a tabela `mundos_estado` e expandindo o `estado_json` para incluir inventario, slot selecionado e mutacoes do terreno.

### Fluxo Tecnico

```text
mouse / teclado
  -> GameApp
  -> RaycastPicker + MutableWorld
  -> [quebrar] remove bloco + gera recurso
  -> [colocar] valida face + consome item
  -> ChunkManager marca chunks sujos
  -> ChunkMesher remalha apenas o necessario
  -> SoftwareRenderer desenha com fog reforcada
  -> Save v2 persiste player + inventory + mutations
```

### Decisoes Estruturais

- Evoluir `mundos_estado.estado_json` para `schema_version = 2`, sem criar nova tabela nesta fase.
- Inventario simples da fase tera `27` slots totais, com `9` slots de hotbar.
- O jogador iniciara com inventario vazio; blocos entram no inventario ao quebrar o mundo.
- O alcance de interacao sera curto e controlado, com alvo centrado na mira.
- Agua desta fase sera estatica, sem simulacao de fluxo.
- O renderer atual em canvas sera mantido; o ganho vira de atualizacao localizada de chunk, catalogo de blocos melhor definido e fog mais agressiva na distancia.

---

## Implementacao Detalhada

### Componente / Arquivo: save v2 e contratos de persistencia

**Acao:** Modificar

**Responsabilidade tecnica:**
Expandir `api/mundos/_common.php`, `api/mundos/buscar.php`, `api/mundos/salvar_estado.php` e `WorldRepository.js` para aceitar `schema_version = 2`, normalizar inventario, slot selecionado e lista de mutacoes do terreno, e manter fallback para saves `v1`.

**Pontos de atencao:**
- Save `v1` precisa continuar abrindo sem quebrar o bootstrap.
- O payload salvo deve continuar compacto e validado antes de persistir.

---

### Componente / Arquivo: catalogo de blocos e decoracao procedural

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Ampliar `BlockTypes.js` com pelo menos `water`, `sand`, `wood` e `leaves`, e refatorar `TerrainGenerator.js` para delegar regras superficiais a um decorador deterministico capaz de inferir agua, areia, pedra exposta e arvores pelo seed.

**Pontos de atencao:**
- A geracao precisa continuar deterministica por `seed + algorithm_version`.
- Arvores e agua nao podem explodir custo de geracao por coluna ou por chunk.

---

### Componente / Arquivo: camada de mundo mutavel e interacao com blocos

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Criar `MutableWorld.js` e `RaycastPicker.js` para consultar blocos reais do mundo, aplicar mutacoes, validar quebra/colocacao, impedir colocacao dentro do volume do jogador e informar quais chunks precisam ser remalhados.

**Pontos de atencao:**
- A leitura do bloco final deve considerar base procedural + mutacoes persistidas.
- Colocar bloco nao pode prender o jogador nem gerar bloco fora dos limites do mundo.

---

### Componente / Arquivo: hotbar e inventario simples

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Adicionar a HUD de hotbar, o painel de inventario simples e a logica de slots ao runtime do jogo, com selecao por `1-9` e `mouse wheel`, abertura por `E` e interacao simples de troca entre slots.

**Pontos de atencao:**
- Inventario aberto deve suspender interacoes de quebra/colocacao e liberar foco do cursor.
- A representacao visual pode ser simples, mas precisa ser legivel e consistente com a HUD existente.

---

### Componente / Arquivo: mao em primeira pessoa

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Criar um elemento de mao em primeira pessoa ancorado na HUD, com animacao basica de idle, caminhada e uso, acionado pela velocidade do player e pelas acoes de quebrar/colocar.

**Pontos de atencao:**
- A mao nao deve competir com o reticulo central nem esconder o alvo de bloco.
- A animacao deve ser barata e independente do pipeline de chunk.

---

### Componente / Arquivo: meshing, chunks, render e fog

**Acao:** Modificar

**Responsabilidade tecnica:**
Atualizar `ChunkMesher.js`, `ChunkManager.js` e `SoftwareRenderer.js` para lidar com o novo catalogo de blocos, diferenciar solido x translucido basico, remalhar somente chunks sujos e reforcar a fog para mascarar horizonte, borda visual e pop-in.

**Pontos de atencao:**
- Quebra e colocacao devem disparar remesh local, nao regeneracao global.
- Agua e folhas exigem regra simples de renderizacao sem comprometer a performance do canvas.

---

### Componente / Arquivo: integracao final do runtime

**Acao:** Modificar

**Responsabilidade tecnica:**
Integrar em `GameApp.js`, `pages/jogo.php` e `jogo.css` a nova HUD, o fluxo de interacao com blocos, o save v2 e a restauracao completa da sessao, incluindo inventario, slot selecionado e mutacoes do terreno.

**Pontos de atencao:**
- O pause menu da PRD-004 precisa continuar funcionando com o novo estado da gameplay.
- O retorno a um mundo salvo deve reconstruir inventario e mutacoes antes do primeiro frame jogavel.

---

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `save_state_v2` | `schema_version`, `player`, `inventory`, `world` | Evolucao do payload atual em `mundos_estado.estado_json` |
| `player` | `position`, `rotation`, `selected_hotbar_index` | Pose + slot ativo |
| `inventory` | `slots[27]` | Cada slot pode ser `null` ou `{ block_id, quantity }` |
| `world` | `block_mutations[]` | Lista compacta de blocos quebrados ou colocados |
| `block_mutation` | `x`, `y`, `z`, `block_id` | `block_id = "air"` representa quebra persistida |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Rota | `index.php?page=jogo&id_mundo={id}` | Abrir a gameplay com HUD expandida |
| Endpoint | `api/mundos/buscar.php` | Retornar `world`, `save_state` e fallback normalizado |
| Endpoint | `api/mundos/salvar_estado.php` | Persistir `save_state_v2` |
| Modulo JS | `assets/js/game/services/WorldRepository.js` | Traduzir backend <-> runtime |
| Modulo JS | `assets/js/game/world/MutableWorld.js` | Resolver leitura/escrita de blocos |
| Modulo JS | `assets/js/game/world/RaycastPicker.js` | Determinar bloco alvo e face de colocacao |

### Regras de Integridade

- `schema_version = 2` deve ser o formato padrao para novos saves.
- Saves antigos sem inventario devem cair para `27` slots vazios e `selected_hotbar_index = 0`.
- `block_mutations` nao pode conter coordenadas fora dos limites logicos do mundo.
- Quantidade de slot deve ser inteira, positiva e limitada ao teto definido pela UI.
- O runtime deve rejeitar colocacao de bloco quando o slot selecionado estiver vazio.
- O runtime deve impedir quebra de posicoes invalidas e colocacao dentro do volume ocupado pelo jogador.

### Contrato de Save Proposto

```json
{
  "schema_version": 2,
  "player": {
    "position": { "x": 0.5, "y": 37.0, "z": 0.5 },
    "rotation": { "yaw": 0.785398, "pitch": -0.12 },
    "selected_hotbar_index": 0
  },
  "inventory": {
    "slots": [
      { "block_id": "dirt", "quantity": 12 },
      null
    ]
  },
  "world": {
    "block_mutations": [
      { "x": 10, "y": 38, "z": -4, "block_id": "air" },
      { "x": 11, "y": 38, "z": -4, "block_id": "dirt" }
    ]
  }
}
```

---

## Requisitos de Performance e Escala

- Remalhar apenas chunks sujos pela quebra, colocacao ou mudanca de borda relevante.
- Indexar mutacoes em memoria por coordenada e, quando possivel, por chunk para lookup rapido.
- Manter agua estatica e arvores com topologia simples para limitar custo de geracao.
- Aplicar fog de distancia suficiente para esconder melhor o final visual do mapa sem prejudicar leitura da area proxima.
- Preservar carga sob demanda do entorno do jogador, nunca da area total `5000 x 5000 x 100`.

---

## Seguranca e Validacoes

- Validar autenticacao e ownership do mundo em leitura e escrita do save.
- Sanitizar `selected_hotbar_index`, slots do inventario e mutacoes antes de persistir.
- Rejeitar payloads com blocos desconhecidos ou coordenadas fora do mundo.
- Nao confiar no cliente para definir qualquer mutacao fora do alcance de coordenadas validas.
- Em erro de save, manter a sessao jogavel ou pausada com feedback claro, sem destruir o estado local abruptamente.

---

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Mutacoes do terreno crescerem rapido e pesarem no save | Alto | Comecar com payload compacto, deduplicar por coordenada e manter `schema_version` evolutivo |
| Raycast em mundo voxel gerar alvo inconsistente perto de bordas | Medio | Implementar passo discreto com limite de alcance curto e testes em faces adjacentes |
| Agua, folhas e novas faces aumentarem demais o custo do canvas | Alto | Ajustar meshing por tipo, remesh localizado e fog mais forte para reduzir trabalho distante |
| Inventario e pause disputarem controle do cursor | Medio | Centralizar estados de UI em `GameApp` e isolar interacoes de gameplay quando inventario estiver aberto |
| Save v1 quebrar depois da evolucao para v2 | Medio | Manter normalizacao backward-compatible no backend e no bootstrap do runtime |

---

## Plano de Testes

- Entrar em um mundo novo e confirmar hotbar visivel com `9` slots e inventario abrindo por `E`.
- Quebrar blocos dentro do alcance, confirmar highlight do alvo e ganho do recurso no inventario.
- Selecionar um bloco na hotbar, coloca-lo em face valida e confirmar consumo do slot.
- Salvar e sair de um mundo alterado, reabrir o mesmo mundo e confirmar inventario + mutacoes restaurados.
- Abrir um save `v1` antigo e confirmar fallback para inventario vazio e mundo carregado sem erro.
- Explorar areas com agua, areia, pedra aparente e arvores e verificar repetibilidade por seed.
- Validar que a fog mascara melhor o horizonte sem comprometer interacao no alcance curto.

---

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-modelar-estado-mutavel-do-mundo-e-save-v2.md) | Definir save v2, inventario e contrato persistente do mundo mutavel | Nenhuma |
| [TASK-002](./tasks/TASK-002-implementar-mundo-mutavel-e-raycast-de-blocos.md) | Criar a camada de leitura/escrita de blocos e o sistema de alvo por raycast | TASK-001 |
| [TASK-003](./tasks/TASK-003-implementar-hotbar-e-inventario-simples.md) | Entregar inventario simples, hotbar e fluxo de selecao de blocos | TASK-001 |
| [TASK-004](./tasks/TASK-004-implementar-mao-em-primeira-pessoa.md) | Adicionar a mao em primeira pessoa e suas animacoes basicas | TASK-002, TASK-003 |
| [TASK-005](./tasks/TASK-005-enriquecer-superficie-procedural.md) | Incluir agua, areia, pedra aparente e arvores na geracao procedural | Nenhuma |
| [TASK-006](./tasks/TASK-006-atualizar-meshing-render-e-nevoa.md) | Ajustar chunks, render e fog para a nova superficie e o mundo mutavel | TASK-002, TASK-005 |
| [TASK-007](./tasks/TASK-007-integrar-persistencia-e-validar-loop-sandbox.md) | Fechar a integracao final, retomada do mundo e validacao da PRD-005 | TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006 |

---

## Rollback

Reverter a evolucao do save para `schema_version = 2`, restaurar a normalizacao anterior em `api/mundos/_common.php`, remover os modulos de inventario, mao, raycast e mundo mutavel, e voltar `TerrainGenerator.js`, `ChunkMesher.js`, `ChunkManager.js`, `SoftwareRenderer.js`, `GameApp.js`, `pages/jogo.php` e `jogo.css` ao comportamento da PRD-004. Como a tabela `mundos_estado` continua a mesma, o rollback e principalmente logico e de contrato, nao estrutural de banco.
