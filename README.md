# mine_world

Jogo de navegador voltado a ser parecido com Minecraft.

## Harness

```powershell
npm run harness -- validate
npm test
```

Consulte `codex/HARNESS.md` para criar PRDs/DTs e alterar estados formais.

## Setup local

Com Apache e MySQL ativos no Laragon e PHP `8.3.16` selecionado:

```powershell
npm run setup:local
```

O comando cria `mineworld_db`, aplica as migrations e valida cadastro, login,
autenticacao e CRUD de mundo em `http://mine_world.test/`.
