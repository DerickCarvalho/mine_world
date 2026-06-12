# Handoff Claude - PRDs 013, 014 e 015

Contexto: continuar a execucao das PRDs `013`, `014` e `015` no projeto `C:\laragon\www\mine_world`, sem recomeçar do zero. O trabalho foi parcialmente implementado por Codex, mas a validacao final ficou bloqueada por limite do ambiente de execucao.

## Objetivo

Finalizar 100% as PRDs:

- `PRD-013-polimento-visual-camera-mobs-worldgen-v4-1`
- `PRD-014-sobrevivencia-crafting-mundo-vivo`
- `PRD-015-survival-classico-combate-fome-outline`

Prioridade atual:

1. validar e fechar survival/crafting/combate
2. garantir compatibilidade de save
3. atualizar docs de execucao e aceite

## O que ja foi feito

### Camera / outline / save

- pitch ampliado para quase 90 graus:
  - `assets/js/game/core/CameraMath.js`
  - `assets/js/game/render/webgl/WebGLRenderer.js`
  - `api/mundos/_common.php`
- preview fantasma de colocacao removido do alvo atual:
  - `assets/js/game/GameApp.js`
  - `assets/js/game/render/webgl/WebGLRenderer.js`
- mundos novos passaram a usar `v4.1`:
  - `api/mundos/cadastrar.php`

### Survival / HUD / fome

- fome adicionada a:
  - `assets/js/game/world/WorldConfig.js`
  - `api/mundos/_common.php`
  - `pages/jogo.php`
  - `assets/js/game/ui/GameplayHudController.js`
  - `assets/js/game/services/WorldRepository.js`
  - `assets/js/game/GameApp.js`
- `GameApp` agora:
  - salva `hunger`
  - drena fome com o tempo
  - aplica dano por fome zerada
  - reseta fome ao renascer
  - consome comida simples (`raw_pork`) com clique secundario

### Inventario / itens / crafting

- novos itens/blocos adicionados em:
  - `assets/js/game/world/BlockTypes.js`
  - `api/dependencias/block_catalog.php`
- itens atuais adicionados:
  - `stick`
  - `workbench`
  - `wood_pickaxe`
  - `wood_axe`
  - `wood_sword`
  - `stone_pickaxe`
  - `stone_axe`
  - `stone_sword`
  - `raw_pork`
  - `cloth`
  - `fang`
- normalizacao de inventario foi ajustada para `collectable`, nao mais apenas `placeable`:
  - `assets/js/game/GameApp.js`
  - `assets/js/game/services/WorldRepository.js`
- novas receitas adicionadas:
  - `assets/js/game/inventory/CraftingCatalog.js`
  - gravetos
  - bancada
  - ferramentas/armas de madeira e pedra

### Mobs / combate

- `PassiveMob` ganhou:
  - `maxHealth`
  - `health`
  - `attackDamage`
  - `hostileByDefault`
  - `detectRange`
  - `dropTable`
  - `isAlive()`
  - `getDrops()`
  - `takeHit(..., damage)`
- `CatMob` ganhou HP/drops basicos
- `PigMob` e `SheepMob` agora soltam drops
- novo mob hostil criado:
  - `assets/js/game/entities/CrawlerMob.js`
- `MobManager` foi alterado para:
  - spawnar `crawler`
  - aceitar dano real em `hitEntity`
  - remover entidade ao morrer
  - devolver `drops`
- `GameApp.attackTargetEntity()` agora:
  - calcula dano pela arma/ferramenta na mao
  - mata entidade
  - coleta drops direto para o inventario

### Visual de item / hotbar / mao

- `assets/js/game/ui/ItemIcon.js` foi refeito para:
  - manter cubo 3D para blocos colocaveis
  - usar icone flat estilizado para itens nao-colocaveis
- `assets/css/custom/pages/jogo.css` recebeu:
  - cor da barra de fome
  - ajustes no held item
  - icones flat para stick, workbench, tools, raw_pork, cloth, fang

### Testes alterados

- `codex/scripts/test-inventory-operations.mjs`
- `codex/scripts/test-save-compatibility.mjs`
- `codex/scripts/test-gameplay-hud-controller.mjs`

## O que falta verificar imediatamente

### 1. Rodar estes testes

Rodar exatamente:

```powershell
npm run test:inventory
npm run test:compatibility
npm run test:gameplay
npm run test:harness
npm run test:syntax
```

Se isso passar, depois:

```powershell
npm test
```

## Ultimo estado conhecido dos testes

- `npm run test:syntax` passou
- `npm run test:gameplay` passou
- `npm run test:inventory` falhava antes por fixture insuficiente para `glass_from_sand_and_coal`; o teste foi ajustado de `sand: 1` para `sand: 3`, mas nao foi reexecutado por bloqueio do ambiente
- `npm run test:compatibility` falhava porque o `flatTerrain` do teste nao tinha `getSubsurfaceBlockIdAt`; isso foi adicionado, mas nao foi reexecutado por bloqueio do ambiente

## Possiveis pontos ainda problematicos

### Compatibilidade / world stub

Se `test-save-compatibility` ainda falhar, olhar primeiro:

- `codex/scripts/test-save-compatibility.mjs`
- `assets/js/game/world/MutableWorld.js`
- `assets/js/game/world/ProceduralSurfaceDecorator.js`

Talvez o stub do terreno ainda precise de mais algum metodo usado pelo decorator/gerador.

### Combat / audio / mensagem

`GameApp.attackTargetEntity()` ainda usa `this.audio.playCatHurt()` para todo mob. Se quiser polir:

- criar audio mais generico
- ou trocar por som neutro de hit

### Drops

No estado atual, os drops entram direto no inventario ao matar o mob. Isso fecha o loop funcional, mas nao fecha perfeitamente o RF-08 da PRD-015, que pedia item no chao + pickup por proximidade.

Se for concluir a PRD com mais fidelidade, implementar:

- lista `worldDrops` no `GameApp`
- renderizacao simples de drop
- pickup por proximidade
- opcionalmente persistencia no save

Arquivos candidatos:

- `assets/js/game/GameApp.js`
- `assets/js/game/render/webgl/WebGLRenderer.js`
- `assets/js/game/services/WorldRepository.js`
- `api/mundos/_common.php`

### Persistencia de drops

Ainda nao foi feita persistencia de drop no chao. Se decidir implementar:

- adicionar `world.item_drops` no save state JS
- normalizar em `WorldRepository`
- normalizar no PHP em `api/mundos/_common.php`

## Pendencia importante de produto

Se a meta for realmente marcar PRD-015 como 100% concluida, eu recomendo fortemente substituir o drop direto no inventario por drop fisico coletavel, porque o criterio de aceite fala explicitamente:

- "matar um mob gera drop coletavel que entra corretamente no inventario"

Hoje esta funcional, mas abre espaco para questionarem que nao existe o "coletavel no chao".

## Arquivos mais importantes para revisar agora

- `assets/js/game/GameApp.js`
- `assets/js/game/entities/MobManager.js`
- `assets/js/game/entities/PassiveMob.js`
- `assets/js/game/entities/CatMob.js`
- `assets/js/game/entities/CrawlerMob.js`
- `assets/js/game/services/WorldRepository.js`
- `assets/js/game/inventory/CraftingCatalog.js`
- `assets/js/game/ui/ItemIcon.js`
- `assets/css/custom/pages/jogo.css`
- `codex/scripts/test-inventory-operations.mjs`
- `codex/scripts/test-save-compatibility.mjs`

## O que registrar ao final

Quando terminar:

1. atualizar status/tasks das PRDs 013, 014 e 015
2. gerar arquivo de execucao/validacao em `codex/execucoes/`
3. listar claramente:
   - o que foi entregue
   - o que ficou simplificado
   - quais testes passaram

## Observacao final

O ambiente do Codex ficou bloqueado por limite de execucao elevada no Windows sandbox (`spawn setup refresh` + limite de usage), entao o trabalho nao deve ser refeito; ele deve ser apenas validado, ajustado nos pontos finais e documentado.
