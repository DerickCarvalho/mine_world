# TASK-001: Criar benchmark e telemetria de runtime

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-004, TASK-011 |
| **Criterios cobertos** | CA-01, CA-02, CA-03 |

## Objetivo
Criar baseline reproduzivel e telemetria local para frame time, long tasks, chunks, memoria e travessia.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/telemetry/` | Criar | Novo modulo |
| `assets/js/game/GameApp.js` | Modificar | Loop |
| `codex/scripts/` | Criar | Benchmark |

## Passos de Implementacao
1. Definir cenario 1080p/distancia 6 e perfil de hardware.
2. Coletar P50/P95, long tasks, chunks e memoria disponivel.
3. Gerar relatorio comparavel antes/depois.

## Checklist de Validacao
- [x] Benchmark reproduzivel criado
- [x] Metricas registradas sem poluir HUD normal
- [x] Baseline anexada a validacao

## Testes de Verificacao
- **Acao:** executar travessia automatizada de 20 chunks.
- **Resultado esperado:** relatorio inclui CA-01, CA-02 e CA-03.

## Rollback
Remover telemetria do bootstrap mantendo scripts de benchmark isolados.
