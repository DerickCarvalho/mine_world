# TASK-003: Implementar auth backend

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-004, TASK-005, TASK-006 |

---

## Objetivo

Implementar helpers de autenticacao JWT, middleware de protecao e endpoints de cadastro, login, validacao e logout.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/dependencias/auth/jwt_helper.php` | Criar | Novo arquivo |
| `api/dependencias/auth/require_auth.php` | Criar | Novo arquivo |
| `api/dependencias/utils.php` | Criar | Novo arquivo |
| `api/login/cadastrar.php` | Criar | Novo arquivo |
| `api/login/logar.php` | Criar | Novo arquivo |
| `api/login/validar.php` | Criar | Novo arquivo |
| `api/login/logout.php` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Implementar helper JWT com emissao, leitura e expiracao de token.
2. Implementar middleware para extrair `Authorization: Bearer`.
3. Criar utilitarios comuns para respostas JSON padronizadas.
4. Implementar `cadastrar.php` com validacao de duplicidade e `password_hash`.
5. Implementar `logar.php`, `validar.php` e `logout.php` com contrato JSON consistente.

---

## Regras e Cuidados

- Nao armazenar senha em texto puro.
- Nao vazar detalhes internos em respostas de erro.
- `logout.php` deve responder sucesso mesmo em modelo stateless, para simplificar o cliente.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] JWT emitido e validado corretamente
- [ ] Cadastro impede `login` duplicado
- [ ] Login retorna payload do usuario e token
- [ ] Middleware rejeita token ausente ou invalido

---

## Testes de Verificacao

### Teste 1

- **Acao:** Realizar cadastro e login validos via chamada HTTP local.
- **Resultado esperado:** O backend retorna `status=OK`, token e dados do usuario.

### Teste 2

- **Acao:** Chamar `api/login/validar.php` com token invalido ou expirado.
- **Resultado esperado:** O endpoint responde com erro de autenticacao e HTTP adequado.

---

## Rollback

Remover `api/login/` e `api/dependencias/auth/` criados nesta task e revogar o uso do header `Authorization`.

---

## Notas Tecnicas

- O segredo JWT deve ficar centralizado em configuracao backend, nao hardcoded em multiplos arquivos.
