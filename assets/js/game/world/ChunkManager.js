import { createChunkKey } from './ChunkStore.js';
import { WORLD_CONFIG, getChunkCoord, getRuntimeRenderRadius } from './WorldConfig.js';

export class ChunkManager {
    constructor(options) {
        this.store = options.store;
        this.mesher = options.mesher;
        this.renderRadius = getRuntimeRenderRadius(options.renderDistance);
        this.retentionRadius = this.renderRadius + 1;
        this.queue = [];
        this.pending = new Set();
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

    update(position) {
        const playerChunkX = getChunkCoord(position.x);
        const playerChunkZ = getChunkCoord(position.z);
        const desiredKeys = new Set();

        for (let offsetX = -this.renderRadius; offsetX <= this.renderRadius; offsetX += 1) {
            for (let offsetZ = -this.renderRadius; offsetZ <= this.renderRadius; offsetZ += 1) {
                const chunkX = playerChunkX + offsetX;
                const chunkZ = playerChunkZ + offsetZ;
                const key = createChunkKey(chunkX, chunkZ);

                if (!this.overlapsWorld(chunkX, chunkZ)) {
                    continue;
                }

                desiredKeys.add(key);

                if (!this.store.has(key) && !this.pending.has(key)) {
                    this.pending.add(key);
                    this.queue.push({ chunkX: chunkX, chunkZ: chunkZ });
                }
            }
        }

        for (const chunk of this.store.values()) {
            if (Math.abs(chunk.chunkX - playerChunkX) > this.retentionRadius || Math.abs(chunk.chunkZ - playerChunkZ) > this.retentionRadius) {
                this.store.delete(chunk.key);
            }
        }

        this.queue = this.queue.filter((item) => {
            const keep = Math.abs(item.chunkX - playerChunkX) <= this.retentionRadius
                && Math.abs(item.chunkZ - playerChunkZ) <= this.retentionRadius
                && this.overlapsWorld(item.chunkX, item.chunkZ);

            if (!keep) {
                this.pending.delete(createChunkKey(item.chunkX, item.chunkZ));
            }

            return keep;
        });

        return desiredKeys;
    }

    drainQueue(maxChunksPerFrame = 1) {
        let generated = 0;

        while (generated < maxChunksPerFrame && this.queue.length > 0) {
            const nextItem = this.queue.shift();
            const key = createChunkKey(nextItem.chunkX, nextItem.chunkZ);
            this.pending.delete(key);

            if (this.store.has(key) || !this.overlapsWorld(nextItem.chunkX, nextItem.chunkZ)) {
                continue;
            }

            this.store.set(key, this.mesher.generateChunk(nextItem.chunkX, nextItem.chunkZ));
            generated += 1;
        }

        return generated;
    }

    primeInitialChunks(position, targetCount = 12) {
        this.update(position);

        while (this.store.size() < targetCount && this.queue.length > 0) {
            this.drainQueue(1);
        }
    }

    getLoadedChunkCount() {
        return this.store.size();
    }

    getRenderableChunks() {
        return this.store.values();
    }
}
