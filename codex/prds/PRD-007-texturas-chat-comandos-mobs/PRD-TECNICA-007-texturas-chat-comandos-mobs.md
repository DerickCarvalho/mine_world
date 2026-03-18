# PRD-TECNICA-007: Texturas, comandos, chat e primeiro mob

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-007-texturas-chat-comandos-mobs.md](./PRD-007-texturas-chat-comandos-mobs.md) |
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

O jogo usa um renderer 2D por software e a malha atual gera uma face por lado exposto de bloco, sem mesclagem. Isso infla bastante o numero de poligonos processados por frame. O catalogo de blocos so conhece cor base por face, o input ainda nao possui chat, nao existe nenhuma camada de entidades vivas e o shell autenticado ainda nao oferece CRUDs para assets visuais nem para comandos.

No backend, o projeto ja possui autenticacao, migrations, persistencia de mundo e CRUDs simples por pagina. Isso permite encaixar duas novas areas: `texturas` e `comandos`, ambas mantendo o contrato padrao `status`, `message`, `data`.

---

## Solucao Tecnica Proposta

### 1. Otimizacao de malha e renderer

- Substituir a geracao de faces unitarias por uma forma de mesclagem por area contigua e material compatível.
- Preservar informacoes suficientes para o renderer desenhar cor solida ou textura por face.
- Adicionar escala interna de render adaptativa para aliviar custo em momentos de frame alto.

### 2. Sistema de texturas

- Criar tabela `blocos_texturas` com uma linha por `block_key`.
- Salvar metadados de arquivo para `top`, `side` e `bottom`.
- Gravar arquivos fisicos em `_texturas/`.
- Expor endpoints para listar blocos + textura atual, buscar item, salvar uploads e excluir texturas de um bloco.
- Carregar manifest de texturas no runtime e no CRUD web.

### 3. Ajuste da mao

- Redesenhar a HUD da mao como um cuboide simples em CSS.
- Manter a animacao em `FirstPersonHand.js`, mas com amplitude menor e transformacoes mais coerentes com um braco reto.

### 4. Runtime de mobs

- Criar uma camada leve de entidades com `MobManager`, `CatMob` e `EntityPicker`.
- Fazer spawn com checagem de ambiente perto do jogador, cooldown e cap global.
- Simular deslocamento simples em solo com alvo de caminhada aleatorio ou perseguiçao do jogador quando ativado.
- Renderizar o gato como conjunto pequeno de cuboides usando a mesma pipeline do renderer.

### 5. Cadastro e validacao de comandos

- Criar tabela `comandos_runtime`.
- Persistir `command_key`, `label`, `description`, `capability_key`, `validation_status`, `validation_reason`, `active`.
- Implementar um avaliador local que traduz descricoes em capacidades suportadas.
- Nesta fase, o avaliador aprova apenas comandos mapeaveis para `teleport`.

### 6. Chat e execucao de comandos

- Adicionar componentes `ChatOverlay` e `CommandService` no runtime.
- `InputState` passa a emitir `toggleChat`.
- `GameApp` pausa a jogabilidade enquanto o chat estiver aberto.
- Ao enviar mensagem iniciada com `/`, o runtime resolve o comando pela lista validada e despacha para o executor correspondente.
- O executor inicial de `teleport` suporta `/tp x y z`.

---

## Implementacao Detalhada

### Documentacao e roteamento web

- Atualizar `codex/ESCOPO.md` e criar `PRD-007`.
- Incluir novas paginas autenticadas em `index.php`.
- Atualizar `pages/menu.php` e `assets/js/paginas/menu.js` para navegar para `texturas` e `comandos`.

### Persistencia de texturas

- Criar migration para `blocos_texturas`.
- Criar helper compartilhado em `api/texturas/_common.php`.
- Implementar endpoints:
  - `api/texturas/listar.php`
  - `api/texturas/buscar.php`
  - `api/texturas/salvar.php`
  - `api/texturas/excluir.php`
- Adaptar `ApiRequest.js` para aceitar `FormData`.

### Persistencia e validacao de comandos

- Criar migration para `comandos_runtime`.
- Criar helper compartilhado em `api/comandos/_common.php`.
- Implementar endpoints:
  - `api/comandos/listar.php`
  - `api/comandos/buscar.php`
  - `api/comandos/cadastrar.php`
  - `api/comandos/editar.php`
  - `api/comandos/excluir.php`

### Frontend dos CRUDs

- Criar `pages/texturas.php`, `pages/comandos.php`.
- Criar `assets/js/paginas/texturas.js`, `assets/js/paginas/comandos.js`.
- Criar `assets/css/custom/pages/texturas.css`, `assets/css/custom/pages/comandos.css`.

### Runtime de texturas e performance

- Expandir `BlockTypes.js` com catalogo visual compartilhado.
- Adaptar `ChunkMaterials.js` para expor chave de textura por face.
- Reestruturar `ChunkMesher.js` para gerar quads mesclados.
- Adaptar `SoftwareRenderer.js` para desenhar quads texturizados quando disponiveis.
- Adicionar cache de imagens e escala adaptativa no renderer.

### Runtime de chat, comandos e mobs

- Criar:
  - `assets/js/game/entities/EntityPicker.js`
  - `assets/js/game/entities/MobManager.js`
  - `assets/js/game/entities/CatMob.js`
  - `assets/js/game/ui/ChatOverlay.js`
  - `assets/js/game/services/CommandRepository.js`
  - `assets/js/game/services/TextureRepository.js`
- Integrar tudo em `GameApp.js`, `pages/jogo.php`, `assets/css/custom/pages/jogo.css`, `assets/js/paginas/jogo.js` e `InputState.js`.

---

## Dados, Persistencia e Contratos

### Novas tabelas

| Tabela | Campos principais | Observacoes |
|--------|-------------------|-------------|
| `blocos_texturas` | `block_key`, `top_filename`, `side_filename`, `bottom_filename`, `updated_by_user_id`, timestamps | Uma configuracao visual por bloco |
| `comandos_runtime` | `id`, `command_key`, `label`, `description`, `capability_key`, `validation_status`, `validation_reason`, `active`, `created_by_user_id`, timestamps | Cadastro administravel de comandos |

### Pasta de arquivos

| Pasta | Objetivo |
|-------|----------|
| `_texturas/` | Armazenar imagens aprovadas de texturas de bloco |

### Contratos principais

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Endpoint | `api/texturas/salvar.php` | Validar upload e salvar metadados de textura |
| Endpoint | `api/comandos/cadastrar.php` | Validar descricao e persistir comando suportado |
| Modulo JS | `TextureRepository.loadManifest()` | Carregar manifest de texturas para o runtime |
| Modulo JS | `CommandRepository.listValidated()` | Carregar comandos disponiveis no chat |
| Chat | `/tp x y z` | Teleportar o jogador para coordenadas validas |

### Regras de integridade

- Cada arquivo de textura deve ter no maximo `5120` bytes.
- Apenas imagens validas podem ser aceitas em `_texturas`.
- `block_key` deve existir no catalogo atual de blocos.
- `command_key` deve ser unico e usar formato compativel com slash command.
- Apenas comandos com `validation_status = validated` e `active = 1` podem aparecer no chat.

---

## Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Textura aumentar demais o custo do renderer | Medio | Mesclar faces, usar cache de imagens e fallback para cor |
| Chat conflitar com pointer lock e atalhos | Medio | Desabilitar gameplay enquanto o chat estiver aberto |
| Spawn de gatos lotar a cena | Medio | Cap global, cooldown de spawn e chance `1/50` |
| Cadastro de comandos prometer mais do que o jogo suporta | Alto | Validador por capacidade conhecida e rejeicao explicita |

---

## Validacao Esperada

- Migrations novas aplicam sem erro.
- CRUD de texturas lista todos os blocos e salva arquivos dentro do limite.
- CRUD de comandos aprova descricoes de teleporte e rejeita descricoes fora das capacidades atuais.
- `T` abre chat, `/` lista comandos validados e `/tp x y z` move o jogador.
- Gatos aparecem com baixa frequencia, podem seguir o jogador e voltam a vagar ao novo clique.
- O frame em cenas comuns melhora pela reducao de faces renderizadas.
