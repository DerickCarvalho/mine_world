import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, clampNumber, getBlockCoord, isWithinWorldBounds } from './WorldConfig.js';

export class TerrainGenerator {
    constructor(seed, algorithmVersion = 'v2') {
        this.seed = String(seed || 'mineworld');
        this.algorithmVersion = String(algorithmVersion || 'v2');
        this.random = new SeededRandom(this.seed + '|' + this.algorithmVersion);
        this.heightCache = new Map();
        this.biomeCache = new Map();
        this.waterLevel = clampNumber(31, WORLD_CONFIG.minSurfaceHeight + 2, WORLD_CONFIG.maxSurfaceHeight - 8);
    }

    getCacheKey(x, z) {
        return x + ':' + z;
    }

    isInsideWorld(x, z) {
        return isWithinWorldBounds(getBlockCoord(x), getBlockCoord(z));
    }

    getWaterLevel() {
        return this.waterLevel;
    }

    getBiomeAt(x, z) {
        const blockX = getBlockCoord(x);
        const blockZ = getBlockCoord(z);

        if (!isWithinWorldBounds(blockX, blockZ)) {
            return {
                key: 'void',
                temperature: 0,
                moisture: 0,
                continental: 0,
                riverWeight: 0,
                lakeWeight: 0
            };
        }

        const key = this.getCacheKey(blockX, blockZ);
        if (this.biomeCache.has(key)) {
            return this.biomeCache.get(key);
        }

        const temperature = this.random.fractalNoise2D(blockX + 900, blockZ - 400, {
            frequency: 0.0016,
            octaves: 4,
            lacunarity: 2.04,
            persistence: 0.52,
            salt: 41
        });
        const moisture = this.random.fractalNoise2D(blockX - 700, blockZ + 1200, {
            frequency: 0.0017,
            octaves: 4,
            lacunarity: 2.08,
            persistence: 0.5,
            salt: 89
        });
        const continental = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.0011,
            octaves: 5,
            lacunarity: 2.02,
            persistence: 0.54,
            salt: 11
        });
        const riverRaw = Math.abs(this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.0047,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.56,
            salt: 313
        }) * 2 - 1);
        const riverWeight = clampNumber((0.085 - riverRaw) / 0.085, 0, 1);
        const lakeNoise = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.0022,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.58,
            salt: 421
        });
        const lakeWeight = lakeNoise > 0.74 ? clampNumber((lakeNoise - 0.74) / 0.16, 0, 1) : 0;

        let biomeKey = 'plains';
        if (riverWeight >= 0.72) {
            biomeKey = 'river';
        } else if (lakeWeight > 0.68 && continental < 0.58) {
            biomeKey = 'lake';
        } else if (temperature > 0.63 && moisture < 0.38) {
            biomeKey = 'desert';
        } else if (moisture > 0.58) {
            biomeKey = 'forest';
        }

        const biome = {
            key: biomeKey,
            temperature: temperature,
            moisture: moisture,
            continental: continental,
            riverWeight: riverWeight,
            lakeWeight: lakeWeight
        };

        this.biomeCache.set(key, biome);
        return biome;
    }

    getSurfaceHeightAt(x, z) {
        const blockX = getBlockCoord(x);
        const blockZ = getBlockCoord(z);

        if (!isWithinWorldBounds(blockX, blockZ)) {
            return 0;
        }

        const key = this.getCacheKey(blockX, blockZ);
        if (this.heightCache.has(key)) {
            return this.heightCache.get(key);
        }

        const height = this.computeHeight(blockX, blockZ);
        this.heightCache.set(key, height);
        return height;
    }

    computeHeight(x, z) {
        const biome = this.getBiomeAt(x, z);
        const rolling = this.random.fractalNoise2D(x, z, {
            frequency: 0.0054,
            octaves: 4,
            lacunarity: 2.08,
            persistence: 0.48,
            salt: 137
        });
        const hills = this.random.fractalNoise2D(x, z, {
            frequency: 0.0105,
            octaves: 3,
            lacunarity: 2.16,
            persistence: 0.44,
            salt: 211
        });
        const detail = this.random.fractalNoise2D(x, z, {
            frequency: 0.023,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.45,
            salt: 283
        });
        const dune = this.random.fractalNoise2D(x + 400, z - 300, {
            frequency: 0.013,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.54,
            salt: 331
        });

        let rawHeight;
        if (biome.key === 'desert') {
            rawHeight = 26 + biome.continental * 8 + rolling * 4 + dune * 6 + detail * 2;
        } else if (biome.key === 'forest') {
            rawHeight = 33 + biome.continental * 12 + rolling * 8 + hills * 7 + detail * 4;
        } else {
            rawHeight = 30 + biome.continental * 10 + rolling * 6 + hills * 5 + detail * 3;
        }

        if (biome.riverWeight > 0) {
            rawHeight -= biome.riverWeight * (8 + (1 - biome.continental) * 4);
            rawHeight = Math.min(rawHeight, this.waterLevel - 1 + detail * 2);
        }

        if (biome.key === 'lake') {
            rawHeight = Math.min(rawHeight, this.waterLevel - 2 + detail * 1.5);
        }

        const edgeDistanceX = Math.min(x - WORLD_CONFIG.minX, WORLD_CONFIG.maxX - x);
        const edgeDistanceZ = Math.min(z - WORLD_CONFIG.minZ, WORLD_CONFIG.maxZ - z);
        const edgeFactor = clampNumber(Math.min(edgeDistanceX, edgeDistanceZ) / 90, 0, 1);

        return clampNumber(
            Math.round(rawHeight * edgeFactor + 8 * (1 - edgeFactor)),
            WORLD_CONFIG.minSurfaceHeight,
            WORLD_CONFIG.maxSurfaceHeight
        );
    }

    hasCaveEntranceAt(x, z) {
        const noise = this.random.fractalNoise2D(x, z, {
            frequency: 0.0084,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.55,
            salt: 809
        });
        const ridged = Math.abs(this.random.fractalNoise2D(x + 700, z - 500, {
            frequency: 0.011,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.5,
            salt: 947
        }) * 2 - 1);

        return noise > 0.7 && ridged < 0.45;
    }

    isCaveAir(x, y, z, surfaceHeight) {
        if (y <= 2 || y >= surfaceHeight) {
            return false;
        }

        const depth = surfaceHeight - y;
        const entrance = this.hasCaveEntranceAt(x, z);
        if (depth < 3 && !entrance) {
            return false;
        }

        const caveNoiseA = this.random.fractalNoise2D(x + y * 8.11, z - y * 5.27, {
            frequency: 0.047,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.52,
            salt: 701
        });
        const caveNoiseB = this.random.fractalNoise2D(x - y * 6.3, z + y * 9.17, {
            frequency: 0.051,
            octaves: 3,
            lacunarity: 2.02,
            persistence: 0.5,
            salt: 919
        });
        const caveValue = (caveNoiseA + caveNoiseB) * 0.5;

        let threshold = entrance ? 0.59 : 0.665;
        if (depth < 6) {
            threshold += 0.05;
        }
        if (y < 14) {
            threshold += 0.03;
        }

        return caveValue > threshold;
    }

    isSolidAt(x, y, z) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);

        if (blockY < 0 || blockY >= WORLD_CONFIG.height || !isWithinWorldBounds(blockX, blockZ)) {
            return false;
        }

        const surfaceHeight = this.getSurfaceHeightAt(blockX, blockZ);
        if (blockY >= surfaceHeight) {
            return false;
        }

        return !this.isCaveAir(blockX, blockY, blockZ, surfaceHeight);
    }

    getBlockTypeAt(x, y, z) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);
        const surfaceHeight = this.getSurfaceHeightAt(blockX, blockZ);

        if (blockY < 0 || blockY >= surfaceHeight || this.isCaveAir(blockX, blockY, blockZ, surfaceHeight)) {
            return BLOCK_TYPES.air;
        }

        if (blockY === surfaceHeight - 1) {
            return BLOCK_TYPES.grass;
        }

        if (blockY >= surfaceHeight - 4) {
            return BLOCK_TYPES.dirt;
        }

        return BLOCK_TYPES.stone;
    }

    estimateSlopeAt(x, z) {
        const centerHeight = this.getSurfaceHeightAt(x, z);
        const east = this.getSurfaceHeightAt(x + 1, z);
        const west = this.getSurfaceHeightAt(x - 1, z);
        const south = this.getSurfaceHeightAt(x, z + 1);
        const north = this.getSurfaceHeightAt(x, z - 1);

        return Math.max(
            Math.abs(centerHeight - east),
            Math.abs(centerHeight - west),
            Math.abs(centerHeight - south),
            Math.abs(centerHeight - north)
        );
    }

    findSpawnPoint() {
        let bestCandidate = {
            x: 0,
            z: 0,
            slope: Number.POSITIVE_INFINITY,
            penalty: Number.POSITIVE_INFINITY,
            height: this.getSurfaceHeightAt(0, 0)
        };

        for (let radius = 0; radius <= 64; radius += 8) {
            for (let offsetX = -radius; offsetX <= radius; offsetX += 8 || 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 8 || 1) {
                    const x = offsetX;
                    const z = offsetZ;

                    if (!this.isInsideWorld(x, z)) {
                        continue;
                    }

                    const biome = this.getBiomeAt(x, z);
                    if (biome.key === 'river' || biome.key === 'lake') {
                        continue;
                    }

                    const slope = this.estimateSlopeAt(x, z);
                    const height = this.getSurfaceHeightAt(x, z);
                    const penalty = Math.abs(height - (this.waterLevel + 6)) + (biome.key === 'plains' ? 0 : 1.5);

                    if (slope < bestCandidate.slope || (slope === bestCandidate.slope && penalty < bestCandidate.penalty)) {
                        bestCandidate = { x: x, z: z, slope: slope, penalty: penalty, height: height };
                    }
                }
            }

            if (bestCandidate.slope <= 1) {
                break;
            }
        }

        return {
            x: bestCandidate.x + 0.5,
            y: bestCandidate.height,
            z: bestCandidate.z + 0.5
        };
    }
}