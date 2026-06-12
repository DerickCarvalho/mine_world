# TASK-010: Garantir compatibilidade de persistencia

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-004, TASK-005, TASK-008 |
| **Bloqueia** | TASK-011 |
| **Criterios cobertos** | CA-08 |

## Objetivo
Provar que mundos e saves existentes sobrevivem a migracao do runtime.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/services/WorldRepository.js` | Modificar se necessario | Normalizacao |
| `api/mundos/` | Modificar se necessario | Contratos |
| `codex/scripts/` | Criar | Round trip |

## Passos de Implementacao
1. Criar fixtures de save/chunks anteriores.
2. Executar carga, gameplay, save e reabertura.
3. Adicionar normalizacao retrocompativel somente quando necessaria.

## Checklist de Validacao
- [x] Posicao, vida e fly preservados
- [x] Inventario e mutacoes preservados
- [x] Chunks/texturas existentes carregam

## Testes de Verificacao
- **Acao:** round trip de mundo anterior.
- **Resultado esperado:** CA-08 aprovado.

## Rollback
Reverter normalizadores novos e manter schema anterior.
