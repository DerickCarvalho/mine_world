import { BLOCK_TYPES, getBlockIdByKey, getBlockKeyById, isBreakableBlock, isCollectableBlock, isPlaceableBlock, isSolidBlock } from './BlockTypes.js';
import { createChunkKey } from './ChunkStore.js';
import { ProceduralSurfaceDecorator } from './ProceduralSurfaceDecorator.js';
import { WORLD_CONFIG, getBlockCoord, getChunkCoord, isWithinWorldBounds } from './WorldConfig.js';

function createMutationKey(x, y, z) {
    return x + ':' + y + ':' + z;
}

function createChunkSnapshot(chunkX, chunkZ, data) {
    return {
        key: createChunkKey(chunkX, chunkZ),
        chunkX: chunkX,
        chunkZ: chunkZ,
        data: data
    };
}

export class MutableWorld {
    constructor(terrain) {
        this.terrain = terrain;
        this.decorator = new ProceduralSurfaceDecorator(terrain.seed, terrain.algorithmVersion, terrain);
        this.chunkCache = new Map();
        this.mutationValues = new Map();
        this.mutationChunkIndex = new Map();
    }


    syncDormantSnapshot(snapshot) {
        if (!snapshot) {
            return;
        }

        this.dormantChunkCache.delete(snapshot.key);
        this.dormantChunkCache.set(snapshot.key, createChunkSnapshot(snapshot.chunkX, snapshot.chunkZ, new Uint8Array(snapshot.data)));

        while (this.dormantChunkCache.size > this.dormantChunkLimit) {
            const oldestKey = this.dormantChunkCache.keys().next().value;
            this.dormantChunkCache.delete(oldestKey);
        }
    }
    getChunkArraySize() {
        return WORLD_CONFIG.chunkSize * WORLD_CONFIG.chunkSize * WORLD_CONFIG.height;
    }

    createEmptyChunkData() {
        return new Uint8Array(this.getChunkArraySize());
    }

    getChunkIndex(localX, y, localZ) {
        return y * WORLD_CONFIG.chunkSize * WORLD_CONFIG.chunkSize + localZ * WORLD_CONFIG.chunkSize + localX;
    }

    isWithinY(y) {
        return y >= 0 && y < WORLD_CONFIG.height;
    }

    isInsideWorld(x, z) {
        return isWithinWorldBounds(getBlockCoord(x), getBlockCoord(z));
    }

    getChunkKey(chunkX, chunkZ) {
        return createChunkKey(chunkX, chunkZ);
    }

    getSurfaceBiome(x, z) {
        return this.terrain.getBiomeAt(x, z);
    }

    hasChunkSnapshot(chunkX, chunkZ) {
        return this.chunkCache.has(this.getChunkKey(chunkX, chunkZ));
    }

    getChunkSnapshot(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        if (this.chunkCache.has(key)) {
            return this.chunkCache.get(key);
        }

        const data = this.generateChunkData(chunkX, chunkZ);
        const snapshot = createChunkSnapshot(chunkX, chunkZ, data);
        this.chunkCache.set(key, snapshot);
        return snapshot;
    }

    hydrateChunkData(chunkX, chunkZ, data) {
        if (!(data instanceof Uint8Array) || data.length !== this.getChunkArraySize()) {
            return false;
        }

        const hydratedData = new Uint8Array(data);
        this.applyMutationsToChunkData(chunkX, chunkZ, hydratedData);
        this.chunkCache.set(this.getChunkKey(chunkX, chunkZ), createChunkSnapshot(chunkX, chunkZ, hydratedData));
        return true;
    }

    getChunkDataCopy(chunkX, chunkZ) {
        const snapshot = this.getChunkSnapshot(chunkX, chunkZ);
        return new Uint8Array(snapshot.data);
    }

    unloadChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        const snapshot = this.chunkCache.get(key);
        if (snapshot) {
            this.syncDormantSnapshot(snapshot);
        }
        this.chunkCache.delete(key);
    }

    buildChunkBaseData(chunkX, chunkZ) {
        const data = this.createEmptyChunkData();
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

        const setBlock = (worldX, y, worldZ, blockId, onlyIfAir) => {
            if (!this.isWithinY(y) || !isWithinWorldBounds(worldX, worldZ)) {
                return;
            }

            const localX = worldX - startX;
            const localZ = worldZ - startZ;

            if (localX < 0 || localX >= WORLD_CONFIG.chunkSize || localZ < 0 || localZ >= WORLD_CONFIG.chunkSize) {
                return;
            }

            const index = this.getChunkIndex(localX, y, localZ);
            if (onlyIfAir && data[index] !== BLOCK_TYPES.air) {
                return;
            }

            data[index] = blockId;
        };

        for (let localX = 0; localX < WORLD_CONFIG.chunkSize; localX += 1) {
            const worldX = startX + localX;
            if (worldX < WORLD_CONFIG.minX || worldX > WORLD_CONFIG.maxX) {
                continue;
            }

            for (let localZ = 0; localZ < WORLD_CONFIG.chunkSize; localZ += 1) {
                const worldZ = startZ + localZ;
                if (worldZ < WORLD_CONFIG.minZ || worldZ > WORLD_CONFIG.maxZ) {
                    continue;
                }

                const profile = this.decorator.getColumnProfile(worldX, worldZ);
                const surfaceHeight = profile.surfaceHeight;
                setBlock(worldX, 0, worldZ, BLOCK_TYPES.bedrock, false);

                for (let y = 1; y < surfaceHeight && y < WORLD_CONFIG.height; y += 1) {
                    if (this.terrain.isCaveAir(worldX, y, worldZ, surfaceHeight)) {
                        continue;
                    }

                    let blockId = BLOCK_TYPES.stone;
                    if (y === surfaceHeight - 1) {
                        blockId = profile.topBlockId;
                    } else if (y >= surfaceHeight - 4) {
                        blockId = profile.fillerBlockId;
                    }

                    setBlock(worldX, y, worldZ, blockId, false);
                }

                if (profile.hasWater) {
                    for (let y = surfaceHeight; y < profile.waterLevel && y < WORLD_CONFIG.height; y += 1) {
                        setBlock(worldX, y, worldZ, BLOCK_TYPES.water, true);
                    }
                }
            }
        }

        this.decorator.decorateTreesForChunk(chunkX, chunkZ, setBlock);
        return data;
    }

    generateChunkData(chunkX, chunkZ) {
        const data = this.buildChunkBaseData(chunkX, chunkZ);
        this.applyMutationsToChunkData(chunkX, chunkZ, data);
        return data;
    }

    applyMutationsToChunkData(chunkX, chunkZ, data) {
        const chunkKey = this.getChunkKey(chunkX, chunkZ);
        const mutationKeys = this.mutationChunkIndex.get(chunkKey);

        if (!mutationKeys) {
            return;
        }

        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;

        for (const mutationKey of mutationKeys) {
            const mutation = this.mutationValues.get(mutationKey);
            if (!mutation || !this.isWithinY(mutation.y)) {
                continue;
            }

            const localX = mutation.x - startX;
            const localZ = mutation.z - startZ;
            if (localX < 0 || localX >= WORLD_CONFIG.chunkSize || localZ < 0 || localZ >= WORLD_CONFIG.chunkSize) {
                continue;
            }

            data[this.getChunkIndex(localX, mutation.y, localZ)] = mutation.blockId;
        }
    }

    getBlockIdAt(x, y, z) {
        return this.getBlockIdAtBlock(getBlockCoord(x), getBlockCoord(y), getBlockCoord(z));
    }

    getBlockIdAtBlock(blockX, blockY, blockZ) {
        if (!this.isWithinY(blockY) || !isWithinWorldBounds(blockX, blockZ)) {
            return BLOCK_TYPES.air;
        }

        const chunkX = getChunkCoord(blockX);
        const chunkZ = getChunkCoord(blockZ);
        const snapshot = this.getChunkSnapshot(chunkX, chunkZ);
        const localX = blockX - chunkX * WORLD_CONFIG.chunkSize;
        const localZ = blockZ - chunkZ * WORLD_CONFIG.chunkSize;
        return snapshot.data[this.getChunkIndex(localX, blockY, localZ)] || BLOCK_TYPES.air;
    }

    isSolidBlockAtBlock(blockX, blockY, blockZ) {
        return isSolidBlock(this.getBlockIdAtBlock(blockX, blockY, blockZ));
    }

    getTopSolidYAt(x, z) {
        const blockX = getBlockCoord(x);
        const blockZ = getBlockCoord(z);

        if (!isWithinWorldBounds(blockX, blockZ)) {
            return -1;
        }

        for (let y = WORLD_CONFIG.height - 1; y >= 0; y -= 1) {
            if (this.isSolidBlockAtBlock(blockX, y, blockZ)) {
                return y;
            }
        }

        return -1;
    }

    getHighestSolidBelow(x, z, maxY) {
        const blockX = getBlockCoord(x);
        const blockZ = getBlockCoord(z);

        if (!isWithinWorldBounds(blockX, blockZ)) {
            return Number.NEGATIVE_INFINITY;
        }

        const startY = Math.min(WORLD_CONFIG.height - 1, Math.max(0, Math.floor(maxY)));
        for (let y = startY; y >= 0; y -= 1) {
            if (this.isSolidBlockAtBlock(blockX, y, blockZ)) {
                return y;
            }
        }

        return -1;
    }

    generateBaseBlockIdAt(blockX, blockY, blockZ) {
        if (!this.isWithinY(blockY) || !isWithinWorldBounds(blockX, blockZ)) {
            return BLOCK_TYPES.air;
        }

        const chunkX = getChunkCoord(blockX);
        const chunkZ = getChunkCoord(blockZ);
        const tempChunk = this.buildChunkBaseData(chunkX, chunkZ);
        const localX = blockX - chunkX * WORLD_CONFIG.chunkSize;
        const localZ = blockZ - chunkZ * WORLD_CONFIG.chunkSize;
        return tempChunk[this.getChunkIndex(localX, blockY, localZ)] || BLOCK_TYPES.air;
    }

    setMutation(x, y, z, blockId, updateCache = true) {
        const mutationKey = createMutationKey(x, y, z);
        const chunkKey = this.getChunkKey(getChunkCoord(x), getChunkCoord(z));
        const baseBlockId = this.generateBaseBlockIdAt(x, y, z);

        if (blockId === baseBlockId) {
            this.mutationValues.delete(mutationKey);
            const chunkSet = this.mutationChunkIndex.get(chunkKey);

            if (chunkSet) {
                chunkSet.delete(mutationKey);

                if (chunkSet.size === 0) {
                    this.mutationChunkIndex.delete(chunkKey);
                }
            }
        } else {
            this.mutationValues.set(mutationKey, { x: x, y: y, z: z, blockId: blockId });

            if (!this.mutationChunkIndex.has(chunkKey)) {
                this.mutationChunkIndex.set(chunkKey, new Set());
            }

            this.mutationChunkIndex.get(chunkKey).add(mutationKey);
        }

        if (updateCache) {
            const snapshot = this.chunkCache.get(chunkKey);
            if (snapshot && this.isWithinY(y)) {
                const localX = x - getChunkCoord(x) * WORLD_CONFIG.chunkSize;
                const localZ = z - getChunkCoord(z) * WORLD_CONFIG.chunkSize;
                snapshot.data[this.getChunkIndex(localX, y, localZ)] = blockId;
            }
        }
    }

    applySerializedMutations(mutations) {
        this.mutationValues.clear();
        this.mutationChunkIndex.clear();

        if (!Array.isArray(mutations)) {
            return;
        }

        for (const mutation of mutations) {
            if (!mutation || typeof mutation !== 'object') {
                continue;
            }

            const x = Number(mutation.x);
            const y = Number(mutation.y);
            const z = Number(mutation.z);
            const blockId = getBlockIdByKey(mutation.block_id);

            if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z) || !this.isWithinY(y) || !isWithinWorldBounds(x, z)) {
                continue;
            }

            this.setMutation(x, y, z, blockId, false);
        }
    }

    breakBlockAt(blockX, blockY, blockZ) {
        const blockId = this.getBlockIdAtBlock(blockX, blockY, blockZ);
        if (!isBreakableBlock(blockId)) {
            return null;
        }

        this.setMutation(blockX, blockY, blockZ, BLOCK_TYPES.air, true);
        return blockId;
    }

    canPlaceBlockAt(blockX, blockY, blockZ, blockId, playerAabb) {
        if (!this.isWithinY(blockY) || !isWithinWorldBounds(blockX, blockZ) || !isPlaceableBlock(blockId)) {
            return false;
        }

        const currentBlockId = this.getBlockIdAtBlock(blockX, blockY, blockZ);
        if (currentBlockId !== BLOCK_TYPES.air && currentBlockId !== BLOCK_TYPES.water) {
            return false;
        }

        if (!playerAabb) {
            return true;
        }

        return !(playerAabb.minX < blockX + 1
            && playerAabb.maxX > blockX
            && playerAabb.minY < blockY + 1
            && playerAabb.maxY > blockY
            && playerAabb.minZ < blockZ + 1
            && playerAabb.maxZ > blockZ);
    }

    placeBlockAt(blockX, blockY, blockZ, blockId, playerAabb) {
        if (!this.canPlaceBlockAt(blockX, blockY, blockZ, blockId, playerAabb)) {
            return false;
        }

        this.setMutation(blockX, blockY, blockZ, blockId, true);
        return true;
    }

    getSerializedMutations() {
        return Array.from(this.mutationValues.values()).map(function (mutation) {
            return {
                x: mutation.x,
                y: mutation.y,
                z: mutation.z,
                block_id: getBlockKeyById(mutation.blockId)
            };
        });
    }

    canCollectBlock(blockId) {
        return isCollectableBlock(blockId);
    }

    findSpawnPoint() {
        const proceduralSpawn = this.terrain.findSpawnPoint();

        for (let radius = 0; radius <= 64; radius += 4) {
            for (let offsetX = -radius; offsetX <= radius; offsetX += 4 || 1) {
                for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 4 || 1) {
                    const worldX = getBlockCoord(proceduralSpawn.x) + offsetX;
                    const worldZ = getBlockCoord(proceduralSpawn.z) + offsetZ;

                    if (!isWithinWorldBounds(worldX, worldZ)) {
                        continue;
                    }

                    const biome = this.getSurfaceBiome(worldX, worldZ);
                    if (biome.key === 'river' || biome.key === 'lake') {
                        continue;
                    }

                    const topY = this.getTopSolidYAt(worldX + 0.5, worldZ + 0.5);
                    const topBlockId = topY >= 0 ? this.getBlockIdAtBlock(worldX, topY, worldZ) : BLOCK_TYPES.air;

                    if (topBlockId === BLOCK_TYPES.water || topBlockId === BLOCK_TYPES.leaves) {
                        continue;
                    }

                    return {
                        x: worldX + 0.5,
                        y: topY + 1,
                        z: worldZ + 0.5
                    };
                }
            }
        }

        return proceduralSpawn;
    }
}