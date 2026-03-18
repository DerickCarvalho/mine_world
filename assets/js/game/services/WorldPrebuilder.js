import { MutableWorld } from '../world/MutableWorld.js';
import { TerrainGenerator } from '../world/TerrainGenerator.js';
import { getChunkCoord } from '../world/WorldConfig.js';

function buildChunkWindow(centerChunkX, centerChunkZ, radius) {
    const chunks = [];

    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
            const chunkX = centerChunkX + offsetX;
            const chunkZ = centerChunkZ + offsetZ;
            const distanceSq = offsetX * offsetX + offsetZ * offsetZ;

            chunks.push({
                chunkX: chunkX,
                chunkZ: chunkZ,
                distanceSq: distanceSq
            });
        }
    }

    return chunks.sort(function (left, right) {
        return left.distanceSq - right.distanceSq;
    });
}

export class WorldPrebuilder {
    constructor(options) {
        this.repository = options.repository;
        this.worldMeta = options.worldMeta;
        this.saveState = options.saveState || null;
        this.radius = Math.max(1, Math.floor(Number(options.radius || 2)));
        this.batchSize = Math.max(1, Math.floor(Number(options.batchSize || 8)));
        this.onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
        this.terrain = new TerrainGenerator(this.worldMeta.seed, this.worldMeta.algorithm_version);
        this.world = new MutableWorld(this.terrain);
        this.world.applySerializedMutations(this.saveState && this.saveState.world ? this.saveState.world.block_mutations : []);
    }

    emitProgress(title, message) {
        if (this.onProgress) {
            this.onProgress(title, message);
        }
    }

    resolveCenterPosition() {
        const player = this.saveState && this.saveState.player ? this.saveState.player : null;
        const position = player && player.position ? player.position : null;
        const x = position ? Number(position.x) : NaN;
        const z = position ? Number(position.z) : NaN;

        if (Number.isFinite(x) && Number.isFinite(z) && this.world.isInsideWorld(x, z)) {
            return {
                x: x,
                z: z
            };
        }

        return this.world.findSpawnPoint();
    }

    async ensureInitialChunkWindow() {
        const center = this.resolveCenterPosition();
        const windowChunks = buildChunkWindow(getChunkCoord(center.x), getChunkCoord(center.z), this.radius);

        this.emitProgress('Preparando terreno', 'Verificando o cache inicial de chunks do mundo.');
        const cachedBatch = await this.repository.loadChunkBatch(this.worldMeta.id, windowChunks);
        const missingChunks = [];

        for (const chunk of windowChunks) {
            if (!cachedBatch.has(chunk.chunkX + ',' + chunk.chunkZ)) {
                missingChunks.push(chunk);
            }
        }

        if (missingChunks.length === 0) {
            return {
                center: center,
                generatedCount: 0,
                cachedChunksCount: cachedBatch.size
            };
        }

        let savedCount = 0;
        for (let index = 0; index < missingChunks.length; index += this.batchSize) {
            const slice = missingChunks.slice(index, index + this.batchSize);
            const payload = slice.map((chunk) => ({
                chunkX: chunk.chunkX,
                chunkZ: chunk.chunkZ,
                data: this.world.getChunkDataCopy(chunk.chunkX, chunk.chunkZ)
            }));

            this.emitProgress(
                'Preparando terreno',
                'Pre-gerando chunks iniciais (' + Math.min(missingChunks.length, index + slice.length) + '/' + missingChunks.length + ').'
            );

            const result = await this.repository.saveChunks(this.worldMeta.id, payload);
            savedCount += Number(result.savedCount || 0);
        }

        return {
            center: center,
            generatedCount: savedCount,
            cachedChunksCount: cachedBatch.size + savedCount
        };
    }
}
