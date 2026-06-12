# TASK-008: Validar integracao, performance e aderencia final

## Metadados

| Campo | Valor |
|-------|-------|
| **PRD** | [PRD-015-survival-classico-combate-fome-outline.md](../PRD-015-survival-classico-combate-fome-outline.md) |
| **PRD Tecnica** | [PRD-TECNICA-015-survival-classico-combate-fome-outline.md](../PRD-TECNICA-015-survival-classico-combate-fome-outline.md) |
| **Harness Version** | 2 |
| **Status** | Pendente |
| **Depende de** | TASK-004, TASK-005, TASK-006, TASK-007 |
| **Bloqueia** | Nenhuma |
| **Criterios cobertos** | CA-01, CA-13, CA-14 |

## Objetivo

Executar a checagem integrada da PRD-015, cobrindo regressao funcional, performance, sintaxe, harness e smoke manual dos fluxos survival.

## Arquivos / Modulos Afetados

| Arquivo / Modulo | Acao | Referencia |
|------------------|------|------------|
| `codex/execucoes/PRD-015-validacao.md` | Criar | evidencia final da execucao |
| `codex/ESCOPO.md` | Modificar | status consolidado apos execucao |
| `codex/scripts/` | Revisar | testes relevantes existentes |

## Passos de Implementacao

1. Rodar checks sintaticos, harness e testes automatizados relevantes.
2. Fazer smoke manual da camera, outline, worldgen, inventario, fome, mobs, combate e drops.
3. Registrar evidencia, limitacoes e status final sem fingir aprovado o que nao foi validado.

## Regras e Cuidados

- Se algum teste nao puder rodar, a limitacao precisa ser documentada.
- Performance ruim invalida a entrega mesmo com feature “funcionando”.
- O status da PRD precisa refletir o estado real da validacao.

## Checklist de Validacao

- [ ] Implementacao realizada no modulo correto
- [ ] Fluxo principal testado
- [ ] Regressao manual basica verificada
- [ ] Documentacao atualizada se necessario

## Testes de Verificacao

### Teste 1

- **Acao:** rodar `npm test`, `npm run test:harness` e checks sintaticos aplicaveis
- **Resultado esperado:** suite verde ou falhas claramente registradas com causa e impacto

### Teste 2

- **Acao:** executar smoke manual completo da checklist da PRD
- **Resultado esperado:** evidencia suficiente para Connor/Ned fecharem a entrega com honestidade

## Rollback

Nao se aplica diretamente; esta task consolida validacao e documentacao da execucao.

## Notas Tecnicas

- Esta task e obrigatoria para encerrar a PRD sem autoengano.
