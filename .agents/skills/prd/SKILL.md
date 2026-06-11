---
name: prd
description: Conceber uma nova PRD do MineWorld a partir de ideia, problema ou pedido; analisar o projeto com Tony Stark e criar PRD de produto no modelo PDD, PRD tecnica e tasks. Usar quando o usuario pedir /prd, $prd, nova PRD, planejamento amplo ou transformar ideia em backlog. Nao usar para mudanca pequena e isolada, que pertence a DT.
---

# Criar PRD

## Entrada

Aceitar descricao livre e numero opcional. Criar a estrutura inicialmente com `npm run harness -- prd:create [numero] <slug> "<titulo>"`.

## Fluxo

1. Ler `AGENTS.md`, `codex/ESCOPO.md`, os templates e PRDs relacionadas.
2. Inspecionar codigo relevante e worktree.
3. Pedir explicitamente um subagente `tony-stark` para fortalecer escopo, riscos, dependencias, aceite e tasks.
4. Tratar "modelo PDD" como PRD orientada a descoberta: problema, impacto, usuario, resultado desejado, fluxos, escopo, requisitos e aceite antes da solucao tecnica.
5. Usar a CLI para criar `codex/prds/PRD-NNN-slug/` com:
   - `PRD-NNN-slug.md` pelo `TEMPLATE-PRD.md`;
   - `PRD-TECNICA-NNN-slug.md` pelo `TEMPLATE-PRD-TECNICA.md`;
   - `tasks/TASK-NNN-slug.md` para cada unidade, usando `npm run harness -- task:create ...`.
6. Atualizar `codex/ESCOPO.md` com status real.
7. Revisar links, numeracao, dependencias e cobertura do aceite pelas tasks.
8. Executar `npm run test:harness`.

## Regras

- Criar os tres niveis na mesma rodada, mas nao fingir aprovacao humana: usar `Rascunho` ou `Em validacao` quando aplicavel.
- Perguntar apenas quando uma decisao ausente mudar materialmente produto, dados ou arquitetura. Caso contrario, registrar premissas.
- Preferir tasks pequenas, ordenadas e verificaveis. Incluir task final de integracao/validacao em fluxos amplos.
- Dar um ID `CA-NN` para cada criterio e referenciar esses IDs nas tasks.
- Registrar requisitos que substituem comportamento anterior no `Historico de Requisitos`.
- Nao implementar codigo de produto.

## Saida

Informar numero, pasta criada, decisoes de Stark, premissas, perguntas abertas e prontidao para `$prd-exec NNN`.
