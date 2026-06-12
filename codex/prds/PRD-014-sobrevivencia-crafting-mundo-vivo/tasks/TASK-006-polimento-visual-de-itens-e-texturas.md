# TASK-006: Polimento visual de itens e texturas

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-003 |
| **Bloqueia** | TASK-007 |
| **Criterios cobertos** | CA-09, CA-10, CA-11 |

## Objetivo

Melhorar a aparencia dos itens na UI, introduzir balanco da mao vazia e corrigir ou tornar configuravel a orientacao das texturas por face.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/ui/ItemIcon.js` | Modificar | Visual dos itens |
| `assets/js/game/ui/FirstPersonHand.js` | Modificar | Mao vazia com balanco |
| `assets/js/game/ui/Hotbar.js` | Revisar | Render visual |
| `assets/js/game/ui/InventoryPanel.js` | Revisar | Render visual |
| `assets/js/game/world/ChunkMesher.js` | Modificar | UV/orientacao |
| `assets/js/game/world/ChunkMaterials.js` | Modificar | Metadados de textura |
| `assets/js/paginas/texturas.js` | Modificar | Ajuste de direcao no menu, se necessario |

## Passos de Implementacao

1. Refinar a representacao visual dos itens no inventario e hotbar.
2. Introduzir balanco coerente da mao vazia em movimento.
3. Corrigir orientacao de textura no runtime ou expor configuracao por face no CRUD.

## Regras e Cuidados

- Mundo e UI precisam enxergar a textura da mesma maneira.
- Nao empilhar correcao visual ad hoc em cada tela; o ideal e centralizar no pipeline.
- A mao vazia nao deve conflitar com held item real.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** abrir inventario/hotbar com diversos blocos e observar a representacao visual.
- **Resultado esperado:** os itens ficam mais bonitos, consistentes e reconheciveis.

### Teste 2

- **Acao:** anexar textura lateral com orientacao evidente e renderizar o bloco no mundo e na UI.
- **Resultado esperado:** a orientacao fica correta ou ajustavel pelo menu sem divergencia.

## Rollback

Restaurar o pipeline visual anterior de item/mao/textura e retirar controles extras de direcao, se tiverem sido adicionados.

## Notas Tecnicas

- Esta task absorve parte do polimento pedido tambem na PRD-013, caso ela ainda nao tenha sido executada.
