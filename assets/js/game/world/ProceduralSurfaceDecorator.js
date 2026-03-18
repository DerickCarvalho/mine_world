import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, isWithinWorldBounds } from './WorldConfig.js';

export class ProceduralSurfaceDecorator {
    constructor(seed, algorithmVersion, terrain) {
        this.terrain = terrain;
        this.random = new SeededRandom(String(seed || 'mineworld') + '|surface|' + String(algorithmVersion || 'v2'));
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

        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
            for (let offsetZ = -2; offsetZ <= 2; offsetZ += 1) {
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
        } else if (slope >= 3 || surfaceHeight >= this.waterLevel + 24) {
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
        const biomeFactor = biome.key === 'forest' ? 1 : 0.68;

        return (this.random.valueNoise2D(x, z, 0.052, 601) * 0.72
            + this.random.random2D(x, z, 733) * 0.28) * biomeFactor;
    }

    isTreeAnchor(x, z) {
        const profile = this.getColumnProfile(x, z);
        if (!profile.canGrowTree) {
            return false;
        }

        const threshold = profile.biomeKey === 'forest' ? 0.62 : 0.86;
        const radius = profile.biomeKey === 'forest' ? 3 : 4;
        const score = this.getTreeScore(x, z);

        if (score < threshold) {
            return false;
        }

        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
            for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
                if (offsetX === 0 && offsetZ === 0) {
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

    getTreeHeight(x, z) {
        return 4 + Math.floor(this.random.random2D(x, z, 907) * 3);
    }

    decorateTreesForChunk(chunkX, chunkZ, applyBlock) {
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        const endX = startX + WORLD_CONFIG.chunkSize - 1;
        const endZ = startZ + WORLD_CONFIG.chunkSize - 1;

        for (let worldX = startX - 3; worldX <= endX + 3; worldX += 1) {
            for (let worldZ = startZ - 3; worldZ <= endZ + 3; worldZ += 1) {
                if (!isWithinWorldBounds(worldX, worldZ) || !this.isTreeAnchor(worldX, worldZ)) {
                    continue;
                }

                const trunkBaseY = this.getColumnProfile(worldX, worldZ).surfaceHeight;
                const trunkHeight = this.getTreeHeight(worldX, worldZ);
                const canopyBaseY = trunkBaseY + trunkHeight - 2;
                const canopyTopY = trunkBaseY + trunkHeight + 1;

                for (let y = trunkBaseY; y < trunkBaseY + trunkHeight; y += 1) {
                    applyBlock(worldX, y, worldZ, BLOCK_TYPES.wood, false);
                }

                for (let y = canopyBaseY; y <= canopyTopY; y += 1) {
                    const verticalDistance = Math.abs(y - (trunkBaseY + trunkHeight));
                    const radius = y >= canopyTopY ? 1 : 2;

                    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
                        for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
                            if (Math.abs(offsetX) + Math.abs(offsetZ) > 3 + Math.max(0, 1 - verticalDistance)) {
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
        }
    }
}