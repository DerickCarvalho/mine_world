# TASK-005: Refinar fisica, sprint, agachamento e agua

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-009, TASK-011 |
| **Criterios cobertos** | CA-04 |

## Objetivo
Adicionar estados determinísticos de sprint, agachamento, protecao de borda e agua.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/player/InputState.js` | Modificar | Inputs |
| `assets/js/game/player/PlayerController.js` | Modificar | Estados |
| `assets/js/game/player/CollisionResolver.js` | Modificar | Bordas/agua |

## Passos de Implementacao
1. Modelar estados e transicoes.
2. Implementar velocidades, colisao e controle vertical.
3. Adicionar testes determinísticos.

## Checklist de Validacao
- [x] Sprint e agachamento previsiveis
- [x] Agachamento protege borda
- [x] Agua nao conflita com fly

## Testes de Verificacao
- **Acao:** executar cenarios determinísticos de movimento.
- **Resultado esperado:** CA-04 aprovado.

## Rollback
Desabilitar novos estados mantendo locomocao anterior.
