# TASK-004: Construir login frontend

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-001-contas-persistencia.md](../PRD-001-contas-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-001-contas-persistencia.md](../PRD-TECNICA-001-contas-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001, TASK-003 |
| **Bloqueia** | TASK-006 |

---

## Objetivo

Construir a experiencia publica de `login.php` com formularios de cadastro e login, validacao cliente e persistencia do token no navegador.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `login.php` | Modificar | Estrutura criada na TASK-001 |
| `assets/js/paginas/login.js` | Criar | Novo arquivo |
| `assets/css/custom/pages/login.css` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Montar em `login.php` os blocos de cadastro e login com alternancia simples.
2. Criar `assets/js/paginas/login.js` para validar campos, chamar API e armazenar token.
3. Redirecionar para `index.php?page=menu` ao autenticar com sucesso.
4. Tratar erros com helper global de mensagens.
5. Garantir que usuario autenticado nao fique preso na tela publica se ja possuir sessao valida.

---

## Regras e Cuidados

- O frontend deve permanecer em JS Vanilla.
- O token deve ser salvo usando a chave definida em `ENV.TOKEN_KEY`.
- O fluxo de cadastro e login precisa compartilhar a mesma camada de request.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Formularios de login e cadastro funcionais
- [ ] Validacao cliente basica aplicada
- [ ] Token salvo corretamente no navegador
- [ ] Redirecionamento para a area autenticada funcionando

---

## Testes de Verificacao

### Teste 1

- **Acao:** Cadastrar um usuario novo pela interface.
- **Resultado esperado:** A conta e criada, o usuario recebe retorno claro e consegue seguir para login ou autenticacao imediata conforme regra escolhida.

### Teste 2

- **Acao:** Efetuar login com credencial invalida.
- **Resultado esperado:** A tela informa o erro sem travar e sem recarregar toda a pagina.

---

## Rollback

Restaurar `login.php` ao shell minimo e remover `assets/js/paginas/login.js` e `assets/css/custom/pages/login.css`.

---

## Notas Tecnicas

- Se o cadastro optar por autenticar automaticamente, manter o mesmo contrato de armazenamento de token usado no login.
