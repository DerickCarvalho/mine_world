# TASK-007: Integrar persistencia e validar loop sandbox

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-005-loop-sandbox-inventario-superficie.md](../PRD-005-loop-sandbox-inventario-superficie.md) |
| **PRD Tecnica** | [PRD-TECNICA-005-loop-sandbox-inventario-superficie.md](../PRD-TECNICA-005-loop-sandbox-inventario-superficie.md) |
| **Status** | Concluida |
| **Depende de** | TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006 |
| **Bloqueia** | Nenhuma |

---

## Objetivo

Consolidar o loop sandbox completo, garantir retomada consistente do mundo com inventario e mutacoes persistidas, e validar o fluxo fim a fim da PRD-005.

---

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | Integracao final do runtime |
| `assets/js/game/services/WorldRepository.js` | Modificar | Save/load final |
| `pages/jogo.php` | Modificar | Ajustes finais de HUD |
| `assets/css/custom/pages/jogo.css` | Modificar | Ajustes finais de UI |

---

## Passos de Implementacao

1. Integrar save v2, inventario, mundo mutavel, mao e superficie enriquecida no bootstrap da gameplay.
2. Garantir `Salvar e sair` e retomada completa do mundo alterado.
3. Executar validacoes manuais e tecnicas da PRD-005 e registrar ajustes finais.

---

## Regras e Cuidados

- O mundo deve ser reconstruido com mutacoes antes do primeiro frame jogavel.
- O save precisa persistir o estado coerente do inventario, slot ativo e alteracoes do terreno.
- Confirmar aderencia ao padrao `login.php` / `index.php?page=` / `pages/` / `assets/js/paginas/` / `api/{dominio}/{acao}.php` / `ENV` / wrapper de request.

---

## Checklist de Validacao

- [ ] Fluxo de mundo novo funcionando
- [ ] Fluxo de salvar e reabrir funcionando
- [ ] Inventario e mutacoes restaurados corretamente
- [ ] Regressao basica da PRD-004 validada

---

## Testes de Verificacao

### Teste 1

- **Acao:** quebrar blocos, coletar recursos, colocar novos blocos, salvar e sair.
- **Resultado esperado:** ao reabrir o mesmo mundo, terreno e inventario aparecem como estavam ao sair.

### Teste 2

- **Acao:** criar um mundo novo, explorar areas com agua, areia e arvores, e interagir com blocos.
- **Resultado esperado:** o loop sandbox funciona de ponta a ponta sem erro estrutural no runtime.

---

## Rollback

Desfazer a integracao final no `GameApp.js` e no `WorldRepository.js`, mantendo apenas a base da PRD-004 caso a PRD-005 precise ser retirada.

---

## Notas Tecnicas

- Esta task fecha a PRD-005 e deve revisar qualquer ajuste de documentacao necessario ao final da execucao.
