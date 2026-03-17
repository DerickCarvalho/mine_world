# TASK-001: Criar fundacao web e API

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-004 |

---

## Objetivo

Criar a estrutura base de shell web do MineWorld e os arquivos compartilhados de ambiente, request, loading, alertas e bootstrap de sessao no cliente.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `login.php` | Criar | Novo arquivo |
| `index.php` | Criar | Novo arquivo |
| `layout.php` | Criar | Novo arquivo |
| `partials/` | Criar | Nova pasta |
| `env.default.js` | Criar | Novo arquivo |
| `env.deploy.js` | Criar | Novo arquivo |
| `assets/css/custom/global.css` | Criar | Novo arquivo |
| `assets/js/ApiRequest.js` | Criar | Novo arquivo |
| `assets/js/Loading.js` | Criar | Novo arquivo |
| `assets/js/alert.js` | Criar | Novo arquivo |
| `assets/js/auth.js` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Criar a arvore inicial `assets/`, `partials/`, `pages/` e `assets/js/paginas/`.
2. Implementar `env.default.js` e `env.deploy.js` com `ENV.DOMAIN`, `ENV.API_BASE_URL`, `ENV.KEY_PREFIX` e `ENV.TOKEN_KEY`.
3. Implementar `ApiRequest.js` em Vanilla JS sobre `fetch`, com injecao automatica do token e parse de JSON padrao.
4. Implementar helpers globais de loading, sucesso, erro e confirmacao sem depender de framework frontend.
5. Criar `login.php`, `index.php` e `layout.php` como shell minimo reutilizavel.

---

## Regras e Cuidados

- O shell deve seguir o padrao `login.php` / `index.php?page=...`.
- O frontend deve continuar em JS Vanilla, mesmo reaproveitando a organizacao estrutural do projeto de referencia.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Estrutura de pastas criada no modulo correto
- [ ] `ENV` carregando sem erros no navegador
- [ ] Wrapper de request pronto para ser reutilizado
- [ ] Shell base carregando sem regressao

---

## Testes de Verificacao

### Teste 1

- **Acao:** Abrir `login.php` no navegador local.
- **Resultado esperado:** A pagina carrega CSS/JS base sem erro de console.

### Teste 2

- **Acao:** Abrir `index.php?page=menu` sem token valido.
- **Resultado esperado:** O bootstrap de auth impede acesso pleno e redireciona para `login.php`.

---

## Rollback

Remover a arvore base criada em `assets/`, `partials/`, `pages/`, `login.php`, `index.php`, `layout.php` e arquivos `env.*.js`.

---

## Notas Tecnicas

- O objetivo desta task nao e entregar telas finais, apenas a fundacao compartilhada.
