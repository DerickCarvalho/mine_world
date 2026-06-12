# TASK-008: Evoluir inventario e manipulacao de pilhas

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-010, TASK-011 |
| **Criterios cobertos** | CA-07 |

## Objetivo
Implementar cursor stack e operacoes determinísticas de mover, combinar, trocar e dividir.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/InventoryPanel.js` | Modificar | Interacao |
| `assets/js/game/inventory/` | Criar | Regras puras |
| `assets/js/game/GameApp.js` | Modificar | Integracao/save |

## Passos de Implementacao
1. Criar operacoes puras conservando quantidade.
2. Integrar cliques primario/secundario e cursor.
3. Validar save e hotbar.

## Checklist de Validacao
- [x] Pilhas respeitam 64
- [x] Nenhuma perda ou duplicacao
- [x] Cursor e slots sao claros

## Testes de Verificacao
- **Acao:** combinar, dividir, trocar e salvar pilhas.
- **Resultado esperado:** CA-07 aprovado.

## Rollback
Voltar a troca de slots usando os mesmos dados persistidos.
