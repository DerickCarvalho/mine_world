import assert from 'node:assert/strict';
import { InteractionController } from '../../assets/js/game/interaction/InteractionController.js';
import { BLOCK_TYPES } from '../../assets/js/game/world/BlockTypes.js';

const controller = new InteractionController();
const stone = { blockId: BLOCK_TYPES.stone, breakable: true, block: { x: 1, y: 2, z: 3 }, place: { x: 1, y: 3, z: 3 } };
assert.equal(controller.updateBreaking({ held: true, target: stone, deltaTime: 0.5 }), false);
assert.ok(controller.getBreakingProgress(stone) > 0);
assert.equal(controller.updateBreaking({ held: false, target: stone, deltaTime: 0.1 }), false);
assert.equal(controller.getBreakingProgress(stone), 0);
assert.equal(controller.updateBreaking({ held: true, target: stone, deltaTime: 2 }), true);

const world = { canPlaceBlockAt: (...args) => args[0] === 1 && args[1] === 3 };
assert.equal(controller.getPlacementPreview(world, stone, { block_id: 'dirt', quantity: 1 }, {}).valid, true);
assert.equal(controller.getPlacementPreview(world, stone, null, {}), null);

console.log('InteractionController: quebra progressiva, cancelamento e preview validados.');
