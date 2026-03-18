# TASK-004: Implementar mao em primeira pessoa

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | TASK-002, TASK-003 |
| **Bloqueia** | TASK-007 |

---

## Objetivo

Adicionar a mao do personagem em primeira pessoa com animacao leve de idle, caminhada e uso, conectada ao estado de movimento e de interacao com blocos.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/FirstPersonHand.js` | Criar | Novo modulo |
| `assets/js/game/GameApp.js` | Modificar | Integracao com eventos de uso |
| `pages/jogo.php` | Modificar | Container visual da mao |
| `assets/css/custom/pages/jogo.css` | Modificar | Estilos e animacoes |

---

## Passos de Implementacao

1. Criar a representacao visual da mao ancorada na HUD.
2. Animar idle e caminhada com base na velocidade do jogador.
3. Disparar animacao de uso ao quebrar e ao colocar blocos.

---

## Regras e Cuidados

- A mao deve permanecer no canto inferior da tela sem encobrir o reticulo central.
- A animacao deve continuar barata e independente do renderer de chunks.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Mao visivel na gameplay
- [ ] Animacao de caminhada reagindo ao deslocamento
- [ ] Animacao de uso disparando em quebra e colocacao
- [ ] Integracao sem regressao na HUD

---

## Testes de Verificacao

### Teste 1

- **Acao:** caminhar continuamente com `WASD`.
- **Resultado esperado:** a mao executa um balanco perceptivel de caminhada.

### Teste 2

- **Acao:** quebrar e colocar blocos em sequencia.
- **Resultado esperado:** a mao responde com animacao curta de uso a cada interacao.

---

## Rollback

Remover `FirstPersonHand.js` e retirar o container/estilos correspondentes da tela de jogo.

---

## Notas Tecnicas

- O visual pode ser provisorio nesta fase, desde que a leitura da acao fique clara.
