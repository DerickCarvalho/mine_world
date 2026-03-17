export function createChunkKey(chunkX, chunkZ) {
    return chunkX + ',' + chunkZ;
}

export class ChunkStore {
    constructor() {
        this.chunks = new Map();
    }

    has(key) {
        return this.chunks.has(key);
    }

    get(key) {
        return this.chunks.get(key) || null;
    }

    set(key, chunk) {
        this.chunks.set(key, chunk);
    }

    delete(key) {
        this.chunks.delete(key);
    }

    size() {
        return this.chunks.size;
    }

    values() {
        return Array.from(this.chunks.values());
    }
}
