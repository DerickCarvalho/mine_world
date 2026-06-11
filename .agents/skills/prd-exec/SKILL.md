---
name: prd-exec
description: Executar uma PRD existente do MineWorld pelo numero, orquestrando Jarvis para implementacao, Connor para investigacao continua e Ned para validacao final. Usar quando o usuario pedir /prd-exec, $prd-exec, executar, implementar ou concluir uma PRD. Nao usar para criar PRD.
---

# Executar PRD

## Entrada

Exigir numero. Normalizar `50`, `050` ou `PRD-050` para `050` e localizar exatamente uma pasta em `codex/prds/`.

## Preflight

1. Ler `AGENTS.md`, `codex/ESCOPO.md`, PRD, PRD tecnica e tasks.
2. Verificar status, dependencias, aceite, worktree e codigo relevante.
3. Pedir ao subagente `jarvis` auditoria curta de prontidao.
4. Para melhoria opcional, apresentar sugestao e prosseguir sem ampliar escopo. Perguntar somente se a lacuna for bloqueante ou mudar materialmente o resultado.

## Execucao

1. Usar Jarvis como executor principal e implementar tasks em ordem.
2. Atualizar task com `npm run harness -- task:status ...`; a CLI bloqueia conclusao com checklist pendente.
3. Apos cada conjunto coerente, pedir ao subagente `connor` investigacao independente e corrigir achados confirmados.
4. Repetir Jarvis -> Connor ate nao restarem inconsistencias confirmadas.
5. Pedir ao subagente `ned` a rodada final de sintaxe, testes, smoke/E2E e regressao.
6. Se Ned achar bugs, Jarvis corrige, Connor verifica e Ned repete.

## Conclusao

- Atualizar PRD, tasks e `codex/ESCOPO.md` conforme a realidade.
- Criar o relatorio com `npm run harness -- validation:create prd NNN`.
- Alterar estado da PRD apenas com `npm run harness -- prd:status NNN "<estado>"`.
- Executar `npm test` e registrar os resultados no relatorio.
- Nao marcar `Implementada` com aceite pendente ou teste essencial nao realizado.
- Resumir implementacao, achados/correcoes, testes, evidencias e riscos.
