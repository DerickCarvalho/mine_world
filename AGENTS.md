# MineWorld Agent Harness

## Fonte de verdade

- Ler `codex/ESCOPO.md` antes de planejar produto ou alterar comportamento.
- Tratar `codex/prds/` e `codex/debitos-tecnicos/` como registro de intencao e execucao.
- Usar os templates em `codex/_templates/` para documentos novos.
- Usar `npm run harness -- ...` para criar documentos, validar e alterar estados.
- Preservar alteracoes existentes no worktree.

## Mapa do projeto

- Shell web e rotas: `index.php`, `login.php`, `layout.php`, `pages/`, `partials/`.
- APIs e persistencia: `api/`, especialmente helpers compartilhados e migrations.
- Runtime do jogo: `assets/js/game/`.
- Integracao por pagina: `assets/js/paginas/`.
- Estilos: `assets/css/custom/pages/`.
- Referencias visuais: `codex/arquivos_para_se_basear/`.
- Documentacao de produto e execucao: `codex/`.

## Fluxos oficiais

- Conceber PRD: usar `$prd` (tambem aparece na lista de slash commands).
- Executar PRD: usar `$prd-exec` com o numero, por exemplo `050`.
- Conceber debito tecnico: usar `$dt`.
- Executar debito tecnico: usar `$dt-exec` com o numero.
- Usar os agentes customizados de `.codex/agents/` conforme a skill determinar.

## Regras de documentacao

- Novas PRDs devem usar o formato completo do `TEMPLATE-PRD.md`, seguido de PRD tecnica e tasks individuais.
- PRD de produto deve estar aprovada antes da execucao. Ao criar PRD, PRD tecnica e tasks na mesma rodada, manter o status real e registrar premissas.
- DT deve ser pequena e autocontida. Promover para PRD quando exigir multiplas entregas independentes, decisao relevante de produto ou mudanca ampla de arquitetura.
- Atualizar `codex/ESCOPO.md` quando uma PRD ou DT mudar o estado consolidado do produto.
- Nao marcar documento como concluido sem testes executados e evidencias registradas.
- Registrar requisitos substituidos no `Historico de Requisitos`; nao apagar silenciosamente regras antigas.
- Seguir as transicoes formais documentadas em `codex/HARNESS.md`.

## Validacao

- Para JavaScript alterado, executar `node --check` em cada arquivo aplicavel.
- Para PHP alterado, usar `C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe -l`.
- Executar testes automatizados existentes quando encontrados.
- Para fluxo de navegador sem suite E2E instalada, realizar o melhor smoke test disponivel e registrar a limitacao.
- Smoke HTTP local pode usar `http://mine_world.test/`; validar autenticacao e efeitos persistentes quando aplicavel.
- Connor investiga aderencia durante a execucao; Ned executa a validacao final integrada.
- Antes de concluir qualquer entrega, executar `npm test`.

## Review

- Priorizar divergencias com PRD/DT, bugs, regressao, integridade de dados, performance do runtime e testes ausentes.
- Citar arquivos e evidencias. Nao aprovar apenas porque sintaxe passou.
