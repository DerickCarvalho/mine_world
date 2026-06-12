# TASK-007: Implementar preview e validacao de colocacao

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-009, TASK-011 |
| **Criterios cobertos** | CA-06 |

## Objetivo
Exibir preview valido/invalido antes de colocar blocos e impedir consumo incorreto.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/interaction/` | Criar/Modificar | Colocacao |
| `assets/js/game/render/` | Modificar | Preview |
| `assets/js/game/GameApp.js` | Modificar | Integracao |

## Passos de Implementacao
1. Calcular posicao e motivo de bloqueio continuamente.
2. Renderizar preview sem alterar o mundo.
3. Confirmar somente posicoes validas.

## Checklist de Validacao
- [x] Preview diferencia valido/invalido
- [x] Player nao pode ser enclausurado
- [x] Item nao e consumido em erro

## Testes de Verificacao
- **Acao:** tentar colocar em posicoes validas, corpo e limite.
- **Resultado esperado:** CA-06 aprovado.

## Rollback
Remover preview mantendo validacoes finais de colocacao.
