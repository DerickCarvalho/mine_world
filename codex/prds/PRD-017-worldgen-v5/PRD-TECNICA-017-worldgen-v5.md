# PRD-TECNICA-017: World Generation v5 — terreno procedural renovado

## Referência

| Campo | Valor |
|-------|-------|
| **PRD de Produto** | [PRD-017-worldgen-v5.md](./PRD-017-worldgen-v5.md) |
| **Harness Version** | 2 |
| **Data** | 12/06/2026 |
| **Autor Técnico** | Codex |
| **Versão** | 1.0 proposta |

## Contexto Técnico

- **Projeto:** MineWorld
- **Stack:** JavaScript Vanilla (geração roda no `ChunkWorker.js`, Web Worker)
- **Ambiente local:** Windows + Laragon em `C:\laragon\www\mine_world`

## Análise do Estado Atual

### Arquivos relevantes

| Arquivo | Papel atual | Impacto esperado |
|---------|-------------|------------------|
| `assets/js/game/world/TerrainGenerator.js` | Biomas, altura, minérios, cavernas | Reescrever parcialmente |
| `assets/js/game/world/ProceduralSurfaceDecorator.js` | Árvores, estruturas | Reescrever parcialmente |
| `assets/js/game/world/BlockTypes.js` | Definição de blocos | Adicionar novos blocos |
| `assets/js/game/workers/ChunkWorker.js` | Roda TerrainGenerator/Decorator | Sem alteração (usa os módulos) |
| `assets/js/game/world/WorldConfig.js` | Constantes do mundo | Alterar version string |

### Problemas detectados no código atual

1. **`decorateVillage()`** — linhas 255–289 do ProceduralSurfaceDecorator: gera casas 5×5 sem realismo
2. **`decorateRuins()`** — linhas 291–316: gera ruínas com gold_ore aleatório
3. **`decorateEucalyptusTree()`** — copa raio 1, parece um graveto com leaves
4. **`getBlockTypeAt()`** — retorna apenas grass/dirt/stone sem bioma-específico
5. **`getSubsurfaceBlockIdAt()`** — apenas 3 minérios com thresholds fixos

## Solução Técnica Proposta

### Novos blocos em BlockTypes.js

Adicionar os IDs 27–38 ao array `BLOCK_DEFINITIONS`. Cada novo bloco precisa de:
- `id`, `key`, `name` (em português)
- `solid`, `opaque`, `breakable`, `hardness`
- `collectable`, `placeable`, `maxStack`
- `baseColors` (fallback até texturas estarem disponíveis)

**Blocos de superfície:**
```js
{ id: 27, key: 'gravel',     name: 'Cascalho',      solid: true,  opaque: true,  breakable: true,  hardness: 0.6,   collectable: true,  placeable: true,  maxStack: 64, baseColors: { top: {r:138,g:130,b:122}, side: {r:138,g:130,b:122}, bottom: {r:138,g:130,b:122} } },
{ id: 28, key: 'snow',       name: 'Neve',           solid: true,  opaque: true,  breakable: true,  hardness: 0.2,   collectable: true,  placeable: true,  maxStack: 64, baseColors: { top: {r:244,g:250,b:254}, side: {r:244,g:250,b:254}, bottom: {r:244,g:250,b:254} } },
{ id: 29, key: 'red_sand',   name: 'Areia Vermelha', solid: true,  opaque: true,  breakable: true,  hardness: 0.45,  collectable: true,  placeable: true,  maxStack: 64, baseColors: { top: {r:197,g:100,b:40},  side: {r:197,g:100,b:40},  bottom: {r:197,g:100,b:40}  } },
{ id: 30, key: 'cactus',     name: 'Cacto',          solid: true,  opaque: false, breakable: true,  hardness: 0.4,   collectable: true,  placeable: false, maxStack: 64, baseColors: { top: {r:88,g:140,b:60},   side: {r:72,g:120,b:50},   bottom: {r:88,g:140,b:60}   } },
{ id: 31, key: 'flower',     name: 'Flor',           solid: false, opaque: false, breakable: true,  hardness: 0.0,   collectable: true,  placeable: false, maxStack: 64, baseColors: { top: {r:224,g:80,b:80},   side: {r:224,g:80,b:80},   bottom: {r:224,g:80,b:80}   } },
{ id: 32, key: 'tall_grass', name: 'Grama Alta',     solid: false, opaque: false, breakable: true,  hardness: 0.0,   collectable: false, placeable: false, maxStack: 0,  baseColors: { top: {r:72,g:156,b:60},   side: {r:72,g:156,b:60},   bottom: {r:72,g:156,b:60}   } },
```

**Minérios e itens:**
```js
{ id: 33, key: 'diamond_ore', name: 'Minerio de Diamante', solid: true,  opaque: true,  breakable: true, hardness: 3.0,    collectable: true, placeable: true,  maxStack: 64, baseColors: { top: {r:100,g:214,b:224}, side: {r:100,g:214,b:224}, bottom: {r:100,g:214,b:224} } },
{ id: 34, key: 'lapis_ore',   name: 'Minerio de Lapis',   solid: true,  opaque: true,  breakable: true, hardness: 3.0,    collectable: true, placeable: true,  maxStack: 64, baseColors: { top: {r:50,g:80,b:172},   side: {r:50,g:80,b:172},   bottom: {r:50,g:80,b:172}   } },
{ id: 35, key: 'coal',        name: 'Carvao',             solid: false, opaque: false, breakable: false, hardness: Infinity, collectable: true, placeable: false, maxStack: 64, baseColors: { top: {r:55,g:55,b:55},   side: {r:55,g:55,b:55},   bottom: {r:55,g:55,b:55}   } },
{ id: 36, key: 'iron_ingot',  name: 'Lingote de Ferro',   solid: false, opaque: false, breakable: false, hardness: Infinity, collectable: true, placeable: false, maxStack: 64, baseColors: { top: {r:192,g:180,b:168}, side: {r:192,g:180,b:168}, bottom: {r:192,g:180,b:168} } },
{ id: 37, key: 'gold_ingot',  name: 'Lingote de Ouro',    solid: false, opaque: false, breakable: false, hardness: Infinity, collectable: true, placeable: false, maxStack: 64, baseColors: { top: {r:252,g:202,b:60},  side: {r:252,g:202,b:60},  bottom: {r:252,g:202,b:60}  } },
{ id: 38, key: 'diamond',     name: 'Diamante',           solid: false, opaque: false, breakable: false, hardness: Infinity, collectable: true, placeable: false, maxStack: 64, baseColors: { top: {r:100,g:214,b:224}, side: {r:100,g:214,b:224}, bottom: {r:100,g:214,b:224} } },
```

### Reescrita de TerrainGenerator

#### computeHeight() — melhorias

O problema atual: cada bioma calcula altura de forma totalmente independente, sem transição.

**Nova abordagem:** calcular altura de múltiplos biomas vizinhos e fazer blend baseado no `biomeWeight` atual.

```js
computeHeight(x, z) {
  const biome = this.getBiomeAt(x, z);
  const baseH = this._computeBiomeHeight(x, z, biome);
  
  // Blend suave com biomas vizinhos num raio de 12 blocos
  const blendRadius = 12;
  let totalWeight = 1;
  let blendH = baseH;
  // sample 4 pontos cardeais para blending leve
  for (const [ox, oz] of [[-blendRadius, 0], [blendRadius, 0], [0, -blendRadius], [0, blendRadius]]) {
    const nb = this.getBiomeAt(x + ox, z + oz);
    if (nb.key !== biome.key) {
      const w = 0.15;
      blendH += this._computeBiomeHeight(x + ox, z + oz, nb) * w;
      totalWeight += w;
    }
  }
  return Math.round(blendH / totalWeight);
}
```

Parâmetros de altura por bioma (ajustar `_computeBiomeHeight()`):

| Bioma | Base | Variação | Frequência |
|-------|------|----------|------------|
| plains | 36 | ±3 | baixa |
| meadow | 37 | ±5 | média-baixa |
| forest | 35 | ±6 | média |
| desert | 32 | ±4 | média (dunas) |
| badlands | 44 | ±6 (platôs) | baixa |
| mountains | 52 | ±26 | média-alta |
| taiga | 38 | ±10 | média |
| river | waterLevel-1 | ±1 | baixa |
| lake | waterLevel-2 | ±0.5 | muito baixa |

#### getBlockTypeAt() — bioma-específico

Atualizar para retornar blocos de superfície corretos:

```js
getBlockTypeAt(x, y, z) {
  const blockX = getBlockCoord(x); const blockY = getBlockCoord(y); const blockZ = getBlockCoord(z);
  const surfaceHeight = this.getSurfaceHeightAt(blockX, blockZ);
  
  if (blockY < 0 || blockY >= surfaceHeight || this.isCaveAir(blockX, blockY, blockZ, surfaceHeight)) {
    return BLOCK_TYPES.air;
  }
  
  const biome = this.getBiomeAt(blockX, blockZ);
  
  if (blockY === surfaceHeight - 1) {
    // Superfície
    if (biome.key === 'desert') return BLOCK_TYPES.sand;
    if (biome.key === 'badlands') return BLOCK_TYPES.red_sand;
    if (biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 28) return BLOCK_TYPES.snow;
    if (biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 22) return BLOCK_TYPES.stone;
    if (surfaceHeight <= this.waterLevel + 1) return BLOCK_TYPES.sand; // praias e margens
    return BLOCK_TYPES.grass;
  }
  
  // Subsolo próximo à superfície (filler)
  if (blockY >= surfaceHeight - 4) {
    if (biome.key === 'desert' || biome.key === 'badlands') return blockY === surfaceHeight - 1 ? BLOCK_TYPES.sand : BLOCK_TYPES.sand;
    if (biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 22) return BLOCK_TYPES.stone;
    return BLOCK_TYPES.dirt;
  }
  
  return BLOCK_TYPES.stone;
}
```

#### getSubsurfaceBlockIdAt() — novos minérios

```js
getSubsurfaceBlockIdAt(x, y, z, surfaceHeight = null) {
  const blockY = getBlockCoord(y);
  if (blockY <= 0) return BLOCK_TYPES.bedrock;
  
  // noise para ore placement
  const oreNoise = this.random.fractalNoise2D(x + blockY * 17, z - blockY * 13, {frequency: 0.081, octaves: 2, lacunarity: 2, persistence: 0.52, salt: 1187});
  const oreChance = oreNoise;
  
  if (blockY <= 15 && oreChance > 0.94) return BLOCK_TYPES.diamond_ore;
  if (blockY <= 28 && oreChance > 0.90) return BLOCK_TYPES.gold_ore;
  if (blockY <= 30 && oreChance > 0.89) return BLOCK_TYPES.lapis_ore;
  if (blockY <= 52 && oreChance > 0.82) return BLOCK_TYPES.iron_ore;
  if (blockY <= 68 && oreChance > 0.76) return BLOCK_TYPES.coal_ore;
  
  return BLOCK_TYPES.stone;
}
```

### Reescrita de ProceduralSurfaceDecorator

#### Remover

- Método `decorateVillage(chunkX, chunkZ, applyBlock)` — deletar completamente
- Método `decorateRuins(chunkX, chunkZ, applyBlock)` — deletar completamente
- Métodos `shouldPlaceVillageAnchor()` e `shouldPlaceRuinAnchor()` — deletar
- Método `decorateEucalyptusTree()` — substituir por `decorateBirchTree()`
- Chamada `this.decorateVillage(chunkX, chunkZ, applyBlock)` em `decorateTreesForChunk()` — remover
- Chamada `this.decorateRuins(chunkX, chunkZ, applyBlock)` em `decorateTreesForChunk()` — remover

#### Melhorar oak tree

```js
decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock) {
  const trunkHeight = 5 + Math.floor(this.random.random2D(worldX, worldZ, 907) * 3); // 5-7
  const canopyBaseY = trunkBaseY + trunkHeight - 2;
  const canopyTopY = trunkBaseY + trunkHeight + 2;
  
  for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y++) {
    applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
  }
  
  for (let y = canopyBaseY; y <= canopyTopY; y++) {
    const radius = y === canopyTopY ? 1 : (y === canopyTopY - 1 ? 2 : 2);
    for (let ox = -radius; ox <= radius; ox++) {
      for (let oz = -radius; oz <= radius; oz++) {
        const dist = Math.sqrt(ox*ox + oz*oz);
        if (dist > radius + 0.5) continue;
        // buracos aleatórios nos cantos para copa orgânica
        if (dist > radius - 0.3 && this.random.random2D(worldX + ox, worldZ + oz, 1031) > 0.6) continue;
        if (ox === 0 && oz === 0 && y < canopyTopY) continue;
        applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
      }
    }
  }
}
```

#### Adicionar birch tree

```js
decorateBirchTree(worldX, worldZ, trunkBaseY, applyBlock) {
  const trunkHeight = 6 + Math.floor(this.random.random2D(worldX, worldZ, 1013) * 3); // 6-8
  const canopyBaseY = trunkBaseY + trunkHeight - 2;
  const canopyTopY = trunkBaseY + trunkHeight + 1;
  
  for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y++) {
    // usar wood por ora; PRD-016 pode mapear texturas diferentes
    applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
  }
  
  for (let y = canopyBaseY; y <= canopyTopY; y++) {
    const radius = y >= canopyTopY ? 1 : 2;
    for (let ox = -radius; ox <= radius; ox++) {
      for (let oz = -radius; oz <= radius; oz++) {
        if (Math.abs(ox) + Math.abs(oz) > radius + 1) continue;
        if (ox === 0 && oz === 0 && y < canopyTopY) continue;
        applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
      }
    }
  }
}
```

#### Melhorar pine/spruce tree

```js
decoratePineTree(worldX, worldZ, trunkBaseY, applyBlock) {
  const trunkHeight = 10 + Math.floor(this.random.random2D(worldX, worldZ, 1217) * 6); // 10-15
  const canopyStart = trunkBaseY + 3;
  
  for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y++) {
    applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
  }
  
  // Copa cônica: radius decresce de baixo para cima
  for (let y = canopyStart; y <= trunkBaseY + trunkHeight; y++) {
    const distToTop = (trunkBaseY + trunkHeight) - y;
    // radius: 0 no topo, cresce de 1 em 1 a cada 2 blocos
    const radius = Math.min(3, Math.floor(distToTop / 2));
    
    for (let ox = -radius; ox <= radius; ox++) {
      for (let oz = -radius; oz <= radius; oz++) {
        if (Math.abs(ox) + Math.abs(oz) > radius + (radius > 1 ? 1 : 0)) continue;
        if (ox === 0 && oz === 0 && y < trunkBaseY + trunkHeight) continue;
        applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
      }
    }
  }
  // ponta
  applyBlock(worldX, trunkBaseY + trunkHeight, worldZ, BLOCK_TYPES.leaves, true);
}
```

#### Tipo de árvore por bioma

```js
getTreeType(x, z) {
  const biome = this.terrain.getBiomeAt(x, z);
  if (biome.key === 'taiga') return 'pine';
  const v = this.random.random2D(x, z, 991);
  if (biome.key === 'plains' || biome.key === 'meadow') return v > 0.5 ? 'birch' : 'oak';
  if (biome.key === 'forest') return v > 0.3 ? 'oak' : 'birch';
  return 'oak';
}
```

#### Decoração de solo

Adicionar método `decorateSurfaceForChunk(chunkX, chunkZ, applyBlock)`:

```js
decorateSurfaceForChunk(chunkX, chunkZ, applyBlock) {
  const startX = chunkX * WORLD_CONFIG.chunkSize;
  const startZ = chunkZ * WORLD_CONFIG.chunkSize;
  
  for (let wx = startX; wx < startX + WORLD_CONFIG.chunkSize; wx++) {
    for (let wz = startZ; wz < startZ + WORLD_CONFIG.chunkSize; wz++) {
      if (!isWithinWorldBounds(wx, wz)) continue;
      const profile = this.getColumnProfile(wx, wz);
      
      if (profile.hasWater) continue;
      const surfaceY = profile.surfaceHeight;
      const rnd = this.random.random2D(wx, wz, 2003);
      
      switch (profile.biomeKey) {
        case 'plains':
        case 'meadow':
          if (rnd < 0.12) applyBlock(wx, surfaceY, wz, BLOCK_TYPES.tall_grass, true);
          else if (rnd < 0.15) applyBlock(wx, surfaceY, wz, BLOCK_TYPES.flower, true);
          break;
        case 'forest':
          if (rnd < 0.08) applyBlock(wx, surfaceY, wz, BLOCK_TYPES.tall_grass, true);
          else if (rnd < 0.10) applyBlock(wx, surfaceY, wz, BLOCK_TYPES.flower, true);
          break;
        case 'desert':
        case 'badlands':
          if (rnd < 0.03) {
            // cacto: 1-3 blocos de altura
            const cactusH = 1 + Math.floor(this.random.random2D(wx, wz, 2099) * 3);
            for (let cy = 0; cy < cactusH; cy++) {
              applyBlock(wx, surfaceY + cy, wz, BLOCK_TYPES.cactus, false);
            }
          }
          break;
        case 'taiga':
          if (rnd < 0.04) applyBlock(wx, surfaceY, wz, BLOCK_TYPES.snow, false);
          break;
      }
    }
  }
}
```

Chamar `this.decorateSurfaceForChunk(chunkX, chunkZ, applyBlock)` no final de `decorateTreesForChunk()`.

**Ponto de atenção:** `tall_grass`, `flower` e `cactus` são colocados em `surfaceY` (um bloco acima da superfície sólida). O `canGrowTree` do `getColumnProfile` impede árvores em posições já decoradas.

### Atualização de WorldConfig.js

```js
// Adicionar ao export
algorithmVersion: 'v5.0',
```

No `TerrainGenerator.constructor`: usar `'v5.0'` por padrão.

## Dados, Persistência e Contratos

- Chunks com versão < v5.0 já salvos: continuam usando seus dados; não regeram
- Novos chunks: usam v5.0
- `chunk.algorithmVersion` deve ser salvo junto do chunk para distinguir gerações futuras

## Requisitos de Performance e Escala

- Blend de altura: apenas 4 samples extras por coluna; custo mínimo
- Decoração de solo: 1 random por bloco da superfície do chunk = 256 randoms extra; aceitável
- Árvores: sem mudança significativa de custo
- O `columnCache` do Decorator continua sendo limpo entre chunks

## Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Cacto em posição inválida (sem areia abaixo) | Médio | Verificar `topBlockId === BLOCK_TYPES.sand` antes de colocar |
| Flores/grama colocadas em água | Baixo | `if (profile.hasWater) continue` já cobre |
| Performance de blend entre biomas | Médio | Manter blendRadius = 12 e só amostrar 4 vizinhos |
| Birch/Oak com textura igual (wood) | Baixo | Aceitável por ora; PRD-016 pode adicionar `birch_log` depois |
| Mundos antigos com estruturas de vila | Baixo | Apenas novos chunks usam v5; chunks salvos mantêm as estruturas |

## Plano de Testes

- `node --check` em `TerrainGenerator.js`, `ProceduralSurfaceDecorator.js`, `BlockTypes.js`
- `npm run test:harness` e `npm test`
- Smoke com seed padrão: verificar deserto com areia e cactos
- Smoke: montanha com neve visível
- Smoke: forest com flores e grama
- Smoke: nenhuma "casa de 4 pilares" ou "ruína com ouro" visível
- Multi-seed smoke: 3 seeds diferentes, verificar variedade
- Telemetria: tempo de geração de chunk

## Tasks Derivadas

| Task | Objetivo | Dependências |
|------|----------|--------------|
| [TASK-001](./tasks/TASK-001-novos-blocos.md) | Adicionar novos blocos ao BlockTypes.js | Nenhuma |
| [TASK-002](./tasks/TASK-002-terreno-biomas.md) | Reescrever computeHeight e getBlockTypeAt | TASK-001 |
| [TASK-003](./tasks/TASK-003-minerios.md) | Atualizar getSubsurfaceBlockIdAt com novos minérios | TASK-001 |
| [TASK-004](./tasks/TASK-004-arvores-decoracao.md) | Reescrever árvores, decoração de solo, remover estruturas | TASK-001, TASK-002 |
| [TASK-005](./tasks/TASK-005-validar-worldgen.md) | Validar smoke multi-seed e performance | TASK-002, TASK-003, TASK-004 |

## Rollback

- Reverter `TerrainGenerator.algorithmVersion` para `'v4.0'`
- Reverter `ProceduralSurfaceDecorator` para versão anterior via git
- Novos blocos adicionados ao `BlockTypes.js` são inofensivos se não forem gerados
