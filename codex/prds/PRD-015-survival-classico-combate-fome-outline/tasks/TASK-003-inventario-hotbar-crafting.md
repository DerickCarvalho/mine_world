# TASK-003: Reconstruir inventario, hotbar e crafting

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-004, TASK-007 |
| **Criterios cobertos** | CA-06, CA-07, CA-09 |

## Objetivo

Evoluir inventario, hotbar e crafting para um fluxo realmente usavel, bonito e confiavel, sem bugs de stacks e sem icones quebrados.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/InventoryPanel.js` | Modificar | grid, area de craft e cursor stack |
| `assets/js/game/ui/Hotbar.js` | Modificar | estado visual do slot ativo |
| `assets/js/game/ui/ItemIcon.js` | Modificar | icones e leitura visual dos itens |
| `assets/js/game/inventory/InventoryOperations.js` | Modificar | estabilidade de pilhas e cliques |
| `assets/js/game/inventory/CraftingCatalog.js` | Modificar | receitas uteis e validacoes |
| `assets/js/game/GameApp.js` | Modificar | integracao do inventario, craft e mao |

## Passos de Implementacao

1. Corrigir a leitura visual dos itens/blocos no inventario e na hotbar.
2. Estabilizar movimentacao de pilhas e area de crafting.
3. Expandir receitas uteis e validar consumo correto de recursos.

## Regras e Cuidados

- Nenhum craft pode duplicar item.
- A hotbar precisa continuar sincronizada com inventario e held item.
- Evitar UI pesada ou confusa demais para a fase atual do projeto.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** abrir inventario, mover pilhas, trocar slots e voltar para a gameplay
- **Resultado esperado:** pilhas continuam consistentes e a hotbar reflete o estado final

### Teste 2

- **Acao:** executar receitas basicas de madeira, gravetos e ferramenta simples
- **Resultado esperado:** os insumos corretos sao consumidos e o resultado correto aparece

## Rollback

Restaurar inventario/crafting anteriores e manter apenas correcoes de bug pontuais que nao alterem o fluxo.

## Notas Tecnicas

- Esta task e a base para fome, comida, arma e drops funcionarem de forma coerente.
