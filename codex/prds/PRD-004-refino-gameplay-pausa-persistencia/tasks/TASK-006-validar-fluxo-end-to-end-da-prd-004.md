# TASK-006: Validar fluxo end-to-end da PRD-004

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-003, TASK-005 |
| **Bloqueia** | Nenhuma |

---

## Objetivo

Executar a rodada final de validacao integrada da PRD-004, ajustando arestas de performance, pausa e retomada antes de marcar a entrega como concluida.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | Ajustes finais se surgirem |
| `assets/js/game/render/SoftwareRenderer.js` | Modificar | Afinacoes finais se surgirem |
| `assets/js/game/player/PlayerController.js` | Modificar | Afinacoes finais se surgirem |
| `assets/js/game/services/WorldRepository.js` | Modificar | Tratamento final de erros |
| `codex/prds/PRD-004-refino-gameplay-pausa-persistencia/` | Validar | Consistencia documental da PRD |

---

## Passos de Implementacao

1. Rodar a matriz manual de testes da PRD-004 no fluxo completo.
2. Validar save, retorno ao menu e retomada do mesmo mundo.
3. Revisar travamentos mais evidentes na exploracao inicial e ajustar limites se necessario.
4. Confirmar que pause, pointer lock e cleanup continuam consistentes apos varias entradas e saidas.
5. Atualizar a documentacao operacional se algum ajuste de contrato ou comportamento for necessario.

---

## Regras e Cuidados

- Esta task deve corrigir apenas arestas residuais, nao reabrir o escopo da PRD.
- Entradas e saidas repetidas da rota `jogo` nao podem acumular listeners ou estados zumbis.
- Se algum ajuste mudar o entendimento do escopo, refletir isso na documentacao principal aplicavel.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Fluxo principal da PRD-004 testado ponta a ponta
- [ ] Regressao basica da rota `jogo` revisada
- [ ] Pause e save consistentes em repeticoes
- [ ] Documentacao final coerente com o comportamento entregue

---

## Testes de Verificacao

### Teste 1

- **Acao:** Executar o fluxo completo: entrar no mundo, andar, pausar, retornar, pausar de novo, salvar e sair, reabrir.
- **Resultado esperado:** Todos os estados funcionam sem quebra visual, sem input preso e com retomada correta do mundo.

### Teste 2

- **Acao:** Entrar e sair da rota `jogo` varias vezes, inclusive apos save e sem save.
- **Resultado esperado:** Nao ha duplicacao de eventos, overlays presos ou degradacao evidente do fluxo.

---

## Rollback

Reverter apenas os ajustes finais introduzidos nesta task, preservando a estrutura principal aprovada nas tasks anteriores.

---

## Notas Tecnicas

- Esta task fecha a PRD-004 e prepara o terreno para a proxima frente de texturas e interacao com blocos.
