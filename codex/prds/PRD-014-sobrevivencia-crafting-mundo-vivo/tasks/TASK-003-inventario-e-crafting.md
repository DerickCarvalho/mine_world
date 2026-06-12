# TASK-003: Inventario e crafting

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001, TASK-002 |
| **Bloqueia** | TASK-006, TASK-007 |
| **Criterios cobertos** | CA-05, CA-06 |

## Objetivo

Evoluir o inventario para suportar crafting e lista de receitas, mantendo pilhas, hotbar e regras consistentes de consumo de recursos.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/InventoryPanel.js` | Modificar | UI de inventario |
| `assets/js/game/inventory/` | Expandir | Regras puras |
| `assets/js/game/GameApp.js` | Modificar | Integracao runtime |
| `assets/js/game/services/WorldRepository.js` | Modificar | Persistencia |

## Passos de Implementacao

1. Definir catalogo de receitas e motor puro de resolucao de crafting.
2. Adicionar area de crafting e lista de receitas na UI do inventario.
3. Integrar consumo/resultado ao save e ao modo de jogo.

## Regras e Cuidados

- Nenhum craft pode duplicar ou perder itens fora das regras.
- A lista de crafts precisa ser legivel mesmo com catalogo crescendo.
- O fluxo de pilhas existente nao pode quebrar.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** abrir inventario, selecionar recursos validos e executar crafts conhecidos.
- **Resultado esperado:** insumos sao consumidos e resultados corretos aparecem no inventario.

### Teste 2

- **Acao:** tentar craftar com insumos insuficientes ou invalidos.
- **Resultado esperado:** o sistema bloqueia a acao sem corromper pilhas.

## Rollback

Remover area de crafting e lista de receitas, restaurando o inventario sem criacao de itens.

## Notas Tecnicas

- O motor de crafting deve ser testavel sem UI.
