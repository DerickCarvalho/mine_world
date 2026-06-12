import assert from "node:assert/strict";
import { WorldPrebuilder } from "../../assets/js/game/services/WorldPrebuilder.js";

const cachedChunks = new Map([
  ["0,0", { chunkX: 0, chunkZ: 0, data: new Uint8Array(16 * 16 * 100) }]
]);
const savedCoords = [];
const progress = [];

const repository = {
  async loadChunkBatch() {
    return cachedChunks;
  },
  async saveChunks(_worldId, chunks) {
    for (const chunk of chunks) {
      savedCoords.push(`${chunk.chunkX},${chunk.chunkZ}`);
    }
    return { savedCount: chunks.length, cachedChunksCount: cachedChunks.size + savedCoords.length };
  }
};

const prebuilder = new WorldPrebuilder({
  repository,
  worldMeta: { id: 1, seed: "dt-001", algorithm_version: "v4.0" },
  saveState: {
    player: { position: { x: 0.5, z: 0.5 } },
    world: { block_mutations: [] }
  },
  radius: 2,
  batchSize: 4,
  onProgress(_title, message) {
    progress.push(message);
  }
});

const result = await prebuilder.ensureInitialChunkWindow();

assert.equal(savedCoords.length, 24);
assert.equal(savedCoords.includes("0,0"), false);
assert.equal(new Set(savedCoords).size, savedCoords.length);
assert.equal(result.cachedChunksCount, 25);
assert.equal(progress.length > 1, true);

console.log("WorldPrebuilder: retomada parcial preservou 1 chunk e gerou somente os 24 ausentes.");
