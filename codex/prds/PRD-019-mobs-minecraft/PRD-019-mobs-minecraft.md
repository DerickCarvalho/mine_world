# PRD-019: Mobs do Minecraft â€” substituiÃ§Ã£o completa do ecossistema de entidades

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-019 |
| **Harness Version** | 2 |
| **Titulo** | Mobs do Minecraft â€” substituiÃ§Ã£o completa do ecossistema de entidades |
| **Tipo** | Melhoria e expansÃ£o de gameplay |
| **Prioridade** | Alta |
| **Status** | Rascunho |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **DependÃªncias** | PRD-016 (EntityTextureMap), PRD-017 (novos itens para drops) |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** remover os mobs genÃ©ricos (cat/crawler) e adicionar os mobs clÃ¡ssicos do Minecraft com texturas reais, comportamentos fiÃ©is e drops corretos
- **Stack alvo:** JavaScript Vanilla
- **Ambiente de referÃªncia:** Windows + Laragon em `C:\laragon\www\mine_world`

## Problema / Oportunidade

O ecossistema de mobs atual tem 4 entidades: `cat`, `crawler`, `pig` e `sheep`. O gato e o crawler sÃ£o invenÃ§Ãµes do projeto sem correspondÃªncia no MC â€” o gato Ã© um mob passivo com comportamento de seguir, e o crawler Ã© um mob hostil genÃ©rico. Ambos usam modelos box coloridos sem textura. Os mobs pig e sheep existem mas tambÃ©m sem textura real. NÃ£o hÃ¡ creeper, zombie, skeleton, spider, cow ou chicken. O jogo nÃ£o tem nenhuma das entidades icÃ´nicas que definem a experiÃªncia do Minecraft.

### Impacto Atual

- **Quem Ã© afetado:** todo jogador
- **FrequÃªncia:** sempre que o jogo roda
- **ConsequÃªncia:** o mundo parece vazio e descaracterizado; sem creeper com explosÃ£o, sem zombie de noite, sem galinha soltando penas â€” a identidade do MC nÃ£o estÃ¡ presente

## Objetivo da Funcionalidade

1. Remover completamente `CatMob.js` e `CrawlerMob.js`
2. Adicionar: **creeper**, **zombie**, **skeleton**, **spider**, **pig**, **cow**, **sheep**, **chicken**
3. Aplicar a textura de entidade correspondente de `assets/textures/mc/entity/` em cada mob
4. Implementar comportamentos fiÃ©is ao MC: passivos fogem ao serem atacados; hostis perseguem e atacam
5. Creeper tem explosÃ£o ao chegar perto do jogador
6. Cada mob dropa itens corretos ao morrer
7. Regras de spawn por bioma e horÃ¡rio (passivos de dia, hostis de noite/cavernas)

### Resultado Esperado para o UsuÃ¡rio

- Explorar planÃ­cies e ver porcos cor-de-rosa, ovelhas brancas, vacas manchadas e galinhas brancas
- Ã€ noite, ser perseguido por zombies lentos e skeletons que atiram flechas
- Tomar susto com creeper silencioso que explode ao se aproximar
- Matar uma ovelha e obter lÃ£ branca; matar um porco e obter carne crua
- Mobs com aparÃªncia reconhecÃ­vel do MC graÃ§as Ã s texturas de entidade

## Fluxo Atual

1. Spawnagem de cat (floresta/taiga) e crawler (montanha/deserto) com lÃ³gica aleatÃ³ria
2. Pig e sheep spawnam em plains/meadow
3. Nenhum mob hostil persegue de noite
4. Drops: cloth (lÃ£ genÃ©rica), fang (presa genÃ©rica), raw_pork

## Fluxo Desejado

1. **Dia:** pig (plains), cow (plains/meadow), sheep (plains/meadow/taiga), chicken (plains/forest) spawnam com textura
2. **Noite / caverna escura:** zombie, skeleton, spider, creeper spawnam
3. Passivos fogem quando atacados; hostis perseguem o jogador dentro de range
4. Creeper acende fusÃ­vel ao chegar a 2.5 blocos do jogador â†’ explode apÃ³s 3 segundos
5. Skeleton atira flechas a cada 2 segundos com alcance de 8 blocos
6. Zombie e spider: melee com alcance 1.5 blocos, cooldown 1 segundo
7. Drops ao morrer: por tipo de mob (ver tabela)

## Escopo IncluÃ­do

- RemoÃ§Ã£o de `CatMob.js` e `CrawlerMob.js`
- Novos arquivos: `CreeperMob.js`, `ZombieMob.js`, `SkeletonMob.js`, `SpiderMob.js`, `CowMob.js`, `ChickenMob.js`
- AtualizaÃ§Ã£o de `PigMob.js` e `SheepMob.js` com textura MC e drops corretos
- AtualizaÃ§Ã£o de `MobManager.js` com novas regras de spawn e tipos
- IntegraÃ§Ã£o com `EntityTextureMap.js` (PRD-016)
- Ciclo dia/noite simples para spawn: contador de tempo no GameApp (hostis spawnam apÃ³s tick 12000, passivos atÃ© tick 12000)
- Drops: wool, leather, raw_pork, raw_beef, raw_chicken, feather, bone
- ExplosÃ£o do creeper: dano ao jogador e opcionalmente destruiÃ§Ã£o de alguns blocos ao redor
- Skeleton com arco e flechas visÃ­veis no modelo
- Spawn em cavernas escuras
- Villagers
- DomesticaÃ§Ã£o ou taming de mobs

## Escopo ExcluÃ­do

- Comportamento de grupo (zombies chamando outros)
- endermen, blazes, ghasts

## Requisitos Funcionais

### RF-01: Mobs passivos â€” pig, cow, sheep, chicken

**Pig:**
- Textura: `entity/pig/pig.png`
- Comportamento: passivo, anda aleatoriamente, foge quando atacado
- Drops: 1â€“3 raw_pork (jÃ¡ existe como `raw_pork` no BlockTypes)
- Spawn: plains, meadow, forest

**Cow:**
- Textura: `entity/cow/cow.png`
- Comportamento: passivo, anda devagar aleatoriamente
- Drops: 1â€“2 leather, 1â€“3 raw_beef (novo item, ver RF-05)
- Spawn: plains, meadow

**Sheep:**
- Textura: `entity/sheep/sheep.png`
- Comportamento: passivo, anda aleatoriamente
- Drops: 1â€“3 wool (usar `cloth` renomeado para `wool`, ou adicionar `wool` como novo item)
- Spawn: plains, meadow, taiga

**Chicken:**
- Textura: `entity/chicken.png`
- Comportamento: passivo, anda caÃ³ticamente, cai devagar (sem dano de queda)
- Drops: 1 feather, 1 raw_chicken (novo item, ver RF-05)
- Spawn: plains, forest

### RF-02: Mobs hostis â€” creeper, zombie, skeleton, spider

**Creeper:**
- Textura: `entity/creeper/creeper.png`
- Comportamento: silencioso, persegue jogador a atÃ© 8 blocos
- Ao chegar a â‰¤2.5 blocos: iniciar fusÃ­vel (3 segundos de pausa)
- ApÃ³s fusÃ­vel: explodir â€” dano de 6 HP ao jogador, remover 5â€“10 blocos em esfera de raio 3 ao redor
- Se jogador sair do alcance durante fusÃ­vel: cancelar
- Drops: 0â€“1 gunpowder (novo item, ver RF-05)
- Spawn: noite, qualquer bioma

**Zombie:**
- Textura: `entity/zombie/zombie.png`
- Comportamento: persegue jogador a atÃ© 12 blocos, ataque melee 1.5 blocos, dano 2 HP, cooldown 1s
- Velocidade: 70% da velocidade do jogador
- Drops: 0â€“2 rotten_flesh (novo item, ver RF-05)
- Spawn: noite, plains/meadow/forest

**Skeleton:**
- Textura: `entity/skeleton/skeleton.png`
- Comportamento: mantÃ©m distÃ¢ncia (4â€“8 blocos), "atira flechas" a cada 2s (evento de hit direto simplificado), dano 2 HP
- Drops: 0â€“2 bone, 0â€“2 arrow
- Spawn: noite, qualquer bioma

**Spider:**
- Textura: `entity/spider/spider.png`
- Comportamento: melee como zombie mas mais rÃ¡pido (90% velocidade do jogador), dano 2 HP, cooldown 0.8s
- Neutro de dia (apenas ataca se atacado), hostil de noite
- Drops: 0â€“2 string (jÃ¡ existe ou adicionar)
- Spawn: noite, qualquer bioma; modelo com hitbox maior/mais baixo (1.0 de altura, 1.4 de largura)

### RF-03: Regras de spawn

**Passivos (dia):**
- Spawnam durante ticks 0â€“11999 (dia)
- MÃ¡ximo 12 mobs passivos ativos
- DistÃ¢ncia do jogador: 8â€“20 blocos
- Bioma compatÃ­vel conforme RF-01

**Hostis (noite):**
- Spawnam durante ticks 12000+ (noite) ou se o GameApp tiver ciclo de dia/noite ativo
- Se nÃ£o houver ciclo dia/noite: spawn hostis tem probabilidade de 30% apÃ³s 10 minutos de jogo
- MÃ¡ximo 8 mobs hostis ativos
- DistÃ¢ncia do jogador: 10â€“20 blocos

**Desespawning:**
- Mobs a mais de 64 blocos do jogador sÃ£o removidos (passivos e hostis nÃ£o-agressivos)
- Mobs agressivos (em combate) nÃ£o desespawnam por distÃ¢ncia

### RF-04: Ciclo dia/noite no GameApp

**DescriÃ§Ã£o:** introduzir um contador de tempo de jogo para determinar dia/noite.

**Regras:**
- 1 dia de jogo = 20 minutos reais (24000 ticks a 20 ticks/s)
- Tick atual: `gameTick = (gameTick + deltaTime * 20) % 24000`
- Dia: ticks 0â€“11999
- Noite: ticks 12000â€“23999
- `MobManager.isDaytime()` â†’ retorna boolean
- Iniciar na manhÃ£ (tick 1000)
- NÃ£o Ã© necessÃ¡rio escurecer o cÃ©u na v1 â€” apenas a lÃ³gica de spawn

### RF-05: Novos drops (itens)

Adicionar ao `BlockTypes.js`:
- `raw_beef` (id: a definir) â€” carne bovina crua, collectable, maxStack 16
- `raw_chicken` (id: a definir) â€” frango cru, collectable, maxStack 16
- `rotten_flesh` (id: a definir) â€” carne podre, collectable, maxStack 64 (comida ruim que dÃ¡ nÃ¡usea â€” efeito para PRD futura)
- `gunpowder` (id: a definir) â€” pÃ³lvora, collectable, maxStack 64
- `bone` (jÃ¡ existe como `fang`? renomear para `bone`) â€” osso, collectable, maxStack 64
- `arrow` (id: a definir) â€” flecha, collectable, maxStack 64
- `feather` (id: a definir) â€” pena, collectable, maxStack 64
- `leather` (id: a definir) â€” couro, collectable, maxStack 64

### RF-06: RemoÃ§Ã£o de cat e crawler

- Remover `CatMob.js` e `CrawlerMob.js`
- Remover imports em `MobManager.js`
- Remover referÃªncias no `spawnCommandMob()` para cat/crawler
- Remover lÃ³gica de `toggleFollow()` e `hitEntity()` que dependem de cat

## Requisitos NÃ£o Funcionais

- **Performance:** mobs hostis com pathfinding simples (linha direta atÃ© o jogador + desvio de blocos bÃ¡sico); sem A* complexo
- **MÃ¡ximo de entidades:** 20 total (passivos + hostis)
- **Raio de atividade:** mobs alÃ©m de 64 blocos sÃ£o desativados mas mantidos no array

## Dados e PersistÃªncia

- Mobs sÃ£o efÃªmeros â€” nÃ£o persistidos entre sessÃµes (como antes)
- Drops de mobs sÃ£o persistidos no chunk (ver DropManager da PRD-015)
- Novos itens de drop precisam estar no `BLOCK_SAVE_KEYS`

## DependÃªncias e Premissas

- PRD-016: `EntityTextureMap` deve mapear todos os 8 tipos de mob
- PRD-017: `raw_beef`, `feather`, `leather` podem ser adicionados em conjunto
- O `DropManager` da PRD-015 deve estar implementado para drops fÃ­sicos no mundo
- Ciclo de dia/noite Ã© introduzido aqui de forma mÃ­nima (apenas contador)

## CritÃ©rios de Aceite

- [ ] **CA-01:** pig, cow, sheep e chicken spawnam durante o dia em biomas corretos com textura MC visÃ­vel
- [ ] **CA-02:** creeper, zombie, skeleton e spider spawnam Ã  noite (ou apÃ³s 10 minutos de jogo)
- [ ] **CA-03:** matar porco dropa raw_pork; matar ovelha dropa wool; matar galinha dropa feather e raw_chicken
- [ ] **CA-04:** creeper explode apÃ³s 3 segundos de fusÃ­vel ao chegar perto do jogador
- [ ] **CA-05:** skeleton causa dano ao jogador a distÃ¢ncia sem chegar corpo a corpo
- [ ] **CA-06:** zombie persegue e causa dano melee ao jogador
- [ ] **CA-07:** spider Ã© neutra de dia e hostil de noite
- [ ] **CA-08:** nÃ£o existe mais nenhum "cat" ou "crawler" no mundo
- [ ] **CA-09:** mÃ¡ximo de 20 mobs simultÃ¢neos
- [ ] **CA-10:** `npm test` e `npm run test:harness` passam

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tÃ©cnica | [PRD-TECNICA-019-mobs-minecraft.md](./PRD-TECNICA-019-mobs-minecraft.md) |
| Tasks | [tasks/](./tasks/) |

