# PRD-017: World Generation v5 â€” terreno procedural renovado

## Resumo Executivo

| Campo | Valor |
|-------|-------|
| **ID** | PRD-017 |
| **Harness Version** | 2 |
| **Titulo** | World Generation v5 â€” terreno procedural renovado |
| **Tipo** | Melhoria de gameplay e experiÃªncia visual |
| **Prioridade** | Alta |
| **Status** | Implementada |
| **Data** | 12/06/2026 |
| **Autor** | Codex |
| **DependÃªncias** | PRD-016 (texturas para novos blocos de superfÃ­cie) |

## Contexto do Produto

- **Projeto:** MineWorld
- **Objetivo macro:** substituir a geraÃ§Ã£o procedural atual (v4.0) por uma versÃ£o que produza terreno natural, biomas convincentes e decoraÃ§Ã£o de superfÃ­cie como o Minecraft; substituir as estruturas horrÃ­veis de "vilas" e "ruÃ­nas" por estruturas bem feitas e coerentes com o bioma
- **Stack alvo:** JavaScript Vanilla (Web Worker para geraÃ§Ã£o de chunks)
- **Ambiente de referÃªncia:** Windows + Laragon em `C:\laragon\www\mine_world`

## Problema / Oportunidade

A worldgen atual (v4.0) apresenta vÃ¡rios problemas graves:

1. **Estruturas feias:** `decorateVillage()` gera casas de 5Ã—5 blocos com 4 pilares nos cantos e teto plano de planks; `decorateRuins()` gera 3Ã—3 de cobblestone com 2 pilares diagonais e um ouro no meio. Nenhum das duas parece natural ou intencional.
2. **Ãrvores estranhas:** "eucalyptus" nÃ£o existe no MC e tem copa minÃºscula absurda (raio 1). "Pine" e "oak" sÃ£o aceitÃ¡veis, mas podem melhorar.
3. **Sem decoraÃ§Ã£o de solo:** nenhuma flor, grama, cogumelo, pedra dispersa ou cacto no deserto.
4. **Terreno plano/serrilhado:** em plains o terreno Ã© muito plano e em mountains o relevo pode ficar serrilhado demais.
5. **Sem neve/snow:** montanhas altas nÃ£o tÃªm neve no topo.
6. **Bioma badlands/mesa:** sem os blocos caracterÃ­sticos de red_sand e terracotta.
7. **TransiÃ§Ãµes abruptas:** biomas mudam abruptamente sem transiÃ§Ã£o suave.
8. **MinÃ©rio limitado:** apenas coal_ore, iron_ore e gold_ore. Sem diamond, lapis, emerald.

### Impacto Atual

- **Quem Ã© afetado:** qualquer jogador que explora o mundo
- **FrequÃªncia:** toda sessÃ£o
- **ConsequÃªncia:** o mundo parece artificial e sem alma; as "casas" geradas desorientam o jogador e nÃ£o agregam nada

## Objetivo da Funcionalidade

Entregar uma nova versÃ£o do gerador procedural (v5.0) que produza:
- Terreno natural com transiÃ§Ãµes suaves entre biomas
- DecoraÃ§Ã£o de superfÃ­cie (flores, grama, cacto, cogumelos)
- Variedade de Ã¡rvores fiÃ©is ao MC (carvalho, bÃ©tula, pinheiro/spruce)
- Biomas com identidade visual clara (plains, forest, desert, mountains, taiga, badlands)
- Neve nos topos de montanhas
- MinÃ©rios novos e distribuiÃ§Ã£o realista por profundidade
- SubstituiÃ§Ã£o das estruturas fake por estruturas naturais e coerentes por bioma (poÃ§o de deserto, torre de pedra em ruÃ­nas, formaÃ§Ãµes rochosas, dungeon subterrÃ¢nea)

### Resultado Esperado para o UsuÃ¡rio

- Explorar um mundo que parece natural: florestas densas com variedade de Ã¡rvores, desertos com dunas e cactos, montanhas com neve, planÃ­cies abertas com flores
- Nunca mais encontrar aquelas "casas" de 4 pilares e teto plano ou as "ruÃ­nas" com ouro aleatÃ³rio; em vez disso, encontrar estruturas que parecem naturais e fazem sentido no bioma
- Minerar em profundidade e encontrar minÃ©rios proporcionalmente raros (diamond Ã© raro e fundo)

## Fluxo Atual

1. `TerrainGenerator.computeHeight()` gera altura por bioma com parÃ¢metros fractal
2. `ProceduralSurfaceDecorator.decorateTreesForChunk()` adiciona Ã¡rvores e entÃ£o chama `decorateVillage()` e `decorateRuins()`
3. `getBlockTypeAt()` retorna apenas grass/dirt/stone/air (sem bioma-especÃ­fico)

## Fluxo Desejado

1. `TerrainGenerator` v5: gera altura com transiÃ§Ãµes suaves entre biomas via interpolaÃ§Ã£o/blending
2. `TerrainGenerator.getBlockTypeAt()` retorna blocos especÃ­ficos por bioma (red_sand em badlands, snow em montanhas altas)
3. `ProceduralSurfaceDecorator` v5: gera Ã¡rvores por tipo de bioma, decoraÃ§Ã£o de solo (flores, grama), e estruturas naturais coerentes por bioma
4. `TerrainGenerator.getSubsurfaceBlockIdAt()` distribui minÃ©rios com ranges por profundidade

## Escopo IncluÃ­do

- Novos blocos necessÃ¡rios em `BlockTypes.js`: `gravel`, `snow`, `red_sand`, `cactus`, `flower`, `tall_grass`, `diamond_ore`, `lapis_ore`, `iron_ingot`, `gold_ingot`, `coal`, `diamond`
- GeraÃ§Ã£o de cavernas complexas
- Estruturas naturais como aldeias, templos, fortalezas
- Ciclo dia/noite afetando spawns
- Reescrita de `TerrainGenerator.computeHeight()` para terreno mais natural
- Reescrita de `TerrainGenerator.getBlockTypeAt()` com bioma-especÃ­fico
- Reescrita de `TerrainGenerator.getSubsurfaceBlockIdAt()` com novos minÃ©rios
- Reescrita de `ProceduralSurfaceDecorator`: substituir `decorateVillage()` e `decorateRuins()` por estruturas bem construÃ­das (poÃ§o de deserto, ruÃ­nas de torre, dungeon subterrÃ¢nea), melhorar Ã¡rvores, adicionar decoraÃ§Ã£o de solo
- Novas formas de Ã¡rvore: oak melhorado, birch, spruce/pine melhorado
- DecoraÃ§Ã£o: flores (poppy, dandelion), tall_grass, cogumelos (taiga/forest), cacto (deserto), pedra dispersa

## Escopo ExcluÃ­do

- Bioma nether ou end
- Ãrvores gigantes (jungle) ou bambu
- Bioma swamp ou savana

## Requisitos Funcionais

### RF-01: Novos blocos de superfÃ­cie e itens base

**DescriÃ§Ã£o:** adicionar ao `BlockTypes.js` os blocos necessÃ¡rios para o novo worldgen e para crafting futuro.

**Blocos de superfÃ­cie novos:**
- `gravel` (id: 27) â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 0.6
- `snow` (id: 28) â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 0.2
- `red_sand` (id: 29) â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 0.45 (como areia)
- `cactus` (id: 30) â€” sÃ³lido, NÃƒO opaco, quebrÃ¡vel, hardness 0.4, placeable: false (colocado pelo worldgen)
- `flower` (id: 31) â€” NÃƒO sÃ³lido, NÃƒO opaco, quebrÃ¡vel, hardness 0.0 (quebra instantÃ¢neo), placeable: false
- `tall_grass` (id: 32) â€” NÃƒO sÃ³lido, NÃƒO opaco, quebrÃ¡vel, hardness 0.0

**Itens/recursos novos:**
- `diamond_ore` (id: 33) â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 3.0
- `lapis_ore` (id: 34) â€” sÃ³lido, opaco, quebrÃ¡vel, hardness 3.0
- `coal` (id: 35) â€” item, collectable, maxStack 64 (drop do coal_ore)
- `iron_ingot` (id: 36) â€” item, collectable, maxStack 64
- `gold_ingot` (id: 37) â€” item, collectable, maxStack 64
- `diamond` (id: 38) â€” item, collectable, maxStack 64

**Mapeamentos de texturas adicionais em `BlockTextureMap.js`** (da PRD-016):
- gravel â†’ `gravel.png`
- snow â†’ `snow.png`
- red_sand â†’ `red_sand.png`
- cactus â†’ top: `cactus_top.png`, side: `cactus_side.png`
- flower â†’ `poppy.png` (ou random entre poppy/dandelion/dandelion)
- tall_grass â†’ `grass.png`
- diamond_ore â†’ `diamond_ore.png`
- lapis_ore â†’ `lapis_ore.png`

### RF-02: Terreno mais natural por bioma

**DescriÃ§Ã£o:** o `computeHeight()` deve produzir terreno com transiÃ§Ãµes suaves entre biomas e elevaÃ§Ã£o convincente por tipo.

**Regras de negÃ³cio:**
- **Plains:** muito plano, altura base 34â€“38, variaÃ§Ã£o mÃ¡xima de Â±4 blocos
- **Forest:** suavemente ondulado, base 33â€“40, variaÃ§Ã£o Â±6
- **Desert:** dunas onduladas, base 30â€“36 com frequÃªncia media-alta de noise
- **Mountains:** picos altos 48â€“78, vale entre picos, encostas abruptas mas nÃ£o serrilhadas
- **Taiga:** montanhoso mÃ©dio, base 36â€“48
- **Meadow:** planÃ­cie com colinas suaves, base 36â€“44
- **Badlands:** platÃ´s planos com despenhadeiros, base 40â€“52
- TransiÃ§Ã£o entre biomas deve ser suave (blend de alturas) em faixa de 8â€“16 blocos

**SaÃ­da esperada:** terreno que parece natural ao explorar sem gaps abruptos entre biomas

### RF-03: Blocos de superfÃ­cie por bioma

**DescriÃ§Ã£o:** o `getBlockTypeAt()` deve retornar o bloco correto para a superfÃ­cie do bioma.

**Regras:**
- **Desert / Badlands:** superfÃ­cie = `sand` ou `red_sand` respectivamente; filler = mesma
- **Mountains > y=66:** superfÃ­cie = `snow`; y=60â€“65 = `stone`
- **Taiga, altitude normal:** superfÃ­cie = `grass`; pode ter neve leve em altitudes maiores
- **River/Lake margins:** borda = `gravel` (1-2 blocos de largura)
- **Todos outros biomas:** grass/dirt como antes

**SaÃ­da esperada:** deserto tem areia, montanha alta tem neve, badlands tem red_sand

### RF-04: DistribuiÃ§Ã£o de minÃ©rios por profundidade

**DescriÃ§Ã£o:** `getSubsurfaceBlockIdAt()` deve distribuir minÃ©rios de forma realista.

**DistribuiÃ§Ã£o (contando da bedrock para cima):**
- `diamond_ore`: y â‰¤ 15, raridade muito alta (threshold > 0.94)
- `gold_ore`: y â‰¤ 28, raridade alta (threshold > 0.88)
- `lapis_ore`: y â‰¤ 30, raridade alta (threshold > 0.87)
- `iron_ore`: y â‰¤ 52, raridade mÃ©dia (threshold > 0.80)
- `coal_ore`: y â‰¤ 68, raridade baixa (threshold > 0.74)
- `stone`: filler padrÃ£o

**SaÃ­da esperada:** diamond requer mineraÃ§Ã£o profunda; coal Ã© abundante na superfÃ­cie

### RF-05: DecoraÃ§Ã£o de superfÃ­cie

**DescriÃ§Ã£o:** adicionar decoraÃ§Ã£o ao bioma alÃ©m de Ã¡rvores.

**Regras por bioma:**
- **Plains/Meadow:** flores (poppy, dandelion) a cada ~8 blocos, tall_grass frequente
- **Forest:** tall_grass, flores ocasionais, cogumelos raros (brown/red)
- **Taiga:** neve dispersa no chÃ£o, cogumelos
- **Desert:** cactos a cada ~12 blocos, sem grama
- **Badlands:** cactos raros, sem grama
- **River/Lake:** juncos/tall_grass nas margens

**Flores e grama sÃ£o blocos nÃ£o-sÃ³lidos** (como na PRD de blocos acima): ao quebrar, caem como item; nÃ£o interferem com colisÃ£o do jogador

**SaÃ­da esperada:** superfÃ­cies com variedade visual, mundo parece vivo

### RF-06: Ãrvores melhoradas

**DescriÃ§Ã£o:** substituir eucalyptus por birch; melhorar a copa do oak; padronizar spruce.

**Tipos:**
- **Oak (carvalho):** tronco 5â€“7, copa oval 5Ã—5Ã—4 (raio 2 na base, raio 1 no topo), folhas com buracos aleatÃ³rios para parecer natural
- **Birch (bÃ©tula):** tronco fino 6â€“8, copa oval pequena 3Ã—3Ã—3, bioma plains e forest
- **Spruce/Pine (pinheiro):** tronco 10â€“16, copa cÃ´nica (raio 3 na base, raio 1 no topo), exclusivo da taiga
- Remover "eucalyptus" completamente

**Regras:**
- Density: forest 30%, plains 8%, meadow 12%, taiga 25% de spruce
- Duas Ã¡rvores nÃ£o podem estar a menos de 3 blocos de distÃ¢ncia (tronco a tronco)
- Birch usa textura `birch_log.png`/`birch_planks.png`/`birch_leaves.png` (se disponÃ­vel) ou fallback para wood/leaves

**SaÃ­da esperada:** florestas com variedade de Ã¡rvores; nenhuma "eucalyptus" estranha

### RF-07: Substituir estruturas artificiais por estruturas naturais

**DescriÃ§Ã£o:** remover `decorateVillage()` e `decorateRuins()` e substituir por estruturas bem feitas, coerentes com o bioma, que um jogador poderia encontrar no Minecraft real.

**Regras:**
- Deletar os mÃ©todos `decorateVillage`, `decorateRuins`, `shouldPlaceVillageAnchor`, `shouldPlaceRuinAnchor`
- Criar `decorateStructure(chunk, biome, seed)` como ponto de entrada Ãºnico para estruturas
- Estruturas sÃ£o posicionadas uma por chunk no mÃ¡ximo, com base em threshold seeded (nÃ£o todo chunk tem estrutura)
- Probabilidade de estrutura por chunk: ~15% (1 em cada 6-7 chunks aproximadamente)

**SaÃ­da esperada:** sem casas-fantoche nem obeliscos de cobblestone com ouro aleatÃ³rio; em vez disso, estruturas que fazem sentido visualmente

### RF-08: Novas estruturas por bioma

**DescriÃ§Ã£o:** cada bioma tem um conjunto de estruturas que podem aparecer na geraÃ§Ã£o do chunk.

---

**Desert Well (poÃ§o do deserto):**
- Bioma: desert
- Materiais: sandstone, sand
- Formato: quadrado 3Ã—3 de sandstone no chÃ£o com buracos nas paredes (parece um poÃ§o aberto), bloco de Ã¡gua no centro afundado 1 bloco
- Tamanho: 3Ã—3Ã—3 (largura Ã— profundidade Ã— altura)
- Probabilidade: 12% nos chunks de deserto

```
Vista topo:       Vista lateral:
[S][S][S]         [S][S][S]
[S][W][S]         [S][ ][S]
[S][S][S]         [S][W][S]  â† Ã¡gua ao nÃ­vel do chÃ£o
                  
S=sandstone, W=water
```

---

**Stone Tower Ruins (torre de pedra em ruÃ­nas):**
- Bioma: plains, meadow, forest
- Materiais: cobblestone, mossy_cobblestone (alias de cobblestone por ora), stone
- Formato: torre cilÃ­ndrica/quadrada 4Ã—4 base, altura 6â€“10, paredes com lacunas aleatÃ³rias (parece demolida), teto ausente
- VariaÃ§Ã£o: altura e posiÃ§Ã£o de lacunas sÃ£o seeded por posiÃ§Ã£o do chunk
- Probabilidade: 8% nos chunks elegÃ­veis

```
Corte horizontal (4Ã—4):
[C][C][C][C]
[C][ ][ ][C]
[C][ ][ ][C]
[C][C][C][C]

C=cobblestone (30% chance de vazio por bloco de parede = lacunas aleatÃ³rias)
```

---

**Rock Formation (formaÃ§Ã£o rochosa natural):**
- Bioma: mountains, taiga
- Materiais: stone, gravel
- Formato: cluster de 5â€“12 blocos de stone dispostos em forma de mound orgÃ¢nico (1â€“3 blocos de altura), usando noise seeded para posiÃ§Ã£o de cada bloco
- Probabilidade: 20% nos chunks de montanha/taiga (mais comum pois Ã© pequena)

---

**Desert Pillar (pilar de arenito):**
- Bioma: badlands, desert (secundÃ¡rio)
- Materiais: sandstone, red_sand
- Formato: coluna de 4â€“8 blocos de sandstone no topo de uma elevaÃ§Ã£o, topo com 1 bloco de red_sand
- Probabilidade: 10% nos chunks de badlands

---

**Underground Dungeon (dungeon subterrÃ¢nea):**
- Gerada no subsolo (y 20â€“45), independente de bioma
- Materiais: cobblestone, mossy_cobblestone
- Formato: sala 5Ã—5Ã—4 com paredes de cobblestone, chÃ£o de mossy_cobblestone, teto de cobblestone; conecta ao terreno por corredor de 1Ã—2 blocos
- Centro da sala: bloco especial `dungeon_core` (placeholder visual â€” bloco de mossy_cobblestone por ora)
- Probabilidade: 5% por chunk (raro de encontrar)

```
Vista lateral:
   [saÃ­da ao terreno]
        [C][C]
[C][C][C][C][C]  â† teto
[C][ ][ ][ ][C]
[C][ ][D][ ][C]  â† D = dungeon_core
[C][m][m][m][C]  â† chÃ£o mossy

C=cobblestone, m=mossy_cobblestone, D=center
```

**Regras gerais de todas as estruturas:**
- Uma estrutura por chunk no mÃ¡ximo
- PosiÃ§Ã£o dentro do chunk Ã© seeded (determinÃ­stica, mesma seed = mesma estrutura)
- A estrutura nÃ£o pode ser colocada se o terreno local estÃ¡ a mais de 4 blocos de diferenÃ§a de altura (evita estruturas flutuando ou enterradas)
- Estruturas nunca colocam blocos abaixo de `y=10` ou acima de `y=90`
- Estruturas nÃ£o sobrescrevem pedra ou minÃ©rio subsuperficial (apenas ar e blocos de superfÃ­cie)

**SaÃ­da esperada:** explorar o mundo e encontrar um poÃ§o no deserto, uma torre em ruÃ­nas numa floresta, uma formaÃ§Ã£o de pedras nas montanhas â€” tudo que parece ter sido gerado naturalmente

## Requisitos NÃ£o Funcionais

- **Performance:** o tempo de geraÃ§Ã£o por chunk nÃ£o pode aumentar mais de 50% em relaÃ§Ã£o ao v4.0 (monitorar via `RuntimeTelemetry`)
- **Determinismo:** mesma seed deve gerar exatamente o mesmo mundo (cache de biome/height mantido)
- **Save compatibility:** mundos jÃ¡ salvos com chunks existentes continuam carregando; apenas chunks novos usam v5

## Dados e PersistÃªncia

- `WorldConfig.algorithmVersion` deve ser atualizado para `'v5.0'` nos novos mundos
- Mundos existentes mantÃªm a versÃ£o salva e continuam gerando chunks pendentes com a versÃ£o original

## DependÃªncias e Premissas

- Novos blocos adicionados em `BlockTypes.js` (RF-01) sÃ£o prÃ©-requisito para surface decorator
- `BlockTextureMap.js` (PRD-016) precisa mapear os novos blocos; executar em paralelo
- GeraÃ§Ã£o acontece no `ChunkWorker.js` (Web Worker); mudanÃ§as em `TerrainGenerator` e `ProceduralSurfaceDecorator` sÃ£o repassadas automaticamente

## CritÃ©rios de Aceite

- [x] **CA-01:** todos os novos blocos (gravel, snow, red_sand, cactus, flower, tall_grass, diamond_ore, lapis_ore) estÃ£o definidos em `BlockTypes.js` e renderizados com textura ou cor fallback
- [x] **CA-02:** bioma deserto tem superfÃ­cie de areia e cactos visÃ­veis
- [x] **CA-03:** bioma montanha tem neve visÃ­vel nos picos acima de y=66
- [x] **CA-04:** bioma badlands tem superfÃ­cie de red_sand
- [x] **CA-05:** Plains e Forest tÃªm flores e tall_grass dispersas
- [x] **CA-06:** nÃ£o existe nenhuma "casa de 4 pilares" nem "ruÃ­na com ouro" gerada pelo worldgen
- [x] **CA-06b:** poÃ§o de arenito aparece em chunks de deserto com probabilidade ~12%
- [x] **CA-06c:** torre de pedra em ruÃ­nas aparece em plains/meadow/forest com probabilidade ~8%
- [x] **CA-06d:** mesma seed gera as mesmas estruturas nas mesmas posiÃ§Ãµes (determinismo)
- [x] **CA-06e:** nenhuma estrutura flutua no ar nem fica totalmente enterrada (verificaÃ§Ã£o de terreno local)
- [x] **CA-07:** oak, birch e spruce sÃ£o geradas corretamente por bioma; nenhuma "eucalyptus"
- [x] **CA-08:** diamond ore sÃ³ aparece abaixo de y=15; iron ore atÃ© y=52; coal ore atÃ© y=68
- [x] **CA-09:** terreno nÃ£o apresenta gaps bruscos entre biomas na transiÃ§Ã£o
- [x] **CA-10:** `npm test` e `npm run test:harness` passam
- [x] **CA-11:** velocidade de geraÃ§Ã£o de chunk nÃ£o degrada mais de 50% (verificar telemetria)

## Documentos Relacionados

| Documento | Link |
|-----------|------|
| PRD tÃ©cnica | [PRD-TECNICA-017-worldgen-v5.md](./PRD-TECNICA-017-worldgen-v5.md) |
| Tasks | [tasks/](./tasks/) |

