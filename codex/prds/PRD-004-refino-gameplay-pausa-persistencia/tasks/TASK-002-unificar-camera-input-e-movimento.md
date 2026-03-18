# TASK-002: Unificar camera, input e movimento

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-004, TASK-005 |

---

## Objetivo

Corrigir a base vetorial do runtime para que movimento e camera usem a mesma orientacao, com mouse natural por padrao e pausa tratada como acao discreta.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/player/InputState.js` | Modificar | Acoes discretas e controle de pausa |
| `assets/js/game/player/PlayerController.js` | Modificar | Vetores de locomocao e look |
| `assets/js/game/render/SoftwareRenderer.js` | Modificar | Alinhar convencao da camera |
| `assets/js/game/world/WorldConfig.js` | Modificar | Garantir default natural de `invert_y` |
| `assets/js/game/core/CameraMath.js` | Criar | Helper compartilhado de orientacao |

---

## Passos de Implementacao

1. Criar um helper compartilhado para derivar vetores de frente/direita e normalizar yaw/pitch.
2. Refatorar `PlayerController.js` para usar esse helper no movimento.
3. Ajustar o consumo do mouse para leitura natural por padrao, respeitando `invert_y` apenas como opcao.
4. Adicionar acao discreta de pausa em `InputState.js`, evitando repeticoes por tecla segurada.
5. Validar que o renderer usa a mesma base de orientacao visual do player.

---

## Regras e Cuidados

- `W` deve sempre empurrar o jogador para a frente que esta sendo vista em tela.
- O eixo vertical do mouse nao pode nascer invertido.
- O ajuste deve preservar `invert_y = 1` como configuracao opcional.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Movimento segue a camera em 360 graus
- [ ] Mouse sobe a camera ao mover para cima por padrao
- [ ] `invert_y` continua funcional quando habilitado
- [ ] Acao de pausa consumida sem alternancia duplicada

---

## Testes de Verificacao

### Teste 1

- **Acao:** Entrar em um mundo, girar a camera para tras e apertar `W`.
- **Resultado esperado:** O jogador anda para a frente relativa da camera atual.

### Teste 2

- **Acao:** Testar o look vertical com `invert_y = 0` e depois com `invert_y = 1`.
- **Resultado esperado:** O comportamento padrao e natural, e a configuracao invertida continua opcional e consistente.

---

## Rollback

Remover o helper compartilhado de camera e restaurar o fluxo anterior de look/movimento em `InputState.js`, `PlayerController.js` e `SoftwareRenderer.js`.

---

## Notas Tecnicas

- Esta task nao pausa o jogo sozinha; ela apenas prepara os controles corretos e os gatilhos de input para a proxima etapa.
