# TASK-003: Implementar hotbar e inventario simples

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-004, TASK-007 |

---

## Objetivo

Entregar um inventario simples com `27` slots totais, hotbar de `9` slots, selecao rapida por teclado e wheel, e abertura por `E` dentro da gameplay.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/Hotbar.js` | Criar | Novo modulo |
| `assets/js/game/ui/InventoryPanel.js` | Criar | Novo modulo |
| `assets/js/game/GameApp.js` | Modificar | Estado de UI e selecao |
| `pages/jogo.php` | Modificar | Estrutura HTML da HUD |
| `assets/css/custom/pages/jogo.css` | Modificar | Estilos da hotbar e inventario |

---

## Passos de Implementacao

1. Modelar slots, item stack e indice de slot selecionado.
2. Renderizar hotbar fixa na HUD e painel de inventario simples.
3. Integrar selecao por `1-9`, `mouse wheel` e abertura por `E`.

---

## Regras e Cuidados

- Inventario aberto deve suspender a interacao de quebrar e colocar ate ser fechado.
- A hotbar deve refletir visualmente o slot selecionado e a quantidade do item.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Hotbar visivel durante a gameplay
- [ ] Inventario abre e fecha corretamente
- [ ] Selecao por teclado e wheel funcionando
- [ ] Estado da UI sincronizado com o save

---

## Testes de Verificacao

### Teste 1

- **Acao:** pressionar `1-9` e girar a wheel do mouse durante a gameplay.
- **Resultado esperado:** o slot ativo muda sem quebrar locomocao e pause.

### Teste 2

- **Acao:** pressionar `E` para abrir e fechar o inventario.
- **Resultado esperado:** o painel aparece, bloqueia interacoes de bloco e depois devolve o controle ao jogo.

---

## Rollback

Remover os modulos de HUD do inventario, restaurar `pages/jogo.php` e `jogo.css` para o layout anterior e eliminar o estado de slots do runtime.

---

## Notas Tecnicas

- Nesta fase nao havera crafting, drag complexo ou telas adicionais de gerenciamento.
