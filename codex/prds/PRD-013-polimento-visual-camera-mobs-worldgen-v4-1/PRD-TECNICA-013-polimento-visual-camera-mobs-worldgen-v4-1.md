# PRD-TECNICA-013: Polimento visual, camera livre e worldgen 4.1

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](./PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
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

- `GameApp` integra runtime, HUD, input, inventario, held item, mobs e ciclo de update/render.
- `PlayerController`, `CameraMath`, `RaycastPicker` e `EntityPicker` compartilham a nocao operacional de yaw/pitch.
- `WebGLRenderer` aplica o pitch em shader e hoje possui clamp proprio, separado do clamp de `CameraMath`.
- `FirstPersonHand`, `ItemIcon`, `Hotbar` e `InventoryPanel` definem a leitura visual do slot ativo e dos itens da UI.
- `MobManager` e `CatMob` sustentam o primeiro mob jogavel.
- `TerrainGenerator` e `ProceduralSurfaceDecorator` definem biomas, relevo, vegetacao e spawnability dos mundos `v4.0`.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `assets/js/game/player/PlayerController.js` | Atualiza yaw/pitch do jogador | Alterar |
| `assets/js/game/core/CameraMath.js` | Clamp e vetores da camera | Alterar |
| `assets/js/game/render/webgl/WebGLRenderer.js` | Consome pitch da camera no shader | Alterar |
| `assets/js/game/world/RaycastPicker.js` | Raycast de blocos | Revisar e alterar se necessario |
| `assets/js/game/entities/EntityPicker.js` | Picking de entidades | Revisar e alterar se necessario |
| `assets/js/game/ui/FirstPersonHand.js` | Held item em primeira pessoa | Alterar |
| `assets/js/game/ui/ItemIcon.js` | Gera markup visual dos itens | Alterar |
| `assets/js/game/ui/Hotbar.js` | Renderiza hotbar | Alterar |
| `assets/js/game/ui/InventoryPanel.js` | Renderiza inventario | Alterar |
| `assets/css/custom/pages/jogo.css` | Estilos da HUD/gameplay | Alterar |
| `assets/js/game/entities/CatMob.js` | Modelo e animacao do mob base | Alterar |
| `assets/js/game/entities/MobManager.js` | Spawn e ciclo do mob base | Revisar |
| `assets/js/game/world/TerrainGenerator.js` | Relevo e classificacao de bioma | Alterar |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Vegetacao, arvores e cobertura superficial | Alterar |
| `assets/js/game/GameApp.js` | Orquestra selecao da hotbar e integracao de HUD/runtime | Alterar |
| `assets/js/game/services/WorldRepository.js` | Persistencia de pitch e slot selecionado | Revisar |

### Dependencias Tecnicas

- WebGL 2 continua sendo o alvo principal do renderer.
- O runtime de saves e mundos atuais deve permanecer retrocompativel.
- Nao ha dependencia de backend novo; a mudanca e concentrada em frontend e geracao procedural local.

## Solucao Tecnica Proposta

### Abordagem

Executar um polimento incremental sobre os sistemas ja existentes, evitando introduzir uma arquitetura paralela. A camera deve unificar a faixa operacional de pitch em helpers, controller e renderer. O held item e a UI devem compartilhar um upgrade no `ItemIcon`, com fallback explicito de mao vazia no `FirstPersonHand`. O mob base deve receber retrabalho de malha/partes e uma animacao mais limpa sem alterar seu contrato de gameplay. O worldgen deve virar `v4.1` apenas para mundos novos, expandindo biomas e vegetacao sem migrar seeds antigas.

### Fluxo Tecnico

```text
mouse e hotbar -> PlayerController/CameraMath + HUD -> runtime/GameApp
                -> WebGLRenderer + ItemIcon/FirstPersonHand + CatMob
                -> TerrainGenerator/ProceduralSurfaceDecorator
                -> WorldRepository para pitch e versionamento do mundo
```

### Decisoes Estruturais

- Centralizar o limite de pitch em um contrato unico reaproveitado por input, raycast e renderer.
- Tratar mao vazia como estado visual legitimo do held item, nao como ausencia silenciosa de componente.
- Reaproveitar a mesma base de composicao visual para held item, hotbar e inventario, com variacoes de escala e enquadramento.
- Introduzir `v4.1` como nova linha de worldgen somente para mundos novos, preservando comportamento de mundos persistidos.
- Manter o mesmo mob base e o mesmo comportamento sistemico, trocando apenas apresentacao e transicoes de animacao.

## Implementacao Detalhada

### Componente / Arquivo: camera e picking (`PlayerController`, `CameraMath`, `WebGLRenderer`, pickers)

**Acao:** Modificar

**Responsabilidade tecnica:**
Unificar o pitch operacional, revisar clamps duplicados e garantir que camera, shader, raycast e picking leiam a mesma faixa angular.

**Pontos de atencao:**
- Extremos de pitch tendem a expor `cos(pitch)` proximo de zero; raycast e picking nao podem assumir componente horizontal relevante.
- Saves antigos com pitch menor continuam validos e nao exigem migracao.

### Componente / Arquivo: held item e UI (`FirstPersonHand`, `ItemIcon`, `Hotbar`, `InventoryPanel`, `jogo.css`)

**Acao:** Modificar

**Responsabilidade tecnica:**
Refinar o markup e a composicao visual dos itens equipados e da UI, incluindo textura aparente, iluminacao simples, melhor enquadramento e fallback de mao vazia.

**Pontos de atencao:**
- O estado sem item precisa ser tratado sem quebrar animacoes basicas da primeira pessoa.
- O custo DOM/CSS deve continuar baixo para nao disputar com o render 3D.

### Componente / Arquivo: mob base (`CatMob`, `MobManager`)

**Acao:** Modificar

**Responsabilidade tecnica:**
Rever proporcoes, partes visuais e animacao procedural do mob, mantendo spawn, follow e picking.

**Pontos de atencao:**
- O retrabalho nao pode aumentar demais o numero de partes ou alocar geometria em excesso por frame.
- O comportamento atual do mob continua sendo contrato vigente; a tarefa e de apresentacao, nao de IA nova.

### Componente / Arquivo: worldgen (`TerrainGenerator`, `ProceduralSurfaceDecorator`, bootstrap de mundos novos)

**Acao:** Modificar

**Responsabilidade tecnica:**
Expandir a classificacao de biomas, ajustar curvas de montanha, distribuir novas arvores e promover novos mundos para `algorithm_version = v4.1`.

**Pontos de atencao:**
- Mudar defaults apenas para mundos novos.
- Validar seeds variadas para evitar spawn em terreno inviavel e artefatos como overhangs ou crateras artificiais.

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| Estado do player | `x`, `y`, `z`, `yaw`, `pitch`, `selected_hotbar_index` | Mantem contrato atual; apenas amplia faixa operacional de pitch |
| Metadado de mundo | `seed`, `algorithm_version` | Mundos novos passam a nascer em `v4.1` apos a execucao |
| Perfil de bioma | `key`, pesos, thresholds, ruido regional | Efemero e deterministico por seed |
| Representacao visual de item | `block_id`, faces, classes visuais, estado de mao vazia | Efemero, sem persistencia |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Modulo | `clampPitch` / helpers de camera | Definir faixa vertical unica |
| Modulo | `renderItemIconMarkup` | Gerar item mais legivel na mao e na UI |
| Modulo | `FirstPersonHand` | Alternar entre held item e mao vazia |
| Modulo | `CatMob` | Materializar novo visual e animacao do mob |
| Modulo | `TerrainGenerator` | Classificar biomas e relevo `v4.1` |
| Modulo | `ProceduralSurfaceDecorator` | Distribuir arvores e cobertura superficial por bioma |

### Regras de Integridade

- O mesmo pitch normalizado deve ser usado por renderizacao, raycast e persistencia.
- Mundos antigos nao podem mudar de `algorithm_version` automaticamente.
- O estado vazio da hotbar nao pode gerar item fantasma nem ocultar item real.
- O retrabalho do mob nao pode quebrar spawn, picking ou toggle de follow.

## Requisitos de Performance e Escala

- A ampliacao de pitch nao pode introduzir jitter perceptivel ou NaN nos extremos da camera.
- Held item, mao vazia e icones de UI devem continuar com custo de DOM baixo e sem animacoes caras.
- O retrabalho do mob deve manter frame pacing estavel com multiplos mobs em cena.
- `v4.1` nao pode aumentar de forma regressiva o tempo de prebuild inicial nem gerar explosao de arvores/chunks.

## Seguranca e Validacoes

- Preservar ownership e rotas atuais de save do mundo.
- Normalizar e validar pitch salvo antes de persistir ou hidratar runtime.
- Validar `algorithm_version` apenas dentro do catalogo suportado pelo frontend.

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Clamp duplicado deixar camera incoerente | Alto | Unificar helper e revisar todos os consumidores de pitch |
| Fallback de mao vazia conflitar com held item | Medio | Tratar estado vazio explicitamente e cobrir troca de slot |
| Novo visual do mob degradar performance | Medio | Reaproveitar geometria simples e animacao procedural leve |
| `v4.1` piorar spawn ou criar artefatos | Alto | Smoke com varias seeds e validacao visual perto do spawn |
| Escopo virar reestilizacao total do jogo | Medio | Limitar a quatro frentes: camera, item/UI, mob base e worldgen |

## Plano de Testes

- `node --check` nos modulos JS alterados de camera, UI, mob e worldgen.
- `npm test` e `npm run test:harness`.
- Smoke manual em mundo existente e em mundos novos `v4.1`.
- Validacao manual de extremos de pitch com quebra, colocacao e picking.
- Comparacao visual de held item, hotbar, inventario e mao vazia.
- Observacao do mob em idle, deslocamento e follow por alguns minutos.

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-liberar-pitch-e-mao-vazia.md) | Liberar pitch total e introduzir fallback de mao vazia | Nenhuma |
| [TASK-002](./tasks/TASK-002-refinar-itens-da-mao-e-da-ui.md) | Refinar held item, hotbar e inventario | TASK-001 |
| [TASK-003](./tasks/TASK-003-retrabalhar-visual-e-animacao-do-mob-base.md) | Melhorar apresentacao do mob base | Nenhuma |
| [TASK-004](./tasks/TASK-004-evoluir-worldgen-v4-1.md) | Evoluir biomas, arvores e montanhas em `v4.1` | Nenhuma |
| [TASK-005](./tasks/TASK-005-validar-integracao-da-gameplay.md) | Validar regressao e integracao entre camera, UI, mob e worldgen | TASK-001, TASK-002, TASK-003, TASK-004 |

Cada criterio `CA-NN` da PRD de produto deve aparecer em pelo menos uma task.

## Rollback

Reverter incrementalmente por frente: restaurar o clamp anterior de pitch, remover o estado de mao vazia, voltar `ItemIcon` e estilos de UI, recolocar a versao anterior do `CatMob` e manter `v4.0` como default de mundos novos. Como a persistencia principal nao muda de schema, o rollback e majoritariamente logico e de assets/codigo.
