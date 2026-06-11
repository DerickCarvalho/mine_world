# Harness MineWorld

## Comandos

```powershell
npm run harness -- validate
npm run harness -- prd:create 012 nome-curto "Titulo da PRD"
npm run harness -- dt:create nome-curto "Titulo da DT"
npm run harness -- task:create 012 001 implementar-base "Implementar base"
npm run harness -- validation:create prd 012
npm run harness -- prd:status 012 "Em validacao"
npm run harness -- dt:status 001 "Em andamento"
npm run harness -- task:status 012 001 "Em andamento"
npm test
```

## Estados formais

### PRD

```text
Rascunho -> Em validacao -> Aprovada -> Em andamento -> Implementada
```

`Bloqueada` pode voltar para `Em andamento`. `Cancelada` e `Implementada` sao estados finais.

### Debito tecnico

```text
Rascunho -> Aprovada -> Em andamento -> Concluida
```

`Bloqueada` pode voltar para `Em andamento`. `Cancelada` e `Concluida` sao estados finais.

## Compatibilidade

- Documentos com `Harness Version = 2` sao validados de forma estrita.
- Documentos anteriores permanecem aceitos, mas geram avisos de divida documental.
- Estados finais exigem relatorio em `codex/execucoes/[PRD/DT]-NNN-validacao.md`.
- A CLI bloqueia conclusao com criterios pendentes, tasks incompletas ou validacao final nao aprovada.
- Cada criterio `CA-NN` de uma PRD v2 deve aparecer em pelo menos uma task.

## Testes

- `test:harness`: estrutura, estados, links, evidencias e cobertura de aceite.
- `test:syntax`: `node --check` para JavaScript e `php -l` para PHP.
- `test:smoke`: rotas HTTP publicas e protecao basica da API.
