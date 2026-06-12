# TASK-002: Refinar itens da mao e da UI

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **PRD Tecnica** | [PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md](../PRD-TECNICA-013-polimento-visual-camera-mobs-worldgen-v4-1.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-001 |
| **Bloqueia** | TASK-005 |
| **Criterios cobertos** | CA-03, CA-04 |

## Objetivo

Melhorar a leitura visual do held item, da hotbar e do inventario sem mudar o contrato funcional de selecao e pilhas. O resultado deve parecer mais intencional e coerente com os blocos do mundo.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/ItemIcon.js` | Modificar | Composicao visual dos itens |
| `assets/js/game/ui/FirstPersonHand.js` | Modificar | Held item refinado |
| `assets/js/game/ui/Hotbar.js` | Modificar | Render de slots |
| `assets/js/game/ui/InventoryPanel.js` | Modificar | Render de inventario |
| `assets/css/custom/pages/jogo.css` | Modificar | Aparencia e alinhamento visual |

## Passos de Implementacao

1. Evoluir o markup visual do item para refletir melhor topo, lado, frente, proporcao e enquadramento.
2. Ajustar escalas, sombras e posicionamento do held item e dos icones da UI para reduzir aspecto de placeholder.
3. Verificar consistencia visual entre slot ativo, hotbar e inventario com diferentes tipos de bloco.

## Regras e Cuidados

- O mesmo bloco precisa ser reconhecivel na mao, na hotbar e no inventario.
- Nao transformar a HUD em uma copia literal da referencia externa; manter identidade do MineWorld.
- O custo de CSS e DOM deve permanecer leve.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** percorrer slots com blocos basicos diferentes e observar held item, hotbar e inventario.
- **Resultado esperado:** a representacao visual permanece coerente e claramente distinguivel.

### Teste 2

- **Acao:** abrir e fechar inventario durante a gameplay, trocando stacks e slots ativos.
- **Resultado esperado:** os icones permanecem estaveis e sem quebrar o fluxo de selecao.

## Rollback

Restaurar o `ItemIcon` e os estilos atuais do held item e da UI, mantendo apenas o fallback de mao vazia da task anterior.

## Notas Tecnicas

- Cobertura principal: `CA-03` e `CA-04`.
