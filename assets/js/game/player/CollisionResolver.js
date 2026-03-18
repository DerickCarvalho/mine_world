import { WORLD_CONFIG, clampNumber } from '../world/WorldConfig.js';

export class CollisionResolver {
    constructor(world) {
        this.world = world;
    }

    clampHorizontal(value, axis) {
        if (axis === 'x') {
            return clampNumber(value, WORLD_CONFIG.minX + 1, WORLD_CONFIG.maxX);
        }

        return clampNumber(value, WORLD_CONFIG.minZ + 1, WORLD_CONFIG.maxZ);
    }

    getSamplePoints(x, z) {
        const radius = WORLD_CONFIG.playerRadius * 0.92;

        return [
            { x: x, z: z },
            { x: x + radius, z: z + radius },
            { x: x + radius, z: z - radius },
            { x: x - radius, z: z + radius },
            { x: x - radius, z: z - radius }
        ];
    }

    getSupportHeight(x, z, referenceY) {
        let highest = 0;
        const searchY = Math.max(0, Math.min(WORLD_CONFIG.height - 1, Math.ceil(referenceY + WORLD_CONFIG.stepHeight)));

        for (const point of this.getSamplePoints(x, z)) {
            if (!this.world.isInsideWorld(point.x, point.z)) {
                return Number.POSITIVE_INFINITY;
            }

            const solidY = this.world.getHighestSolidBelow(point.x, point.z, searchY);
            highest = Math.max(highest, solidY + 1);
        }

        return highest;
    }

    collidesBody(x, footY, z) {
        const minX = x - WORLD_CONFIG.playerRadius + 0.001;
        const maxX = x + WORLD_CONFIG.playerRadius - 0.001;
        const minY = footY + 0.05;
        const maxY = footY + WORLD_CONFIG.playerHeight - 0.05;
        const minZ = z - WORLD_CONFIG.playerRadius + 0.001;
        const maxZ = z + WORLD_CONFIG.playerRadius - 0.001;

        for (let blockX = Math.floor(minX); blockX <= Math.floor(maxX); blockX += 1) {
            for (let blockY = Math.floor(minY); blockY <= Math.floor(maxY); blockY += 1) {
                for (let blockZ = Math.floor(minZ); blockZ <= Math.floor(maxZ); blockZ += 1) {
                    if (this.world.isSolidBlockAtBlock(blockX, blockY, blockZ)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    canOccupy(x, z, currentFootY) {
        const supportHeight = this.getSupportHeight(x, z, currentFootY);
        if (!Number.isFinite(supportHeight)) {
            return {
                canOccupy: false,
                supportHeight: Number.POSITIVE_INFINITY
            };
        }

        if (supportHeight > currentFootY + WORLD_CONFIG.stepHeight) {
            return {
                canOccupy: false,
                supportHeight: supportHeight
            };
        }

        return {
            canOccupy: !this.collidesBody(x, supportHeight, z),
            supportHeight: supportHeight
        };
    }

    resolveHorizontal(position, deltaX, deltaZ) {
        let nextX = position.x;
        let nextZ = position.z;

        const resolvedX = this.canOccupy(position.x + deltaX, position.z, position.y);
        if (resolvedX.canOccupy) {
            nextX = this.clampHorizontal(position.x + deltaX, 'x');
        }

        const resolvedZ = this.canOccupy(nextX, position.z + deltaZ, position.y);
        if (resolvedZ.canOccupy) {
            nextZ = this.clampHorizontal(position.z + deltaZ, 'z');
        }

        return {
            x: nextX,
            z: nextZ,
            supportHeight: this.getSupportHeight(nextX, nextZ, position.y)
        };
    }

    resolveVertical(position, proposedFootY) {
        const supportHeight = this.getSupportHeight(position.x, position.z, Math.max(position.y, proposedFootY));

        if (proposedFootY <= supportHeight) {
            return {
                y: supportHeight,
                grounded: true,
                hitCeiling: false
            };
        }

        if (this.collidesBody(position.x, proposedFootY, position.z)) {
            return {
                y: Math.max(position.y, supportHeight),
                grounded: false,
                hitCeiling: true
            };
        }

        return {
            y: proposedFootY,
            grounded: false,
            hitCeiling: false
        };
    }
}
