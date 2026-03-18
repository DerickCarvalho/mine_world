import { createChunkKey } from './ChunkStore.js';
import { WORLD_CONFIG, getBlockCoord, getChunkCoord, getRuntimeRenderRadius } from './WorldConfig.js';

function normalizeLocalCoord(value) {
    return ((value % WORLD_CONFIG.chunkSize) + WORLD_CONFIG.chunkSize) % WORLD_CONFIG.chunkSize;
}

export class ChunkManager {
    constructor(options) {
        this.store = options.store;
        this.mesher = options.mesher;
        this.world = options.world;
        this.renderRadius = getRuntimeRenderRadius(options.renderDistance);
        this.retentionRadius = this.renderRadius;
        this.requestQueue = [];
        this.requestPending = new Set();
        this.loadingPending = new Set();
        this.generationQueue = [];
        this.generationPending = new Set();
        this.dirtyQueue = [];
        this.dirtyPending = new Set();
        this.pendingSave = new Map();
        this.lastPlayerChunkX = null;
        this.lastPlayerChunkZ = null;
    }

    setRenderDistance(renderDistance) {
        this.renderRadius = getRuntimeRenderRadius(renderDistance);
        this.retentionRadius = this.renderRadius;
    }

    overlapsWorld(chunkX, chunkZ) {
        const startX = chunkX * WORLD_CONFIG.chunkSize;
        const endX = startX + WORLD_CONFIG.chunkSize - 1;
        const startZ = chunkZ * WORLD_CONFIG.chunkSize;
        const endZ = startZ + WORLD_CONFIG.chunkSize - 1;

        return endX >= WORLD_CONFIG.minX
            && startX <= WORLD_CONFIG.maxX
            && endZ >= WORLD_CONFIG.minZ
            && startZ <= WORLD_CONFIG.maxZ;
    }

    getDistanceSq(chunkX, chunkZ, originChunkX, originChunkZ) {
        const deltaX = chunkX - originChunkX;
        const deltaZ = chunkZ - originChunkZ;
        return deltaX * deltaX + deltaZ * deltaZ;
    }

    sortByDistance(queue, originChunkX, originChunkZ) {
        return queue
            .map((item) => ({
                chunkX: item.chunkX,
                chunkZ: item.chunkZ,
                distanceSq: this.getDistanceSq(item.chunkX, item.chunkZ, originChunkX, originChunkZ)
            }))
            .sort((left, right) => left.distanceSq - right.distanceSq);
    }

    queueChunkRequest(chunkX, chunkZ, originChunkX, originChunkZ) {
        const key = createChunkKey(chunkX, chunkZ);

        if (!this.overlapsWorld(chunkX, chunkZ)
            || this.store.has(key)
            || this.requestPending.has(key)
            || this.loadingPending.has(key)
            || this.generationPending.has(key)) {
            return;
        }

        this.requestPending.add(key);
        this.requestQueue.push({
            chunkX: chunkX,
            chunkZ: chunkZ,
            distanceSq: this.getDistanceSq(chunkX, chunkZ, originChunkX, originChunkZ)
        });
    }

    update(position, force = false) {
        const playerChunkX = getChunkCoord(position.x);
        const playerChunkZ = getChunkCoord(position.z);

        if (!force && this.lastPlayerChunkX === playerChunkX && this.lastPlayerChunkZ === playerChunkZ) {
            return false;
        }

        this.lastPlayerChunkX = playerChunkX;
        this.lastPlayerChunkZ = playerChunkZ;

        for (let offsetX = -this.renderRadius; offsetX <= this.renderRadius; offsetX += 1) {
            for (let offsetZ = -this.renderRadius; offsetZ <= this.renderRadius; offsetZ += 1) {
                this.queueChunkRequest(playerChunkX + offsetX, playerChunkZ + offsetZ, playerChunkX, playerChunkZ);
            }
        }

        for (const chunk of this.store.values()) {
            if (Math.abs(chunk.chunkX - playerChunkX) > this.retentionRadius || Math.abs(chunk.chunkZ - playerChunkZ) > this.retentionRadius) {
                this.store.delete(chunk.key);
                this.world.unloadChunk(chunk.chunkX, chunk.chunkZ);
                this.dirtyPending.delete(chunk.key);
            }
        }

        this.requestQueue = this.sortByDistance(
            this.requestQueue.filter((item) => {
                const keep = Math.abs(item.chunkX - playerChunkX) <= this.retentionRadius
                    && Math.abs(item.chunkZ - playerChunkZ) <= this.retentionRadius
                    && this.overlapsWorld(item.chunkX, item.chunkZ);

                if (!keep) {
                    this.requestPending.delete(createChunkKey(item.chunkX, item.chunkZ));
                }

                return keep;
            }),
            playerChunkX,
            playerChunkZ
        );

        this.generationQueue = this.sortByDistance(
            this.generationQueue.filter((item) => {
                const keep = Math.abs(item.chunkX - playerChunkX) <= this.retentionRadius
                    && Math.abs(item.chunkZ - playerChunkZ) <= this.retentionRadius
                    && this.overlapsWorld(item.chunkX, item.chunkZ);

                if (!keep) {
                    this.generationPending.delete(createChunkKey(item.chunkX, item.chunkZ));
                }

                return keep;
            }),
            playerChunkX,
            playerChunkZ
        );

        this.dirtyQueue = this.sortByDistance(
            this.dirtyQueue.filter((item) => this.store.has(createChunkKey(item.chunkX, item.chunkZ))),
            playerChunkX,
            playerChunkZ
        );

        return true;
    }

    takeLoadBatch(maxCount = 8) {
        const batch = [];

        while (batch.length < maxCount && this.requestQueue.length > 0) {
            const nextItem = this.requestQueue.shift();
            const key = createChunkKey(nextItem.chunkX, nextItem.chunkZ);

            if (!this.requestPending.has(key) || this.loadingPending.has(key) || this.store.has(key)) {
                continue;
            }

            this.loadingPending.add(key);
            batch.push({
                chunkX: nextItem.chunkX,
                chunkZ: nextItem.chunkZ
            });
        }

        return batch;
    }

    resolveLoadBatch(requestedChunks, loadedChunks) {
        const loadedMap = loadedChunks instanceof Map ? loadedChunks : new Map();

        for (const chunk of Array.isArray(requestedChunks) ? requestedChunks : []) {
            const chunkX = Number(chunk.chunkX);
            const chunkZ = Number(chunk.chunkZ);
            const key = createChunkKey(chunkX, chunkZ);
            this.loadingPending.delete(key);
            this.requestPending.delete(key);

            if (this.store.has(key) || !this.overlapsWorld(chunkX, chunkZ)) {
                continue;
            }

            const cached = loadedMap.get(key);
            if (cached && cached.data instanceof Uint8Array && this.world.hydrateChunkData(chunkX, chunkZ, cached.data)) {
                this.store.set(key, this.mesher.generateChunk(chunkX, chunkZ));
                continue;
            }

            if (!this.generationPending.has(key)) {
                this.generationPending.add(key);
                this.generationQueue.push({
                    chunkX: chunkX,
                    chunkZ: chunkZ,
                    distanceSq: this.lastPlayerChunkX === null ? 0 : this.getDistanceSq(chunkX, chunkZ, this.lastPlayerChunkX, this.lastPlayerChunkZ)
                });
            }
        }

        if (this.lastPlayerChunkX !== null) {
            this.generationQueue = this.sortByDistance(this.generationQueue, this.lastPlayerChunkX, this.lastPlayerChunkZ);
        }
    }

    markChunkDirty(chunkX, chunkZ) {
        const key = createChunkKey(chunkX, chunkZ);

        if (!this.store.has(key) || this.dirtyPending.has(key)) {
            return;
        }

        this.dirtyPending.add(key);
        this.dirtyQueue.push({
            chunkX: chunkX,
            chunkZ: chunkZ,
            distanceSq: this.lastPlayerChunkX === null ? 0 : this.getDistanceSq(chunkX, chunkZ, this.lastPlayerChunkX, this.lastPlayerChunkZ)
        });
    }

    markBlockDirty(worldX, worldY, worldZ) {
        const blockX = getBlockCoord(worldX);
        const blockZ = getBlockCoord(worldZ);
        const chunkX = getChunkCoord(blockX);
        const chunkZ = getChunkCoord(blockZ);
        const localX = normalizeLocalCoord(blockX);
        const localZ = normalizeLocalCoord(blockZ);
        const chunks = [{ chunkX: chunkX, chunkZ: chunkZ }];

        if (localX === 0) {
            chunks.push({ chunkX: chunkX - 1, chunkZ: chunkZ });
        }

        if (localX === WORLD_CONFIG.chunkSize - 1) {
            chunks.push({ chunkX: chunkX + 1, chunkZ: chunkZ });
        }

        if (localZ === 0) {
            chunks.push({ chunkX: chunkX, chunkZ: chunkZ - 1 });
        }

        if (localZ === WORLD_CONFIG.chunkSize - 1) {
            chunks.push({ chunkX: chunkX, chunkZ: chunkZ + 1 });
        }

        for (const chunk of chunks) {
            this.markChunkDirty(chunk.chunkX, chunk.chunkZ);
        }
    }

    queueChunkForSave(chunkX, chunkZ) {
        const key = createChunkKey(chunkX, chunkZ);
        if (!this.world.hasChunkSnapshot(chunkX, chunkZ)) {
            return;
        }

        this.pendingSave.set(key, {
            chunkX: chunkX,
            chunkZ: chunkZ,
            data: this.world.getChunkDataCopy(chunkX, chunkZ)
        });
    }

    rebuildDirtyChunk(item) {
        const key = createChunkKey(item.chunkX, item.chunkZ);
        this.dirtyPending.delete(key);

        if (!this.store.has(key)) {
            return false;
        }

        this.store.set(key, this.mesher.generateChunk(item.chunkX, item.chunkZ));
        this.queueChunkForSave(item.chunkX, item.chunkZ);
        return true;
    }

    generateChunk(item) {
        const key = createChunkKey(item.chunkX, item.chunkZ);
        this.generationPending.delete(key);

        if (this.store.has(key) || !this.overlapsWorld(item.chunkX, item.chunkZ)) {
            return false;
        }

        this.store.set(key, this.mesher.generateChunk(item.chunkX, item.chunkZ));
        this.queueChunkForSave(item.chunkX, item.chunkZ);
        return true;
    }

    drainQueue(maxChunksPerFrame = 1) {
        let processed = 0;
        let generated = 0;
        let rebuilt = 0;

        while (processed < maxChunksPerFrame && this.dirtyQueue.length > 0) {
            const nextDirty = this.dirtyQueue.shift();
            if (this.rebuildDirtyChunk(nextDirty)) {
                rebuilt += 1;
                processed += 1;
            }
        }

        while (processed < maxChunksPerFrame && this.generationQueue.length > 0) {
            const nextItem = this.generationQueue.shift();
            if (this.generateChunk(nextItem)) {
                generated += 1;
                processed += 1;
            }
        }

        return {
            processed: processed,
            generated: generated,
            rebuilt: rebuilt
        };
    }

    takeSaveBatch(maxCount = 6) {
        const batch = [];

        for (const [key, value] of this.pendingSave.entries()) {
            batch.push(value);
            this.pendingSave.delete(key);

            if (batch.length >= maxCount) {
                break;
            }
        }

        return batch;
    }

    requeueSaveBatch(chunks) {
        for (const chunk of Array.isArray(chunks) ? chunks : []) {
            if (!chunk || !(chunk.data instanceof Uint8Array)) {
                continue;
            }

            this.pendingSave.set(createChunkKey(chunk.chunkX, chunk.chunkZ), {
                chunkX: chunk.chunkX,
                chunkZ: chunk.chunkZ,
                data: chunk.data
            });
        }
    }

    getPendingCount() {
        return this.requestQueue.length + this.loadingPending.size + this.generationQueue.length + this.dirtyQueue.length;
    }

    getLoadedChunkCount() {
        return this.store.size();
    }

    getPendingSaveCount() {
        return this.pendingSave.size;
    }

    getRenderableChunks() {
        return this.store.values();
    }
}
