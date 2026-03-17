# PRD-TECNICA-003: Mundo 3D procedural jogavel

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-003-mundo-3d-procedural.md](./PRD-003-mundo-3d-procedural.md) |
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

Ao final das PRDs anteriores, o projeto deve contar com autenticacao, shell autenticado, lobby de mundos e endpoint para leitura de metadados de um mundo. Ainda nao existira runtime 3D, gerador procedural, player controller ou pipeline de chunking.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `pages/mundos.php` | Seleciona o mundo a ser aberto | Reutilizar |
| `api/mundos/buscar.php` | Entrega metadados do mundo | Reutilizar / possivel ajuste |
| `index.php` | Roteador autenticado | Modificar para suportar `page=jogo` |
| `assets/js/paginas/` | Scripts das telas autenticadas | Expandir |

### Dependencias Tecnicas

- PRD-001 e PRD-002 implementadas ou tecnicamente disponiveis
- Browser desktop moderno com suporte a ES modules e Canvas 2D
- Runtime 3D autocontido em `assets/js/game/`, sem bundler e sem dependencia externa nesta primeira versao

---

## Solucao Tecnica Proposta

### Abordagem

Implementar a tela de jogo como pagina autenticada `index.php?page=jogo&id_mundo={id}`. O shell PHP continua responsavel por autenticar e carregar o HTML da pagina, enquanto o runtime 3D e iniciado por um script module em JS Vanilla.

Para manter a entrega autocontida e sem dependencias externas, a renderizacao 3D usa um renderer proprio em `canvas`, com projecao em perspectiva, painter's algorithm e geometria de faces geradas por chunk. A aplicacao continua Vanilla JS: sem React, Vue, build step ou transpiler.

O mundo sera logicamente de `5000 x 5000 x 100`, mas o cliente nunca materializara essa area total. A geracao sera deterministica por seed e feita por chunking horizontal. A representacao inicial sera um terreno de colunas bloco-a-bloco derivado de heightmap procedural, suficiente para locomocao, colisao e leitura visual do relevo sem ainda suportar mineracao ou construcao.

### Fluxo Tecnico

```text
index.php?page=jogo&id_mundo=ID
  -> pages/jogo.php
  -> assets/js/paginas/jogo.js (module)
  -> api/mundos/buscar.php
  -> GameApp
     -> WorldLoader
     -> TerrainGenerator
     -> ChunkManager
     -> ChunkMesher
     -> PlayerController
     -> HUD/Crosshair
```

### Decisoes Estruturais

- Usar renderer proprio em Canvas 2D, mantendo JS Vanilla em toda a stack do runtime.
- Chunk horizontal de `16 x 16` blocos e altura logica fixa `100`.
- Raio de carga derivado de `render_distance`, operando na pratica entre `2` e `4` chunks, com retencao de `+1`.
- Geracao baseada em heightmap com ruido deterministico em vez de volume completo com cavernas na primeira versao.
- Colisao baseada em solido por coluna e AABB simples do jogador.

---

## Implementacao Detalhada

### Componente / Arquivo: rota e pagina de jogo

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Adicionar suporte a `index.php?page=jogo&id_mundo={id}` no roteador, criar `pages/jogo.php` com canvas, overlay de loading e crosshair, e carregar o script `assets/js/paginas/jogo.js` como module.

**Pontos de atencao:**
- A pagina `jogo` deve usar variante de layout mais enxuta que o shell de menu.
- O carregamento inicial precisa bloquear entrada parcial antes dos metadados do mundo.

---

### Componente / Arquivo: bootstrap do runtime 3D

**Acao:** Criar

**Responsabilidade tecnica:**
Criar `assets/js/paginas/jogo.js` e `assets/js/game/GameApp.js` para instanciar renderer, runtime, camera, loop de update, resize e cleanup. O bootstrap tambem deve buscar os metadados do mundo selecionado e aplicar configuracoes do usuario relevantes.

**Pontos de atencao:**
- Garantir destruicao do loop e dos listeners ao sair da pagina.
- Nao misturar regras de negocio de mundo com codigo de UI de shell.

---

### Componente / Arquivo: geracao procedural e mundo

**Acao:** Criar

**Responsabilidade tecnica:**
Criar modulos como:

- `assets/js/game/world/WorldConfig.js`
- `assets/js/game/world/TerrainGenerator.js`
- `assets/js/game/world/ChunkManager.js`
- `assets/js/game/world/ChunkStore.js`
- `assets/js/game/world/ChunkMesher.js`

`TerrainGenerator.js` gera alturas por `x,z` a partir de seed e ruido deterministico. `ChunkManager.js` decide quais chunks entram e saem. `ChunkMesher.js` cria geometrias apenas com faces expostas, usando materiais placeholder por tipo de bloco.

**Pontos de atencao:**
- O mundo deve respeitar limite logico horizontal e altura de 1 a 100.
- Gerar somente chunks proximos ao jogador e descartar os distantes.

---

### Componente / Arquivo: controle do jogador

**Acao:** Criar

**Responsabilidade tecnica:**
Criar `assets/js/game/player/PlayerController.js` para pointer lock, leitura de mouse, `WASD`, salto, gravidade basica, velocidade horizontal e colisao com terreno.

**Pontos de atencao:**
- O jogador deve nascer acima do solo.
- O sistema precisa impedir queda infinita e atravessamento do terreno.

---

### Componente / Arquivo: HUD e camada visual auxiliar

**Acao:** Criar

**Responsabilidade tecnica:**
Criar modulos e CSS para crosshair, tela de carregamento, mensagens de estado e overlay discreto de erro caso o mundo nao possa abrir.

**Pontos de atencao:**
- HUD deve ser minima e nao poluir a exploracao.
- O estado de pointer lock precisa ter instrucao inicial clara para o usuario.

---

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `mundos` | `id`, `usuario_id`, `nome`, `seed`, `algorithm_version`, `ultimo_jogado_em` | o runtime precisa de `seed` e `algorithm_version` |
| `world meta payload` | `id`, `nome`, `seed`, `algorithm_version` | retorno de `api/mundos/buscar.php` |
| `user config payload` | `render_distance`, `mouse_sensitivity`, `invert_y`, `master_volume` | lido no bootstrap do jogo |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Rota | `index.php?page=jogo&id_mundo={id}` | Abrir o mundo selecionado |
| Endpoint | `api/mundos/buscar.php` | Retornar metadados do mundo e validar ownership |
| Endpoint | `api/configuracoes/buscar.php` | Carregar configuracoes do jogador |
| Modulo JS | `assets/js/paginas/jogo.js` | Bootstrap da cena |
| Modulo JS | `assets/js/game/GameApp.js` | Loop principal do runtime |

### Regras de Integridade

- `buscar.php` deve negar acesso a mundo que nao pertence ao usuario autenticado.
- O runtime so inicia depois que `seed` e `algorithm_version` forem carregados.
- Coordenadas do jogador devem permanecer dentro do limite logico do mundo.
- Chunks carregados em memoria devem refletir a mesma seed e versao de algoritmo do mundo aberto.

---

## Requisitos de Performance e Escala

- Nunca renderizar a area total `5000 x 5000 x 100` de uma vez.
- Processar geracao de chunk em fila, preferencialmente um ou poucos por frame para evitar travamentos.
- Reutilizar materiais e objetos 3D compartilhados sempre que possivel.
- Limitar a memoria viva por raio de chunk configuravel.
- Aplicar `render_distance` do usuario dentro de faixas seguras definidas pelo runtime.

---

## Seguranca e Validacoes

- Validar ownership do mundo no backend antes de entregar seed e metadados.
- Sanitizar `id_mundo` recebido por query string e nao confiar em parametros do cliente.
- O runtime nao deve depender de dados sensiveis alem dos metadados minimos do mundo.
- Falhas no carregamento devem abortar a inicializacao da cena com feedback seguro.

---

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Tentativa de implementar voxel completo logo na primeira versao | Alto | Limitar a versao inicial a terreno por heightmap com faces expostas |
| Queda de performance por chunks pesados | Alto | Chunk `16x16`, fila de geracao e descarte por distancia |
| Renderer proprio exigir compromissos de fidelidade visual | Medio | Priorizar legibilidade do relevo, chunking e controls antes de texturas e efeitos avancados |
| Colisao ficar inconsistente em bordas de chunk | Medio | Centralizar consulta de altura/solidez no `ChunkStore` e testar bordas manualmente |

---

## Plano de Testes

- Abrir mundo valido a partir do lobby
- Garantir que a mesma seed produz o mesmo terreno em cargas repetidas
- Verificar movemento basico com `WASD`, mouse e `espaco`
- Testar spawn seguro e colisao com o solo
- Testar aproximacao/afastamento para forcar carga e descarte de chunks
- Testar falha de `api/mundos/buscar.php` e exibicao de erro controlado

---

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-preparar-rota-runtime-3d.md) | Preparar rota de jogo, pagina e runtime 3D base | PRD-002 concluida |
| [TASK-002](./tasks/TASK-002-implementar-bootstrap-do-mundo.md) | Carregar metadados do mundo e iniciar o runtime | TASK-001 |
| [TASK-003](./tasks/TASK-003-implementar-gerador-procedural.md) | Implementar geracao por seed e configuracao do mundo | TASK-002 |
| [TASK-004](./tasks/TASK-004-implementar-chunks-e-mesh.md) | Implementar chunk manager e mesher com blocos placeholder | TASK-003 |
| [TASK-005](./tasks/TASK-005-implementar-player-controller.md) | Implementar camera, movimento, fisica e colisao | TASK-004 |
| [TASK-006](./tasks/TASK-006-integrar-hud-e-ciclo-de-vida.md) | Integrar HUD, loading, cleanup e validacao final | TASK-002, TASK-004, TASK-005 |

---

## Rollback

Remover a rota `page=jogo`, os modulos `assets/js/game/` e os estilos/HTML da pagina de jogo. Como esta PRD nao altera a persistencia estrutural de banco alem do uso de metadados ja existentes, o rollback pode ser feito sem migracoes adicionais.
