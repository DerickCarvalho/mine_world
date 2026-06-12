import { MutableWorld } from './MutableWorld.js';
import { TerrainGenerator } from './TerrainGenerator.js';

export function createChunkMeshingSnapshot(world, chunkX, chunkZ) {
    const chunks = [
        { chunkX: chunkX, chunkZ: chunkZ },
        { chunkX: chunkX, chunkZ: chunkZ - 1 },
        { chunkX: chunkX, chunkZ: chunkZ + 1 },
        { chunkX: chunkX - 1, chunkZ: chunkZ },
        { chunkX: chunkX + 1, chunkZ: chunkZ }
    ];
    const snapshots = [];

    for (const chunk of chunks) {
        const data = world.peekChunkDataCopy(chunk.chunkX, chunk.chunkZ);
        if (!data) {
            continue;
        }

        snapshots.push({
            chunkX: chunk.chunkX,
            chunkZ: chunk.chunkZ,
            dataBuffer: data.buffer
        });
    }

    return {
        protocolVersion: 2,
        chunkX: chunkX,
        chunkZ: chunkZ,
        snapshots: snapshots,
        mutations: world.getSerializedMutationsForChunks(chunks)
    };
}

export function createSnapshotWorld(snapshot) {
    const terrain = new TerrainGenerator(snapshot && snapshot.seed, snapshot && snapshot.algorithmVersion);
    const world = new MutableWorld(terrain);

    world.applySerializedMutations(snapshot && Array.isArray(snapshot.mutations) ? snapshot.mutations : []);

    for (const chunk of snapshot && Array.isArray(snapshot.snapshots) ? snapshot.snapshots : []) {
        if (!chunk || !(chunk.dataBuffer instanceof ArrayBuffer)) {
            continue;
        }
        world.hydrateChunkData(chunk.chunkX, chunk.chunkZ, new Uint8Array(chunk.dataBuffer));
    }

    return world;
}
