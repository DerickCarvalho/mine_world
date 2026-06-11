---
name: dt
description: Criar um Debito Tecnico pequeno e separado de PRDs para correcao, manutencao, melhoria interna ou item residual do MineWorld, fortalecendo a proposta com Tony Stark. Usar quando o usuario pedir /dt, $dt, debito tecnico ou pequena correcao isolada. Nao usar para funcionalidade ampla ou multiplas entregas.
---

# Criar Debito Tecnico

## Entrada

Aceitar descricao livre e numero opcional. Criar a estrutura inicialmente com `npm run harness -- dt:create [numero] <slug> "<titulo>"`.

## Fluxo

1. Ler `AGENTS.md`, `codex/ESCOPO.md`, `TEMPLATE-DT.md`, PRDs relacionadas e codigo relevante.
2. Pedir ao subagente `tony-stark` para confirmar que cabe em DT e melhorar causa, impacto, escopo, riscos e aceite.
3. Se exigir decisao importante de produto, mudanca ampla ou varias entregas, recomendar `$prd`.
4. Criar `codex/debitos-tecnicos/DT-NNN-slug/DT-NNN-slug.md`.
5. Atualizar `codex/ESCOPO.md` apenas se mudar estado consolidado ou for pendencia relevante.
6. Revisar se o documento e autocontido e executavel.
7. Executar `npm run test:harness`.

## Regras

- DT equivale a uma task independente: objetivo unico, escopo pequeno e validacao objetiva.
- Registrar PRD de origem quando for trabalho residual.
- Registrar requisitos substituidos no historico da DT.
- Nao implementar codigo.

## Saida

Informar numero, documento, analise de Stark, premissas e prontidao para `$dt-exec NNN`.
