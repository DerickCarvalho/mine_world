import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, clampNumber, getBlockCoord, isWithinWorldBounds } from './WorldConfig.js';

export class TerrainGenerator {
    constructor(seed, algorithmVersion = 'v3.5') {
        this.seed = String(seed || 'mineworld');
        this.algorithmVersion = String(algorithmVersion || 'v3.5');
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
                lakeWeight: 0,
                mountainWeight: 0,
                foothillWeight: 0,
                region: 0
            };
        }

        const key = this.getCacheKey(blockX, blockZ);
        if (this.biomeCache.has(key)) {
            return this.biomeCache.get(key);
        }

        const region = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.00042,
            octaves: 4,
            lacunarity: 2.02,
            persistence: 0.58,
            salt: 15
        });
        const temperature = this.random.fractalNoise2D(blockX + 900, blockZ - 400, {
            frequency: 0.00094,
            octaves: 4,
            lacunarity: 2.04,
            persistence: 0.52,
            salt: 41
        });
        const moisture = this.random.fractalNoise2D(blockX - 700, blockZ + 1200, {
            frequency: 0.00108,
            octaves: 4,
            lacunarity: 2.08,
            persistence: 0.54,
            salt: 89
        });
        const continental = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.00076,
            octaves: 5,
            lacunarity: 2.02,
            persistence: 0.56,
            salt: 11
        });
        const mountainRidge = Math.abs(this.random.fractalNoise2D(blockX - 3200, blockZ + 1700, {
            frequency: 0.00086,
            octaves: 4,
            lacunarity: 2.04,
            persistence: 0.56,
            salt: 177
        }) * 2 - 1);
        const mountainWeight = clampNumber((0.22 - mountainRidge) / 0.22, 0, 1) * clampNumber((continental - 0.36) / 0.44, 0, 1);
        const foothillNoise = this.random.fractalNoise2D(blockX + 2200, blockZ - 1400, {
            frequency: 0.0012,
            octaves: 3,
            lacunarity: 2.02,
            persistence: 0.58,
            salt: 207
        });
        const foothillWeight = clampNumber((foothillNoise - 0.44) / 0.36, 0, 1) * clampNumber((continental - 0.24) / 0.5, 0, 1);
        const riverNoise = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.0018,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.58,
            salt: 313
        });
        const riverCenter = Math.abs(riverNoise * 2 - 1);
        const riverWeight = clampNumber((0.055 - riverCenter) / 0.055, 0, 1);
        const lakeNoise = this.random.fractalNoise2D(blockX + 700, blockZ - 900, {
            frequency: 0.00105,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.6,
            salt: 421
        });
        const basinNoise = this.random.fractalNoise2D(blockX - 1200, blockZ + 300, {
            frequency: 0.00066,
            octaves: 3,
            lacunarity: 2.04,
            persistence: 0.57,
            salt: 517
        });
        const lakeWeight = lakeNoise > 0.72 && basinNoise > 0.58 ? clampNumber((lakeNoise - 0.72) / 0.18, 0, 1) : 0;

        let biomeKey = 'plains';
        if (riverWeight >= 0.54) {
            biomeKey = 'river';
        } else if (lakeWeight >= 0.5) {
            biomeKey = 'lake';
        } else if (mountainWeight >= 0.4) {
            biomeKey = 'mountains';
        } else if (temperature > 0.62 && moisture < 0.36 && region > 0.38) {
            biomeKey = 'desert';
        } else if (moisture > 0.54 || (region < 0.22 && moisture > 0.46)) {
            biomeKey = 'forest';
        }

        const biome = {
            key: biomeKey,
            temperature: temperature,
            moisture: moisture,
            continental: continental,
            riverWeight: riverWeight,
            lakeWeight: lakeWeight,
            mountainWeight: mountainWeight,
            foothillWeight: foothillWeight,
            region: region
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
        const continentalBase = this.random.fractalNoise2D(x, z, {
            frequency: 0.0008,
            octaves: 4,
            lacunarity: 2.02,
            persistence: 0.57,
            salt: 137
        });
        const rolling = this.random.fractalNoise2D(x, z, {
            frequency: 0.0028,
            octaves: 3,
            lacunarity: 2.04,
            persistence: 0.5,
            salt: 211
        });
        const detail = this.random.fractalNoise2D(x, z, {
            frequency: 0.0072,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.44,
            salt: 283
        });
        const mountainSoft = this.random.fractalNoise2D(x + 1600, z - 800, {
            frequency: 0.0015,
            octaves: 3,
            lacunarity: 2.04,
            persistence: 0.58,
            salt: 601
        });
        const dune = this.random.fractalNoise2D(x + 400, z - 300, {
            frequency: 0.0068,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.54,
            salt: 349
        });

        let rawHeight = 30 + biome.continental * 7 + continentalBase * 4 + rolling * 3.4 + detail * 1.2;

        if (biome.key === 'desert') {
            rawHeight = 28 + biome.continental * 5 + continentalBase * 2.6 + rolling * 1.8 + dune * 3.8 + detail * 0.8;
        } else if (biome.key === 'forest') {
            rawHeight = 32 + biome.continental * 7.2 + continentalBase * 3.6 + rolling * 3.8 + detail * 1.4;
        } else if (biome.key === 'mountains') {
            rawHeight = 35
                + biome.continental * 8.2
                + continentalBase * 3
                + biome.foothillWeight * 5.5
                + biome.mountainWeight * 9.5
                + mountainSoft * 5.8
                + rolling * 2.4
                + detail * 0.7;
        } else if (biome.foothillWeight > 0.24) {
            rawHeight += biome.foothillWeight * 4.6 + rolling * 1.4;
        }

        if (biome.riverWeight > 0) {
            rawHeight -= biome.riverWeight * 2.6;
            rawHeight = Math.min(rawHeight, this.waterLevel + 0.5 + detail * 0.25);
        }

        if (biome.key === 'lake') {
            rawHeight = Math.min(rawHeight, this.waterLevel - 0.6 + detail * 0.35);
        }

        const edgeDistanceX = Math.min(x - WORLD_CONFIG.minX, WORLD_CONFIG.maxX - x);
        const edgeDistanceZ = Math.min(z - WORLD_CONFIG.minZ, WORLD_CONFIG.maxZ - z);
        const edgeFactor = clampNumber(Math.min(edgeDistanceX, edgeDistanceZ) / 96, 0, 1);

        return clampNumber(
            Math.round(rawHeight * edgeFactor + 8 * (1 - edgeFactor)),
            WORLD_CONFIG.minSurfaceHeight,
            WORLD_CONFIG.maxSurfaceHeight
        );
    }

    hasCaveEntranceAt(x, z) {
        const entranceNoise = this.random.fractalNoise2D(x, z, {
            frequency: 0.0048,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.56,
            salt: 809
        });
        const ridge = Math.abs(this.random.fractalNoise2D(x + 700, z - 500, {
            frequency: 0.0062,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.52,
            salt: 947
        }) * 2 - 1);

        return entranceNoise > 0.78 && ridge < 0.32;
    }

    isCaveAir(x, y, z, surfaceHeight) {
        if (y <= 3 || y >= surfaceHeight) {
            return false;
        }

        const depth = surfaceHeight - y;
        const entrance = this.hasCaveEntranceAt(x, z);
        if (depth < 4 && !entrance) {
            return false;
        }

        const tunnelA = this.random.fractalNoise2D(x + y * 2.7, z - y * 1.9, {
            frequency: 0.024,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.54,
            salt: 701
        });
        const tunnelB = this.random.fractalNoise2D(x - y * 2.1, z + y * 2.6, {
            frequency: 0.026,
            octaves: 2,
            lacunarity: 2.02,
            persistence: 0.52,
            salt: 919
        });
        const caveValue = (tunnelA + tunnelB) * 0.5;

        let threshold = entrance ? 0.73 : 0.81;
        if (depth < 8) {
            threshold += 0.05;
        }
        if (y < 18) {
            threshold -= 0.02;
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

        for (let radius = 0; radius <= 80; radius += 8) {
            for (let offsetX = -radius; offsetX <= radius; offsetX += 8 || 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 8 || 1) {
                    const x = offsetX;
                    const z = offsetZ;

                    if (!this.isInsideWorld(x, z)) {
                        continue;
                    }

                    const biome = this.getBiomeAt(x, z);
                    if (biome.key === 'river' || biome.key === 'lake' || biome.key === 'mountains') {
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
