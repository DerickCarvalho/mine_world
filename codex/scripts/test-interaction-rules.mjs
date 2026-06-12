import assert from "node:assert/strict";
import { applyPrimaryClick } from "../../assets/js/game/inventory/InventoryOperations.js";
import {
  BLOCK_TYPES,
  getBlockHardness,
  isBreakableBlock,
  isCollectableBlock,
  isPlaceableBlock
} from "../../assets/js/game/world/BlockTypes.js";
import { MutableWorld } from "../../assets/js/game/world/MutableWorld.js";

function createRuleWorld(initialBlockId = BLOCK_TYPES.air) {
  const mutations = [];
  const world = Object.create(MutableWorld.prototype);

  world.getBlockIdAtBlock = () => initialBlockId;
  world.setMutation = (x, y, z, blockId) => {
    mutations.push({ x, y, z, blockId });
  };

  return { world, mutations };
}

const playerAabb = {
  minX: 0.2,
  maxX: 0.8,
  minY: 1,
  maxY: 2.95,
  minZ: 0.2,
  maxZ: 0.8
};

{
  assert.ok(getBlockHardness(BLOCK_TYPES.stone) > getBlockHardness(BLOCK_TYPES.dirt));
  assert.ok(getBlockHardness(BLOCK_TYPES.dirt) > getBlockHardness(BLOCK_TYPES.leaves));
  assert.equal(getBlockHardness(BLOCK_TYPES.bedrock), Number.POSITIVE_INFINITY);
  assert.equal(isBreakableBlock(BLOCK_TYPES.bedrock), false);
  assert.equal(isCollectableBlock(BLOCK_TYPES.bedrock), false);
  assert.equal(isPlaceableBlock(BLOCK_TYPES.bedrock), false);
}

{
  const bedrock = createRuleWorld(BLOCK_TYPES.bedrock);
  const stone = createRuleWorld(BLOCK_TYPES.stone);

  assert.equal(bedrock.world.breakBlockAt(0, 0, 0), null);
  assert.deepEqual(bedrock.mutations, []);
  assert.equal(stone.world.breakBlockAt(0, 1, 0), BLOCK_TYPES.stone);
  assert.deepEqual(stone.mutations, [
    { x: 0, y: 1, z: 0, blockId: BLOCK_TYPES.air }
  ]);
}

{
  const air = createRuleWorld(BLOCK_TYPES.air);
  const water = createRuleWorld(BLOCK_TYPES.water);
  const occupied = createRuleWorld(BLOCK_TYPES.stone);

  assert.equal(air.world.canPlaceBlockAt(2, 1, 2, BLOCK_TYPES.dirt, playerAabb), true);
  assert.equal(water.world.canPlaceBlockAt(2, 1, 2, BLOCK_TYPES.dirt, playerAabb), true);
  assert.equal(occupied.world.canPlaceBlockAt(2, 1, 2, BLOCK_TYPES.dirt, playerAabb), false);
  assert.equal(air.world.canPlaceBlockAt(0, 1, 0, BLOCK_TYPES.dirt, playerAabb), false);
  assert.equal(air.world.canPlaceBlockAt(2, -1, 2, BLOCK_TYPES.dirt, playerAabb), false);
  assert.equal(air.world.canPlaceBlockAt(2, 1, 2, BLOCK_TYPES.bedrock, playerAabb), false);

  assert.equal(air.world.placeBlockAt(2, 1, 2, BLOCK_TYPES.dirt, playerAabb), true);
  assert.deepEqual(air.mutations, [
    { x: 2, y: 1, z: 2, blockId: BLOCK_TYPES.dirt }
  ]);
  assert.equal(air.world.placeBlockAt(0, 1, 0, BLOCK_TYPES.dirt, playerAabb), false);
  assert.equal(air.mutations.length, 1);
}

{
  const fullSlots = Array.from({ length: 36 }, () => ({
    block_id: "stone",
    quantity: 64
  }));
  let cursorStack = { block_id: "stone", quantity: 1 };

  for (const slot of fullSlots) {
    const result = applyPrimaryClick(slot, cursorStack, 64);
    assert.deepEqual(result.slot, slot);
    cursorStack = result.cursorStack;
  }

  assert.deepEqual(cursorStack, { block_id: "stone", quantity: 1 });

  const available = applyPrimaryClick(
    { block_id: "stone", quantity: 63 },
    cursorStack,
    64
  );
  assert.deepEqual(available, {
    slot: { block_id: "stone", quantity: 64 },
    cursorStack: null
  });
}

console.log("InteractionRules: dureza, bedrock, colocacao e capacidade de inventario validadas.");
