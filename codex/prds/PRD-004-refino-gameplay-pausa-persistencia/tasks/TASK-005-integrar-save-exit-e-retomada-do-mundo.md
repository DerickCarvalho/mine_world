# TASK-005: Integrar save-exit e retomada do mundo

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-004-refino-gameplay-pausa-persistencia.md](../PRD-004-refino-gameplay-pausa-persistencia.md) |
| **PRD Tecnica** | [PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md](../PRD-TECNICA-004-refino-gameplay-pausa-persistencia.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001, TASK-002, TASK-004 |
| **Bloqueia** | TASK-006 |

---

## Objetivo

Conectar o backend de save ao runtime para permitir `Salvar e sair`, retorno ao menu principal e retomada do mundo no ultimo ponto salvo.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/services/WorldRepository.js` | Modificar | Leitura e escrita de save state |
| `assets/js/game/GameApp.js` | Modificar | Fluxo de save, redirect e restore |
| `assets/js/paginas/jogo.js` | Modificar | Bootstrap com contexto completo |
| `api/mundos/buscar.php` | Reutilizar | Contexto de abertura do mundo |
| `api/mundos/salvar_estado.php` | Reutilizar | Persistencia do ultimo estado |

---

## Passos de Implementacao

1. Expandir o `WorldRepository` para carregar `save_state` e salvar o estado atual do runtime.
2. Fazer o bootstrap escolher entre ultimo save valido e spawn procedural.
3. Capturar posicao/orientacao validas ao acionar `Salvar e sair`.
4. Persistir o save, atualizar status da UI e redirecionar para `index.php?page=menu` somente apos sucesso.
5. Manter o usuario no pause menu com feedback claro em caso de falha de save.

---

## Regras e Cuidados

- O frontend nao pode considerar o save concluido antes da resposta `OK` do backend.
- Save ausente ou invalido deve cair para spawn procedural seguro.
- O redirecionamento apos salvar deve sempre voltar ao menu principal autenticado.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] `Salvar e sair` envia o payload correto
- [ ] Sucesso redireciona ao menu principal
- [ ] Falha de save nao redireciona silenciosamente
- [ ] Reabertura do mundo restaura a ultima pose salva

---

## Testes de Verificacao

### Teste 1

- **Acao:** Entrar em um mundo, mover para outro ponto, pausar e escolher `Salvar e sair`.
- **Resultado esperado:** O estado e persistido e o usuario volta para `index.php?page=menu`.

### Teste 2

- **Acao:** Reabrir o mesmo mundo apos o save anterior.
- **Resultado esperado:** O spawn acontece na ultima posicao/orientacao salvas, sem voltar ao ponto procedural inicial.

---

## Rollback

Desfazer a extensao do `WorldRepository` e do `GameApp` para save/load, mantendo apenas o fluxo de abertura procedural anterior.

---

## Notas Tecnicas

- Esta task deve salvar apenas o estado realmente relevante da versao atual, sem inventar mutacoes de bloco que ainda nao existem na gameplay.
