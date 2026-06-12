# TASK-004: Migrar geracao e meshing para Worker

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001, TASK-002 |
| **Bloqueia** | TASK-010, TASK-011 |
| **Criterios cobertos** | CA-02, CA-03 |

## Objetivo
Executar geracao e meshing pesado fora da main thread com jobs versionados.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/workers/` | Criar | Chunk Worker |
| `assets/js/game/world/ChunkManager.js` | Modificar | Jobs/versionamento |
| `assets/js/game/world/ChunkMesher.js` | Modificar | Buffers transferiveis |

## Passos de Implementacao
1. Definir protocolo de mensagens e versoes.
2. Transferir snapshot e buffers sem copias desnecessarias.
3. Descartar respostas obsoletas e tratar falha do Worker.

## Checklist de Validacao
- [x] Jobs obsoletos nao alteram o mundo
- [x] Worker nao acessa DOM
- [x] Long tasks medidas

> Resolucao final: snapshots agora transferem apenas chunks conhecidas e o Worker recompõe o mundo procedural localmente com seed, algoritmo e mutacoes relevantes. A geracao ausente deixou de depender da main thread.

## Testes de Verificacao
- **Acao:** atravessar 20 chunks continuamente.
- **Resultado esperado:** atender CA-02 e CA-03.

## Rollback
Ativar pipeline sincrono pelo contrato de chunks.
