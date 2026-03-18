import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, isWithinWorldBounds } from './WorldConfig.js';

export class ProceduralSurfaceDecorator {
    constructor(seed, algorithmVersion, terrain) {
        this.terrain = terrain;
        this.random = new SeededRandom(String(seed || 'mineworld') + '|surface|' + String(algorithmVersion || 'v3.5'));
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

        if (biome.key === 'desert' || nearWater) {
            topBlockId = BLOCK_TYPES.sand;
            fillerBlockId = BLOCK_TYPES.sand;
        } else if ((biome.key === 'mountains' && (slope >= 5 || surfaceHeight >= this.waterLevel + 27)) || surfaceHeight >= this.waterLevel + 36) {
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
                && (biome.key === 'forest' || biome.key === 'plains')
        };

        this.columnCache.set(key, profile);
        return profile;
    }

    getTreeScore(x, z) {
        const biome = this.terrain.getBiomeAt(x, z);
        const biomeFactor = biome.key === 'forest' ? 1 : 0.42;

        return (this.random.valueNoise2D(x, z, 0.025, 601) * 0.68
            + this.random.valueNoise2D(x + 1800, z - 900, 0.012, 733) * 0.22
            + this.random.random2D(x, z, 877) * 0.1) * biomeFactor;
    }

    isTreeAnchor(x, z) {
        const profile = this.getColumnProfile(x, z);
        if (!profile.canGrowTree) {
            return false;
        }

        const threshold = profile.biomeKey === 'forest' ? 0.8 : 0.95;
        const radius = profile.biomeKey === 'forest' ? 6 : 9;
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
        const value = this.random.random2D(x, z, 991);
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
                if (treeType === 'eucalyptus') {
                    this.decorateEucalyptusTree(worldX, worldZ, trunkBaseY, applyBlock);
                } else {
                    this.decorateOakTree(worldX, worldZ, trunkBaseY, applyBlock);
                }
            }
        }
    }
}
