import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, isWithinWorldBounds } from './WorldConfig.js';

export class ProceduralSurfaceDecorator {
    constructor(seed, algorithmVersion, terrain) {
        this.terrain = terrain;
        this.random = new SeededRandom(String(seed || 'mineworld') + '|surface|' + String(algorithmVersion || 'v5.0'));
        this.columnCache = new Map();
        this.waterLevel = terrain.getWaterLevel();
    }

    getColumnKey(x, z) {
        return x + ':' + z;
    }

    isNearWater(surfaceHeight, x, z) {
        if (surfaceHeight <= this.waterLevel + 1) {
            return true;
        }

        for (let offsetX = -3; offsetX <= 3; offsetX += 1) {
            for (let offsetZ = -3; offsetZ <= 3; offsetZ += 1) {
                if (offsetX === 0 && offsetZ === 0) {
                    continue;
                }

                const sampleX = x + offsetX;
                const sampleZ = z + offsetZ;
                if (!isWithinWorldBounds(sampleX, sampleZ)) {
                    continue;
                }

                if (this.terrain.getSurfaceHeightAt(sampleX, sampleZ) <= this.waterLevel + 1) {
                    return true;
                }
            }
        }

        return false;
    }

    getColumnProfile(x, z) {
        const key = this.getColumnKey(x, z);
        if (this.columnCache.has(key)) {
            return this.columnCache.get(key);
        }

        const biome = this.terrain.getBiomeAt(x, z);
        const surfaceHeight = this.terrain.getSurfaceHeightAt(x, z);
        const slope = this.terrain.estimateSlopeAt(x, z);
        const nearWater = this.isNearWater(surfaceHeight, x, z) || biome.key === 'river' || biome.key === 'lake';

        let topBlockId = BLOCK_TYPES.grass;
        let fillerBlockId = BLOCK_TYPES.dirt;

        if (biome.key === 'desert') {
            topBlockId = BLOCK_TYPES.sand;
            fillerBlockId = BLOCK_TYPES.sand;
        } else if (biome.key === 'badlands') {
            topBlockId = BLOCK_TYPES.red_sand;
            fillerBlockId = BLOCK_TYPES.red_sand;
        } else if (nearWater) {
            topBlockId = BLOCK_TYPES.sand;
            fillerBlockId = BLOCK_TYPES.sand;
        } else if (biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 28) {
            topBlockId = BLOCK_TYPES.snow;
            fillerBlockId = BLOCK_TYPES.stone;
        } else if ((biome.key === 'mountains' && (slope >= 6 || surfaceHeight >= this.waterLevel + 22)) || surfaceHeight >= this.waterLevel + 38) {
            topBlockId = BLOCK_TYPES.stone;
            fillerBlockId = BLOCK_TYPES.stone;
        }

        const wateryColumn = surfaceHeight < this.waterLevel || biome.key === 'river' || biome.key === 'lake';
        const profile = {
            biomeKey: biome.key,
            surfaceHeight: surfaceHeight,
            topBlockId: topBlockId,
            fillerBlockId: fillerBlockId,
            hasWater: wateryColumn,
            waterLevel: this.waterLevel,
            slope: slope,
            canGrowTree: !wateryColumn
                && topBlockId === BLOCK_TYPES.grass
                && slope <= 1
                && surfaceHeight > this.waterLevel + 2
                && (biome.key === 'forest' || biome.key === 'plains' || biome.key === 'meadow' || biome.key === 'taiga')
        };

        this.columnCache.set(key, profile);
        return profile;
    }

    getTreeScore(x, z) {
        const biome = this.terrain.getBiomeAt(x, z);
        const biomeFactor = biome.key === 'forest'
            ? 1
            : (biome.key === 'taiga' ? 0.82 : (biome.key === 'meadow' ? 0.46 : 0.34));

        return (this.random.valueNoise2D(x, z, 0.024, 601) * 0.7
            + this.random.valueNoise2D(x + 1800, z - 900, 0.01, 733) * 0.22
            + this.random.random2D(x, z, 877) * 0.08) * biomeFactor;
    }

    isTreeAnchor(x, z) {
        const profile = this.getColumnProfile(x, z);
        if (!profile.canGrowTree) {
            return false;
        }

        const threshold = profile.biomeKey === 'forest'
            ? 0.86
            : (profile.biomeKey === 'taiga' ? 0.9 : 0.965);
        const radius = profile.biomeKey === 'forest'
            ? 7
            : (profile.biomeKey === 'taiga' ? 8 : 10);
        const score = this.getTreeScore(x, z);

        if (score < threshold) {
            return false;
        }

        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
            for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
                if (offsetX === 0 && offsetZ === 0) {
                    continue;
                }
                if (Math.abs(offsetX) + Math.abs(offsetZ) > radius + 1) {
                    continue;
                }

                const sampleX = x + offsetX;
                const sampleZ = z + offsetZ;
                if (!isWithinWorldBounds(sampleX, sampleZ)) {
                    continue;
                }

                const neighborProfile = this.getColumnProfile(sampleX, sampleZ);
                if (!neighborProfile.canGrowTree) {
                    continue;
                }

                if (this.getTreeScore(sampleX, sampleZ) > score) {
                    return false;
                }
            }
        }

        return true;
    }

    getTreeType(x, z) {
        const biome = this.terrain.getBiomeAt(x, z);
        if (biome.key === 'taiga') return 'pine';
        const v = this.random.random2D(x, z, 991);
        if (biome.key === 'plains' || biome.key === 'meadow') return v > 0.5 ? 'birch' : 'oak';
        if (biome.key === 'forest') return v > 0.3 ? 'oak' : 'birch';
        return 'oak';
    }

    decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 5 + Math.floor(this.random.random2D(worldX, worldZ, 907) * 3);
        const canopyBaseY = trunkBaseY + trunkHeight - 2;
        const canopyTopY = trunkBaseY + trunkHeight + 2;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyBaseY; y <= canopyTopY; y += 1) {
            const radius = y === canopyTopY ? 1 : 2;

            for (let ox = -radius; ox <= radius; ox += 1) {
                for (let oz = -radius; oz <= radius; oz += 1) {
                    const dist = Math.sqrt(ox * ox + oz * oz);
                    if (dist > radius + 0.5) continue;
                    // buracos organicos na periferia da copa
                    if (dist > radius - 0.3 && this.random.random2D(worldX + ox, worldZ + oz, 1031) > 0.6) continue;
                    if (ox === 0 && oz === 0 && y < canopyTopY) continue;
                    applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
                }
            }
        }
    }

    decorateBirchTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 6 + Math.floor(this.random.random2D(worldX, worldZ, 1013) * 3);
        const canopyBaseY = trunkBaseY + trunkHeight - 2;
        const canopyTopY = trunkBaseY + trunkHeight + 1;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyBaseY; y <= canopyTopY; y += 1) {
            const radius = y >= canopyTopY ? 1 : 2;
            for (let ox = -radius; ox <= radius; ox += 1) {
                for (let oz = -radius; oz <= radius; oz += 1) {
                    if (Math.abs(ox) + Math.abs(oz) > radius + 1) continue;
                    if (ox === 0 && oz === 0 && y < canopyTopY) continue;
                    applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
                }
            }
        }
    }

    decoratePineTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 10 + Math.floor(this.random.random2D(worldX, worldZ, 1217) * 6);
        const canopyStart = trunkBaseY + 3;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyStart; y <= trunkBaseY + trunkHeight; y += 1) {
            const distanceToTop = (trunkBaseY + trunkHeight) - y;
            const radius = Math.min(3, Math.floor(distanceToTop / 2));

            for (let ox = -radius; ox <= radius; ox += 1) {
                for (let oz = -radius; oz <= radius; oz += 1) {
                    if (Math.abs(ox) + Math.abs(oz) > radius + (radius > 1 ? 1 : 0)) continue;
                    if (ox === 0 && oz === 0 && y < trunkBaseY + trunkHeight) continue;
                    applyBlock(worldX + ox, y, worldZ + oz, BLOCK_TYPES.leaves, true);
                }
            }
        }
        applyBlock(worldX, trunkBaseY + trunkHeight, worldZ, BLOCK_TYPES.leaves, true);
    }

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
                        if (rnd < 0.035 && profile.topBlockId === BLOCK_TYPES.sand) {
                            const cactusH = 1 + Math.floor(this.random.random2D(wx, wz, 2099) * 3);
                            for (let cy = 0; cy < cactusH; cy++) {
                                applyBlock(wx, surfaceY + cy, wz, BLOCK_TYPES.cactus, false);
                            }
                        }
                        break;
                    case 'badlands':
                        if (rnd < 0.015 && profile.topBlockId === BLOCK_TYPES.red_sand) {
                            applyBlock(wx, surfaceY, wz, BLOCK_TYPES.cactus, false);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // Structure: Desert Well — 3x3 sandstone ring with water center
    _placeDesertWell(anchorX, anchorZ, baseY, applyBlock) {
        const sandstone = BLOCK_TYPES.cobblestone; // uses cobblestone as sandstone stand-in
        const sand = BLOCK_TYPES.sand;
        // bottom floor
        for (let ox = -1; ox <= 1; ox++) {
            for (let oz = -1; oz <= 1; oz++) {
                applyBlock(anchorX + ox, baseY - 1, anchorZ + oz, sand, false);
            }
        }
        // ring walls (3 high, hollow center)
        for (let wallY = 0; wallY <= 2; wallY++) {
            for (let ox = -1; ox <= 1; ox++) {
                for (let oz = -1; oz <= 1; oz++) {
                    if (ox === 0 && oz === 0) {
                        if (wallY === 0) applyBlock(anchorX, baseY + wallY - 1, anchorZ, BLOCK_TYPES.water, false);
                        continue;
                    }
                    applyBlock(anchorX + ox, baseY + wallY, anchorZ + oz, sandstone, false);
                }
            }
        }
    }

    // Structure: Stone Tower Ruins — 4x4 hollow tower with random gaps
    _placeStoneTower(anchorX, anchorZ, baseY, applyBlock) {
        const towerHeight = 6 + Math.floor(this.random.random2D(anchorX, anchorZ, 3001) * 5);
        const material = BLOCK_TYPES.cobblestone;

        for (let wallY = 0; wallY < towerHeight; wallY++) {
            for (let ox = 0; ox <= 3; ox++) {
                for (let oz = 0; oz <= 3; oz++) {
                    const isWall = ox === 0 || ox === 3 || oz === 0 || oz === 3;
                    if (!isWall) continue;
                    // 30% chance de lacuna em cada bloco de parede (exceto base e topo)
                    if (wallY > 0 && wallY < towerHeight - 1) {
                        const gapRnd = this.random.random2D(anchorX + ox, anchorZ + oz + wallY * 37, 3007);
                        if (gapRnd < 0.30) continue;
                    }
                    applyBlock(anchorX + ox, baseY + wallY, anchorZ + oz, material, false);
                }
            }
        }
    }

    // Structure: Rock Formation — organic mound of stone/gravel blocks
    _placeRockFormation(anchorX, anchorZ, baseY, applyBlock) {
        const blockCount = 5 + Math.floor(this.random.random2D(anchorX, anchorZ, 4001) * 8);
        const mats = [BLOCK_TYPES.stone, BLOCK_TYPES.stone, BLOCK_TYPES.gravel];
        for (let bi = 0; bi < blockCount; bi++) {
            const ox = Math.round((this.random.random2D(anchorX + bi, anchorZ, 4003) - 0.5) * 4);
            const oz = Math.round((this.random.random2D(anchorX, anchorZ + bi, 4007) - 0.5) * 4);
            const oy = Math.floor(this.random.random2D(anchorX + bi, anchorZ + bi, 4013) * 3);
            const mat = mats[Math.floor(this.random.random2D(anchorX + bi, anchorZ + oz, 4019) * mats.length)];
            applyBlock(anchorX + ox, baseY + oy, anchorZ + oz, mat, false);
        }
    }

    // Structure: Desert Pillar — sandstone column topped with red_sand
    _placeDesertPillar(anchorX, anchorZ, baseY, applyBlock) {
        const pillarH = 4 + Math.floor(this.random.random2D(anchorX, anchorZ, 5001) * 5);
        for (let py = 0; py < pillarH; py++) {
            applyBlock(anchorX, baseY + py, anchorZ, BLOCK_TYPES.cobblestone, false);
        }
        applyBlock(anchorX, baseY + pillarH, anchorZ, BLOCK_TYPES.red_sand, false);
    }

    // Structure: Underground Dungeon — 5x5x4 cobblestone room at y 20-45
    _placeUndergroundDungeon(anchorX, anchorZ, baseY, applyBlock) {
        const dungeonY = Math.max(20, Math.min(45, baseY - 15 - Math.floor(this.random.random2D(anchorX, anchorZ, 6001) * 10)));
        const cbk = BLOCK_TYPES.cobblestone;

        // floor
        for (let ox = 0; ox <= 4; ox++) {
            for (let oz = 0; oz <= 4; oz++) {
                applyBlock(anchorX + ox, dungeonY, anchorZ + oz, cbk, false);
            }
        }
        // walls and ceiling
        for (let wy = 1; wy <= 4; wy++) {
            for (let ox = 0; ox <= 4; ox++) {
                for (let oz = 0; oz <= 4; oz++) {
                    const isWall = ox === 0 || ox === 4 || oz === 0 || oz === 4 || wy === 4;
                    if (isWall) applyBlock(anchorX + ox, dungeonY + wy, anchorZ + oz, cbk, false);
                }
            }
        }
        // center mossy cobblestone marker
        applyBlock(anchorX + 2, dungeonY + 1, anchorZ + 2, cbk, false);

        // entrance corridor (2 blocks tall, from surface to dungeon)
        const corrX = anchorX + 2;
        const corrZ = anchorZ + 2;
        for (let cy = dungeonY + 4; cy <= baseY; cy++) {
            applyBlock(corrX, cy, corrZ, BLOCK_TYPES.air, false);
            applyBlock(corrX, cy + 1, corrZ, BLOCK_TYPES.air, false);
        }
    }

    decorateStructure(chunkX, chunkZ, applyBlock) {
        // One structure per chunk max, seeded by chunk position
        const structureRnd = this.random.random2D(chunkX * 16 + 7, chunkZ * 16 + 3, 9001);
        if (structureRnd > 0.20) return; // ~20% of chunks have any structure

        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

        // Pick anchor position within chunk (seeded)
        const ax = startX + Math.floor(this.random.random2D(chunkX, chunkZ, 9003) * WORLD_CONFIG.chunkSize);
        const az = startZ + Math.floor(this.random.random2D(chunkX + 500, chunkZ - 700, 9007) * WORLD_CONFIG.chunkSize);

        if (!isWithinWorldBounds(ax, az)) return;

        const profile = this.getColumnProfile(ax, az);
        if (profile.hasWater) return;
        if (profile.slope > 4) return; // don't place on very steep terrain
        const baseY = profile.surfaceHeight;
        if (baseY < 10 || baseY > 90) return;

        const biomeKey = profile.biomeKey;

        // Desert Well: 12% in desert (structureRnd < 0.12 after the 20% gate gives 12%*20%=2.4% total)
        if (biomeKey === 'desert') {
            if (structureRnd < 0.12) {
                this._placeDesertWell(ax, az, baseY, applyBlock);
            } else {
                // Desert Pillar: secondary for desert, 10% in badlands
                this._placeDesertPillar(ax, az, baseY, applyBlock);
            }
            return;
        }

        if (biomeKey === 'badlands') {
            this._placeDesertPillar(ax, az, baseY, applyBlock);
            return;
        }

        if (biomeKey === 'plains' || biomeKey === 'meadow' || biomeKey === 'forest') {
            if (structureRnd < 0.08) {
                this._placeStoneTower(ax, az, baseY, applyBlock);
            } else {
                // Underground dungeon: 5% per chunk
                this._placeUndergroundDungeon(ax, az, baseY, applyBlock);
            }
            return;
        }

        if (biomeKey === 'mountains' || biomeKey === 'taiga') {
            this._placeRockFormation(ax, az, baseY, applyBlock);
            return;
        }

        // For any other biome: underground dungeon
        if (structureRnd < 0.05) {
            this._placeUndergroundDungeon(ax, az, baseY, applyBlock);
        }
    }

    decorateTreesForChunk(chunkX, chunkZ, applyBlock) {
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        const endX = startX + WORLD_CONFIG.chunkSize - 1;
        const endZ = startZ + WORLD_CONFIG.chunkSize - 1;

        for (let worldX = startX - 5; worldX <= endX + 5; worldX += 1) {
            for (let worldZ = startZ - 5; worldZ <= endZ + 5; worldZ += 1) {
                if (!isWithinWorldBounds(worldX, worldZ) || !this.isTreeAnchor(worldX, worldZ)) {
                    continue;
                }

                const trunkBaseY = this.getColumnProfile(worldX, worldZ).surfaceHeight;
                const treeType = this.getTreeType(worldX, worldZ);
                if (treeType === 'pine') {
                    this.decoratePineTree(worldX, worldZ, trunkBaseY, applyBlock);
                } else if (treeType === 'birch') {
                    this.decorateBirchTree(worldX, worldZ, trunkBaseY, applyBlock);
                } else {
                    this.decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock);
                }
            }
        }

        this.decorateSurfaceForChunk(chunkX, chunkZ, applyBlock);
        this.decorateStructure(chunkX, chunkZ, applyBlock);
    }
}
