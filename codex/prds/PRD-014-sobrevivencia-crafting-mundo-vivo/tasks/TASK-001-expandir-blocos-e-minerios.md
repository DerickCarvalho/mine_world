# TASK-001: Expandir blocos e minerios

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | Nenhuma |
| **Bloqueia** | TASK-002, TASK-003, TASK-004, TASK-005 |
| **Criterios cobertos** | CA-01, CA-02 |

## Objetivo

Ampliar o catalogo de blocos e introduzir uma primeira camada de minerios e derivados para sustentar progressao, crafting e variedade visual no mundo.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `assets/js/game/world/BlockTypes.js` | Modificar | Catalogo de blocos |
| `assets/js/game/world/TerrainGenerator.js` | Modificar | Distribuicao de minerios |
| `assets/js/game/world/MutableWorld.js` | Modificar | Drops e leitura do mundo |
| `assets/js/game/services/WorldRepository.js` | Revisar | Persistencia |

## Passos de Implementacao

1. Definir novos blocos, minerios e derivados basicos com IDs estaveis.
2. Introduzir regras de distribuicao procedural e de coleta/drops.
3. Garantir que save, hotbar e render reconhecam os novos recursos.

## Regras e Cuidados

- Novos recursos precisam funcionar em mundo, UI e persistencia.
- A distribuicao de minerio nao pode ser arbitraria a ponto de quebrar a fantasia do mundo.
- Evitar inflar o catalogo inicial alem do que a PRD consegue validar direito.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** criar mundos novos e explorar diferentes altitudes/profundidades.
- **Resultado esperado:** novos recursos aparecem de forma coerente e coletavel.

### Teste 2

- **Acao:** coletar recursos novos, salvar e reabrir o mundo.
- **Resultado esperado:** inventario e mutacoes preservam os novos itens corretamente.

## Rollback

Restaurar o catalogo anterior de blocos e remover a distribuicao procedural dos novos recursos.

## Notas Tecnicas

- Base de progressao para o restante da PRD.
