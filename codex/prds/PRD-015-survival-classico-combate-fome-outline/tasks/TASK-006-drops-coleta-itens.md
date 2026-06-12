# TASK-006: Implementar drops, coleta e integracao com inventario

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-005 |
| **Bloqueia** | TASK-008 |
| **Criterios cobertos** | CA-11, CA-13, CA-14 |

## Objetivo

Fechar o loop de recompensa dos mobs com drops visiveis no mundo, pickup e integracao correta com o inventario.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/GameApp.js` | Modificar | spawn e coleta de drops |
| `assets/js/game/entities/` | Modificar | emissao de drop na morte |
| `assets/js/game/inventory/InventoryOperations.js` | Revisar | integracao de pickup com stacks |
| `assets/js/game/render/` | Criar/Modificar | representacao visual de drop |

## Passos de Implementacao

1. Criar representacao runtime para drops no chao.
2. Integrar morte de mob com spawn de drop e pickup por proximidade.
3. Garantir que itens coletados empilhem corretamente sem duplicacao.

## Regras e Cuidados

- Inventario cheio precisa de comportamento previsivel.
- O drop precisa ser leve de atualizar por frame.
- Nao serializar o que nao precisa ficar salvo entre sessoes.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** matar um mob e se aproximar do drop
- **Resultado esperado:** surge item coletavel no chao e ele entra no inventario ao pegar

### Teste 2

- **Acao:** repetir a coleta com stack do mesmo item ja existente
- **Resultado esperado:** a quantidade soma corretamente sem perder item

## Rollback

Desligar a emissao e o runtime dos drops, mantendo o restante do combate funcional.

## Notas Tecnicas

- Os primeiros drops podem ser simples; o importante aqui e fechar integridade do ciclo.
