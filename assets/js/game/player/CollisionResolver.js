import { WORLD_CONFIG, clampNumber } from '../world/WorldConfig.js';

export class CollisionResolver {
    constructor(terrainGenerator) {
        this.terrain = terrainGenerator;
    }

    clampHorizontal(value, axis) {
        if (axis === 'x') {
            return clampNumber(value, WORLD_CONFIG.minX + 1, WORLD_CONFIG.maxX);
        }

        return clampNumber(value, WORLD_CONFIG.minZ + 1, WORLD_CONFIG.maxZ);
    }

    getSamplePoints(x, z) {
        const radius = WORLD_CONFIG.playerRadius;
        return [
            { x: x, z: z },
            { x: x + radius, z: z },
            { x: x - radius, z: z },
            { x: x, z: z + radius },
            { x: x, z: z - radius }
        ];
    }

    getSupportHeight(x, z) {
        let highest = 0;

        for (const point of this.getSamplePoints(x, z)) {
            if (!this.terrain.isInsideWorld(point.x, point.z)) {
                return Number.POSITIVE_INFINITY;
            }

            highest = Math.max(highest, this.terrain.getSurfaceHeightAt(point.x, point.z));
        }

        return highest;
    }

    canOccupy(x, z, currentFootY) {
        const supportHeight = this.getSupportHeight(x, z);
        if (!Number.isFinite(supportHeight)) {
            return false;
        }

        return supportHeight <= currentFootY + WORLD_CONFIG.stepHeight;
    }

    resolveHorizontal(position, deltaX, deltaZ) {
        let nextX = position.x;
        let nextZ = position.z;

        if (this.canOccupy(position.x + deltaX, position.z, position.y)) {
            nextX = this.clampHorizontal(position.x + deltaX, 'x');
        }

        if (this.canOccupy(nextX, position.z + deltaZ, position.y)) {
            nextZ = this.clampHorizontal(position.z + deltaZ, 'z');
        }

        return {
            x: nextX,
            z: nextZ,
            supportHeight: this.getSupportHeight(nextX, nextZ)
        };
    }
}
