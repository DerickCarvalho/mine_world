# TASK-005: Implementar player controller

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-003-mundo-3d-procedural.md](../PRD-003-mundo-3d-procedural.md) |
| **PRD Tecnica** | [PRD-TECNICA-003-mundo-3d-procedural.md](../PRD-TECNICA-003-mundo-3d-procedural.md) |
| **Status** | Concluida |
| **Depende de** | TASK-004 |
| **Bloqueia** | TASK-006 |

---

## Objetivo

Implementar camera em primeira pessoa, pointer lock, movimento com `WASD`, salto, gravidade e colisao basica com o terreno.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/player/PlayerController.js` | Criar | Novo arquivo |
| `assets/js/game/player/InputState.js` | Criar | Novo arquivo |
| `assets/js/game/player/CollisionResolver.js` | Criar | Novo arquivo |
| `assets/js/game/GameApp.js` | Modificar | Integrar update do jogador |

---

## Passos de Implementacao

1. Implementar captura de mouse por pointer lock.
2. Implementar leitura de teclado para `WASD` e `espaco`.
3. Adicionar gravidade, velocidade, salto e damping basico.
4. Resolver colisao com o terreno usando consulta de solidez/altura por coluna.
5. Definir rotina de spawn seguro acima do terreno.

---

## Regras e Cuidados

- O jogador nao deve nascer enterrado.
- O jogador nao deve atravessar o solo nem cair indefinidamente.
- O controle precisa respeitar configuracoes como sensibilidade e `invert_y`, se presentes.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Pointer lock funcionando
- [ ] Movimento com `WASD` funcionando
- [ ] Salto e gravidade funcionando
- [ ] Colisao e spawn seguros funcionando

---

## Testes de Verificacao

### Teste 1

- **Acao:** Entrar na cena, capturar o mouse e mover camera e personagem.
- **Resultado esperado:** A orientacao e o deslocamento respondem aos controles esperados.

### Teste 2

- **Acao:** Caminhar ate aclives, bordas e fronteiras de chunk.
- **Resultado esperado:** O jogador permanece sobre o terreno sem atravessar blocos nem cair infinitamente.

---

## Rollback

Remover os modulos de player e desfazer a integracao com o loop do `GameApp`.

---

## Notas Tecnicas

- O modelo de fisica e propositalmente simples nesta primeira versao.
