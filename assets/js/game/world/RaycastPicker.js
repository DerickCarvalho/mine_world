import { BLOCK_TYPES, isBreakableBlock } from './BlockTypes.js';

function getLookDirection(camera) {
    const cosPitch = Math.cos(camera.pitch || 0);

    return {
        x: -Math.sin(camera.yaw || 0) * cosPitch,
        y: Math.sin(camera.pitch || 0),
        z: Math.cos(camera.yaw || 0) * cosPitch
    };
}

function createBlockKey(blockX, blockY, blockZ) {
    return blockX + ':' + blockY + ':' + blockZ;
}

export class RaycastPicker {
    constructor(world, maxDistance = 5.25) {
        this.world = world;
        this.maxDistance = maxDistance;
        this.stepSize = 0.05;
    }

    pick(camera) {
        if (!camera || !camera.position) {
            return null;
        }

        const direction = getLookDirection(camera);
        let previousCell = null;
        let previousKey = null;

        for (let distance = 0; distance <= this.maxDistance; distance += this.stepSize) {
            const sampleX = camera.position.x + direction.x * distance;
            const sampleY = camera.position.y + direction.y * distance;
            const sampleZ = camera.position.z + direction.z * distance;
            const blockX = Math.floor(sampleX);
            const blockY = Math.floor(sampleY);
            const blockZ = Math.floor(sampleZ);
            const blockKey = createBlockKey(blockX, blockY, blockZ);

            if (blockKey === previousKey) {
                continue;
            }

            previousKey = blockKey;
            const blockId = this.world.getBlockIdAtBlock(blockX, blockY, blockZ);

            if (blockId !== BLOCK_TYPES.air && blockId !== BLOCK_TYPES.water) {
                return {
                    block: {
                        x: blockX,
                        y: blockY,
                        z: blockZ
                    },
                    place: previousCell,
                    blockId: blockId,
                    distance: Number(distance.toFixed(3)),
                    breakable: isBreakableBlock(blockId)
                };
            }

            previousCell = {
                x: blockX,
                y: blockY,
                z: blockZ
            };
        }

        return null;
    }
}
