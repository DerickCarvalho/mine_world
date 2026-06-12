import { ChunkMesher } from '../world/ChunkMesher.js';
import { setBlockTextureCatalog } from '../world/ChunkMaterials.js';
import { createSnapshotWorld } from '../world/ChunkMeshingSnapshot.js';

self.addEventListener('message', (event) => {
    const job = event.data;
    if (!job || job.type !== 'mesh-chunk') {
        return;
    }

    const startedAt = performance.now();

    try {
        setBlockTextureCatalog(job.textureCatalog || {});
        const world = createSnapshotWorld({
            ...job.snapshot,
            seed: job.seed,
            algorithmVersion: job.algorithmVersion
        });
        const chunk = new ChunkMesher(world).generateChunk(job.chunkX, job.chunkZ);
        const chunkData = world.getChunkDataCopy(job.chunkX, job.chunkZ);

        self.postMessage({
            type: 'mesh-result',
            jobId: job.jobId,
            key: job.key,
            version: job.version,
            mode: job.mode,
            chunk: chunk,
            chunkDataBuffer: chunkData.buffer,
            durationMs: performance.now() - startedAt
        }, [chunkData.buffer]);
    } catch (error) {
        self.postMessage({
            type: 'mesh-error',
            jobId: job.jobId,
            key: job.key,
            version: job.version,
            mode: job.mode,
            chunkX: job.chunkX,
            chunkZ: job.chunkZ,
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
