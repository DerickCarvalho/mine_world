import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, clampNumber, getBlockCoord, isWithinWorldBounds } from './WorldConfig.js';

export class TerrainGenerator {
    constructor(seed, algorithmVersion = 'v5.0') {
        this.seed = String(seed || 'mineworld');
        this.algorithmVersion = String(algorithmVersion || 'v5.0');
        this.random = new SeededRandom(this.seed + '|' + this.algorithmVersion);
        this.heightCache = new Map();
        this.biomeCache = new Map();
        this.waterLevel = clampNumber(32, WORLD_CONFIG.minSurfaceHeight + 2, WORLD_CONFIG.maxSurfaceHeight - 8);
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
                macro: 0,
                mountainWeight: 0,
                ridgeWeight: 0,
                riverWeight: 0,
                lakeWeight: 0
            };
        }

        const key = this.getCacheKey(blockX, blockZ);
        if (this.biomeCache.has(key)) {
            return this.biomeCache.get(key);
        }

        const macro = this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.00036,
            octaves: 4,
            lacunarity: 2.02,
            persistence: 0.56,
            salt: 11
        });
        const continental = this.random.fractalNoise2D(blockX + 800, blockZ - 1200, {
            frequency: 0.00062,
            octaves: 5,
            lacunarity: 2,
            persistence: 0.58,
            salt: 39
        });
        const temperature = this.random.fractalNoise2D(blockX - 900, blockZ + 1400, {
            frequency: 0.00092,
            octaves: 4,
            lacunarity: 2.06,
            persistence: 0.53,
            salt: 71
        });
        const moisture = this.random.fractalNoise2D(blockX + 1400, blockZ - 600, {
            frequency: 0.00098,
            octaves: 4,
            lacunarity: 2.04,
            persistence: 0.55,
            salt: 113
        });
        const ridgeNoise = Math.abs(this.random.fractalNoise2D(blockX - 2600, blockZ + 900, {
            frequency: 0.00074,
            octaves: 4,
            lacunarity: 2.04,
            persistence: 0.57,
            salt: 181
        }) * 2 - 1);
        const ridgeWeight = clampNumber((0.34 - ridgeNoise) / 0.34, 0, 1);
        const mountainWeight = clampNumber((continental - 0.5) / 0.28, 0, 1) * clampNumber((macro - 0.46) / 0.24, 0, 1);
        const riverNoise = Math.abs(this.random.fractalNoise2D(blockX, blockZ, {
            frequency: 0.00118,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.58,
            salt: 313
        }) * 2 - 1);
        const riverWeight = clampNumber((0.032 - riverNoise) / 0.032, 0, 1) * clampNumber((0.76 - ridgeWeight) / 0.76, 0, 1);
        const lakeNoise = this.random.fractalNoise2D(blockX + 500, blockZ - 700, {
            frequency: 0.00088,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.57,
            salt: 451
        });
        const basinNoise = this.random.fractalNoise2D(blockX - 1300, blockZ + 300, {
            frequency: 0.00052,
            octaves: 3,
            lacunarity: 2,
            persistence: 0.58,
            salt: 529
        });
        const lakeWeight = lakeNoise > 0.7 && basinNoise > 0.56 ? clampNumber((lakeNoise - 0.7) / 0.18, 0, 1) : 0;

        let biomeKey = 'plains';
        if (riverWeight > 0.48) {
            biomeKey = 'river';
        } else if (lakeWeight > 0.42) {
            biomeKey = 'lake';
        } else if (mountainWeight > 0.26 && ridgeWeight > 0.16) {
            biomeKey = 'mountains';
        } else if (temperature < 0.34 && moisture > 0.52) {
            biomeKey = 'taiga';
        } else if (temperature > 0.54 && moisture > 0.42 && continental > 0.48) {
            biomeKey = 'meadow';
        } else if (temperature > 0.66 && moisture < 0.26 && continental > 0.46) {
            biomeKey = 'badlands';
        } else if (temperature > 0.64 && moisture < 0.34) {
            biomeKey = 'desert';
        } else if (moisture > 0.55) {
            biomeKey = 'forest';
        }

        const biome = {
            key: biomeKey,
            temperature: temperature,
            moisture: moisture,
            continental: continental,
            macro: macro,
            mountainWeight: mountainWeight,
            ridgeWeight: ridgeWeight,
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
        const continentalBase = this.random.fractalNoise2D(x, z, {
            frequency: 0.00076,
            octaves: 4,
            lacunarity: 2.02,
            persistence: 0.57,
            salt: 137
        });
        const rolling = this.random.fractalNoise2D(x, z, {
            frequency: 0.0022,
            octaves: 3,
            lacunarity: 2.02,
            persistence: 0.52,
            salt: 211
        });
        const detail = this.random.fractalNoise2D(x, z, {
            frequency: 0.0058,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.45,
            salt: 283
        });
        const mountainMass = this.random.fractalNoise2D(x + 1600, z - 800, {
            frequency: 0.0011,
            octaves: 3,
            lacunarity: 2.04,
            persistence: 0.58,
            salt: 601
        });
        const ridgeSoft = this.random.fractalNoise2D(x - 700, z + 500, {
            frequency: 0.0019,
            octaves: 2,
            lacunarity: 2.02,
            persistence: 0.54,
            salt: 677
        });
        const dune = this.random.fractalNoise2D(x + 400, z - 300, {
            frequency: 0.0056,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.54,
            salt: 349
        });

        let rawHeight = 30 + biome.continental * 6.5 + continentalBase * 4.4 + rolling * 2.8 + detail * 1.1;

        if (biome.key === 'desert') {
            rawHeight = 29 + biome.continental * 4.8 + continentalBase * 2.6 + rolling * 1.4 + dune * 2.8 + detail * 0.6;
        } else if (biome.key === 'badlands') {
            rawHeight = 32 + biome.continental * 7.1 + continentalBase * 2.3 + rolling * 1.8 + detail * 0.8 + dune * 1.6;
        } else if (biome.key === 'meadow') {
            rawHeight = 33 + biome.continental * 6.8 + continentalBase * 3.2 + rolling * 3.8 + detail * 1.6;
        } else if (biome.key === 'taiga') {
            rawHeight = 34 + biome.continental * 6.5 + continentalBase * 3.6 + rolling * 2.9 + detail * 1.5;
        } else if (biome.key === 'forest') {
            rawHeight = 31 + biome.continental * 6.4 + continentalBase * 3.4 + rolling * 3.2 + detail * 1.2;
        } else if (biome.key === 'mountains') {
            const rangeLift = biome.mountainWeight * 8.5 + biome.ridgeWeight * 6.5;
            rawHeight = 34
                + biome.continental * 7.5
                + continentalBase * 2.6
                + mountainMass * 5.2
                + ridgeSoft * 3.6
                + rangeLift
                + rolling * 2.2
                + detail * 1.3;
        }

        if (biome.key === 'river') {
            rawHeight -= biome.riverWeight * 1.8;
            rawHeight = Math.min(rawHeight, this.waterLevel + 0.2 + detail * 0.2);
        }

        if (biome.key === 'lake') {
            rawHeight = Math.min(rawHeight, this.waterLevel - 0.4 + detail * 0.25);
        }

        // Blend suave com alturas ja calculadas de biomas vizinhos para evitar gaps abruptos
        const blendRadius = 12;
        const blendOffsets = [[-blendRadius, 0], [blendRadius, 0], [0, -blendRadius], [0, blendRadius]];
        let blendH = rawHeight;
        let blendTotal = 1.0;
        for (let bi = 0; bi < blendOffsets.length; bi++) {
            const nx = x + blendOffsets[bi][0];
            const nz = z + blendOffsets[bi][1];
            const nk = this.getCacheKey(nx, nz);
            if (this.heightCache.has(nk)) {
                const nBiome = this.getBiomeAt(nx, nz);
                if (nBiome.key !== biome.key) {
                    blendH += this.heightCache.get(nk) * 0.2;
                    blendTotal += 0.2;
                }
            }
        }
        rawHeight = blendH / blendTotal;

        const edgeDistanceX = Math.min(x - WORLD_CONFIG.minX, WORLD_CONFIG.maxX - x);
        const edgeDistanceZ = Math.min(z - WORLD_CONFIG.minZ, WORLD_CONFIG.maxZ - z);
        const edgeFactor = clampNumber(Math.min(edgeDistanceX, edgeDistanceZ) / 88, 0, 1);

        return clampNumber(
            Math.round(rawHeight * edgeFactor + 10 * (1 - edgeFactor)),
            WORLD_CONFIG.minSurfaceHeight,
            WORLD_CONFIG.maxSurfaceHeight
        );
    }

    hasCaveEntranceAt(x, z) {
        const entranceNoise = this.random.fractalNoise2D(x, z, {
            frequency: 0.0036,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.56,
            salt: 809
        });
        const ridge = Math.abs(this.random.fractalNoise2D(x + 700, z - 500, {
            frequency: 0.0052,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.52,
            salt: 947
        }) * 2 - 1);

        return entranceNoise > 0.8 && ridge < 0.24;
    }

    isCaveAir(x, y, z, surfaceHeight) {
        if (y <= 4 || y >= surfaceHeight) {
            return false;
        }

        const depth = surfaceHeight - y;
        const entrance = this.hasCaveEntranceAt(x, z);
        if (depth < 5 && !entrance) {
            return false;
        }

        const tunnelA = this.random.fractalNoise2D(x + y * 2.2, z - y * 1.8, {
            frequency: 0.019,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.54,
            salt: 701
        });
        const tunnelB = this.random.fractalNoise2D(x - y * 1.9, z + y * 2.1, {
            frequency: 0.021,
            octaves: 2,
            lacunarity: 2.02,
            persistence: 0.52,
            salt: 919
        });
        const tunnelC = this.random.fractalNoise2D(x + 400, z - 300 + y * 1.2, {
            frequency: 0.012,
            octaves: 1,
            lacunarity: 2,
            persistence: 0.5,
            salt: 967
        });
        const caveValue = (tunnelA * 0.42) + (tunnelB * 0.42) + (tunnelC * 0.16);

        let threshold = entrance ? 0.74 : 0.83;
        if (depth < 8) {
            threshold += 0.05;
        }
        if (y < 20) {
            threshold -= 0.03;
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

    getSubsurfaceBlockIdAt(x, y, z, surfaceHeight = null) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);
        const topY = Number.isFinite(surfaceHeight) ? surfaceHeight : this.getSurfaceHeightAt(blockX, blockZ);

        if (blockY <= 0) {
            return BLOCK_TYPES.bedrock;
        }

        if (topY - blockY <= 3) {
            return BLOCK_TYPES.stone;
        }

        const oreNoise = this.random.fractalNoise2D(blockX + blockY * 17, blockZ - blockY * 13, {
            frequency: 0.081,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.52,
            salt: 1187
        });
        const denseNoise = this.random.fractalNoise2D(blockX - blockY * 9, blockZ + blockY * 11, {
            frequency: 0.052,
            octaves: 2,
            lacunarity: 2.04,
            persistence: 0.55,
            salt: 1453
        });
        const oreChance = oreNoise * 0.72 + denseNoise * 0.28;

        if (blockY <= 15 && oreChance > 0.94) return BLOCK_TYPES.diamond_ore;
        if (blockY <= 28 && oreChance > 0.90) return BLOCK_TYPES.gold_ore;
        if (blockY <= 30 && oreChance > 0.89) return BLOCK_TYPES.lapis_ore;
        if (blockY <= 52 && oreChance > 0.82) return BLOCK_TYPES.iron_ore;
        if (blockY <= 68 && oreChance > 0.76) return BLOCK_TYPES.coal_ore;

        return BLOCK_TYPES.stone;
    }

    getBlockTypeAt(x, y, z) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);
        const surfaceHeight = this.getSurfaceHeightAt(blockX, blockZ);

        if (blockY < 0 || blockY >= surfaceHeight || this.isCaveAir(blockX, blockY, blockZ, surfaceHeight)) {
            return BLOCK_TYPES.air;
        }

        if (blockY <= 0) {
            return BLOCK_TYPES.bedrock;
        }

        const biome = this.getBiomeAt(blockX, blockZ);
        const isBeach = surfaceHeight <= this.waterLevel + 1;
        const isHighMountain = biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 28;
        const isStoneMountain = biome.key === 'mountains' && surfaceHeight >= this.waterLevel + 22;

        if (blockY === surfaceHeight - 1) {
            if (biome.key === 'desert') return BLOCK_TYPES.sand;
            if (biome.key === 'badlands') return BLOCK_TYPES.red_sand;
            if (isHighMountain) return BLOCK_TYPES.snow;
            if (isStoneMountain) return BLOCK_TYPES.stone;
            if (isBeach) return BLOCK_TYPES.sand;
            return BLOCK_TYPES.grass;
        }

        if (blockY >= surfaceHeight - 4) {
            if (biome.key === 'desert') return BLOCK_TYPES.sand;
            if (biome.key === 'badlands') return BLOCK_TYPES.red_sand;
            if (isBeach) return BLOCK_TYPES.sand;
            if (isStoneMountain) return BLOCK_TYPES.stone;
            return BLOCK_TYPES.dirt;
        }

        return this.getSubsurfaceBlockIdAt(blockX, blockY, blockZ, surfaceHeight);
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
                    const candidateX = offsetX;
                    const candidateZ = offsetZ;

                    if (!this.isInsideWorld(candidateX, candidateZ)) {
                        continue;
                    }

                    const biome = this.getBiomeAt(candidateX, candidateZ);
                    if (biome.key === 'river' || biome.key === 'lake' || biome.key === 'mountains' || biome.key === 'badlands') {
                        continue;
                    }

                    const slope = this.estimateSlopeAt(candidateX, candidateZ);
                    const height = this.getSurfaceHeightAt(candidateX, candidateZ);
                    const penalty = Math.abs(height - (this.waterLevel + 5)) + ((biome.key === 'plains' || biome.key === 'meadow') ? 0 : 1.25);

                    if (slope < bestCandidate.slope || (slope === bestCandidate.slope && penalty < bestCandidate.penalty)) {
                        bestCandidate = { x: candidateX, z: candidateZ, slope: slope, penalty: penalty, height: height };
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
