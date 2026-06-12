# DT-001: Evitar timeout na criacao e pre-geracao inicial de mundo

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DT-001 |
| **Harness Version** | 2 |
| **Status** | Concluida |
| **Prioridade** | Alta |
| **Data** | 11/06/2026 |
| **Autor** | Codex + Tony Stark |
| **PRD de origem** | PRD-006, PRD-011 |

## Contexto e causa

Ao criar um mundo, o cadastro dos metadados conclui, mas a interface aguarda tambem a pre-geracao e persistencia da janela inicial de 25 chunks. O salvamento usa o timeout global de 15 segundos e o backend normaliza os payloads de chunks duas vezes antes de executar upserts individuais.

Em uma medicao local, gerar os 25 chunks levou aproximadamente 198 ms. Ja o fluxo autenticado completo permaneceu bloqueado por mais de 180 segundos; ao inspecionar o banco, o mundo havia sido criado, mas possuia zero chunks persistidos. Como o frontend trata cadastro e pre-geracao no mesmo bloco de erro, o usuario recebe a mensagem enganosa de que a criacao do mundo falhou e pode tentar criar mundos duplicados.

## Objetivo

Tornar a criacao e a pre-geracao inicial de mundos resilientes, sem timeout enganoso e sem alterar o timeout global das demais APIs.

## Escopo incluido

- Permitir que uma requisicao defina um timeout especifico, mantendo 15 segundos como padrao global.
- Usar timeout especifico apenas nas operacoes de carregar e salvar chunks.
- Reduzir o tamanho dos lotes da pre-geracao inicial de 8 para 3 ou 4 chunks.
- Remover a normalizacao duplicada de payloads de chunks no backend.
- Separar, na interface, falha de cadastro de mundo de falha na preparacao inicial.
- Manter o mundo criado quando a pre-geracao falhar e informar que a preparacao sera retomada ao abri-lo.
- Garantir que uma pre-geracao parcial seja retomada sem regenerar chunks ja persistidos.
- Medir a duracao dos lotes durante a validacao da correcao.

## Fora de escopo

- Mover a geracao para Web Worker.
- Criar fila assincrona no backend.
- Alterar schema ou formato de armazenamento dos chunks.
- Adicionar compressao binaria.
- Reescrever o gerador de mundo.
- Alterar o raio inicial ou a quantidade de 25 chunks.
- Refatorar completamente `ApiRequest`.

## Arquivos / modulos afetados

| Arquivo / modulo | Acao | Motivo |
| --- | --- | --- |
| `assets/js/ApiRequest.js` | Modificar | Suportar timeout por requisicao sem alterar o padrao global. |
| `assets/js/paginas/mundos.js` | Modificar | Separar cadastro e preparacao na experiencia e retomar falhas parciais. |
| `assets/js/game/services/WorldPrebuilder.js` | Modificar | Ajustar lotes, progresso e retomada da pre-geracao. |
| `assets/js/game/services/WorldRepository.js` | Modificar | Aplicar timeout especifico nas operacoes de chunks. |
| `api/mundos/salvar_chunks.php` | Modificar | Evitar normalizacao duplicada antes da persistencia. |
| `api/mundos/_common.php` | Modificar | Garantir normalizacao unica e revisar o custo da persistencia. |
| `codex/scripts/` | Criar ou modificar | Adicionar medicao reproduzivel do fluxo de criacao e persistencia inicial. |

## Plano de implementacao

1. Criar uma medicao reproduzivel do tempo de geracao, envio e persistencia por lote.
2. Remover a segunda normalizacao dos payloads no caminho de `salvar_chunks.php`.
3. Adicionar suporte opcional a timeout por requisicao em `ApiRequest`.
4. Aplicar timeout especifico para chunks e reduzir o lote inicial para 3 ou 4 chunks.
5. Separar o sucesso do cadastro do resultado da pre-geracao na interface.
6. Validar a retomada idempotente apos interrupcao parcial.
7. Executar testes de regressao do cadastro, abertura e salvamento de mundos.

## Riscos e rollback

- **Risco:** Lotes menores aumentam a quantidade de requisicoes; medir o tempo total antes de concluir.
- **Risco:** Um timeout especifico maior pode esconder regressao; manter medicao por lote e nao alterar o timeout global.
- **Risco:** A retomada parcial precisa permanecer idempotente para nao regenerar ou sobrescrever chunks persistidos incorretamente.
- **Risco:** Alteracoes em `WorldRepository.saveChunks()` afetam salvamentos durante o jogo.
- **Rollback:** Restaurar o tamanho de lote e o caminho anterior de requisicao, mantendo apenas a separacao da mensagem de cadastro.

## Criterios de aceite

- [x] **CA-01:** Criar um novo mundo nao termina com erro de tempo limite.
- [x] **CA-02:** Os 25 chunks iniciais sao persistidos no banco.
- [x] **CA-03:** Cada payload de chunk e normalizado apenas uma vez no backend.
- [x] **CA-04:** O timeout padrao das APIs comuns permanece em 15 segundos.
- [x] **CA-05:** Falha na pre-geracao nao e apresentada como falha no cadastro do mundo.
- [x] **CA-06:** Uma pre-geracao interrompida retoma sem regenerar chunks ja persistidos.
- [x] **CA-07:** Abrir mundos existentes e salvar chunks durante o jogo continuam funcionando.
- [x] **CA-08:** A interface permanece responsiva e atualiza o progresso entre lotes.

## Plano de validacao

- Executar `npm test`.
- Criar um mundo novo e confirmar os 25 chunks iniciais no banco.
- Interromper a pre-geracao apos um lote e confirmar a retomada dos chunks restantes.
- Medir a duracao de cada lote e confirmar que o timeout global comum permanece em 15 segundos.
- Abrir um mundo existente, alterar chunks e confirmar o salvamento.

## Evidencias de conclusao

- Causa raiz local confirmada no log PHP: FastCGI apontava `TEMP/TMP` para `C:\Windows\Temp`, sem conseguir criar o arquivo temporario necessario para armazenar o corpo JSON; o PHP descartava todo o POST antes do endpoint.
- `npm run setup:local` corrigiu o FastCGI para `C:/laragon/tmp`, reiniciou o Apache e validou cadastro, autenticacao, criacao, persistencia, carga e exclusao de mundo.
- O fluxo autenticado persistiu e recarregou os 25 chunks iniciais; lote mais lento medido em 14 ms.
- `test-world-prebuilder.mjs` confirmou retomada parcial: preservou um chunk existente e gerou somente os 24 ausentes.
- `npm test` passou antes da ultima correcao do fallback de abertura: harness com 0 erros, sintaxe 106/106, retomada parcial e smoke HTTP aprovados.
- Connor encontrou e motivou a reducao dos lotes secundarios do `GameApp` para quatro e a tolerancia a falha de persistencia durante a abertura.
- Smoke autenticado headless abriu o mundo, inicializou WebGL, atualizou a interface e confirmou o fluxo de abertura sem timeout.
- Nova validacao autenticada persistiu e recarregou 25 chunks; lote mais lento medido em 43 ms.

## Historico de Requisitos

| Requisito / Decisao | Estado | Substitui | Substituido por | Motivo |
|---------------------|--------|-----------|----------------|--------|
| Pre-gerar e armazenar a janela inicial | Vigente | PRD-006 | - | Preservar o carregamento inicial previsto. |
| Manter estabilidade de runtime | Vigente | PRD-011 | - | Evitar bloqueio e timeout durante a preparacao. |
| Tratar falha de pre-geracao separadamente do cadastro | Vigente | Comportamento anterior da PRD-006 e PRD-011 | - | Impedir erro enganoso e criacao duplicada de mundos. |
