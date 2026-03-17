# PRD-TECNICA-002: Menus principais e lobby de mundos

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-002-menus-lobby.md](./PRD-002-menus-lobby.md) |
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

Ao final da PRD-001, o sistema devera contar com autenticacao base, shell protegido minimo, wrapper de request e tabelas de usuarios, configuracoes e mundos. Esta PRD tecnica expande essa fundacao para o fluxo principal autenticado do jogo.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `index.php` | Shell autenticado minimo | Modificar |
| `layout.php` | Estrutura global da area autenticada | Modificar |
| `pages/menu.php` | Placeholder inicial da PRD-001 | Modificar |
| `api/configuracoes/*.php` | Persistencia base de configuracoes | Reutilizar |
| `api/mundos/` | Ainda inexistente | Criar |

### Dependencias Tecnicas

- PRD-001 implementada ou disponivel para leitura tecnica
- Tabela `mundos` pronta no banco
- Helpers `ApiRequest.js`, `Loading.js` e `alert.js` disponiveis

---

## Solucao Tecnica Proposta

### Abordagem

Implementar a area autenticada do MineWorld como um pequeno shell roteado por query string, no estilo do projeto de referencia, mas com apresentacao de jogo e nao de dashboard. Cada tela importante tera um PHP server-rendered proprio e um script JS dedicado em `assets/js/paginas/`.

O backend de mundos seguira o padrao `api/mundos/{acao}.php` e sera responsavel por listar, criar, buscar e excluir mundos do usuario autenticado. A tela `Opcoes` consumira os endpoints de configuracao da PRD-001.

### Fluxo Tecnico

```text
index.php?page=menu -> pages/menu.php -> assets/js/paginas/menu.js
index.php?page=mundos -> pages/mundos.php -> assets/js/paginas/mundos.js -> api/mundos/*.php
index.php?page=opcoes -> pages/opcoes.php -> assets/js/paginas/opcoes.js -> api/configuracoes/*.php
```

### Decisoes Estruturais

- O shell autenticado tera rotas explicitas para `menu`, `mundos` e `opcoes`.
- A confirmacao de exclusao de mundo usara helper global de confirmacao.
- A criacao de mundo ja persistira `seed` e `algorithm_version`.
- `pages/mundos.php` deve expor o mundo selecionado de forma simples para a PRD-003 iniciar a transicao para a tela de jogo.

---

## Implementacao Detalhada

### Componente / Arquivo: roteador autenticado e layout

**Acao:** Modificar

**Responsabilidade tecnica:**
Expandir `index.php` e `layout.php` para suportar as novas rotas, aplicar estrutura visual do shell autenticado e organizar espacos para titulo da tela, acoes principais e area centralizada.

**Pontos de atencao:**
- O layout precisa servir tanto para paginas de menu quanto para a tela futura de jogo.
- O roteador deve ter fallback seguro para `menu`.

---

### Componente / Arquivo: paginas autenticadas

**Acao:** Criar / Modificar

**Responsabilidade tecnica:**
Criar ou ajustar:

- `pages/menu.php`
- `pages/mundos.php`
- `pages/opcoes.php`

Cada pagina tera sua marcacao HTML propria, mas deve compartilhar a mesma base de layout e carregar somente o JS necessario para seu fluxo.

**Pontos de atencao:**
- A interface deve ser centralizada e clara, mas sem herdar visual de painel administrativo.
- A pagina de mundos precisa suportar estado vazio.

---

### Componente / Arquivo: scripts de tela

**Acao:** Criar

**Responsabilidade tecnica:**
Criar:

- `assets/js/paginas/menu.js`
- `assets/js/paginas/mundos.js`
- `assets/js/paginas/opcoes.js`

Esses scripts devem gerenciar navegacao, fetch de dados, validacao simples, fluxo de criacao/exclusao de mundos e salvamento das configuracoes do usuario.

**Pontos de atencao:**
- Nao duplicar o wrapper de request nem helpers globais.
- `mundos.js` precisa manter estado do item selecionado.

---

### Componente / Arquivo: API de mundos

**Acao:** Criar

**Responsabilidade tecnica:**
Criar:

- `api/mundos/listar.php`
- `api/mundos/cadastrar.php`
- `api/mundos/buscar.php`
- `api/mundos/excluir.php`

`listar.php` retorna somente mundos do usuario autenticado. `cadastrar.php` gera seed quando ausente. `buscar.php` retorna os metadados minimos do mundo para a PRD-003. `excluir.php` remove o mundo em hard delete.

**Pontos de atencao:**
- Confirmar ownership do mundo em todos os endpoints.
- `excluir.php` deve remover somente o item do usuario autenticado.

---

### Componente / Arquivo: estilos de pagina

**Acao:** Criar

**Responsabilidade tecnica:**
Criar CSS especifico para login ja existente e novas paginas:

- `assets/css/custom/pages/menu.css`
- `assets/css/custom/pages/mundos.css`
- `assets/css/custom/pages/opcoes.css`

Esses estilos devem definir centralizacao, estados de selecao e modais/paineis leves.

**Pontos de atencao:**
- Manter consistencia visual entre as telas.
- Garantir legibilidade em desktop e responsividade minima.

---

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `mundos` | `id`, `usuario_id`, `nome`, `seed`, `algorithm_version`, `ultimo_jogado_em`, `criado_em`, `atualizado_em` | alimenta lobby e tela de jogo |
| `usuarios_configuracoes` | `usuario_id`, `render_distance`, `mouse_sensitivity`, `master_volume`, `invert_y` | lida na tela `Opcoes` |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Rota | `index.php?page=menu` | Menu principal |
| Rota | `index.php?page=mundos` | Lista e gestao de mundos |
| Rota | `index.php?page=opcoes` | Configuracoes do usuario |
| Endpoint | `api/mundos/listar.php` | Listar mundos do usuario |
| Endpoint | `api/mundos/cadastrar.php` | Criar novo mundo |
| Endpoint | `api/mundos/buscar.php` | Buscar metadados de um mundo |
| Endpoint | `api/mundos/excluir.php` | Excluir mundo definitivamente |
| Endpoint | `api/configuracoes/buscar.php` | Ler configuracoes |
| Endpoint | `api/configuracoes/salvar.php` | Salvar configuracoes |

### Regras de Integridade

- O frontend nunca deve listar ou excluir mundos de outro usuario.
- `seed` deve ser persistida no momento da criacao do mundo.
- O botao de exclusao so atua quando houver selecao ativa.
- A tela `Opcoes` deve operar sempre sobre o usuario autenticado.

---

## Requisitos de Performance e Escala

- A lista de mundos pode ser carregada inteira na primeira versao, sem paginacao.
- A navegacao entre `menu`, `mundos` e `opcoes` deve reaproveitar o shell e evitar recargas pesadas de recursos.
- Operacoes de criar e excluir mundo devem atualizar o estado visual sem exigir refresh manual.

---

## Seguranca e Validacoes

- Todos os endpoints de `api/mundos/` devem exigir token valido.
- O backend deve validar ownership antes de `buscar` e `excluir`.
- O nome do mundo deve ser validado em tamanho minimo e maximo.
- A tela de `Opcoes` nao deve permitir escrever configuracoes fora da faixa aceitavel.

---

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Shell autenticado virar um layout pesado demais para a tela de jogo | Medio | Manter layout modular e permitir variante enxuta para `page=jogo` depois |
| Estado selecionado da lista de mundos ficar inconsistente apos exclusao | Medio | Centralizar estado da pagina em `mundos.js` e recarregar lista apos mutacoes |
| Seed gerada no frontend e backend divergirem | Baixo | Gerar seed no backend quando nao enviada pelo cliente |

---

## Plano de Testes

- Navegacao autenticada entre `menu`, `mundos` e `opcoes`
- Criacao de mundo com seed automatica
- Exclusao definitiva com confirmacao e tentativa sem selecao
- Leitura e salvamento das configuracoes na tela `Opcoes`
- Tentativa de acessar mundo de outro usuario via `api/mundos/buscar.php`

---

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-configurar-roteador-layout.md) | Ajustar roteador autenticado e layout base das paginas | PRD-001 concluida |
| [TASK-002](./tasks/TASK-002-implementar-menu-principal.md) | Implementar a pagina principal `MineWorld` | TASK-001 |
| [TASK-003](./tasks/TASK-003-implementar-api-mundos.md) | Implementar endpoints de mundos | TASK-001 |
| [TASK-004](./tasks/TASK-004-implementar-tela-mundos.md) | Implementar lista, criacao e exclusao de mundos | TASK-002, TASK-003 |
| [TASK-005](./tasks/TASK-005-implementar-tela-opcoes.md) | Implementar `Opcoes` integrada a configuracoes | TASK-001 |

---

## Rollback

Remover as rotas autenticadas novas, excluir `api/mundos/` e restaurar o shell ao placeholder minimo da PRD-001. Como a persistencia de `mundos` ja nasce na PRD-001, o rollback desta PRD nao exige remover a tabela, apenas desativar seu uso pelo frontend e API.
