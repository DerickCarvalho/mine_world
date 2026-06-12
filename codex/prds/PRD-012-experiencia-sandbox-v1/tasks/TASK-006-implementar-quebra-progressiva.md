# TASK-006: Implementar quebra progressiva e feedback

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-009, TASK-011 |
| **Criterios cobertos** | CA-05 |

## Objetivo
Substituir quebra instantanea por progresso baseado em dureza e feedback cancelavel.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/BlockTypes.js` | Modificar | Dureza |
| `assets/js/game/interaction/` | Criar | Controller |
| `assets/js/game/audio/GameAudio.js` | Modificar | Feedback |

## Passos de Implementacao
1. Definir dureza por bloco.
2. Processar input continuo, alvo e cancelamento.
3. Renderizar progresso/particulas e tocar feedback.

## Checklist de Validacao
- [x] Bedrock continua inquebravel
- [x] Progresso cancela corretamente
- [x] Item e coletado uma unica vez

## Testes de Verificacao
- **Acao:** quebrar materiais diferentes e perder o alvo.
- **Resultado esperado:** CA-05 aprovado.

## Rollback
Restaurar acao instantanea preservando definicoes de dureza.
