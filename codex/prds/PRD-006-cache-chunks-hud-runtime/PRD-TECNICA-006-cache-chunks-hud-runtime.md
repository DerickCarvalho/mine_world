# PRD-TECNICA-006: Cache de chunks, HUD contextual e configuracoes em runtime

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-006-cache-chunks-hud-runtime.md](./PRD-006-cache-chunks-hud-runtime.md) |
| **Data** | 18/03/2026 |
| **Autor Tecnico** | Codex |
| **Versao** | 1.0 |

---

## Contexto Tecnico

- **Projeto:** MineWorld
- **Stack:** HTML, CSS e JavaScript Vanilla
- **Backend:** PHP 8.3.16 + MySQL
- **Ambiente local:** `C:\laragon\www\mine_world`
- **Padrao base obrigatorio:** shell PHP inspirado em `dealer-gestao-modulos`

---

## Analise do Estado Atual

O runtime atual ja suporta mundo mutavel, inventario simples, pausa e save do jogador, mas o pipeline de terreno ainda depende do gerador procedural sempre que uma chunk e solicitada. Isso encarece entrada em mundo, deslocamento inicial e retorno a areas ja exploradas. A HUD tambem ficou sobrecarregada com coordenadas e dados do mundo sempre visiveis, e o pause menu ainda nao concentra configuracoes editaveis em tempo real.

O refinamento desta fase exige separar duas camadas de persistencia:

1. `mundos_estado`: estado de sessao do jogador, inventario e mutacoes globais.
2. `mundos_chunks`: snapshot da base de cada chunk ja gerada para aquele mundo.

Assim o gerador procedural passa a ser usado somente no primeiro contato com uma chunk ainda inexistente para o mundo em questao.

---

## Solucao Tecnica Proposta

### 1. Persistencia de chunks por mundo

- Criar tabela `mundos_chunks` com chave composta `mundo_id + chunk_x + chunk_z`.
- Salvar em cada registro:
  - coordenadas da chunk
  - `schema_version`
  - payload serializado da malha de blocos base daquele chunk
  - timestamps
- O payload sera um `Uint8Array` serializado em `base64`, suficiente para o estado base do chunk.
- Mutacoes do jogador continuam fora desse snapshot estrutural e permanecem no `save_state`.

### 2. Pre-geracao inicial

- Novo modulo `WorldPrebuilder.js` gera uma janela inicial de chunks ao redor do spawn procedural.
- Esse prebuild roda:
  - logo apos `api/mundos/cadastrar.php` retornar o `id` do mundo
  - antes do bootstrap final da gameplay de um mundo sem cache inicial
- O prebuild usa o mesmo `TerrainGenerator` do runtime para manter determinismo.

### 3. ChunkManager com cache persistente

- `ChunkManager.js` passa a operar com tres estados:
  - chunk carregada da base persistida
  - chunk gerada localmente e ainda nao salva
  - chunk suja por mutacao do jogador
- O manager prioriza:
  1. carregar lotes salvos da API
  2. gerar localmente apenas o que faltar
  3. colocar chunks novas/sujas em fila de flush
- Chunks fora do raio continuam descarregadas da memoria, mas permanecem salvas no banco.

### 4. HUD e pausa contextuais

- `SceneOverlay.js` deixa de exibir coordenadas e dados tecnicos sempre.
- Coordenadas viram card alternavel por `C`.
- O menu de pausa ganha:
  - resumo do mundo atual
  - quantidade de chunks em cache
  - seed e versao do algoritmo
  - formulario de configuracoes de jogo
- `P` continua pausando o jogo, mas agora tambem funciona como hub de dados/configuracoes.

### 5. Aplicacao live de configuracoes

- `PauseMenu.js` expõe evento `onApplySettings`.
- `GameApp.js` envia alteracoes para `WorldRepository.saveUserConfig()`.
- Ao voltar do save da API, o runtime aplica:
  - `render_distance` no `ChunkManager`
  - `mouse_sensitivity` e `invert_y` no `PlayerController`
  - `master_volume` reservado para consumo futuro

### 6. Bedrock e regras de interacao

- `BlockTypes.js` ganha `bedrock`.
- `TerrainGenerator.js` e `MutableWorld.js` garantem `bedrock` em `y = 0`.
- Validacoes de quebra passam a rejeitar `bedrock`.

---

## Implementacao Detalhada

### Componente / Arquivo: persistencia de chunks

**Acao:** Criar / Modificar

**Arquivos principais:**
- `api/database/migrations/0005_create_mundos_chunks_table.php`
- `api/mundos/carregar_chunks.php`
- `api/mundos/salvar_chunks.php`
- `api/mundos/_common.php`
- `api/mundos/buscar.php`

**Responsabilidade tecnica:**
Criar a tabela e os endpoints para leitura e escrita em lote de chunks persistidas, com validacao de ownership, limites de coordenada e contagem de cache por mundo.

---

### Componente / Arquivo: codec e repositorio de chunks

**Acao:** Criar / Modificar

**Arquivos principais:**
- `assets/js/game/world/ChunkCodec.js`
- `assets/js/game/services/WorldRepository.js`

**Responsabilidade tecnica:**
Serializar `Uint8Array <-> base64`, carregar lotes de chunks, salvar batches e expor estatisticas de cache para o runtime.

---

### Componente / Arquivo: bootstrap e prebuild de mundo

**Acao:** Criar / Modificar

**Arquivos principais:**
- `assets/js/game/services/WorldPrebuilder.js`
- `assets/js/paginas/mundos.js`
- `assets/js/paginas/jogo.js`

**Responsabilidade tecnica:**
Executar pre-geracao inicial apos criar um mundo e, na entrada da gameplay, garantir que exista uma janela minima de chunks persistidas antes do primeiro frame jogavel.

---

### Componente / Arquivo: mundo mutavel e manager de chunks

**Acao:** Modificar

**Arquivos principais:**
- `assets/js/game/world/MutableWorld.js`
- `assets/js/game/world/ChunkManager.js`
- `assets/js/game/world/BlockTypes.js`
- `assets/js/game/world/ChunkMaterials.js`

**Responsabilidade tecnica:**
Hidratar chunks salvas, gerar chunks faltantes, marcar chunks novas/sujas para persistencia e impedir quebra de `bedrock`.

---

### Componente / Arquivo: HUD, mao e pausa

**Acao:** Modificar

**Arquivos principais:**
- `pages/jogo.php`
- `assets/css/custom/pages/jogo.css`
- `assets/js/game/ui/FirstPersonHand.js`
- `assets/js/game/ui/PauseMenu.js`
- `assets/js/game/ui/SceneOverlay.js`
- `assets/js/game/player/InputState.js`

**Responsabilidade tecnica:**
Refazer a apresentacao da mao, centralizar hotbar, sobrepor hotbar sobre a mao, alternar coordenadas com `C`, mover dados do mundo para o pause menu e abrir configuracoes editaveis durante a partida.

---

### Componente / Arquivo: integracao do runtime

**Acao:** Modificar

**Arquivos principais:**
- `assets/js/game/GameApp.js`
- `assets/js/game/player/PlayerController.js`

**Responsabilidade tecnica:**
Aplicar a nova logica de pause/configuracoes, reagir ao toggle de coordenadas, sincronizar save de chunks e manter o loop do jogo consistente.

---

## Dados, Persistencia e Contratos

### Nova tabela

| Tabela | Campos principais | Observacoes |
|--------|-------------------|-------------|
| `mundos_chunks` | `mundo_id`, `chunk_x`, `chunk_z`, `schema_version`, `data_base64`, `criado_em`, `atualizado_em` | Chave primaria composta por mundo + coordenadas |

### Endpoints

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Endpoint | `api/mundos/carregar_chunks.php` | Carregar um lote de chunks persistidas |
| Endpoint | `api/mundos/salvar_chunks.php` | Salvar um lote de chunks novas ou alteradas |
| Endpoint | `api/mundos/buscar.php` | Passar `chunk_stats` no contexto do mundo |

### Contratos JS

| Modulo | Metodo | Objetivo |
|--------|--------|----------|
| `WorldRepository` | `loadChunkBatch(worldId, chunks)` | Ler chunks persistidas |
| `WorldRepository` | `saveChunks(worldId, chunks)` | Persistir chunks em lote |
| `WorldPrebuilder` | `ensureInitialChunkWindow()` | Garantir janela inicial pronta |

### Regras de integridade

- Cada chunk persistida pertence a um unico mundo.
- `chunk_x` e `chunk_z` devem permanecer nos limites logicos do mapa.
- `data_base64` deve representar exatamente `chunkSize * height * chunkSize` bytes.
- `bedrock` nao pode ser quebrada nem coletada.
- O cache de chunks nao substitui mutacoes do jogador; ambas as camadas devem ser aplicadas juntas no runtime.

---

## Fluxo Tecnico Consolidado

```text
criar mundo
  -> api/mundos/cadastrar.php
  -> WorldPrebuilder gera janela inicial
  -> api/mundos/salvar_chunks.php
  -> entrar no jogo

entrar no jogo
  -> api/mundos/buscar.php
  -> carregar save do jogador + chunk_stats
  -> garantir janela inicial de chunks
  -> bootstrap do GameApp

explorar
  -> ChunkManager tenta carregar lote salvo
  -> se nao existir, gera chunk
  -> salva chunk nova
  -> se jogador altera bloco, marca chunk suja
  -> flush em lote salva chunk atualizada
```

---

## Riscos e Mitigacoes

- **Risco:** excesso de escrita ao salvar uma chunk a cada alteracao.
  - **Mitigacao:** fila de flush com batch e debounce curto.
- **Risco:** payload de chunk grande demais para requests pequenas repetidas.
  - **Mitigacao:** salvar somente janela inicial e delta explorado, com lotes controlados.
- **Risco:** conflito entre snapshot de chunk e mutacoes do save.
  - **Mitigacao:** snapshot representa base do chunk; mutacoes continuam aplicadas por cima.

---

## Validacao Esperada

- Migration `0005` aplicada sem erro.
- Mundo novo pregera e salva chunks antes do spawn.
- Mundo existente reaproveita cache persistido.
- `C` alterna coordenadas.
- `P` abre pausa com dados do mundo e configuracoes.
- Ajustar configuracoes durante o jogo reflete sem reload.
- `bedrock` continua intacta apos tentativa de quebra.
