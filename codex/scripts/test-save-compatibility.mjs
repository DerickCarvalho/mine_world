import assert from "node:assert/strict";
import {
  INVENTORY_CLICK,
  applyInventoryClick
} from "../../assets/js/game/inventory/InventoryOperations.js";
import { PlayerController } from "../../assets/js/game/player/PlayerController.js";
import { WorldRepository } from "../../assets/js/game/services/WorldRepository.js";
import { BLOCK_TYPES } from "../../assets/js/game/world/BlockTypes.js";
import { decodeChunkData, encodeChunkData } from "../../assets/js/game/world/ChunkCodec.js";
import { MutableWorld } from "../../assets/js/game/world/MutableWorld.js";

const WORLD_ID = 12;
const apiCalls = [];
let worldResponse = null;
let savedState = null;
let savedChunks = [];

globalThis.window = {
  ApiRequest: {
    async get(endpoint) {
      apiCalls.push({ method: "GET", endpoint });

      if (endpoint === "mundos/buscar.php") {
        return worldResponse;
      }

      throw new Error(`GET inesperado: ${endpoint}`);
    },
    async post(endpoint, data, options) {
      apiCalls.push({ method: "POST", endpoint, data, options });

      if (endpoint === "mundos/salvar_estado.php") {
        savedState = structuredClone(data.state);
        return { status: "OK", data: { save_state: savedState } };
      }

      if (endpoint === "mundos/salvar_chunks.php") {
        savedChunks = structuredClone(data.chunks);
        return {
          status: "OK",
          data: {
            saved_count: savedChunks.length,
            cached_chunks_count: savedChunks.length
          }
        };
      }

      if (endpoint === "mundos/carregar_chunks.php") {
        return { status: "OK", data: { chunks: savedChunks } };
      }

      throw new Error(`POST inesperado: ${endpoint}`);
    }
  }
};

const repository = new WorldRepository();
const legacySave = {
  player: {
    position: { x: "10.12349", y: "42.76549", z: "-3.33339" },
    rotation: { yaw: "7.25", pitch: "-0.3456789" },
    selected_hotbar_index: "99",
    health: "17",
    hunger: "7",
    dead: "0",
    fly_enabled: "1",
    fly_active: true,
    spawn_position: { x: "1.1119", y: "5.5555", z: "2.2229" }
  },
  inventory: {
    slots: [
      { block_id: "stone" },
      { block_id: "wood_sword", quantity: "1" },
      { block_id: "dirt", quantity: "2" },
      { block_id: "water", quantity: 3 },
      { block_id: "stone", quantity: 999 }
    ]
  },
  world: {
    modified_blocks: [
      { x: 2, y: 20, z: 3, block_id: "stone" },
      { x: 2, y: 20, z: 3, block_id: "dirt" },
      { x: -1, y: 21, z: -2, block_id: "stone" },
      { x: 1.5, y: 2, z: 3, block_id: "stone" }
    ]
  },
  saved_at: "2026-01-02 03:04:05"
};

worldResponse = {
  status: "OK",
  data: {
    world: { id: WORLD_ID, seed: "legacy-world", algorithm_version: "v3" },
    save_state: legacySave,
    chunk_stats: { cached_chunks_count: 2 }
  }
};

const loadedLegacy = await repository.fetchWorld(WORLD_ID);
const normalizedLegacy = loadedLegacy.saveState;

assert.equal(normalizedLegacy.schema_version, 3);
assert.equal(normalizedLegacy.game_mode, "survival");
assert.deepEqual(normalizedLegacy.player.position, { x: 10.123, y: 42.765, z: -3.333 });
assert.deepEqual(normalizedLegacy.player.rotation, { yaw: 7.25, pitch: -0.345679 });
assert.equal(normalizedLegacy.player.selected_hotbar_index, 8);
assert.equal(normalizedLegacy.player.health, 10);
assert.equal(normalizedLegacy.player.hunger, 7);
assert.equal(normalizedLegacy.player.fly_enabled, 1);
assert.equal(normalizedLegacy.player.fly_active, 1);
assert.deepEqual(normalizedLegacy.player.spawn_position, { x: 1.112, y: 5.556, z: 2.223 });
assert.equal(normalizedLegacy.inventory.slots.length, 27);
assert.deepEqual(normalizedLegacy.inventory.slots.slice(0, 5), [
  { block_id: "stone", quantity: 1 },
  { block_id: "wood_sword", quantity: 1 },
  { block_id: "dirt", quantity: 2 },
  null,
  { block_id: "stone", quantity: 64 }
]);
assert.deepEqual(normalizedLegacy.world.block_mutations, [
  { x: 2, y: 20, z: 3, block_id: "dirt" },
  { x: -1, y: 21, z: -2, block_id: "stone" }
]);

let inventorySlots = normalizedLegacy.inventory.slots;
let inventoryResult = applyInventoryClick(inventorySlots, null, 1, INVENTORY_CLICK.PRIMARY);
inventoryResult = applyInventoryClick(inventoryResult.slots, inventoryResult.cursorStack, 3, INVENTORY_CLICK.PRIMARY);
inventorySlots = inventoryResult.slots;

assert.equal(inventoryResult.cursorStack, null);
assert.equal(inventorySlots[1], null);
assert.deepEqual(inventorySlots[3], { block_id: "wood_sword", quantity: 1 });

const flatTerrain = {
  seed: "compatibility-stub",
  algorithmVersion: "v3",
  getWaterLevel: () => 2,
  getBiomeAt: () => ({ key: "desert" }),
  getSurfaceHeightAt: () => 4,
  getSubsurfaceBlockIdAt: () => BLOCK_TYPES.stone,
  estimateSlopeAt: () => 0,
  isCaveAir: () => false,
  findSpawnPoint: () => ({ x: 0.5, y: 4, z: 0.5 })
};
const mutableWorld = new MutableWorld(flatTerrain);
mutableWorld.applySerializedMutations(normalizedLegacy.world.block_mutations);

assert.deepEqual(mutableWorld.getSerializedMutations(), normalizedLegacy.world.block_mutations);
assert.equal(mutableWorld.getBlockIdAtBlock(2, 20, 3), BLOCK_TYPES.dirt);
assert.equal(mutableWorld.getBlockIdAtBlock(-1, 21, -2), BLOCK_TYPES.stone);

const collisionWorldStub = {
  isInsideWorld: () => true,
  getHighestSolidBelow: () => 3,
  getBlockIdAtBlock: () => BLOCK_TYPES.air,
  isSolidBlockAtBlock: () => false
};
const player = new PlayerController({
  world: collisionWorldStub,
  canvas: {},
  config: {},
  spawn: {
    ...normalizedLegacy.player.position,
    ...normalizedLegacy.player.rotation
  },
  flyEnabled: normalizedLegacy.player.fly_enabled === 1,
  flying: normalizedLegacy.player.fly_active === 1
});
const savedPose = player.getSavePose();

assert.deepEqual(savedPose, {
  position: normalizedLegacy.player.position,
  rotation: {
    yaw: 0.966815,
    pitch: normalizedLegacy.player.rotation.pitch
  },
  fly_enabled: 1,
  fly_active: 1
});

const v3State = {
  schema_version: 3,
  game_mode: "creative",
  player: {
    ...savedPose,
    selected_hotbar_index: normalizedLegacy.player.selected_hotbar_index,
    health: normalizedLegacy.player.health,
    hunger: normalizedLegacy.player.hunger,
    max_health: normalizedLegacy.player.max_health,
    dead: normalizedLegacy.player.dead,
    spawn_position: normalizedLegacy.player.spawn_position
  },
  inventory: { slots: inventorySlots },
  world: { block_mutations: mutableWorld.getSerializedMutations() },
  saved_at: normalizedLegacy.saved_at
};
const savedV3 = await repository.saveGameState(WORLD_ID, v3State);

assert.deepEqual(savedV3, savedState);
assert.equal(savedV3.schema_version, 3);
assert.equal(savedV3.game_mode, "creative");
assert.deepEqual(savedV3.inventory.slots, inventorySlots);
assert.deepEqual(savedV3.world.block_mutations, normalizedLegacy.world.block_mutations);
assert.deepEqual(savedV3.player.position, savedPose.position);
assert.deepEqual(savedV3.player.rotation, savedPose.rotation);

worldResponse.data.save_state = savedState;
const reopenedV3 = (await repository.fetchWorld(WORLD_ID)).saveState;
assert.deepEqual(reopenedV3, savedV3);

const chunkBytes = new Uint8Array([
  BLOCK_TYPES.bedrock,
  BLOCK_TYPES.stone,
  BLOCK_TYPES.dirt,
  BLOCK_TYPES.grass,
  BLOCK_TYPES.water
]);
const encodedChunk = encodeChunkData(chunkBytes);

assert.deepEqual(decodeChunkData(encodedChunk), chunkBytes);
assert.equal(decodeChunkData(""), null);

const chunkSaveResult = await repository.saveChunks(WORLD_ID, [
  { chunkX: -2, chunkZ: 3, data: chunkBytes },
  { chunkX: 0.5, chunkZ: 1, data: chunkBytes },
  { chunkX: 4, chunkZ: 5, data: [1, 2, 3] }
]);
const loadedChunks = await repository.loadChunkBatch(WORLD_ID, [{ chunkX: -2, chunkZ: 3 }]);

assert.deepEqual(chunkSaveResult, { savedCount: 1, cachedChunksCount: 1 });
assert.equal(savedChunks[0].data_base64, encodedChunk);
assert.deepEqual(loadedChunks.get("-2,3"), {
  chunkX: -2,
  chunkZ: 3,
  data: chunkBytes
});
assert.equal(apiCalls.some((call) => call.endpoint === "mundos/salvar_estado.php"), true);
assert.equal(apiCalls.some((call) => call.endpoint === "mundos/salvar_chunks.php"), true);
assert.equal(apiCalls.some((call) => call.endpoint === "mundos/carregar_chunks.php"), true);

console.log("Save compatibility: legado/v3, inventario, mutacoes, chunks/codec e pose preservados em round-trip.");
