# PRD-004: Refino de gameplay, pausa e persistencia de mundo

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-004 |
| **Titulo** | Refino de gameplay, pausa e persistencia de mundo |
| **Tipo** | Melhoria |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 17/03/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-003 |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** transformar a primeira cena jogavel em um loop mais natural, estavel e persistente entre sessoes
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL quando houver necessidade de backend
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural obrigatorio:** basear front + API no modelo de `C:\laragon\www\dealer-gestao-modulos`

---

## Padrao de Front + API Aplicavel

- **Entrada publica:** `login.php`
- **Area autenticada:** `index.php?page=...`
- **Composicao de UI:** `layout.php`, `pages/`, `partials/`
- **Scripts por tela:** `assets/js/paginas/`
- **Configuracao frontend:** `env.default.js` e `env.deploy.js` com objeto global `ENV`
- **API:** `api/{dominio}/{acao}.php`
- **Cliente HTTP:** wrapper compartilhado no estilo `ApiRequest.js`
- **Sessao no cliente:** token em `localStorage`
- **Feedback visual:** helpers compartilhados de loading, sucesso, erro e confirmacao
- **Observacao:** o runtime do jogo continua em JS Vanilla, mesmo quando a persistencia e o shell web seguirem o padrao front + API acima

---

## Problema / Oportunidade

A primeira versao jogavel da PRD-003 abriu o mundo procedural, mas ainda tem atritos centrais para a experiencia de jogo: a locomocao nao transmite claramente que o corpo do jogador acompanha a direcao da camera, o runtime apresenta travamentos perceptiveis, nao existe menu de pausa in-game e a sessao do mundo nao persiste o ponto onde o jogador parou.

Sem esse refinamento, o jogo ja abre e anda, mas ainda nao sustenta um loop de exploracao confiavel. O jogador perde contexto ao sair, nao tem um caminho controlado para interromper a partida e percebe a cena como menos responsiva do que deveria.

### Impacto Atual

- **Quem e afetado:** jogador e produto
- **Frequencia:** sempre que entra em um mundo
- **Consequencia:** atrito na exploracao, perda de continuidade entre sessoes e sensacao de prototipo ainda instavel

---

## Objetivo da Funcionalidade

Entregar o segundo passo do runtime de jogo com foco em sensacao de controle, continuidade e confiabilidade. A locomocao deve seguir de forma clara a orientacao da camera, a exploracao precisa ficar mais estavel, e o jogador deve conseguir pausar, retomar e sair do mundo sem perder o estado relevante da partida.

Essa PRD tambem introduz a primeira camada real de persistencia de sessao do mundo. Ao escolher `Salvar e sair`, o sistema deve gravar o estado persistivel da sessao atual e devolver o usuario ao menu principal. Quando esse mesmo mundo for reaberto, o spawn deve ocorrer no ultimo ponto salvo, e nao mais no spawn procedural inicial.

### Resultado Esperado para o Usuario

- Mover-se na direcao que esta olhando, com leitura mais natural do corpo e da camera
- Controlar a camera com mouse em leitura natural, olhando para cima ao subir o mouse e para baixo ao descer o mouse
- Explorar a area inicial com menos travamentos e menos picos de carga perceptiveis
- Pausar a partida com `P`, retomar quando quiser ou salvar e sair com seguranca
- Reabrir o mesmo mundo e voltar ao ponto em que parou

---

## Fluxo Atual

1. O usuario abre um mundo procedural e entra sempre no spawn inicial.
2. O runtime ainda apresenta atrito de leitura no movimento e travamentos perceptiveis.
3. Nao existe menu de pausa nem fluxo formal de salvar e sair.
4. Ao deixar o mundo, o jogador perde o ponto em que parou.

## Fluxo Desejado

1. O usuario entra em um mundo e movimenta o personagem em coerencia com a direcao da camera.
2. O usuario move o mouse e a camera responde de forma natural, sem inversao por padrao.
3. A exploracao inicial roda com menos travamentos e atualizacoes mais controladas.
4. Ao pressionar `P`, o jogo abre um menu de pausa e interrompe de fato a simulacao da gameplay.
5. No menu de pausa, o usuario pode escolher `Retornar ao jogo` ou `Salvar e sair`.
6. Em `Salvar e sair`, o sistema persiste o estado do mundo e do jogador, entao redireciona ao menu principal.
7. Ao abrir novamente esse mundo, o jogador renasce no ultimo ponto salvo da sessao.

---

## Escopo Incluido

- Refino da locomocao para seguir a orientacao horizontal da camera
- Correcao do controle de camera para comportamento natural do mouse, sem inversao por padrao
- Revisao de performance do runtime atual, com foco em reduzir travamentos perceptiveis
- Menu de pausa in-game acionado por `P`
- Pausa real da simulacao e do input de gameplay enquanto o menu estiver aberto
- Acao `Retornar ao jogo`
- Acao `Salvar e sair`, com retorno ao menu principal
- Persistencia do ultimo estado salvo do jogador no mundo, incluindo posicao e orientacao
- Estrutura de persistencia do estado do mundo orientada ao que a versao atual realmente modifica e precisa reabrir
- Reentrada no mundo a partir do ultimo ponto salvo, com fallback para spawn seguro apenas quando nao houver estado persistido

## Escopo Excluido

- Novas mecanicas de quebrar ou colocar blocos
- Sistema final de texturas
- Multiplayer ou sincronizacao em tempo real
- Historico de saves, multiplos checkpoints ou rollback manual

---

## Requisitos Funcionais

### RF-01: Movimento alinhado a camera

**Descricao:** a locomocao do jogador deve respeitar a orientacao horizontal atual da camera.

**Regras de negocio:**
- Ao pressionar `W`, o personagem deve avancar para a frente relativa da camera.
- Ao pressionar `S`, o personagem deve recuar na direcao oposta da camera.
- `A` e `D` devem strafar lateralmente em relacao ao angulo da camera.
- Girar a camera antes ou durante o deslocamento deve alterar a direcao de movimento de forma coerente.

**Entrada:** movimento de mouse + teclas `WASD`

**Saida esperada:** deslocamento natural e legivel em primeira pessoa

---

### RF-02: Controle natural da camera com mouse

**Descricao:** o movimento do mouse deve controlar a camera com leitura natural por padrao.

**Regras de negocio:**
- Mover o mouse para cima deve fazer a camera olhar para cima por padrao.
- Mover o mouse para baixo deve fazer a camera olhar para baixo por padrao.
- O controle horizontal da camera deve permanecer coerente com o deslocamento lateral do mouse.
- Caso exista configuracao de inverter eixo vertical, ela deve ser tratada como opcional e nunca como comportamento padrao.

**Entrada:** movimento de mouse

**Saida esperada:** camera mais intuitiva e consistente com a expectativa padrao de primeira pessoa

---

### RF-03: Melhoria perceptivel de performance

**Descricao:** a exploracao inicial do mundo deve ficar mais estavel do que na versao atual.

**Regras de negocio:**
- O runtime nao deve recalcular ou redesenhar desnecessariamente todo o mundo a cada frame.
- A carga de chunks, a malha visual e o pipeline de render devem operar com orcamento controlado.
- O jogador deve perceber reducao clara de travamentos ao explorar a area inicial.
- O sistema pode simplificar tecnicamente partes internas do runtime desde que preserve o comportamento de produto esperado.

**Entrada:** exploracao normal do mundo a partir do spawn

**Saida esperada:** experiencia mais fluida e previsivel na area jogavel inicial

---

### RF-04: Menu de pausa com tecla P

**Descricao:** ao pressionar `P`, o sistema deve abrir um menu de pausa in-game.

**Regras de negocio:**
- A tecla `P` deve alternar o estado de pausa enquanto o jogador estiver na tela de jogo.
- O menu de pausa deve oferecer ao menos `Retornar ao jogo` e `Salvar e sair`.
- Enquanto pausado, a simulacao da gameplay deve parar de fato.
- O menu deve capturar a atencao do usuario sem encerrar a partida atual.

**Entrada:** tecla `P`

**Saida esperada:** menu de pausa aberto com a partida suspensa

---

### RF-05: Retomar e salvar/sair a partir do pause

**Descricao:** o menu de pausa deve permitir continuar a partida ou sair dela com persistencia.

**Regras de negocio:**
- `Retornar ao jogo` fecha o menu e devolve o controle da gameplay.
- `Salvar e sair` deve persistir o estado necessario antes de redirecionar.
- O redirecionamento apos `Salvar e sair` deve levar o usuario ao menu principal `index.php?page=menu`.
- Em caso de falha no salvamento, o usuario nao deve ser redirecionado silenciosamente sem feedback.

**Entrada:** clique em `Retornar ao jogo` ou `Salvar e sair`

**Saida esperada:** retomada da partida ou saida segura com salvamento concluido

---

### RF-06: Retomar do ultimo ponto salvo

**Descricao:** ao reabrir um mundo salvo, o jogador deve surgir no ultimo ponto persistido da partida.

**Regras de negocio:**
- O estado salvo deve incluir no minimo posicao e orientacao do jogador.
- Se houver estado persistido valido, ele deve prevalecer sobre o spawn procedural inicial.
- Se nao houver estado salvo, o jogo continua usando o spawn seguro procedural.
- O sistema de persistencia deve nascer preparado para armazenar o estado mutavel relevante do mundo a cada evolucao real da gameplay.

**Entrada:** abertura de um mundo existente que ja tenha sido salvo

**Saida esperada:** retomada da partida no ponto em que o usuario parou

---

## Requisitos Nao Funcionais

- **UX/UI:** o pause menu deve ser simples, claro e visualmente coerente com a HUD atual, sem poluir a tela
- **Controles:** a camera deve responder ao mouse de forma intuitiva por padrao, sem exigir adaptacao a eixo invertido
- **Performance:** a exploracao inicial deve reduzir travamentos perceptiveis; carga, malha e render precisam operar de forma incremental
- **Compatibilidade:** navegadores desktop modernos com teclado e mouse
- **Seguranca:** o estado salvo de um mundo deve respeitar ownership do usuario autenticado
- **Persistencia:** o mundo precisa voltar com o ultimo estado salvo relevante da sessao, principalmente posicao/orientacao do jogador
- **Arquitetura:** o fluxo deve respeitar `index.php?page=...`, `pages/`, `assets/js/paginas/`, `api/{dominio}/{acao}.php`, `ENV` e o wrapper compartilhado de request

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Estado salvo do jogador | restaurar posicao e orientacao ao reabrir o mundo | Sim |
| Estado salvo do mundo | manter a sessao consistente ao sair e voltar | Sim |
| Metadados de salvamento | registrar quando e como o save foi atualizado | Sim |
| Estado temporario de pausa | controlar a sessao atual em memoria | Nao |

---

## Dependencias e Premissas

- A PRD-003 precisa continuar sendo a base do runtime jogavel
- O backend deve passar a aceitar persistencia de estado de mundo por usuario e por save
- O save desta fase precisa cobrir o estado realmente relevante da versao atual e deixar caminho claro para futuras mutacoes do mapa
- A saida por `Salvar e sair` deve acontecer apenas depois de o estado persistivel ser tratado com sucesso ou erro controlado

---

## Riscos e Perguntas em Aberto

- Definir o formato inicial do estado salvo do mundo para nao gerar retrabalho quando entrarem mutacoes de bloco
- Balancear ganho de performance sem descaracterizar o relevo e a leitura do terreno atual
- Definir o comportamento exato de pointer lock, HUD e atalhos quando o jogo entra e sai de pausa

---

## Criterios de Aceite

1. [ ] O jogador passa a se mover de forma coerente com a orientacao horizontal da camera.
2. [ ] O mouse controla a camera em leitura natural por padrao, sem inversao vertical inesperada.
3. [ ] A exploracao inicial ao redor do spawn apresenta reducao clara de travamentos perceptiveis em relacao a versao atual.
4. [ ] Pressionar `P` abre um menu de pausa e interrompe de fato a simulacao da gameplay.
5. [ ] O menu de pausa oferece `Retornar ao jogo` e `Salvar e sair`.
6. [ ] `Salvar e sair` persiste o estado necessario da sessao e redireciona ao menu principal.
7. [ ] Reabrir o mesmo mundo faz o jogador surgir no ultimo ponto salvo, e nao no spawn inicial, quando houver estado persistido valido.
8. [ ] Em caso de falha no save, o usuario recebe feedback claro e nao perde o contexto silenciosamente.

---

## Backlog Futuro Relacionado

- Autosave periodico de sessao
- Persistencia de mutacoes de terreno quando quebrar/colocar blocos entrar na gameplay
- Menu completo de pausa com configuracoes in-game

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](./PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| Tasks | [tasks/](./tasks/) |
