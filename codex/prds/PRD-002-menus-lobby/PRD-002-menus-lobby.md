# PRD-002: Menus principais e lobby de mundos

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-002 |
| **Titulo** | Menus principais e lobby de mundos |
| **Tipo** | Nova funcionalidade |
| **Prioridade** | Alta |
| **Status** | Em validacao |
| **Data** | 17/03/2026 |
| **Autor** | Codex |
| **Dependencias** | PRD-001 |

---

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** criar a navegacao principal do produto com identidade visual inspirada na leitura do Minecraft
- **Stack alvo:** HTML, CSS e JavaScript Vanilla
- **Ambiente de referencia:** Windows + Laragon em `C:\laragon\www\mine_world`
- **Padrao estrutural aplicado:** usar area autenticada no formato `index.php?page=...`, composicao em `layout.php` + `pages/` + `partials/`, scripts em `assets/js/paginas/` e API em `api/{dominio}/{acao}.php`

---

## Problema / Oportunidade

Mesmo com autenticacao pronta, o jogo precisa de uma experiencia inicial clara para orientar o jogador entre entrar em um mundo, ajustar preferencias e gerenciar seus saves. Sem um menu principal bem definido e uma tela de mundos objetiva, o usuario nao enxerga o produto como um jogo jogavel.

### Impacto Atual

- **Quem e afetado:** jogador
- **Frequencia:** sempre
- **Consequencia:** falta de navegacao clara entre login, jogo, opcoes e gerenciamento de mundos

---

## Objetivo da Funcionalidade

Entregar o conjunto de telas e interacoes iniciais do MineWorld apos o login: menu principal, tela de selecao de mundos, criacao de novo mundo, exclusao definitiva com confirmacao e tela de opcoes.

A direcao de produto e transmitir uma experiencia familiar a quem conhece Minecraft, sem exigir clonagem visual literal. O foco e legibilidade, centralizacao dos elementos principais e fluxo direto.

### Resultado Esperado para o Usuario

- Enxergar imediatamente o nome `MineWorld` e as opcoes principais ao entrar
- Conseguir navegar para seus mundos com poucos cliques
- Criar e excluir mundos com seguranca e clareza

---

## Fluxo Atual

1. Nao existe menu principal autenticado.
2. Nao existe tela de mundos.
3. Nao existe fluxo de criacao ou exclusao de mundo.

## Fluxo Desejado

1. O usuario faz login em `login.php`.
2. O sistema redireciona para `index.php?page=menu`.
3. O menu principal exibe o titulo `MineWorld` e botoes centralizados `Jogar` e `Opcoes`.
4. Ao clicar em `Jogar`, o usuario navega para `index.php?page=mundos`.
5. Nessa tela, ele pode selecionar um mundo existente, criar um novo mundo ou excluir o selecionado.
6. Se tentar excluir, o sistema pede confirmacao explicita antes de remover.
7. Ao clicar em `Opcoes`, o usuario acessa `index.php?page=opcoes`.

---

## Escopo Incluido

- Menu principal autenticado com marca `MineWorld`
- Botoes centralizados `Jogar` e `Opcoes`
- Tela de lista de mundos do usuario
- Acao de criar novo mundo
- Acao de excluir mundo selecionado com confirmacao obrigatoria
- Navegacao entre menu principal, lista de mundos e opcoes
- Rotas autenticadas em `index.php?page=menu`, `index.php?page=mundos` e `index.php?page=opcoes`
- Scripts de tela em `assets/js/paginas/` e helpers globais para loading, sucesso, erro e confirmacao
- Consumo de API de mundos via wrapper compartilhado, usando `ENV.API_BASE_URL`

## Escopo Excluido

- Editor avancado de configuracoes graficas
- Busca, filtro ou ordenacao complexa de mundos
- Duplicar, exportar ou compartilhar mundos

---

## Requisitos Funcionais

### RF-01: Menu principal autenticado

**Descricao:** apos o login, o sistema deve exibir a tela principal do jogo com o nome `MineWorld` e opcoes centrais.

**Regras de negocio:**
- O menu principal so deve abrir para usuario autenticado.
- As opcoes iniciais visiveis devem ser `Jogar` e `Opcoes`.
- A hierarquia visual deve destacar o nome do jogo acima das acoes.
- A tela deve existir como rota protegida do roteador principal em `index.php?page=menu`.

**Entrada:** sessao autenticada valida

**Saida esperada:** menu principal visivel e pronto para navegacao

---

### RF-02: Acesso a lista de mundos

**Descricao:** ao clicar em `Jogar`, o sistema deve abrir a tela com os mundos do usuario.

**Regras de negocio:**
- A lista deve exibir mundos existentes quando houver.
- Se nao houver mundos, a tela deve continuar funcional e orientar a criacao de um novo.
- O usuario deve conseguir selecionar um unico mundo por vez.
- A tela deve existir como rota protegida em `index.php?page=mundos`.

**Entrada:** clique em `Jogar`

**Saida esperada:** tela de mundos aberta com estado coerente

---

### RF-03: Criacao de novo mundo

**Descricao:** a tela de mundos deve permitir criar um novo mundo.

**Regras de negocio:**
- O fluxo deve coletar no minimo um nome para o mundo.
- O sistema pode aceitar seed opcional; se nao houver seed manual, deve gerar uma automaticamente.
- O mundo criado deve ficar vinculado ao usuario autenticado e aparecer na lista apos a criacao.
- O frontend deve executar esse fluxo pelo padrao de request compartilhado para endpoints novos em `api/mundos/`.

**Entrada:** acao `Criar novo mundo`

**Saida esperada:** novo mundo criado e listado

---

### RF-04: Exclusao definitiva de mundo

**Descricao:** o usuario deve conseguir excluir um mundo selecionado.

**Regras de negocio:**
- O botao de exclusao so deve ficar habilitado quando houver um mundo selecionado.
- A exclusao deve pedir confirmacao explicita antes de executar.
- A remocao deve ser definitiva, sem soft delete.
- A confirmacao deve seguir o padrao de helper global de alerta/confirmacao adotado pelo frontend.

**Entrada:** selecao de mundo + confirmacao de exclusao

**Saida esperada:** mundo removido da lista e do armazenamento

---

### RF-05: Tela de opcoes

**Descricao:** o menu principal deve abrir uma tela de opcoes para configuracoes iniciais do jogo.

**Regras de negocio:**
- A tela precisa ter caminho claro de retorno ao menu principal.
- As opcoes exibidas devem ser compativeis com a persistencia definida em PRD-001.
- Caso alguma configuracao ainda nao exista tecnicamente, ela nao deve aparecer como funcional sem suporte real.
- A tela deve existir como rota protegida em `index.php?page=opcoes`.

**Entrada:** clique em `Opcoes`

**Saida esperada:** tela de configuracoes aberta

---

## Requisitos Nao Funcionais

- **UX/UI:** layout centralizado, leitura imediata, inspiracao no fluxo de Minecraft e responsividade minima para telas menores
- **Performance:** transicoes entre telas sem recarga pesada da aplicacao
- **Compatibilidade:** navegadores desktop modernos
- **Seguranca:** telas e dados protegidos por sessao autenticada
- **Persistencia:** mundos e configuracoes exibidos devem refletir os dados reais da conta logada
- **Arquitetura:** menus e lobby devem respeitar o shell PHP do projeto de referencia, com `layout.php`, `pages/`, `assets/js/paginas/`, `ENV` e consumo de `api/mundos/{acao}.php`

---

## Dados e Persistencia

| Entidade / Dado | Finalidade | Persistencia obrigatoria? |
|-----------------|------------|---------------------------|
| Mundo | listar, criar, selecionar e excluir saves | Sim |
| Configuracao do usuario | alimentar tela de opcoes | Sim |
| Estado de selecao em tela | habilitar acoes corretas no lobby | Nao |

---

## Dependencias e Premissas

- A autenticacao da PRD-001 deve existir para garantir o dono da lista de mundos
- O modelo minimo de mundo deve suportar nome, seed e identificador unico
- A tela de `Opcoes` pode nascer enxuta, desde que tenha utilidade real e persistencia definida
- O shell visual pode seguir o padrao do projeto de referencia sem copiar seu visual de painel administrativo

---

## Riscos e Perguntas em Aberto

- Definir o conjunto inicial exato da tela `Opcoes`
- Definir se a lista de mundos tera preview visual ou apenas informacoes textuais na primeira versao
- Definir se o fluxo de criar mundo pede seed em campo livre ou em etapa opcional expandida

---

## Criterios de Aceite

1. [ ] Usuario autenticado visualiza `index.php?page=menu` com `MineWorld`, `Jogar` e `Opcoes` centralizados.
2. [ ] Ao clicar em `Jogar`, o usuario acessa `index.php?page=mundos` com a lista da propria conta.
3. [ ] O fluxo `Criar novo mundo` cria e exibe um novo mundo na lista.
4. [ ] O fluxo `Excluir mundo` exige confirmacao e remove definitivamente o mundo selecionado.
5. [ ] A tela `Opcoes` abre corretamente em `index.php?page=opcoes` e permite retorno ao menu principal.
6. [ ] As operacoes de mundos usam o padrao de API compartilhada e feedback visual consistente.

---

## Backlog Futuro Relacionado

- Preview visual de mundo
- Mais opcoes graficas e de controle
- Favoritos, filtros e ordenacao de saves

---

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tecnica | [PRD-TECNICA-002-menus-lobby.md](./PRD-TECNICA-002-menus-lobby.md) |
| Tasks | [tasks/](./tasks/) |
