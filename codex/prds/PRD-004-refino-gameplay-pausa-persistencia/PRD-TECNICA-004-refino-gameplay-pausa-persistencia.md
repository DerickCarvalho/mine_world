# PRD-TECNICA-004: Refino de gameplay, pausa e persistencia de mundo

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-004-refino-gameplay-pausa-persistencia.md](./PRD-004-refino-gameplay-pausa-persistencia.md) |
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

O runtime atual da PRD-003 abre o mundo em `index.php?page=jogo&id_mundo={id}` e instancia `GameApp`, `PlayerController`, `ChunkManager`, `ChunkMesher`, `SoftwareRenderer` e `WorldRepository`. A execucao roda em loop continuo, sem estado formal de pausa, sem persistencia de posicao/orientacao e sem endpoint de save do mundo.

Hoje o input de mouse e movimento vive espalhado entre `InputState.js`, `PlayerController.js` e `SoftwareRenderer.js`, o que facilita divergencia entre a orientacao usada para movimentacao e a orientacao usada na camera/render. A fila de chunks tambem ainda opera com estrategia simples de FIFO e o mesher gera muitas faces laterais unitarias, o que pesa no renderer em canvas.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/GameApp.js` | Loop principal da cena | Modificar |
| `assets/js/game/player/InputState.js` | Captura teclado, mouse e pointer lock | Modificar |
| `assets/js/game/player/PlayerController.js` | Move o jogador e controla yaw/pitch | Modificar |
| `assets/js/game/render/SoftwareRenderer.js` | Renderiza todas as faces visiveis em canvas | Modificar |
| `assets/js/game/world/ChunkManager.js` | Carrega e descarrega chunks | Modificar |
| `assets/js/game/world/ChunkMesher.js` | Gera faces por chunk | Modificar |
| `assets/js/game/services/WorldRepository.js` | Busca mundo e configuracoes do usuario | Modificar |
| `pages/jogo.php` | Estrutura HTML da gameplay | Modificar |
| `assets/css/custom/pages/jogo.css` | HUD e overlays da cena | Modificar |
| `assets/js/game/ui/SceneOverlay.js` | Loading, erro e status da cena | Modificar |
| `api/mundos/buscar.php` | Entrega metadados do mundo autenticado | Modificar |
| `api/mundos/_common.php` | Funcoes compartilhadas de mundo | Modificar |
| `api/database/migrations/0003_create_mundos_table.php` | Define metadados basicos dos mundos | Referencia para nova migration |

### Dependencias Tecnicas

- Runtime da PRD-003 implementado e funcional
- Navegador desktop moderno com ES modules, Canvas 2D e Pointer Lock API
- Persistencia em MySQL para guardar o ultimo estado do mundo por usuario
- Reaproveitamento do wrapper `ApiRequest.js` para leitura e escrita do estado salvo

---

## Solucao Tecnica Proposta

### Abordagem

Introduzir uma camada explicita de sessao de jogo sobre o runtime atual, com quatro frentes tecnicas coordenadas:

1. **Base unica de camera e input:** centralizar os vetores de orientacao em um helper compartilhado para que camera, movimento e renderer usem a mesma convencao. Nessa camada tambem fica a correcao do mouse em leitura natural por padrao.
2. **Pipeline de performance mais agressivo:** reduzir trabalho por frame com fila de chunks priorizada por proximidade, budget dinamico de geracao, culling por chunk e malha lateral menos fragmentada.
3. **Estado de pausa formal:** adicionar um state machine simples no runtime para distinguir `booting`, `running`, `paused`, `saving`, `error` e `destroyed`, controlando pointer lock, input, update e UI.
4. **Persistencia real de sessao:** criar armazenamento 1:1 do ultimo estado salvo do mundo e integrar carregamento/gravacao no `WorldRepository`, com retomada no ultimo ponto valido ao reabrir o mundo.

### Fluxo Tecnico

```text
index.php?page=jogo&id_mundo=ID
  -> assets/js/paginas/jogo.js
  -> WorldRepository.loadGameContext(ID)
  -> api/mundos/buscar.php
  -> GameApp.resolveSpawn(save_state || terrain.findSpawnPoint())
  -> runtime running

KeyP
  -> InputState.consumeActions()
  -> GameApp.setSessionState('paused')
  -> PauseMenu
  -> [Retornar] -> running
  -> [Salvar e sair] -> WorldRepository.saveGameState()
                     -> api/mundos/salvar_estado.php
                     -> redirect index.php?page=menu
```

### Decisoes Estruturais

- Criar a tabela `mundos_estado` com cardinalidade `1 save ativo : 1 mundo`.
- Usar um payload versionado de save, com `schema_version` e espaco reservado para `world.modified_blocks`, mesmo que a lista nasca vazia nesta fase.
- Fazer `api/mundos/buscar.php` retornar metadados do mundo e o ultimo `save_state` normalizado em uma unica chamada.
- Centralizar a pausa no `GameApp`, nao no `PlayerController`, para que simulacao, render loop, pointer lock e UI sejam governados pelo mesmo estado.
- Otimizar performance primeiro reduzindo custo estrutural do pipeline atual, sem trocar de renderer e sem introduzir dependencias externas.

---

## Implementacao Detalhada

### Componente / Arquivo: persistencia de estado do mundo

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Criar a migration `0004_create_mundos_estado_table.php`, o endpoint `api/mundos/salvar_estado.php` e os ajustes em `api/mundos/buscar.php` e `_common.php` para salvar e recuperar o ultimo estado persistido do mundo autenticado.

**Pontos de atencao:**
- O save precisa validar ownership do mundo antes de ler ou escrever.
- O estado salvo deve ser pequeno, normalizado e versionado.

---

### Componente / Arquivo: camera, input e locomocao

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Criar um helper compartilhado de base vetorial da camera e refatorar `InputState.js` e `PlayerController.js` para que movimento, look horizontal e look vertical usem a mesma convencao do renderer, com mouse natural por padrao e `invert_y` tratado apenas como opcao persistida.

**Pontos de atencao:**
- `WASD` deve responder ao yaw efetivamente visto em tela.
- A tecla `P` deve virar acao discreta, sem repetir alternancias por auto-repeat do teclado.

---

### Componente / Arquivo: pipeline de performance

**Acao:** Modificar

**Responsabilidade tecnica:**
Refinar `ChunkManager.js`, `ChunkMesher.js`, `TerrainGenerator.js` e `SoftwareRenderer.js` para reduzir custo de geracao e desenho, priorizando chunks proximos, reduzindo geometria lateral redundante e descartando trabalho visual fora de alcance util.

**Pontos de atencao:**
- O ganho de fluidez nao pode quebrar leitura do relevo nem gerar pop-in agressivo demais.
- O prime inicial deve bloquear menos tempo sem deixar o jogador cair em vazio visual imediato.

---

### Componente / Arquivo: pause menu e estado da sessao

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Adicionar a UI de pausa na rota `jogo`, criar um modulo proprio de menu de pausa e estender `GameApp.js` para coordenar `pause`, `resume`, `saving`, erro e cleanup de forma deterministica.

**Pontos de atencao:**
- Ao pausar, o jogo deve parar update de gameplay de fato.
- O pointer lock precisa ser liberado ao pausar e recuperado apenas com acao explicita do usuario.

---

### Componente / Arquivo: integracao de save/load no runtime

**Acao:** Modificar

**Responsabilidade tecnica:**
Expandir `WorldRepository.js`, `assets/js/paginas/jogo.js` e `GameApp.js` para restaurar o ultimo estado salvo no bootstrap, persistir a sessao atual ao sair, validar posicao/orientacao antes do save e aplicar fallback seguro para spawn procedural quando o save estiver ausente ou inconsistente.

**Pontos de atencao:**
- `Salvar e sair` so pode redirecionar apos resposta clara do backend.
- Save invalido nao pode prender o usuario em estado quebrado na abertura seguinte.

---

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `mundos` | `id`, `usuario_id`, `nome`, `seed`, `algorithm_version`, `ultimo_jogado_em` | continua como catalogo do mundo |
| `mundos_estado` | `mundo_id`, `schema_version`, `player_x`, `player_y`, `player_z`, `player_yaw`, `player_pitch`, `estado_json`, `salvo_em` | novo save ativo do mundo |
| `save_state payload` | `schema_version`, `player`, `world` | `world.modified_blocks` nasce vazio nesta fase |
| `session state` | `booting`, `running`, `paused`, `saving`, `error`, `destroyed` | apenas em memoria no frontend |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Rota | `index.php?page=jogo&id_mundo={id}` | Abrir o mundo selecionado |
| Endpoint | `api/mundos/buscar.php` | Retornar `world` + `save_state` do mundo autenticado |
| Endpoint | `api/mundos/salvar_estado.php` | Persistir o ultimo estado valido do mundo |
| Modulo JS | `assets/js/game/services/WorldRepository.js` | Ler e salvar contexto do mundo |
| Modulo JS | `assets/js/game/GameApp.js` | Orquestrar sessao, pausa, save e restore |

### Regras de Integridade

- Deve existir no maximo um registro ativo em `mundos_estado` por `mundo_id`.
- `mundo_id` salvo precisa pertencer ao usuario autenticado dono da sessao.
- `player_x` e `player_z` devem permanecer dentro dos limites logicos do mundo.
- `player_pitch` deve ser salvo dentro da faixa operacional do runtime.
- O payload `estado_json` deve permanecer compacto e validado antes de persistir.
- Em leitura, save ausente ou inconsistente deve cair para spawn procedural seguro.

### Contrato de Save Proposto

```json
{
  "schema_version": 1,
  "player": {
    "position": { "x": 0.5, "y": 37, "z": 0.5 },
    "rotation": { "yaw": 0.785398, "pitch": 0.18 }
  },
  "world": {
    "modified_blocks": []
  }
}
```

---

## Requisitos de Performance e Escala

- Reduzir o prime inicial bloqueante para uma faixa pequena e previsivel, priorizando chunks mais proximos do spawn.
- Trocar fila FIFO simples por fila ordenada por distancia ao jogador.
- Permitir budget adaptativo de geracao por frame conforme tempo do frame anterior.
- Compactar faces laterais contiguas de mesmo material no `ChunkMesher`.
- Fazer culling por chunk antes de iterar faces no renderer.
- Manter o cliente dependente apenas do entorno carregado, nunca da area total `5000 x 5000 x 100`.

---

## Seguranca e Validacoes

- Validar autenticacao e ownership do mundo em leitura e escrita do save.
- Sanitizar `id_mundo`, coordenadas, yaw, pitch e `schema_version`.
- Rejeitar payloads de save muito grandes ou com formato invalido.
- Nao confiar em posicao salva pelo cliente sem checagem de limites do mundo.
- Em falha de save, manter o usuario na tela de pausa com feedback claro.

---

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Divergencia residual entre camera renderizada e vetores de movimento | Alto | Centralizar a orientacao em helper compartilhado e usa-lo no player e no renderer |
| Save corrompido gerar spawn dentro do terreno ou fora do mundo | Alto | Validar payload e aplicar fallback para spawn seguro procedural |
| Otimizacao agressiva gerar pop-in ou perda visual perceptivel | Medio | Priorizar chunks proximos, manter retention radius e validar em exploracao manual |
| Pausa quebrar pointer lock ou deixar input preso | Medio | Controlar pausa no `GameApp` e resetar input ao trocar de estado |
| Crescimento futuro do save exigir retrabalho | Medio | Adotar `schema_version` e `world.modified_blocks` desde a primeira versao |

---

## Plano de Testes

- Entrar em um mundo e validar que `WASD` seguem a camera em qualquer yaw.
- Mover o mouse para cima e verificar que a camera sobe por padrao; repetir com `invert_y = 1`.
- Explorar a area inicial e comparar percepcao de travamento antes e depois do pipeline otimizado.
- Pressionar `P` durante a gameplay e verificar pausa real da simulacao e liberacao do cursor.
- Escolher `Retornar ao jogo` e retomar controle sem duplicar listeners.
- Escolher `Salvar e sair`, confirmar persistencia e retorno ao menu principal.
- Reabrir o mesmo mundo e validar retomada na ultima posicao/orientacao salvas.
- Forcar save invalido ou ausente e garantir fallback para spawn procedural seguro.

---

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-modelar-persistencia-de-estado-do-mundo.md) | Criar a base de banco e API para salvar e ler o ultimo estado do mundo | Nenhuma |
| [TASK-002](./tasks/TASK-002-unificar-camera-input-e-movimento.md) | Corrigir a base de camera, mouse e locomocao do runtime | Nenhuma |
| [TASK-003](./tasks/TASK-003-otimizar-chunks-meshing-e-render.md) | Reduzir custo de geracao e renderizacao do mundo atual | Nenhuma |
| [TASK-004](./tasks/TASK-004-implementar-menu-de-pausa-e-estado-da-sessao.md) | Introduzir pause menu e state machine de gameplay | TASK-002 |
| [TASK-005](./tasks/TASK-005-integrar-save-exit-e-retomada-do-mundo.md) | Ligar save/load do backend ao runtime e ao retorno ao menu | TASK-001, TASK-002, TASK-004 |
| [TASK-006](./tasks/TASK-006-validar-fluxo-end-to-end-da-prd-004.md) | Consolidar validacoes finais e ajuste fino da PRD-004 | TASK-003, TASK-005 |

---

## Rollback

Reverter a migration `0004_create_mundos_estado_table.php`, remover `api/mundos/salvar_estado.php`, desfazer a extensao de `buscar.php`, remover os modulos de pausa e restaurar as versoes anteriores de `GameApp.js`, `InputState.js`, `PlayerController.js`, `ChunkManager.js`, `ChunkMesher.js` e `SoftwareRenderer.js`. Como o save desta fase e aditivo e 1:1 com o mundo, o rollback pode ser feito sem apagar `mundos`, apenas removendo a estrutura de estado introduzida na PRD-004.
