# TASK-001: Auditar runtime e fechar camera, raycast e outline

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-005 |
| **Criterios cobertos** | CA-01, CA-02, CA-03 |

## Objetivo

Mapear a arquitetura real da gameplay e corrigir a base de camera, raycast e selecao visual de bloco. Esta task fecha os comportamentos mais visiveis e de maior impacto perceptivo antes das expansoes seguintes.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/player/PlayerController.js` | Modificar | pitch, yaw e alinhamento do olhar |
| `assets/js/game/core/CameraMath.js` | Modificar | clamp e vetores da camera |
| `assets/js/game/world/RaycastPicker.js` | Modificar | direcao e alvo do raycast |
| `assets/js/game/interaction/InteractionController.js` | Modificar | highlight/preview de bloco |
| `assets/js/game/GameApp.js` | Modificar | integracao com crosshair e alvo atual |
| `assets/js/game/render/` | Modificar | outline fino do bloco selecionado |

## Passos de Implementacao

1. Auditar os modulos de camera, raycast, highlight e colocacao de bloco e registrar o fluxo real.
2. Corrigir clamp de pitch para permitir olhar ao ceu e ao chao sem inversao quebrada.
3. Remover o bloco fantasma e substituir por outline discreto no bloco mirado.

## Regras e Cuidados

- O raycast precisa continuar selecionando a face correta para colocacao.
- Mirar no ar deve remover completamente o destaque.
- Confirmar aderencia ao runtime atual sem criar fluxo paralelo fora de `GameApp`.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** entrar em um mundo, mover o mouse para cima e para baixo ate o limite
- **Resultado esperado:** o jogador olha diretamente para o ceu e para os proprios pes sem glitch

### Teste 2

- **Acao:** mirar em blocos diferentes e depois no ar
- **Resultado esperado:** aparece apenas outline no bloco valido e nenhum cubo fantasma preenchido

## Rollback

Restaurar o clamp e o highlight anteriores, desde que a colocacao de bloco volte a funcionar de forma previsivel.

## Notas Tecnicas

- Esta task deve produzir um mini mapa tecnico da gameplay usado pelas demais tasks da PRD-015.
