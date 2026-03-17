import { BLOCK_TYPES } from './BlockTypes.js';
import { SeededRandom } from './SeededRandom.js';
import { WORLD_CONFIG, clampNumber, getBlockCoord, isWithinWorldBounds } from './WorldConfig.js';

export class TerrainGenerator {
    constructor(seed, algorithmVersion = 'v1') {
        this.seed = String(seed || 'mineworld');
        this.algorithmVersion = String(algorithmVersion || 'v1');
        this.random = new SeededRandom(this.seed + '|' + this.algorithmVersion);
        this.heightCache = new Map();
    }

    getCacheKey(x, z) {
        return x + ':' + z;
    }

    isInsideWorld(x, z) {
        return isWithinWorldBounds(getBlockCoord(x), getBlockCoord(z));
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
        const continental = this.random.fractalNoise2D(x, z, {
            frequency: 0.0034,
            octaves: 4,
            lacunarity: 2.05,
            persistence: 0.52,
            salt: 11
        });

        const hills = this.random.fractalNoise2D(x, z, {
            frequency: 0.009,
            octaves: 3,
            lacunarity: 2.18,
            persistence: 0.46,
            salt: 37
        });

        const ridgedRaw = this.random.fractalNoise2D(x, z, {
            frequency: 0.018,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.5,
            salt: 71
        });

        const ridged = 1 - Math.abs(ridgedRaw * 2 - 1);
        const plateau = this.random.fractalNoise2D(x, z, {
            frequency: 0.0018,
            octaves: 2,
            lacunarity: 2,
            persistence: 0.65,
            salt: 97
        });

        const edgeDistanceX = Math.min(x - WORLD_CONFIG.minX, WORLD_CONFIG.maxX - x);
        const edgeDistanceZ = Math.min(z - WORLD_CONFIG.minZ, WORLD_CONFIG.maxZ - z);
        const edgeFactor = clampNumber(Math.min(edgeDistanceX, edgeDistanceZ) / 120, 0, 1);

        const rawHeight = 14
            + continental * 24
            + hills * 11
            + ridged * 7
            + plateau * 8;

        return clampNumber(
            Math.round(rawHeight * edgeFactor + 6 * (1 - edgeFactor)),
            WORLD_CONFIG.minSurfaceHeight,
            WORLD_CONFIG.maxSurfaceHeight
        );
    }

    isSolidAt(x, y, z) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);

        if (blockY < 0 || blockY >= WORLD_CONFIG.height || !isWithinWorldBounds(blockX, blockZ)) {
            return false;
        }

        return blockY < this.getSurfaceHeightAt(blockX, blockZ);
    }

    getBlockTypeAt(x, y, z) {
        const blockX = getBlockCoord(x);
        const blockY = getBlockCoord(y);
        const blockZ = getBlockCoord(z);
        const surfaceHeight = this.getSurfaceHeightAt(blockX, blockZ);

        if (blockY < 0 || blockY >= surfaceHeight) {
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
        let bestCandidate = { x: 0, z: 0, slope: Number.POSITIVE_INFINITY, height: this.getSurfaceHeightAt(0, 0) };

        for (let radius = 0; radius <= 48; radius += 8) {
            for (let offsetX = -radius; offsetX <= radius; offsetX += 8 || 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 8 || 1) {
                    const x = offsetX;
                    const z = offsetZ;

                    if (!this.isInsideWorld(x, z)) {
                        continue;
                    }

                    const slope = this.estimateSlopeAt(x, z);
                    const height = this.getSurfaceHeightAt(x, z);

                    if (slope < bestCandidate.slope || (slope === bestCandidate.slope && height > bestCandidate.height)) {
                        bestCandidate = { x: x, z: z, slope: slope, height: height };
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
