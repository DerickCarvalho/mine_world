# TASK-003: Implementar renderer WebGL de terreno e agua

## Metadados
| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-012](../PRD-012-experiencia-sandbox-v1.md) |
| **PRD Tecnica** | [PRD-TECNICA-012](../PRD-TECNICA-012-experiencia-sandbox-v1.md) |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Depende de** | TASK-001, TASK-002 |
| **Bloqueia** | TASK-009, TASK-011 |
| **Criterios cobertos** | CA-01, CA-10 |

## Objetivo
Substituir o caminho principal Canvas 2D por renderer WebGL 2 com buffers por chunk.

## Arquivos / Modulos Afetados
| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/render/webgl/` | Criar | Renderer GPU |
| `assets/js/game/render/SoftwareRenderer.js` | Preservar/Modificar | Fallback temporario |
| `assets/js/paginas/jogo.js` | Modificar | Bootstrap |

## Passos de Implementacao
1. Criar contrato e inicializacao WebGL 2.
2. Renderizar terreno, texturas, agua, selecao e entidades.
3. Liberar recursos no unload/destroy e medir benchmark.

## Checklist de Validacao
- [x] Cena principal usa GPU
- [x] Recursos GPU sao liberados
- [x] HUD DOM permanece funcional

## Testes de Verificacao
- **Acao:** executar benchmark 1080p/distancia 6.
- **Resultado esperado:** atender CA-01 sem regressao visual critica.

## Rollback
Selecionar o renderer Canvas pelo contrato enquanto o WebGL e corrigido.
