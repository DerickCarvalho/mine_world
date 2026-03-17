# PRD-TECNICA-001: Sistema de contas e persistencia base

## Referencia

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-001-contas-persistencia.md](./PRD-001-contas-persistencia.md) |
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

O repositorio do MineWorld ainda nao possui aplicacao web implementada. No estado atual existem apenas `README.md` e a documentacao em `codex/`, o que significa que esta PRD tecnica precisa definir a fundacao completa de frontend shell, API, autenticacao e persistencia inicial.

### Arquivos e Modulos Relevantes

| Arquivo / Modulo | Papel atual | Impacto esperado |
|------------------|-------------|------------------|
| `README.md` | Descricao minima do projeto | Sem impacto direto |
| `codex/ESCOPO.md` | Escopo consolidado do produto | Referencia documental |
| `codex/prds/PRD-001-contas-persistencia/PRD-001-contas-persistencia.md` | Escopo de produto da frente | Referencia documental |

### Dependencias Tecnicas

- PHP 8.3.16 com extensao PDO MySQL
- MySQL ou MariaDB local via Laragon
- Fetch API nativa no navegador
- `localStorage` para token de sessao

### Credenciais Locais Confirmadas

- **Banco local:** `mineworld_db`
- **Usuario local assumido:** `root`
- **Senha local informada:** `Senha123#`
- **Observacao:** o banco sera criado pelo usuario; a aplicacao deve apontar para esse nome por padrao na configuracao local

---

## Solucao Tecnica Proposta

### Abordagem

Criar uma base de aplicacao PHP server-rendered com shell simples, mas organizada no mesmo padrao de front + API do projeto de referencia. O frontend fica distribuido em paginas PHP e scripts Vanilla JS por tela, enquanto a API PHP exposta em `api/` responde em JSON para cadastro, login, validacao de sessao e persistencia de configuracoes.

Para autenticacao, a abordagem escolhida e JWT stateless armazenado no cliente. Isso preserva o fluxo parecido com o projeto de referencia, evita dependencia em sessao PHP para a fase inicial e simplifica a integracao com o wrapper de request compartilhado.

As configuracoes do usuario e o catalogo de mundos serao persistidos em banco desde a fundacao, mesmo que o uso intensivo desses dados aconteca nas PRDs seguintes. Isso evita retrabalho estrutural e garante que os menus e o jogo 3D possam nascer sobre uma base real.

### Fluxo Tecnico

```text
login.php -> assets/js/paginas/login.js -> ApiRequest -> api/login/*.php -> PDO/MySQL
                                                       -> localStorage token

index.php?page=... -> auth bootstrap -> api/login/validar.php -> libera shell autenticado
                                                         -> api/configuracoes/*.php
```

### Decisoes Estruturais

- O wrapper `assets/js/ApiRequest.js` sera implementado com `fetch`, nao com jQuery.
- O token sera enviado em `Authorization: Bearer <token>`.
- O contrato JSON dos endpoints novos deve ser padronizado como `{ "status": "...", "message": "...", "data": ... }`.
- O banco ja nascera com tabelas para usuarios, configuracoes e mundos.

---

## Implementacao Detalhada

### Componente / Arquivo: shell base de frontend

**Acao:** Criar

**Responsabilidade tecnica:**
Criar `login.php`, `index.php`, `layout.php`, `partials/` minimos, `env.default.js`, `env.deploy.js`, CSS global e helpers JS compartilhados para que as proximas PRDs possam reutilizar a mesma estrutura.

**Pontos de atencao:**
- `index.php` deve negar acesso sem token valido.
- O shell deve ser neutro o bastante para receber menus e jogo sem acoplamento visual desnecessario.

---

### Componente / Arquivo: camada de request e sessao no cliente

**Acao:** Criar

**Responsabilidade tecnica:**
Implementar `assets/js/ApiRequest.js`, `assets/js/auth.js`, `assets/js/Loading.js` e `assets/js/alert.js` para centralizar chamadas HTTP, envio de token, tratamento de erro 401, estado de carregamento e mensagens globais.

**Pontos de atencao:**
- O wrapper precisa suportar `GET`, `POST`, `PUT` e `DELETE` mesmo que a fase inicial use principalmente `GET` e `POST`.
- O cliente deve remover token invalido e redirecionar para `login.php` quando apropriado.

---

### Componente / Arquivo: PDO, auth e utilitarios de backend

**Acao:** Criar

**Responsabilidade tecnica:**
Criar `api/dependencias/config.php`, `api/dependencias/pdo/conexao.php`, `api/dependencias/pdo/funcoesPDO.php`, `api/dependencias/auth/jwt_helper.php`, `api/dependencias/auth/require_auth.php` e `api/dependencias/utils.php` para unificar configuracao local, conexao, execucao parametrizada e validacao de token.

**Pontos de atencao:**
- Todas as consultas devem usar prepared statements.
- O helper de auth precisa expor leitura do token a partir do header `Authorization`.
- A configuracao local deve apontar por padrao para `mineworld_db` com senha `Senha123#`.

---

### Componente / Arquivo: migrations e bootstrap de banco

**Acao:** Criar

**Responsabilidade tecnica:**
Criar `api/database/migrate.php` e a pasta `api/database/migrations/` com migrations sequenciais para:

- `0000_create_migrations_table.php`
- `0001_create_usuarios_table.php`
- `0002_create_usuarios_configuracoes_table.php`
- `0003_create_mundos_table.php`

**Pontos de atencao:**
- As migrations devem ser idempotentes o suficiente para rodar em ambiente novo.
- `mundos` ja deve nascer com `seed` e `algorithm_version`.

---

### Componente / Arquivo: endpoints de autenticacao

**Acao:** Criar

**Responsabilidade tecnica:**
Criar os endpoints:

- `api/login/cadastrar.php`
- `api/login/logar.php`
- `api/login/validar.php`
- `api/login/logout.php`

`cadastrar.php` cria usuario e linha default em `usuarios_configuracoes`. `logar.php` valida credenciais com `password_verify`, emite JWT e retorna payload minimo do usuario. `validar.php` confirma token e devolve dados da conta. `logout.php` retorna sucesso para o frontend limpar estado local.

**Pontos de atencao:**
- Senha deve usar `password_hash`.
- `logout.php` pode ser stateless, mas precisa manter contrato consistente.

---

### Componente / Arquivo: endpoints de configuracoes base

**Acao:** Criar

**Responsabilidade tecnica:**
Criar:

- `api/configuracoes/buscar.php`
- `api/configuracoes/salvar.php`

Esses endpoints devem operar sobre a configuracao do usuario autenticado, com defaults como `render_distance`, `mouse_sensitivity`, `master_volume` e `invert_y`.

**Pontos de atencao:**
- Se a configuracao ainda nao existir, `buscar.php` deve devolver defaults coerentes.
- `salvar.php` deve aceitar atualizacao parcial sem sobrescrever campos ausentes com `null`.

---

## Dados, Persistencia e Contratos

### Entidades / Estruturas

| Entidade | Campos principais | Observacoes |
|----------|-------------------|-------------|
| `usuarios` | `id`, `login`, `nome_exibicao`, `senha_hash`, `status`, `criado_em`, `atualizado_em` | `login` unico; email fica fora da primeira versao |
| `usuarios_configuracoes` | `id`, `usuario_id`, `render_distance`, `mouse_sensitivity`, `master_volume`, `invert_y`, `atualizado_em` | 1:1 com usuario |
| `mundos` | `id`, `usuario_id`, `nome`, `seed`, `algorithm_version`, `criado_em`, `atualizado_em`, `ultimo_jogado_em` | tabela nasce nesta fase para sustentar PRD-002 e PRD-003 |
| `migrations` | `id`, `nome_arquivo`, `executada_em` | controle do runner de migrations |

### Endpoints / Rotas / Interfaces

| Tipo | Identificador | Objetivo |
|------|---------------|----------|
| Pagina publica | `login.php` | Cadastro e login |
| Pagina protegida | `index.php?page=menu` | Primeiro destino autenticado |
| Endpoint | `api/login/cadastrar.php` | Criar conta |
| Endpoint | `api/login/logar.php` | Autenticar e emitir token |
| Endpoint | `api/login/validar.php` | Validar token e carregar usuario |
| Endpoint | `api/login/logout.php` | Encerrar sessao no cliente |
| Endpoint | `api/configuracoes/buscar.php` | Ler configuracoes do usuario |
| Endpoint | `api/configuracoes/salvar.php` | Persistir configuracoes |

### Regras de Integridade

- `usuarios.login` deve ser unico.
- `usuarios_configuracoes.usuario_id` deve ser unico e referenciar `usuarios.id`.
- `mundos.usuario_id` deve referenciar `usuarios.id`.
- Endpoints protegidos so podem responder com sucesso quando houver token valido.

---

## Requisitos de Performance e Escala

- Login e validacao de token devem responder de forma leve, sem joins desnecessarios.
- O bootstrap da area autenticada deve depender de no maximo uma validacao de token e uma leitura de configuracoes.
- O wrapper de request deve centralizar timeout e tratamento de 401 para evitar duplicacao de fluxo.

---

## Seguranca e Validacoes

- Hash de senha com `password_hash()` e verificacao com `password_verify()`
- Prepared statements em todas as queries
- Sanitizacao basica de entrada e respostas de erro sem vazar detalhes internos
- Token JWT com expiracao e segredo definido no backend
- Endpoints protegidos lendo token pelo header `Authorization`

---

## Riscos Tecnicos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Token em `localStorage` sofrer impacto de XSS | Medio | Escapar output, evitar HTML dinamico inseguro e limitar o que o token contem |
| Falta de consistencia entre `ENV` frontend e config do backend | Medio | Centralizar URL base e chave do token em arquivos de ambiente claros |
| Repositorio ainda vazio gerar acoplamento estrutural ruim | Medio | Criar shell minimo e modular desde o inicio |

---

## Plano de Testes

- Cadastro de usuario novo e tentativa de cadastro duplicado
- Login valido, login invalido e token expirado/invalido
- Acesso direto a `index.php?page=menu` sem token
- Leitura e escrita de configuracoes do usuario autenticado
- Execucao do runner de migrations em banco vazio

---

## Tasks Derivadas

| Task | Objetivo | Dependencias |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-criar-fundacao-web-api.md) | Criar shell web, ambiente e helpers compartilhados | Nenhuma |
| [TASK-002](./tasks/TASK-002-implantar-banco-migrations.md) | Implantar PDO, runner e migrations iniciais | TASK-001 |
| [TASK-003](./tasks/TASK-003-implementar-auth-backend.md) | Implementar JWT, auth guard e endpoints de login | TASK-002 |
| [TASK-004](./tasks/TASK-004-construir-login-frontend.md) | Construir `login.php` e fluxo cliente de autenticacao | TASK-001, TASK-003 |
| [TASK-005](./tasks/TASK-005-implementar-configuracoes-base.md) | Criar endpoints e defaults de configuracoes do usuario | TASK-002, TASK-003 |
| [TASK-006](./tasks/TASK-006-proteger-shell-autenticado.md) | Proteger o shell autenticado e validar sessao no bootstrap | TASK-003, TASK-004, TASK-005 |

---

## Rollback

Remover o shell web criado, excluir endpoints e helpers adicionados e reverter as migrations na ordem inversa (`0003` ate `0000`). Como o repositorio ainda nao possui codigo funcional anterior, o rollback desta PRD equivale a retornar o projeto ao estado apenas documental.
