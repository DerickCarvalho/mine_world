import assert from 'node:assert/strict';
import { ChunkManager } from '../../assets/js/game/world/ChunkManager.js';
import { ChunkStore } from '../../assets/js/game/world/ChunkStore.js';

const dataLength = 16 * 16 * 100;
const snapshots = new Map();
snapshots.set('0,0', new Uint8Array(dataLength));
const world = {
    hasChunkSnapshot: (x, z) => snapshots.has(x + ',' + z),
    getChunkDataCopy: (x, z) => new Uint8Array(snapshots.get(x + ',' + z)),
    peekChunkDataCopy: (x, z) => snapshots.has(x + ',' + z) ? new Uint8Array(snapshots.get(x + ',' + z)) : null,
    getChunkSnapshot: (x, z) => ({
        data: new Uint8Array(snapshots.get(x + ',' + z) || new Uint8Array(dataLength))
    }),
    getSerializedMutations: () => [],
    getSerializedMutationsForChunks: () => [],
    hydrateChunkData: (x, z, data) => {
        snapshots.set(x + ',' + z, new Uint8Array(data));
        return data.length === dataLength;
    },
    getBlockIdAtBlock: () => 0,
    unloadChunk: () => {},
    isInsideWorld: () => true
};
const requests = [];
const workerClient = {
    isAvailable: () => true,
    request: (payload) => {
        requests.push(payload);
        return true;
    },
    getPendingCount: () => requests.length
};
const manager = new ChunkManager({
    store: new ChunkStore(),
    mesher: { generateChunk: () => { throw new Error('Caminho sincrono nao deveria executar.'); } },
    world,
    renderDistance: 2,
    workerClient
});

const sorted = manager.sortByDistance([{ chunkX: 2, chunkZ: 2, version: 7 }], 0, 0);
assert.equal(sorted[0].version, 7);

manager.generationPending.add('0,0');
manager.generationQueue.push({ chunkX: 0, chunkZ: 0, distanceSq: 0 });
assert.equal(manager.drainQueue(1).processed, 1);
assert.equal(requests.length, 1);

const stale = { ...requests[0], chunk: { key: '0,0', chunkX: 0, chunkZ: 0, faces: [] } };
manager.invalidateJob('0,0');
manager.handleWorkerResult(stale);
assert.equal(manager.drainQueue(1).generated, 0);
assert.equal(manager.getLoadedChunkCount(), 0);

manager.generationPending.add('0,0');
manager.generationQueue.push({ chunkX: 0, chunkZ: 0, distanceSq: 0 });
manager.drainQueue(1);
const current = {
    ...requests[1],
    chunk: { key: '0,0', chunkX: 0, chunkZ: 0, faces: [] },
    chunkDataBuffer: new Uint8Array(dataLength).buffer,
    durationMs: 8
};
manager.handleWorkerResult(current);
const integrated = manager.drainQueue(1);
assert.equal(integrated.generated, 1);
assert.equal(manager.getLoadedChunkCount(), 1);
assert.equal(manager.getPendingSaveCount(), 1);

manager.lastPlayerChunkX = 20;
manager.lastPlayerChunkZ = 20;
manager.generationPending.add('1,1');
manager.generationQueue.push({ chunkX: 1, chunkZ: 1, distanceSq: 0 });
manager.drainQueue(1);
manager.handleWorkerResult({
    ...requests[2],
    chunk: { key: '1,1', chunkX: 1, chunkZ: 1, faces: [] },
    chunkDataBuffer: new Uint8Array(dataLength).buffer,
    durationMs: 4
});
manager.drainQueue(1);
assert.equal(manager.store.has('1,1'), false);

const newest = new Uint8Array(dataLength);
newest[0] = 8;
manager.pendingSave.set('0,0', { chunkX: 0, chunkZ: 0, data: newest });
const staleSave = new Uint8Array(dataLength);
staleSave[0] = 2;
manager.requeueSaveBatch([{ chunkX: 0, chunkZ: 0, data: staleSave }]);
assert.equal(manager.pendingSave.get('0,0').data[0], 8);

console.log('Chunk worker pipeline: jobs versionados descartam respostas obsoletas e integram somente a versao atual.');
