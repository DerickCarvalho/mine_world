# TASK-001: Liberar pitch total e mao vazia

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **PRD Tecnica** | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-005 |
| **Criterios cobertos** | CA-01, CA-02, CA-03 |

## Objetivo

Abrir completamente o movimento vertical da camera e introduzir o estado visual de mao vazia em primeira pessoa. A task deve preservar raycast, crosshair, picking e save/load do pitch.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/core/CameraMath.js` | Modificar | Clamp de pitch |
| `assets/js/game/player/PlayerController.js` | Modificar | Atualizacao e restauracao de pitch |
| `assets/js/game/render/webgl/WebGLRenderer.js` | Modificar | Uniform de pitch no shader |
| `assets/js/game/world/RaycastPicker.js` | Modificar | Direcao do raycast |
| `assets/js/game/entities/EntityPicker.js` | Modificar | Direcao do picking |
| `assets/js/game/ui/FirstPersonHand.js` | Modificar | Estado de mao vazia |
| `assets/js/game/GameApp.js` | Modificar | Integracao do slot vazio |

## Passos de Implementacao

1. Unificar a faixa de pitch e remover clamps concorrentes entre helper, controller e renderer.
2. Validar raycast e picking nos extremos verticais e ajustar calculos que assumem `cos(pitch)` longe de zero.
3. Introduzir fallback de mao vazia quando o slot ativo nao tiver bloco, preservando held item quando houver item.

## Regras e Cuidados

- A mesma faixa de pitch precisa valer para controle, shader, raycast, picking e persistencia.
- Nao criar item fantasma nem sobrepor mao vazia por cima de held item real.
- Aderencia ao padrao do shell web permanece inalterada; a task atua apenas no runtime JS da gameplay.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** entrar em um mundo, mover o mouse ate olhar totalmente para cima e para baixo e tentar quebrar/colocar blocos nessas posicoes.
- **Resultado esperado:** a camera alcanca os extremos e a interacao continua correta.

### Teste 2

- **Acao:** deixar o slot ativo vazio e depois alternar para um slot com bloco.
- **Resultado esperado:** a mao vazia aparece apenas no slot vazio e some ao equipar item.

## Rollback

Restaurar o clamp anterior de pitch e remover o fallback de mao vazia do `FirstPersonHand`, retornando ao comportamento atual de slot vazio sem representacao.

## Notas Tecnicas

- Cobertura principal: `CA-01`, `CA-02` e parte de `CA-03`.
