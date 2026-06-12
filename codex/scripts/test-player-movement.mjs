import assert from "node:assert/strict";
import { CollisionResolver } from "../../assets/js/game/player/CollisionResolver.js";
import { PlayerController } from "../../assets/js/game/player/PlayerController.js";
import { BLOCK_TYPES } from "../../assets/js/game/world/BlockTypes.js";
import { WORLD_CONFIG } from "../../assets/js/game/world/WorldConfig.js";

function createWorld({ water = false, platformEndsAtX = Number.POSITIVE_INFINITY } = {}) {
  const hasFloor = (x) => x < platformEndsAtX;

  return {
    isInsideWorld: () => true,
    getHighestSolidBelow: (x) => hasFloor(x) ? 0 : -1,
    isSolidBlockAtBlock: (x, y) => y === 0 && hasFloor(x),
    getBlockIdAtBlock: (_x, y) => water && (y === 1 || y === 2)
      ? BLOCK_TYPES.water
      : BLOCK_TYPES.air
  };
}

function createPlayer(world, options = {}) {
  return new PlayerController({
    world,
    canvas: {},
    config: {},
    spawn: { x: 0.5, y: 1, z: 0.5 },
    ...options
  });
}

function runForwardState(inputChanges, worldOptions = {}) {
  const player = createPlayer(createWorld(worldOptions));
  Object.assign(player.input, { forward: true }, inputChanges);
  player.updateMovement(0.1);
  return player;
}

{
  const walking = runForwardState({});
  const sprinting = runForwardState({ sprint: true });
  const crouching = runForwardState({ crouch: true });

  assert.equal(walking.getMovementState().sprinting, false);
  assert.equal(sprinting.getMovementState().sprinting, true);
  assert.equal(crouching.getMovementState().crouching, true);
  assert.ok(sprinting.getMovementState().speed > walking.getMovementState().speed);
  assert.ok(crouching.getMovementState().speed < walking.getMovementState().speed);
  assert.equal(
    sprinting.getMovementState().speed,
    WORLD_CONFIG.baseMoveSpeed * WORLD_CONFIG.sprintMoveMultiplier
  );
  assert.equal(
    crouching.getMovementState().speed,
    WORLD_CONFIG.baseMoveSpeed * WORLD_CONFIG.crouchMoveMultiplier
  );
  assert.equal(
    crouching.getCameraState().position.y,
    crouching.position.y + WORLD_CONFIG.playerHeight - WORLD_CONFIG.crouchCameraOffset
  );
}

{
  const player = runForwardState({ sprint: true, crouch: true, jump: true }, { water: true });
  const state = player.getMovementState();

  assert.equal(state.inWater, true);
  assert.equal(state.sprinting, false);
  assert.equal(state.crouching, false);
  assert.equal(state.grounded, false);
  assert.ok(player.velocityY > 0);
  assert.ok(state.speed < WORLD_CONFIG.baseMoveSpeed);
}

{
  const player = createPlayer(createWorld({ water: true }), {
    flyEnabled: true,
    flying: true,
    spawn: { x: 0.5, y: 4, z: 0.5 }
  });
  player.input.forward = true;
  player.input.crouch = true;
  player.input.descend = true;
  player.updateMovement(0.1);
  const state = player.getMovementState();

  assert.equal(state.flying, true);
  assert.equal(state.inWater, false);
  assert.equal(state.crouching, false);
  assert.ok(player.velocityY < 0);
}

{
  const resolver = new CollisionResolver(createWorld({ platformEndsAtX: 1 }));
  const position = { x: 0.5, y: 1, z: 0.5 };
  const unprotected = resolver.resolveHorizontal(position, 0.7, 0);
  const protectedResult = resolver.resolveHorizontal(position, 0.7, 0, {
    protectEdges: true
  });

  assert.ok(unprotected.x > position.x);
  assert.equal(protectedResult.x, position.x);
  assert.equal(protectedResult.z, position.z);
}

console.log("PlayerMovement: sprint, agachamento, agua, fly e protecao de borda validados.");
