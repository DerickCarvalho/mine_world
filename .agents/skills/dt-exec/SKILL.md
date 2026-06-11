---
name: dt-exec
description: Executar um Debito Tecnico existente do MineWorld pelo numero, usando Jarvis para implementacao, Connor para investigar divergencias e Ned para validacao final. Usar quando o usuario pedir /dt-exec, $dt-exec, executar ou concluir uma DT. Nao usar para criar DT ou executar PRD.
---

# Executar Debito Tecnico

## Entrada

Exigir numero. Normalizar `5`, `005` ou `DT-005` para `005` e localizar exatamente uma pasta em `codex/debitos-tecnicos/`.

## Fluxo

1. Ler `AGENTS.md`, `codex/ESCOPO.md`, DT, PRD de origem quando houver, worktree e codigo relevante.
2. Pedir ao subagente `jarvis` auditoria curta. Se a DT cresceu e deveria ser PRD, interromper; para lacunas nao bloqueantes, registrar premissas.
3. Jarvis marca `Em andamento`, implementa e valida.
4. Pedir ao subagente `connor` investigacao independente. Jarvis corrige achados confirmados; Connor verifica novamente.
5. Pedir ao subagente `ned` sintaxe, testes e smoke/E2E final. Bugs voltam para Jarvis, depois Connor e Ned.
6. Marcar `Concluida` somente quando aceite e validacoes estiverem satisfeitos.

## Conclusao

- Atualizar DT e `codex/ESCOPO.md` quando aplicavel.
- Criar o relatorio com `npm run harness -- validation:create dt NNN`.
- Alterar estado apenas com `npm run harness -- dt:status NNN "<estado>"`.
- Executar `npm test` e registrar os resultados no relatorio.
- Resumir mudancas, achados/correcoes, testes, evidencias e riscos.
