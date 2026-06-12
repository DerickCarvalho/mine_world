import assert from 'node:assert/strict';
import { ChunkMesher } from '../../assets/js/game/world/ChunkMesher.js';
import { createChunkMeshingSnapshot, createSnapshotWorld } from '../../assets/js/game/world/ChunkMeshingSnapshot.js';
import { MutableWorld } from '../../assets/js/game/world/MutableWorld.js';
import { TerrainGenerator } from '../../assets/js/game/world/TerrainGenerator.js';

const world = new MutableWorld(new TerrainGenerator('snapshot-equivalence', 'v4'));
const direct = new ChunkMesher(world).generateChunk(0, 0);
const snapshot = createChunkMeshingSnapshot(world, 0, 0);
const fromSnapshot = new ChunkMesher(createSnapshotWorld({
    ...snapshot,
    seed: 'snapshot-equivalence',
    algorithmVersion: 'v4'
})).generateChunk(0, 0);

assert.deepEqual(fromSnapshot, direct);
assert.equal(snapshot.protocolVersion, 2);
assert.ok(Array.isArray(snapshot.snapshots));

console.log('Chunk meshing snapshot: geometria com snapshots parciais continua equivalente ao meshing direto.');
