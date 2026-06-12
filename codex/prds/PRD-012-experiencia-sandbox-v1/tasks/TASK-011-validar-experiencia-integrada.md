# TASK-011: Validar experiencia integrada e benchmark final

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-01, CA-02, CA-03, CA-04, CA-05, CA-06, CA-07, CA-08, CA-09, CA-10 |

## Objetivo
Executar benchmark, smoke de 15 minutos e regressao final da PRD-012.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `codex/scripts/` | Modificar/Criar | Validacao |
| `codex/execucoes/PRD-012-validacao.md` | Criar | Evidencias |

## Passos de Implementacao
1. Executar todos os testes automatizados.
2. Rodar benchmark antes/depois no mesmo ambiente.
3. Realizar smoke autenticado de 15 minutos e registrar evidencias.

## Checklist de Validacao
- [x] Todos os CA possuem evidencia
- [x] `npm test` passa
- [x] Riscos residuais documentados

## Testes de Verificacao
- **Acao:** explorar, nadar, coletar, construir, organizar, morrer, salvar e retomar.
- **Resultado esperado:** CA-01 a CA-10 aprovados.

## Rollback
Nao concluir a PRD e reabrir as tasks responsaveis por criterios falhos.
