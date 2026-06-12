# Validacao - DT-001

## Resultado

| Campo | Valor |
|-------|-------|
| **Documento** | [DT-001](../debitos-tecnicos/DT-001-timeout-criacao-mundo/DT-001-timeout-criacao-mundo.md) |
| **Harness Version** | 2 |
| **Data** | 11/06/2026 |
| **Resultado final** | Aprovado |
| **Responsavel pela execucao** | Jarvis |
| **Investigacao** | Connor |
| **Validacao final** | Ned |

## Criterios de aceite

| Criterio | Resultado | Evidencia |
|----------|-----------|-----------|
| CA-01 a CA-04 | Passou | Criacao autenticada, 25 chunks e timeouts validados localmente |
| CA-05 | Passou | Cadastro permanece criado quando preparacao falha; mensagens separadas no frontend |
| CA-06 | Passou | `test-world-prebuilder.mjs` preserva chunk existente e gera somente ausentes |
| CA-07 | Passou | API autenticada persistiu e recarregou chunks; smoke abriu mundo existente |
| CA-08 | Passou | Smoke headless abriu WebGL e interface respondeu durante preparacao |

## Validacoes executadas

| Comando / fluxo | Resultado | Evidencia relevante |
|-----------------|-----------|---------------------|
| `npm run setup:local` | Passou | Ambiente, migrations e API local configurados |
| `node codex/scripts/test-local-api.mjs` | Passou | CRUD e 25 chunks; lote mais lento 43 ms |
| `npm run test:world-prebuilder` | Passou | Retomada parcial idempotente |
| `npm run test:browser` | Passou | Mundo aberto em WebGL, inventario responsivo e screenshot gerada |

## Achados e correcoes

| Origem | Achado | Correcao | Verificacao |
|--------|--------|----------|-------------|
| Connor | Abertura podia falhar ao salvar chunks iniciais | Fallback local e lotes limitados a quatro | API e browser smoke aprovados |
| Ned | Faltava provar abertura real | Smoke Playwright autenticado adicionado | Passou |

## Limitacoes e riscos residuais

- O benchmark headless usa SwiftShader e nao representa desempenho de uma GPU real.
