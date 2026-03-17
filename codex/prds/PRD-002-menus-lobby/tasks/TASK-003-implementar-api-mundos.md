# TASK-003: Implementar API de mundos

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-002-menus-lobby.md](../PRD-002-menus-lobby.md) |
| **PRD Tecnica** | [PRD-TECNICA-002-menus-lobby.md](../PRD-TECNICA-002-menus-lobby.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-004 e PRD-003 |

---

## Objetivo

Criar os endpoints de mundos para listar, criar, buscar e excluir saves do usuario autenticado.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `api/mundos/listar.php` | Criar | Novo arquivo |
| `api/mundos/cadastrar.php` | Criar | Novo arquivo |
| `api/mundos/buscar.php` | Criar | Novo arquivo |
| `api/mundos/excluir.php` | Criar | Novo arquivo |
| `api/dependencias/utils.php` | Modificar | Helpers compartilhados, se necessario |

---

## Passos de Implementacao

1. Criar a pasta `api/mundos/`.
2. Implementar `listar.php` filtrando por usuario autenticado.
3. Implementar `cadastrar.php` com validacao de nome e geracao de seed automatica.
4. Implementar `buscar.php` retornando metadados minimos do mundo.
5. Implementar `excluir.php` com hard delete e checagem de ownership.

---

## Regras e Cuidados

- Todos os endpoints devem exigir token valido.
- `cadastrar.php` nao deve aceitar nome vazio.
- `buscar.php` precisa ser seguro para uso posterior na tela de jogo.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] `listar.php` retorna somente mundos do dono
- [ ] `cadastrar.php` cria registro valido
- [ ] `buscar.php` protege ownership
- [ ] `excluir.php` remove definitivamente o mundo selecionado

---

## Testes de Verificacao

### Teste 1

- **Acao:** Criar dois mundos com o mesmo usuario e listar.
- **Resultado esperado:** Os dois aparecem no retorno de `listar.php` com seus metadados.

### Teste 2

- **Acao:** Tentar buscar ou excluir mundo de outro usuario autenticado.
- **Resultado esperado:** O backend responde com erro de autorizacao ou recurso inexistente para aquele contexto.

---

## Rollback

Remover a pasta `api/mundos/` e desfazer qualquer ajuste compartilhado em utilitarios.

---

## Notas Tecnicas

- `buscar.php` sera consumido diretamente pela PRD-003 no boot da tela `jogo`.
