# TASK-007: Polir mao, itens, texturas e coerencia visual

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-002, TASK-003, TASK-004 |
| **Bloqueia** | TASK-008 |
| **Criterios cobertos** | CA-06, CA-09, CA-13 |

## Objetivo

Dar acabamento visual coerente ao inventario, aos blocos na mao, a mao vazia, ao ceu/cores e a leitura geral do jogo.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/FirstPersonHand.js` | Modificar | mao vazia e animacao |
| `assets/js/game/ui/ItemIcon.js` | Modificar | representacao visual dos itens |
| `assets/css/custom/pages/jogo.css` | Modificar | HUD, hotbar e inventario |
| `assets/js/game/world/ChunkMesher.js` | Revisar | UVs e orientacao de textura |
| `assets/js/paginas/texturas.js` | Revisar | configuracao visual das texturas, se necessario |

## Passos de Implementacao

1. Refinar a mao vazia e o item equipado em primeira pessoa.
2. Ajustar icones e blocos da UI para parecerem limpos e reconheciveis.
3. Revisar texturas/UVs e o conjunto visual geral do jogo.

## Regras e Cuidados

- O polimento nao pode reintroduzir bugs de hitbox, crosshair ou outline.
- Melhoria visual precisa respeitar performance.
- Ajustes de textura devem ser coerentes entre mundo, hotbar e inventario.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** selecionar slot vazio e depois slot com item
- **Resultado esperado:** aparece mao vazia no primeiro caso e item/bloco coerente no segundo

### Teste 2

- **Acao:** abrir inventario e observar itens basicos, stacks e textura dos blocos
- **Resultado esperado:** nao ha icones quebrados, invertidos ou cortados

## Rollback

Recuar para a representacao visual anterior e preservar apenas ajustes comprovadamente corretos de UV e CSS.

## Notas Tecnicas

- Esta task existe para o jogo parar de parecer um mosaico de sistemas de fases diferentes.
