# TASK-006: Proteger shell autenticado e validar sessao

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-003, TASK-004, TASK-005 |
| **Bloqueia** | PRD-002 e PRD-003 |

---

## Objetivo

Fechar o bootstrap autenticado do MineWorld, garantindo que o shell protegido valide o token, carregue o usuario e tenha um destino minimo para `index.php?page=menu`.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `index.php` | Modificar | Estrutura criada na TASK-001 |
| `layout.php` | Modificar | Estrutura criada na TASK-001 |
| `pages/menu.php` | Criar | Novo arquivo placeholder |
| `assets/js/auth.js` | Modificar | Bootstrap de sessao |

---

## Passos de Implementacao

1. Implementar bootstrap de sessao em `auth.js`.
2. Fazer `index.php` exigir token antes de liberar o roteamento.
3. Carregar validacao remota via `api/login/validar.php` ao entrar na area autenticada.
4. Criar `pages/menu.php` placeholder para o redirecionamento inicial da PRD-001.
5. Garantir limpeza de token e retorno a `login.php` quando a sessao nao for valida.

---

## Regras e Cuidados

- O destino `index.php?page=menu` precisa existir ao final desta task, ainda que em formato minimo.
- O shell autenticado nao deve duplicar validacoes de sessao em cada pagina manualmente.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] `index.php?page=menu` existe e depende de sessao valida
- [ ] Token invalido gera limpeza de estado local
- [ ] Usuario autenticado consegue entrar no shell protegido
- [ ] Placeholder de menu pronto para evoluir na PRD-002

---

## Testes de Verificacao

### Teste 1

- **Acao:** Acessar `index.php?page=menu` com token valido.
- **Resultado esperado:** O shell autenticado carrega e valida o usuario sem redirecionamento indevido.

### Teste 2

- **Acao:** Acessar `index.php?page=menu` com token inexistente ou invalido.
- **Resultado esperado:** O bootstrap limpa a sessao local e redireciona para `login.php`.

---

## Rollback

Remover o placeholder `pages/menu.php` e desfazer as regras de guard em `index.php` e `auth.js`.

---

## Notas Tecnicas

- Esta task fecha a fundacao e prepara o terreno para as paginas reais de menu, mundos e opcoes na PRD-002.
