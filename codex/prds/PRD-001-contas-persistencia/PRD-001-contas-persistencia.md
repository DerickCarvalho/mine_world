# PRD-001: Sistema de contas e persistencia base

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-001 |
| **Titulo** | Sistema de contas e persistencia base |
| **Tipo** | Nova funcionalidade |
| **Prioridade** | Alta |
| **Status** | Em validacao |
| **Data** | 17/03/2026 |
| **Autor** | Codex |
| **Dependencias** | Nao possui |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** criar a base de identidade e persistencia para sustentar menus, configuracoes e mundos salvos
- **Stack alvo:** HTML, CSS e JavaScript Vanilla no frontend; PHP 8.3.16 e MySQL quando houver necessidade de backend
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural aplicado:** seguir o desenho geral de `C:\laragon\www\dealer-gestao-modulos`, com `login.php`, `index.php?page=...`, `pages/`, `assets/js/paginas/`, `ENV` e `api/{dominio}/{acao}.php`

---

## Problema / Oportunidade

MineWorld precisa de um fluxo de entrada com cadastro e login para permitir que cada jogador tenha seus mundos e configuracoes vinculados a uma conta. Sem isso, o jogo pode ate abrir no navegador, mas nao existe base confiavel para guardar progresso, preferencias ou lista de mundos por usuario.

### Impacto Atual

- **Quem e afetado:** jogador e produto
- **Frequencia:** sempre
- **Consequencia:** impede persistencia real de configuracoes e mundos e bloqueia o fluxo autenticado do jogo

---

## Objetivo da Funcionalidade

Disponibilizar uma camada inicial de contas capaz de cadastrar usuario, autenticar login, manter sessao ativa e associar dados persistentes do jogador a essa identidade.

Essa base tambem deve preparar o caminho para o salvamento de configuracoes do cliente e do catalogo de mundos do usuario, mesmo que o conteudo detalhado do mundo evolua em PRDs futuras.

### Resultado Esperado para o Usuario

- Entrar no MineWorld por meio de cadastro e login simples
- Ter seus mundos associados a propria conta
- Recuperar configuracoes basicas entre sessoes

---

## Fluxo Atual

1. Nao existe cadastro.
2. Nao existe login.
3. Nao existe persistencia por usuario para configuracoes ou mundos.

## Fluxo Desejado

1. O visitante acessa `login.php`.
2. Ele escolhe entre cadastro e login.
3. O frontend chama endpoints de autenticacao via `ENV.API_BASE_URL`.
4. Ao autenticar com sucesso, o token de sessao e salvo no cliente.
5. O usuario entra na area autenticada em `index.php?page=menu`.
6. Seus dados de configuracao e catalogo de mundos passam a ficar vinculados a sua conta.

---

## Escopo Incluido

- Tela publica `login.php` com alternancia entre cadastro e login
- Criacao de conta com identificador unico
- Login com validacao de credenciais
- Sessao autenticada para uso do jogo
- Base de persistencia para configuracoes do jogador
- Base de persistencia para catalogo de mundos por usuario
- Endpoints dedicados em `api/login/` para cadastro, login, logout e validacao de sessao
- Uso de `ENV.API_BASE_URL` e wrapper compartilhado de requests para chamadas de autenticacao
- Persistencia do token de sessao no cliente para proteger o acesso as telas autenticadas

## Escopo Excluido

- Recuperacao de senha por email
- Login social
- Multiplayer e perfis publicos

---

## Requisitos Funcionais

### RF-01: Cadastro de usuario

**Descricao:** o sistema deve permitir criar uma conta nova para acessar o jogo.

**Regras de negocio:**
- O identificador principal do usuario deve ser unico.
- A senha deve ser armazenada de forma segura, nunca em texto puro.
- O cadastro bem-sucedido deve criar a estrutura minima de conta pronta para uso no jogo.

**Entrada:** nome de usuario e credenciais definidas pelo fluxo escolhido

**Saida esperada:** conta criada e pronta para autenticacao

---

### RF-02: Login de usuario

**Descricao:** o sistema deve autenticar um usuario existente e abrir o fluxo autenticado do jogo.

**Regras de negocio:**
- Credenciais invalidas devem retornar erro claro sem expor detalhes internos.
- Sessao autenticada deve ser reconhecida nas telas protegidas.
- Usuario autenticado nao deve precisar refazer login a cada transicao interna de tela.
- O fluxo deve sair de `login.php` e redirecionar o usuario para a area autenticada em `index.php?page=menu`.

**Entrada:** credenciais de acesso

**Saida esperada:** sessao autenticada valida

---

### RF-03: Persistencia de configuracoes do jogador

**Descricao:** o sistema deve guardar configuracoes basicas da conta para reutilizacao posterior.

**Regras de negocio:**
- Configuracoes salvas devem ficar vinculadas ao usuario autenticado.
- O sistema deve permitir leitura e atualizacao dessas configuracoes pelas telas futuras de opcoes.
- A ausencia de configuracoes previas deve gerar valores padrao utilizaveis.

**Entrada:** preferencias do jogador

**Saida esperada:** configuracoes persistidas e recuperaveis

---

### RF-04: Persistencia do catalogo de mundos

**Descricao:** o sistema deve armazenar os metadados minimos dos mundos criados por cada usuario.

**Regras de negocio:**
- Cada mundo deve possuir um dono.
- Devem existir metadados suficientes para listar, abrir e excluir o mundo.
- A exclusao definitiva do mundo deve remover seus registros vinculados.

**Entrada:** metadados do mundo, como nome e seed

**Saida esperada:** catalogo de mundos por usuario

---

### RF-05: Encerramento e retomada de sessao

**Descricao:** o sistema deve suportar sair da conta e reconhecer quando existe sessao valida.

**Regras de negocio:**
- Logout deve invalidar a sessao atual.
- Ao recarregar a aplicacao, o sistema deve detectar se o usuario ainda esta autenticado.
- Rotas ou telas protegidas nao devem abrir sem sessao valida.
- A camada cliente deve armazenar o token usando a chave definida em `ENV` e anexar esse token ao consumo da API.

**Entrada:** acao de logout ou carregamento da aplicacao

**Saida esperada:** estado correto de autenticacao

---

### RF-06: Contrato de API de autenticacao

**Descricao:** os endpoints novos de autenticacao devem seguir uma convencao previsivel para o frontend.

**Regras de negocio:**
- Os endpoints devem ficar em `api/login/{acao}.php`.
- O retorno JSON deve ser consistente e incluir pelo menos `status`, `message` e `data` quando aplicavel.
- Erros de autenticacao e autorizacao devem usar respostas distinguiveis pelo frontend.

**Entrada:** requisicoes do frontend autenticado ou publico

**Saida esperada:** integracao simples com wrapper compartilhado de request

---

## Requisitos Nao Funcionais

- **UX/UI:** cadastro e login devem ser simples, claros e sem etapas desnecessarias
- **Performance:** autenticacao e leitura dos dados basicos do usuario devem ocorrer sem atraso perceptivel para uso comum
- **Compatibilidade:** fluxo inicial suportado nos navegadores desktop modernos
- **Seguranca:** hash de senha, validacao de sessao, validacao de entrada e protecao basica contra abuso
- **Persistencia:** conta, configuracoes e catalogo de mundos devem sobreviver ao fechamento do navegador
- **Arquitetura:** a feature deve usar `login.php` como entrada publica, `index.php?page=...` como shell autenticado, `ENV` para configuracao de API e um wrapper compartilhado de request no frontend

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Usuario | identificar o jogador e proteger acesso | Sim |
| Configuracao do usuario | guardar preferencias do jogo | Sim |
| Mundo | associar mundos a um dono | Sim |
| Sessao autenticada | manter acesso ativo entre telas | Sim |

---

## Dependencias e Premissas

- O backend podera ser introduzido nesta frente porque a funcionalidade exige persistencia real por usuario
- As telas autenticadas seguintes passarao a depender desta base de conta
- A persistencia detalhada do conteudo do mundo pode evoluir em etapas futuras sem invalidar esta PRD
- O padrao herdado do projeto de referencia sera adaptado para MineWorld sem obrigar a camada 3D a depender de jQuery

---

## Riscos e Perguntas em Aberto

- Definir se o login usara email, nome de usuario ou ambos como credencial principal
- Definir o conjunto minimo de configuracoes que ja nasce na primeira versao de `Opcoes`
- Definir ate onde o registro inicial do mundo salva apenas metadados e seed, deixando alteracoes de blocos para depois

---

## Criterios de Aceite

1. [ ] O visitante consegue criar uma conta valida e autenticar no jogo.
2. [ ] O fluxo publico acontece em `login.php` e, apos login valido, redireciona para `index.php?page=menu`.
3. [ ] O sistema consegue salvar e recuperar configuracoes basicas por usuario.
4. [ ] O sistema consegue salvar e listar os mundos vinculados a cada conta.
5. [ ] Logout invalida a sessao e impede acesso direto as telas protegidas.
6. [ ] A integracao frontend -> autenticacao usa `ENV.API_BASE_URL`, token no cliente e endpoints em `api/login/`.

---

## Backlog Futuro Relacionado

- Recuperacao de senha
- Perfil de usuario mais completo
- Preparacao para multiplayer e identidade online

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-001-contas-persistencia.md](./PRD-TECNICA-001-contas-persistencia.md) |
| Tasks | [tasks/](./tasks/) |
