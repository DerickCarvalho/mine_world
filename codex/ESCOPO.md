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
- PRD-004 implementada: locomocao alinhada a camera, controle natural do mouse, pausa com `P`, `Salvar e sair` e retomada no ultimo ponto salvo.
- PRD-005 implementada: mao em primeira pessoa, hotbar/inventario simples, quebrar/colocar blocos, superficie com arvores/agua/areia/pedra e nevoa de distancia.
- PRD-006 implementada: cache persistente de chunks, pre-geracao inicial, HUD contextual, configuracoes em runtime e camada de bedrock.
- PRD-007 implementada: sistema de texturas por bloco, CRUD de comandos, chat in-game com teleporte, primeiro mob gato e pipeline de render mais leve.
- PRD-008 implementada: HUD de sobrevivencia refinado, voo estavel, audio sintetizado, cache dormant de chunks e worldgen 2.0.
- PRD-009 implementada: worldgen 3.0 com serras/rios suaves, HUD inferior mais proximo do Minecraft e fix do travamento do gato.
- PRD-010 implementada: held item no lugar da mao, inventario 3D coerente com o mundo, worldgen 3.5 e escala/fisica do player revisadas.
- Proxima frente apos PRD-010: crafting, progressao sandbox mais completa e expansao do sistema de comandos.

## Regras de Produto Consolidadas

- O menu principal autenticado deve exibir o nome `MineWorld` e opcoes centralizadas na tela.
- As opcoes iniciais do menu principal sao `Jogar` e `Opcoes`.
- O usuario precisa conseguir se cadastrar e fazer login para salvar configuracoes e mundos.
- A tela de mundos precisa listar mundos existentes do usuario e permitir criar e excluir mundos.
- Exclusao de mundo deve exigir confirmacao explicita e remover o registro de forma definitiva, sem soft delete.
- O primeiro mundo jogavel deve ser procedural.
- A escala do jogo deve considerar `1 bloco = 1m x 1m x 1m`.
- O mundo inicial deve ter dimensao logica de `2000 x 2000 x 100` blocos.
- O jogador deve controlar camera em primeira pessoa com cursor, mouse, `WASD` e `espaco`.
- O movimento na gameplay deve seguir a orientacao horizontal da camera.
- O mouse deve controlar a camera com leitura natural por padrao, sem inversao vertical inesperada.
- A tecla `P` deve abrir o menu de pausa e suspender de fato a gameplay.
- `Salvar e sair` deve persistir o estado necessario do mundo e do jogador antes de retornar ao menu principal.
- Ao reabrir um mundo salvo, o jogador deve nascer no ultimo ponto persistido valido.
- A gameplay deve exibir o item selecionado da hotbar como held item em primeira pessoa, sem mao visivel.
- A gameplay deve oferecer hotbar de 9 slots e inventario simples de 27 slots para blocos.
- Itens da hotbar e do inventario devem usar icones 3D coerentes com a textura/cor do mundo.
- O jogador deve conseguir quebrar e colocar blocos dentro de um alcance controlado.
- O jogador deve iniciar sem kit basico e coletar blocos a partir da quebra do mundo.
- O estado salvo do mundo deve poder refletir inventario e mutacoes do terreno.
- A geracao procedural deve incluir arvores, agua, areia proxima da agua e pedra aparente na superficie.
- A cena deve aplicar nevoa para mascarar melhor a distancia e a borda visual do mapa.
- Coordenadas devem aparecer somente quando o jogador alternar a visualizacao com `C`.
- Dados do mundo devem aparecer somente no menu aberto por `P`.
- Configuracoes devem poder ser editadas durante a gameplay com aplicacao automatica.
- O mundo deve persistir chunks geradas e reaproveita-las em entradas futuras.
- Ao criar um mundo novo, uma janela inicial de chunks deve ser pre-gerada antes do spawn.
- A camada mais profunda do mapa deve ser formada por `bedrock` inquebravel.
- O menu principal deve oferecer acesso ao CRUD de texturas e ao CRUD de comandos.
- Cada bloco atual deve poder receber textura opcional de topo, laterais e fundo com arquivos de ate `5 KB`.
- Na ausencia de textura cadastrada, o bloco deve continuar usando sua cor base.
- O jogo deve oferecer chat in-game aberto por `T`.
- Mensagens iniciadas com `/` devem ser tratadas como comandos cadastrados e validados.
- O primeiro comando suportado via chat deve ser `teleporte`.
- O mundo deve poder spawnar um primeiro mob gato com baixa frequencia perto do jogador em area de mata.
- O clique direito no gato deve alternar entre seguir o jogador e voltar ao comportamento normal.
- A HUD inferior deve manter vida e estado de fly acima da hotbar central, em leitura mais proxima do Minecraft.
- O modo fly deve respeitar colisao, usando `espaco` para subir e `Shift` para descer quando ativo.
- O jogo deve emitir audio para dano, passos, hit de gato, quebrar bloco e colocar bloco.
- Chunks distantes devem sair do runtime ativo e voltar por snapshot reaproveitado quando revisitadas.
- Mundos novos devem nascer em `algorithm_version = v3.5`.
- O relevo montanhoso atual deve priorizar serras e encostas suaves, e os rios devem ser rasos e largos, sem visual de canyon.
- A geracao procedural `v3.5` deve reduzir crateras artificiais, suavizar cavernas e oferecer ao menos carvalho e eucalipto.
- O gato nao pode travar a simulacao ao spawnar ou entrar em cena.
- O player deve ter `1.95` blocos de altura, corpo mais fino e locomocao mais agil.

## PRDs Ativas

| ID | Titulo | Status | Dependencias | Resumo |
|----|--------|--------|--------------|--------|
| PRD-001 | Sistema de contas e persistencia base | Implementada | - | Cadastro, login, sessao e base para salvar configuracoes e catalogo de mundos por usuario. |
| PRD-002 | Menus principais e lobby de mundos | Implementada | PRD-001 | Fluxo autenticado com menu `MineWorld`, tela de mundos, criacao de novo mundo e exclusao definitiva com confirmacao. |
| PRD-003 | Mundo 3D procedural jogavel | Implementada | PRD-001, PRD-002 | Entrada em um mundo procedural 3D com renderer proprio em canvas, camera em primeira pessoa, movimento basico e carregamento sob demanda. |
| PRD-004 | Refino de gameplay, pausa e persistencia de mundo | Implementada | PRD-003 | Refinar locomocao e camera, reduzir travamentos, adicionar pause menu com `P`, salvar/sair e retomada no ultimo ponto salvo. |
| PRD-005 | Loop sandbox com inventario e superficie viva | Implementada | PRD-004 | Adicionar mao em primeira pessoa, hotbar/inventario simples, quebrar/colocar blocos, enriquecer a superficie procedural e aplicar nevoa de distancia. |
| PRD-006 | Cache de chunks, HUD contextual e refinamento in-game | Implementada | PRD-004, PRD-005 | Persistir chunks por mundo, pre-gerar a janela inicial, mover HUD tecnica para atalhos/contexto, permitir configuracoes em runtime e proteger a base com bedrock. |
| PRD-007 | Texturas, comandos, chat e primeiro mob | Implementada | PRD-005, PRD-006 | Adicionar texturas opcionais por bloco, CRUD de comandos com validacao local, chat in-game com teleporte, primeiro gato e reducao do custo de render. |
| PRD-008 | Survival HUD, audio e worldgen 2.0 | Implementada | PRD-006, PRD-007 | Refinar mao e HUD, estabilizar fly, adicionar audio sintetizado, descarregar chunks com cache dormant e evoluir a geracao procedural para biomas mais naturais. |
| PRD-009 | Worldgen 3.0, HUD Minecraft-like e fix do gato | Implementada | PRD-008 | Substituir o algoritmo por `v3` para novos mundos, suavizar serras e rios, aproximar o HUD da referencia visual alvo e remover o travamento do gato. |
| PRD-010 | Held item, inventario 3D e worldgen 3.5 | Implementada | PRD-009 | Remover a mao visivel, reaproveitar as texturas do mundo nos itens da UI, migrar novos mundos para `v3.5` e revisar escala/fisica do player. |

## Fora do Escopo Atual

- Multiplayer
- Crafting, fornalha e ferramentas completas
- Conta social, recuperacao de senha e email transacional

## Backlog de Curto Prazo

- Expandir o catalogo de comandos validaveis alem de teleporte e fly
- Planejar persistencia e interacoes mais ricas para mobs
- Planejar progressao sandbox depois do primeiro loop de construcao persistente