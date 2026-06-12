import assert from 'node:assert/strict';
import { ChunkWorkerClient } from '../../assets/js/game/workers/ChunkWorkerClient.js';

class FakeWorker {
    constructor() {
        this.listeners = {};
    }
    addEventListener(type, callback) {
        this.listeners[type] = callback;
    }
    postMessage() {}
    terminate() {}
}

globalThis.Worker = FakeWorker;
const failures = [];
const client = new ChunkWorkerClient({
    seed: 'test',
    algorithmVersion: 'v4',
    onError: (_error, context) => failures.push(context)
});
client.request({ key: '0,0', version: 1, mode: 'generate', chunkX: 0, chunkZ: 0 });
client.request({ key: '1,0', version: 1, mode: 'rebuild', chunkX: 1, chunkZ: 0 });
client.handleFatalError({ message: 'fatal' });

assert.equal(failures.length, 2);
assert.deepEqual(failures.map((item) => item.key), ['0,0', '1,0']);
assert.equal(client.getPendingCount(), 0);
assert.equal(client.isAvailable(), false);

console.log('ChunkWorkerClient: falha fatal devolve todos os jobs pendentes ao fallback.');
