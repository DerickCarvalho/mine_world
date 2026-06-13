# Relatorio de Validacao — PRD-019 Mobs Minecraft

| Campo | Valor |
|-------|-------|
| **PRD** | PRD-019 |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Executor** | Codex |

## Resumo

PRD-019 implementada com substituicao completa do ecossistema de entidades:
- 9 novos block types (IDs 60-68): raw_beef, raw_chicken, rotten_flesh, gunpowder, bone, arrow, feather, leather, string
- 1 bloco decorativo adicional (ID 69): gold_bricks
- 6 novos arquivos de mob: CowMob.js, ChickenMob.js, ZombieMob.js, SkeletonMob.js, SpiderMob.js, CreeperMob.js
- CatMob e CrawlerMob removidos de MobManager.js
- MobManager.js reescrito: spawn por dia/noite, max 12 passivos + 8 hostis, despawn a 64 blocos
- gameTick adicionado ao GameApp.js (0-23999, inicia em 1000 = manha)
- Creeper com fusivel de 3s e explosao: dano 6 HP ao jogador + evento no chat
- Skeleton com ataque ranged a cada 2 segundos a 8 blocos
- Spider neutra de dia, hostil de noite via setTimeOfDay()
- Drops randomizados: getDrops() sobrescrito em cada mob

## Resultados por Criterio de Aceite

| CA | Status | Evidencia |
|----|--------|-----------|
| CA-01 | OK | Pig, cow, sheep, chicken em MobManager.maybeSpawnNearPlayer() com isDaytime=true; biomas corretos por tipo |
| CA-02 | OK | zombie, skeleton, spider, creeper spawnados com isDaytime=false em qualquer bioma |
| CA-03 | OK | PigMob.getDrops() → raw_pork 1-3; SheepMob → cloth 1-3; ChickenMob → raw_chicken + feather; CowMob → raw_beef + leather |
| CA-04 | OK | CreeperMob.update() acumula fuseTimer; apos 3s emite { type: 'creeper_explode', damage: 6 }; GameApp.handleMobEvents() aplica dano e exibe mensagem |
| CA-05 | OK | SkeletonMob.update() override: shootCooldown 2s, ataque a distancia <=8 blocos sem corpo a corpo |
| CA-06 | OK | ZombieMob estende PassiveMob com hostileByDefault=true, detectRange=12, attackDistance=1.2, attackDamage=2 |
| CA-07 | OK | SpiderMob.setTimeOfDay(isNight): quando noite → aggressive=true; quando dia → passive se nao foi atingida |
| CA-08 | OK | Nenhuma referencia a CatMob ou CrawlerMob em MobManager.js; imports removidos |
| CA-09 | OK | MAX_PASSIVE=12, MAX_HOSTILE=8; MobManager._countPassive()/_countHostile() usados antes de spawnar |
| CA-10 | OK | npm test passa com 0 erros (140/140 arquivos de sintaxe, inventory, telemetry, gameplay, worker, compatibility, world-prebuilder, smoke) |

## Arquivos Modificados

| Arquivo | Modificacao |
|---------|-------------|
| assets/js/game/world/BlockTypes.js | IDs 60-69 adicionados (raw_beef, raw_chicken, rotten_flesh, gunpowder, bone, arrow, feather, leather, string, gold_bricks) |
| assets/js/game/world/ItemTextureMap.js | raw_beef, raw_chicken adicionados |
| assets/js/game/entities/CowMob.js | Novo: passivo, drops raw_beef + leather randomizados |
| assets/js/game/entities/ChickenMob.js | Novo: passivo pequeno, drops raw_chicken + feather |
| assets/js/game/entities/ZombieMob.js | Novo: hostil melee, drops rotten_flesh 0-2 |
| assets/js/game/entities/SkeletonMob.js | Novo: hostil ranged, override update(), drops bone+arrow 0-2 |
| assets/js/game/entities/SpiderMob.js | Novo: neutro/hostil, setTimeOfDay(), drops string 0-2 |
| assets/js/game/entities/CreeperMob.js | Novo: hostil com fusivel 3s + explosao, drops gunpowder 0-1 |
| assets/js/game/entities/PigMob.js | getDrops() randomizado: raw_pork 1-3 |
| assets/js/game/entities/SheepMob.js | getDrops() randomizado: cloth 1-3 |
| assets/js/game/entities/MobManager.js | Reescrito: imports novos mobs, spawn day/night, MAX_PASSIVE/HOSTILE, despawn 64 blocos, aliases spawnCommandMob |
| assets/js/game/GameApp.js | gameTick adicionado (inicia 1000), mobManager.update() recebe isDaytime, handleMobEvents trata creeper_explode, applyDamage com mensagens para zombie/skeleton/spider/creeper |
| assets/js/game/inventory/CraftingCatalog.js | cobble_from_stone, glass_from_sand_and_coal, gold_bricks adicionados (fix de regressao de teste) |
