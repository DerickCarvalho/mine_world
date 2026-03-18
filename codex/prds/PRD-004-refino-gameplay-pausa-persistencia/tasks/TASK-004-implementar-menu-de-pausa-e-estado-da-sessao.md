# TASK-004: Implementar menu de pausa e estado da sessao

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002 |
| **Bloqueia** | TASK-005 |

---

## Objetivo

Adicionar pause menu real na gameplay, com estados formais de sessao e interrupcao efetiva da simulacao quando o jogo estiver pausado.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `pages/jogo.php` | Modificar | Marcar o menu de pausa na tela |
| `assets/css/custom/pages/jogo.css` | Modificar | Estados visuais de pausa |
| `assets/js/game/GameApp.js` | Modificar | State machine e pausa real |
| `assets/js/game/ui/SceneOverlay.js` | Modificar | Coordenar overlays com pausa |
| `assets/js/game/ui/PauseMenu.js` | Criar | Novo modulo |

---

## Passos de Implementacao

1. Criar a UI do pause menu com opcoes `Retornar ao jogo` e `Salvar e sair`.
2. Introduzir estados explicitos de sessao no `GameApp`.
3. Fazer `P` alternar pausa e retomada usando a nova acao discreta do input.
4. Ao pausar, parar update de gameplay e liberar o pointer lock.
5. Ao retomar, fechar o menu e reabilitar o fluxo normal de jogo.

---

## Regras e Cuidados

- Pausa precisa ser real: sem movimento, gravidade ou leitura de mouse aplicada enquanto pausado.
- O usuario nao deve sair da tela de jogo ao apenas pausar.
- O menu deve conviver com overlays de loading e erro sem conflito visual.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] `P` abre o pause menu
- [ ] Simulacao para de fato enquanto pausado
- [ ] Pointer lock e liberado ao pausar
- [ ] `Retornar ao jogo` restaura o fluxo normal

---

## Testes de Verificacao

### Teste 1

- **Acao:** Entrar em um mundo, andar, apertar `P` e tentar continuar se movendo.
- **Resultado esperado:** O menu abre e a posicao do jogador nao continua mudando enquanto pausado.

### Teste 2

- **Acao:** Pausar e escolher `Retornar ao jogo`.
- **Resultado esperado:** O menu fecha, o jogo retoma e o cursor volta a ser capturavel de forma controlada.

---

## Rollback

Remover o modulo `PauseMenu.js`, desfazer o markup/CSS de pausa e restaurar o `GameApp` ao loop sem estado formal de sessao.

---

## Notas Tecnicas

- Esta task ainda nao fecha o save; ela entrega a infraestrutura de pausa sobre a qual o `Salvar e sair` vai se apoiar.
