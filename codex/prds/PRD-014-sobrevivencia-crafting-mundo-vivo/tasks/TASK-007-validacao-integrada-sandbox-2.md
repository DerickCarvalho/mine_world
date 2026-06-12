# TASK-007: Validacao integrada sandbox 2.0

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-014-sobrevivencia-crafting-mundo-vivo.md) |
| **PRD Tecnica** | [PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md](../PRD-TECNICA-014-sobrevivencia-crafting-mundo-vivo.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-002, TASK-003, TASK-004, TASK-005, TASK-006 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-04, CA-07, CA-08, CA-11, CA-12, CA-13 |

## Objetivo

Validar a convivencia entre progressao, modos de jogo, crafting, estruturas, mobs, escala do player e polimento visual sem regressao relevante.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `codex/execucoes/PRD-014-validacao.md` | Criar | Evidencia final |
| Runtime local do jogo | Testar | Mundos antigos e novos |
| `codex/prds/PRD-014-sobrevivencia-crafting-mundo-vivo/` | Revisar | Cobertura documental |

## Passos de Implementacao

1. Executar bateria automatizada e checks sintaticos.
2. Rodar smoke em sobrevivencia e criativo, com crafting, exploracao, mobs e estruturas.
3. Registrar evidencias, defeitos encontrados e correcoes finais antes da conclusao.

## Regras e Cuidados

- Validar tanto mundo antigo quanto mundo novo.
- Testar mais de uma seed; uma seed bonita nao valida o worldgen inteiro.
- Confirmar explicitamente que a escala do player nao regrediu.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** rodar `npm test`, `npm run test:harness` e checks sintaticos dos arquivos alterados.
- **Resultado esperado:** toda a bateria passa sem regressao.

### Teste 2

- **Acao:** jogar em sobrevivencia e criativo, craftar, explorar estruturas, encontrar mobs e validar mao vazia/texturas.
- **Resultado esperado:** a experiencia fica mais rica e coesa sem falha grave de persistencia ou runtime.

## Rollback

Nao se aplica como rollback de codigo; falhas aqui devem reabrir a task ou a entrega de origem correspondente.

## Notas Tecnicas

- Task final de Connor + Ned no fluxo de execucao.
