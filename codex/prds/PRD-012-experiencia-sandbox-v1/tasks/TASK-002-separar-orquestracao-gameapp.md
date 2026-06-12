# TASK-002: Separar orquestracao do GameApp

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008 |
| **Criterios cobertos** | CA-10 |

## Objetivo
Extrair contratos de renderer, interacao, inventario e pipeline de chunks sem mudar o comportamento visivel.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | Orquestracao |
| `assets/js/game/core/` | Criar | Contratos/controllers |

## Passos de Implementacao
1. Mapear responsabilidades e dependencias.
2. Extrair modulos pequenos com contratos testaveis.
3. Preservar bootstrap, save e loop atual.

## Checklist de Validacao
- [x] Comportamento atual preservado
- [x] Novos contratos possuem testes
- [x] `GameApp` permanece somente como orquestrador

## Testes de Verificacao
- **Acao:** executar smoke atual antes/depois.
- **Resultado esperado:** nenhuma regressao funcional.

## Rollback
Reintegrar contratos ao `GameApp` mantendo testes adicionados.
