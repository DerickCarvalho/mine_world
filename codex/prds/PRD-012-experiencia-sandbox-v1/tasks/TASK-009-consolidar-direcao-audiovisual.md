# TASK-009: Consolidar HUD, held item, audio e direcao visual

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-003, TASK-005, TASK-006, TASK-007 |
| **Bloqueia** | TASK-011 |
| **Criterios cobertos** | CA-05, CA-06, CA-09 |

## Objetivo
Unificar a apresentacao da gameplay com identidade propria e feedback coerente.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/jogo.php` | Modificar | HUD |
| `assets/css/custom/pages/jogo.css` | Refatorar | Estilos |
| `assets/js/game/ui/` | Modificar | Feedback |
| `assets/js/game/audio/GameAudio.js` | Modificar | Paisagem sonora |

## Passos de Implementacao
1. Remover overrides concorrentes e definir tokens da gameplay.
2. Integrar feedback de movimento e interacao.
3. Validar responsividade e identidade propria.

## Checklist de Validacao
- [x] HUD prioriza mundo e interacao
- [x] CSS possui estrutura coesa
- [x] Audio informa sem cansar

## Testes de Verificacao
- **Acao:** smoke visual desktop/mobile.
- **Resultado esperado:** feedback de CA-05, CA-06 e CA-09 legivel.

## Rollback
Restaurar layout anterior mantendo controllers funcionais.
