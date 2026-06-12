import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, isWithinWorldBounds } from './WorldConfig.js';

export class ProceduralSurfaceDecorator {
    constructor(seed, algorithmVersion, terrain) {
        this.terrain = terrain;
        this.random = new SeededRandom(String(seed || 'mineworld') + '|surface|' + String(algorithmVersion || 'v4.0'));
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

        if (biome.key === 'desert' || biome.key === 'badlands' || nearWater) {
            topBlockId = BLOCK_TYPES.sand;
            fillerBlockId = BLOCK_TYPES.sand;
        } else if ((biome.key === 'mountains' && (slope >= 6 || surfaceHeight >= this.waterLevel + 30)) || surfaceHeight >= this.waterLevel + 38) {
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
        const value = this.random.random2D(x, z, 991);
        if (biome.key === 'taiga') {
            return 'pine';
        }
        return value > 0.74 ? 'eucalyptus' : 'oak';
    }

    decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 4 + Math.floor(this.random.random2D(worldX, worldZ, 907) * 2);
        const canopyBaseY = trunkBaseY + trunkHeight - 2;
        const canopyTopY = trunkBaseY + trunkHeight + 1;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyBaseY; y <= canopyTopY; y += 1) {
            const radius = y >= canopyTopY ? 1 : 2;

            for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
                    const distance = Math.abs(offsetX) + Math.abs(offsetZ);
                    if (distance > radius + (y < canopyTopY ? 1 : 0)) {
                        continue;
                    }
                    if (offsetX === 0 && offsetZ === 0 && y < canopyTopY) {
                        continue;
                    }

                    applyBlock(worldX + offsetX, y, worldZ + offsetZ, BLOCK_TYPES.leaves, true);
                }
            }
        }
    }

    decorateEucalyptusTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 7 + Math.floor(this.random.random2D(worldX, worldZ, 1013) * 3);
        const canopyCenterY = trunkBaseY + trunkHeight - 1;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyCenterY - 1; y <= canopyCenterY + 1; y += 1) {
            for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                for (let offsetZ = -1; offsetZ <= 1; offsetZ += 1) {
                    if (Math.abs(offsetX) + Math.abs(offsetZ) > 2) {
                        continue;
                    }
                    if (offsetX === 0 && offsetZ === 0 && y < canopyCenterY + 1) {
                        continue;
                    }

                    applyBlock(worldX + offsetX, y, worldZ + offsetZ, BLOCK_TYPES.leaves, true);
                }
            }
        }

        applyBlock(worldX, canopyCenterY + 2, worldZ, BLOCK_TYPES.leaves, true);
    }

    decoratePineTree(worldX, worldZ, trunkBaseY, applyBlock) {
        const trunkHeight = 8 + Math.floor(this.random.random2D(worldX, worldZ, 1217) * 4);
        const canopyStart = trunkBaseY + 3;

        for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
            applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
        }

        for (let y = canopyStart; y <= trunkBaseY + trunkHeight; y += 1) {
            const distanceToTop = (trunkBaseY + trunkHeight) - y;
            const radius = distanceToTop <= 1 ? 1 : (distanceToTop <= 3 ? 2 : 3);

            for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
                    if (Math.abs(offsetX) + Math.abs(offsetZ) > radius + 1) {
                        continue;
                    }
                    if (offsetX === 0 && offsetZ === 0 && y < trunkBaseY + trunkHeight) {
                        continue;
                    }

                    applyBlock(worldX + offsetX, y, worldZ + offsetZ, BLOCK_TYPES.leaves, true);
                }
            }
        }
    }

    shouldPlaceVillageAnchor(worldX, worldZ) {
        const profile = this.getColumnProfile(worldX, worldZ);
        if (profile.biomeKey !== 'plains' && profile.biomeKey !== 'meadow') {
            return false;
        }
        if (profile.surfaceHeight <= this.waterLevel + 2) {
            return false;
        }
        if (this.terrain.estimateSlopeAt(worldX, worldZ) > 1) {
            return false;
        }

        return this.random.valueNoise2D(worldX, worldZ, 0.0062, 1601) > 0.91;
    }

    shouldPlaceRuinAnchor(worldX, worldZ) {
        const profile = this.getColumnProfile(worldX, worldZ);
        if (profile.biomeKey !== 'mountains' && profile.biomeKey !== 'badlands') {
            return false;
        }

        return this.random.valueNoise2D(worldX, worldZ, 0.0076, 1777) > 0.9;
    }

    decorateVillage(chunkX, chunkZ, applyBlock) {
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

        for (let worldX = startX - 6; worldX <= startX + WORLD_CONFIG.chunkSize + 6; worldX += 4) {
            for (let worldZ = startZ - 6; worldZ <= startZ + WORLD_CONFIG.chunkSize + 6; worldZ += 4) {
                if (!isWithinWorldBounds(worldX, worldZ) || !this.shouldPlaceVillageAnchor(worldX, worldZ)) {
                    continue;
                }

                const baseY = this.getColumnProfile(worldX, worldZ).surfaceHeight;
                for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
                    for (let offsetZ = -2; offsetZ <= 2; offsetZ += 1) {
                        applyBlock(worldX + offsetX, baseY, worldZ + offsetZ, BLOCK_TYPES.planks, false);
                    }
                }

                for (let wallY = 1; wallY <= 3; wallY += 1) {
                    applyBlock(worldX - 2, baseY + wallY, worldZ - 2, BLOCK_TYPES.wood, false);
                    applyBlock(worldX + 2, baseY + wallY, worldZ - 2, BLOCK_TYPES.wood, false);
                    applyBlock(worldX - 2, baseY + wallY, worldZ + 2, BLOCK_TYPES.wood, false);
                    applyBlock(worldX + 2, baseY + wallY, worldZ + 2, BLOCK_TYPES.wood, false);
                }

                for (let roofX = -3; roofX <= 3; roofX += 1) {
                    for (let roofZ = -3; roofZ <= 3; roofZ += 1) {
                        applyBlock(worldX + roofX, baseY + 4, worldZ + roofZ, BLOCK_TYPES.planks, false);
                    }
                }

                applyBlock(worldX, baseY + 1, worldZ - 2, BLOCK_TYPES.glass, false);
                applyBlock(worldX, baseY + 2, worldZ - 2, BLOCK_TYPES.glass, false);
            }
        }
    }

    decorateRuins(chunkX, chunkZ, applyBlock) {
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

        for (let worldX = startX - 4; worldX <= startX + WORLD_CONFIG.chunkSize + 4; worldX += 4) {
            for (let worldZ = startZ - 4; worldZ <= startZ + WORLD_CONFIG.chunkSize + 4; worldZ += 4) {
                if (!isWithinWorldBounds(worldX, worldZ) || !this.shouldPlaceRuinAnchor(worldX, worldZ)) {
                    continue;
                }

                const baseY = this.getColumnProfile(worldX, worldZ).surfaceHeight;
                for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                    for (let offsetZ = -1; offsetZ <= 1; offsetZ += 1) {
                        applyBlock(worldX + offsetX, baseY, worldZ + offsetZ, BLOCK_TYPES.cobblestone, false);
                    }
                }

                for (let pillarY = 1; pillarY <= 3; pillarY += 1) {
                    applyBlock(worldX - 1, baseY + pillarY, worldZ - 1, BLOCK_TYPES.cobblestone, false);
                    applyBlock(worldX + 1, baseY + pillarY, worldZ + 1, BLOCK_TYPES.cobblestone, false);
                }

                applyBlock(worldX, baseY + 1, worldZ, BLOCK_TYPES.gold_ore, false);
            }
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
                } else if (treeType === 'eucalyptus') {
                    this.decorateEucalyptusTree(worldX, worldZ, trunkBaseY, applyBlock);
                } else {
                    this.decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock);
                }
            }
        }

        this.decorateVillage(chunkX, chunkZ, applyBlock);
        this.decorateRuins(chunkX, chunkZ, applyBlock);
    }
}
