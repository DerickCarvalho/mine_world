# ESCOPO - MineWorld

## Regras de Consulta

- Toda nova PRD de produto concluida deve atualizar este arquivo na mesma entrega.
- Este arquivo e a referencia rapida do estado atual do produto e deve refletir apenas o que ja foi combinado ou aprovado.
- PRDs tecnicas e tasks so podem ser abertas a partir de PRDs de produto validadas.
- Toda documentacao de produto, tecnica e execucao deve permanecer dentro de `codex/`.

## Visao Atual do Produto

MineWorld e um jogo sandbox 3D de navegador, inspirado na clareza de uso do Minecraft, com foco inicial em HTML, CSS e JavaScript Vanilla no frontend.

Quando houver necessidade de persistencia de conta, configuracoes e mundos, a camada de backend devera usar PHP 8.3.16 com MySQL.

## Padrao Base de Front + API

- O MineWorld deve reaproveitar o padrao estrutural de `C:\laragon\www\dealer-gestao-modulos`.
- A autenticacao publica deve viver em `login.php`.
- A area autenticada deve usar `index.php?page=...` como roteador principal de telas.
- `layout.php`, `pages/` e `partials/` devem estruturar a interface servida pelo PHP.
- Scripts de cada tela devem ficar em `assets/js/paginas/`.
- Configuracoes de ambiente do frontend devem ser publicadas por `env.default.js` e `env.deploy.js` via objeto global `ENV`.
- A API deve seguir o padrao `api/{dominio}/{acao}.php`.
- A comunicacao frontend -> API deve passar por uma abstracao compartilhada de request no estilo `ApiRequest.js`, com token salvo em `localStorage`.
- Feedbacks globais de carregamento, erro, sucesso e confirmacao devem seguir helpers compartilhados no estilo `Loading.js` e `alert.js`.
- O loop de renderizacao 3D, input e simulacao do jogo continua em JavaScript Vanilla; o padrao herdado vale para shell web, autenticacao, menus, persistencia e integracao com API.
- Nos endpoints novos do MineWorld, o contrato JSON deve ser consistente e previsivel, preferencialmente com `status`, `message` e `data`.

## Norte da Fase Atual

- PRD-001 implementada: autenticacao, sessao, configuracoes persistentes e catalogo base de mundos.
- PRD-002 implementada: menu principal `MineWorld`, lobby de mundos, criacao e exclusao definitiva, tela de `Opcoes`.
- PRD-003 implementada: rota `jogo`, mundo procedural por seed, carga por chunks, HUD minimo e movimento em primeira pessoa.
- Proxima frente: evoluir o runtime 3D com texturas, interacao com blocos e persistencia de alteracoes do terreno.

## Regras de Produto Consolidadas

- O menu principal autenticado deve exibir o nome `MineWorld` e opcoes centralizadas na tela.
- As opcoes iniciais do menu principal sao `Jogar` e `Opcoes`.
- O usuario precisa conseguir se cadastrar e fazer login para salvar configuracoes e mundos.
- A tela de mundos precisa listar mundos existentes do usuario e permitir criar e excluir mundos.
- Exclusao de mundo deve exigir confirmacao explicita e remover o registro de forma definitiva, sem soft delete.
- O primeiro mundo jogavel deve ser procedural.
- A escala do jogo deve considerar `1 bloco = 1m x 1m x 1m`.
- O mundo inicial deve ter dimensao logica de `5000 x 5000 x 100` blocos.
- A versao inicial nao inclui quebrar ou colocar blocos.
- O jogador deve controlar camera em primeira pessoa com cursor, mouse, `WASD` e `espaco`.
- O tamanho do mundo e um alvo logico; o cliente nao deve depender de carregar a area total de uma vez.

## PRDs Ativas

| ID | Titulo | Status | Dependencias | Resumo |
|----|--------|--------|--------------|--------|
| PRD-001 | Sistema de contas e persistencia base | Implementada | - | Cadastro, login, sessao e base para salvar configuracoes e catalogo de mundos por usuario. |
| PRD-002 | Menus principais e lobby de mundos | Implementada | PRD-001 | Fluxo autenticado com menu `MineWorld`, tela de mundos, criacao de novo mundo e exclusao definitiva com confirmacao. |
| PRD-003 | Mundo 3D procedural jogavel | Implementada | PRD-001, PRD-002 | Entrada em um mundo procedural 3D com renderer proprio em canvas, camera em primeira pessoa, movimento basico e carregamento sob demanda. |

## Fora do Escopo Atual

- Sistema de texturas completo
- Quebrar blocos
- Colocar blocos
- Multiplayer
- Inventario, crafting e mobs
- Conta social, recuperacao de senha e email transacional

## Backlog de Curto Prazo

- Definir o sistema de texturas para blocos
- Detalhar formato de persistencia de mundos gerados e alteracoes futuras
- Planejar quebrar/colocar blocos e salvamento de alteracoes locais
