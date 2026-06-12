# PRD-TECNICA-012: Experiencia sandbox fundamentada

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-012-experiencia-sandbox-v1.md](./PRD-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Data** | 11/06/2026 |
| **Autor Tecnico** | Codex + Tony Stark |
| **Versao** | 1.0 proposta |

## Contexto Tecnico

A proposta tecnica foi preparada junto do rascunho para estimar a execucao, mas depende da aprovacao da PRD de produto. O runtime atual usa Canvas 2D, ordena faces por frame e concentra simulacao, chunks, interacao e renderizacao em `GameApp`.

### Arquitetura Relevante

- `GameApp` orquestra sessao, UI, interacao, chunks, mobs, audio e loop.
- `SoftwareRenderer` projeta, ordena e desenha faces em Canvas 2D.
- `ChunkMesher` gera quads e `ChunkManager` controla streaming.
- `PlayerController` e `CollisionResolver` implementam movimento.
- `WorldRepository` preserva estado e chunks.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/GameApp.js` | Orquestrador monolitico | Separar responsabilidades |
| `assets/js/game/render/SoftwareRenderer.js` | Renderer Canvas 2D | Substituir gradualmente |
| `assets/js/game/world/ChunkMesher.js` | Meshing sincrono | Adaptar para buffers/Worker |
| `assets/js/game/world/ChunkManager.js` | Streaming de chunks | Versionar jobs assíncronos |
| `assets/js/game/player/` | Movimento e colisao | Adicionar estados sandbox |
| `assets/js/game/ui/` | HUD e inventario | Consolidar interacao |
| `assets/css/custom/pages/jogo.css` | Estilos acumulados | Reorganizar |
| `assets/js/game/services/WorldRepository.js` | Persistencia | Preservar contratos |

## Solucao Tecnica Proposta

### Abordagem

Executar uma migracao incremental orientada por benchmark. Primeiro instrumentar e separar contratos; depois introduzir WebGL e Worker; em seguida evoluir movimento e interacoes; por fim consolidar visual, persistencia e validacao.

### Fluxo Tecnico

```text
input -> controllers de gameplay -> estado mutavel -> jobs versionados de chunk -> buffers WebGL
     -> renderer GPU + HUD DOM -> persistencia existente
```

### Decisoes Estruturais

- Criar contrato de renderer para permitir comparacao/fallback durante a migracao.
- Representar geometria em buffers tipados transferiveis.
- Worker recebe snapshot/versionamento, nunca acessa DOM ou estado mutavel diretamente.
- Separar interacao, inventario e telemetria do `GameApp`.
- Preservar schema de save e API sempre que possivel.

## Implementacao Detalhada

### Renderer WebGL

**Acao:** criar modulos em `assets/js/game/render/webgl/` e adaptar bootstrap.

**Responsabilidade tecnica:** buffers por chunk, materiais, agua, selecao, entidades, camera e fog.

**Pontos de atencao:**
- Reutilizar texturas existentes.
- Liberar buffers ao descarregar chunks.
- Mensagem clara quando WebGL 2 nao estiver disponivel.

### Pipeline de chunks

**Acao:** criar Worker e adaptar `ChunkManager`/`ChunkMesher`.

**Responsabilidade tecnica:** gerar dados/mesh fora da main thread e descartar jobs obsoletos.

### Movimento e interacao

**Acao:** modificar `InputState`, `PlayerController`, `CollisionResolver` e criar controllers dedicados.

**Responsabilidade tecnica:** sprint, agachamento, agua, quebra progressiva, preview e regras de inventario.

### Experiencia audiovisual

**Acao:** consolidar `pages/jogo.php`, UI, audio e `jogo.css`.

**Responsabilidade tecnica:** feedback compacto, identidade propria e estilos sem overrides concorrentes.

## Dados, Persistencia e Contratos

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| Chunk job | coord, versao, snapshot, prioridade | Efemero e transferivel |
| Mesh buffer | positions, normals, uvs, indices, material | Efemero, liberado no unload |
| Interaction state | alvo, progresso, preview, motivo de bloqueio | Efemero |
| Inventory cursor | bloco e quantidade | Persistir somente slots finais |
| Save v3 | player, inventory, mutations | Manter compatibilidade |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Interface | `Renderer` | Inicializar, atualizar recursos, renderizar e destruir |
| Worker | `ChunkWorker` | Gerar e montar buffers versionados |
| Modulo | `InteractionController` | Quebra e colocacao |
| Modulo | `InventoryController` | Operacoes determinísticas de pilhas |
| Modulo | `RuntimeTelemetry` | Coletar benchmark local |

### Regras de Integridade

- Resposta de Worker com versao antiga nao altera chunk atual.
- Quantidade total de itens e conservada nas operacoes de inventario.
- Falha visual ou de Worker nao pode corromper saves existentes.

## Requisitos de Performance e Escala

- Frame time P95 `<= 22 ms` no benchmark de referencia.
- Nenhum congelamento superior a `100 ms` em travessia de 20 chunks.
- No maximo 2 long tasks superiores a `50 ms` por minuto atribuiveis a chunks.
- Geometria, texturas e snapshots devem possuir liberacao no unload.
- Benchmark registra hardware, resolucao, distancia e metricas.

## Seguranca e Validacoes

- Preservar autenticacao e ownership nos endpoints existentes.
- Validar buffers/mensagens recebidas do Worker antes de integrar.
- Normalizar save antigo antes de uso.

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Migracao WebGL regressiva | Alto | Contrato, benchmark e comparacao incremental |
| Worker divergir do mundo | Alto | Jobs versionados e descarte obsoleto |
| Crescimento de memoria GPU | Alto | Dispose no unload e telemetria |
| Regressao de save | Alto | Testes de round trip e schema preservado |
| Escopo excessivo | Medio | Bloquear crafting, novos biomas e novos mobs |

## Plano de Testes

- Benchmark automatizado e smoke guiado de 5/15 minutos.
- Testes determinísticos para movimento, inventario e interacao.
- Testes de versionamento/descarte de jobs de Worker.
- Round trip de mundos e saves existentes.
- `npm test`, `node --check`, `php -l` e smoke autenticado.

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-benchmark-telemetria-runtime.md) | Baseline e telemetria | Nenhuma |
| [TASK-002](./tasks/TASK-002-separar-orquestracao-gameapp.md) | Separar contratos do runtime | TASK-001 |
| [TASK-003](./tasks/TASK-003-implementar-renderer-webgl.md) | Renderer GPU | TASK-001, TASK-002 |
| [TASK-004](./tasks/TASK-004-migrar-geracao-meshing-worker.md) | Pipeline assíncrono | TASK-001, TASK-002 |
| [TASK-005](./tasks/TASK-005-refinar-fisica-movimento.md) | Movimento sandbox | TASK-002 |
| [TASK-006](./tasks/TASK-006-implementar-quebra-progressiva.md) | Quebra progressiva | TASK-002 |
| [TASK-007](./tasks/TASK-007-implementar-preview-colocacao.md) | Preview de colocacao | TASK-002 |
| [TASK-008](./tasks/TASK-008-evoluir-inventario-pilhas.md) | Manipulacao de pilhas | TASK-002 |
| [TASK-009](./tasks/TASK-009-consolidar-direcao-audiovisual.md) | Direcao audiovisual | TASK-003, TASK-005, TASK-006, TASK-007 |
| [TASK-010](./tasks/TASK-010-garantir-compatibilidade-persistencia.md) | Compatibilidade | TASK-004, TASK-005, TASK-008 |
| [TASK-011](./tasks/TASK-011-validar-experiencia-integrada.md) | Validacao integrada | TASK-003 a TASK-010 |

## Rollback

Manter contratos e commits incrementais para permitir voltar ao renderer Canvas e pipeline sincrono enquanto preserva telemetria, testes e correcoes independentes de gameplay.
