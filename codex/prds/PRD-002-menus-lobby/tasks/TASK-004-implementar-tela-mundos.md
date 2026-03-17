# TASK-004: Implementar tela de mundos

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-002-menus-lobby.md](../PRD-002-menus-lobby.md) |
| **PRD Tecnica** | [PRD-TECNICA-002-menus-lobby.md](../PRD-TECNICA-002-menus-lobby.md) |
| **Status** | Pendente |
| **Depende de** | TASK-002, TASK-003 |
| **Bloqueia** | PRD-003 |

---

## Objetivo

Construir a tela `index.php?page=mundos` com listagem de saves, criacao de novo mundo, selecao e exclusao definitiva com confirmacao.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/mundos.php` | Criar | Novo arquivo |
| `assets/js/paginas/mundos.js` | Criar | Novo arquivo |
| `assets/css/custom/pages/mundos.css` | Criar | Novo arquivo |

---

## Passos de Implementacao

1. Montar a interface da lista de mundos com estado vazio e estado populado.
2. Implementar selecao de um mundo por vez.
3. Implementar fluxo de criacao com formulario leve e chamada a `api/mundos/cadastrar.php`.
4. Implementar exclusao com `showConfirm` e refresh de lista.
5. Expor acao clara para entrar no mundo selecionado na PRD-003.

---

## Regras e Cuidados

- O botao de exclusao so deve habilitar quando houver selecao.
- A UI deve refletir imediatamente a criacao ou exclusao concluida.
- A pagina precisa suportar zero mundos sem quebrar o fluxo.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Lista de mundos carregando do backend
- [ ] Criacao de mundo funcional
- [ ] Exclusao com confirmacao funcionando
- [ ] Estado de selecao controlado corretamente

---

## Testes de Verificacao

### Teste 1

- **Acao:** Entrar com usuario sem mundos.
- **Resultado esperado:** A tela orienta a criar novo mundo e o botao de exclusao permanece desabilitado.

### Teste 2

- **Acao:** Criar um mundo, seleciona-lo e exclui-lo com confirmacao.
- **Resultado esperado:** O item aparece na lista, pode ser selecionado e e removido definitivamente apos confirmar.

---

## Rollback

Remover `pages/mundos.php` e os assets da pagina, retornando o fluxo a partir do menu principal.

---

## Notas Tecnicas

- Se houver botao `Entrar no mundo`, ele deve navegar para `index.php?page=jogo&id_mundo={id}` na PRD-003.
