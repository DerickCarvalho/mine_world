function getLookDirection(camera) {
    const cosPitch = Math.cos(camera.pitch || 0);

    return {
        x: -Math.sin(camera.yaw || 0) * cosPitch,
        y: Math.sin(camera.pitch || 0),
        z: Math.cos(camera.yaw || 0) * cosPitch
    };
}

function intersectRayAabb(origin, direction, aabb, maxDistance) {
    let tMin = 0;
    let tMax = maxDistance;

    for (const axis of ['x', 'y', 'z']) {
        const minKey = 'min' + axis.toUpperCase();
        const maxKey = 'max' + axis.toUpperCase();
        const axisDirection = direction[axis];
        const axisOrigin = origin[axis];

        if (Math.abs(axisDirection) < 0.00001) {
            if (axisOrigin < aabb[minKey] || axisOrigin > aabb[maxKey]) {
                return null;
            }

            continue;
        }

        const inverse = 1 / axisDirection;
        let near = (aabb[minKey] - axisOrigin) * inverse;
        let far = (aabb[maxKey] - axisOrigin) * inverse;

        if (near > far) {
            const temp = near;
            near = far;
            far = temp;
        }

        tMin = Math.max(tMin, near);
        tMax = Math.min(tMax, far);

        if (tMin > tMax) {
            return null;
        }
    }

    return tMin <= maxDistance ? tMin : null;
}

export class EntityPicker {
    constructor(maxDistance = 5.25) {
        this.maxDistance = maxDistance;
    }

    pick(camera, entities) {
        if (!camera || !camera.position || !Array.isArray(entities) || entities.length === 0) {
            return null;
        }

        const direction = getLookDirection(camera);
        let closest = null;

        for (const entity of entities) {
            if (!entity || typeof entity.getAabb !== 'function') {
                continue;
            }

            const distance = intersectRayAabb(camera.position, direction, entity.getAabb(), this.maxDistance);
            if (distance === null) {
                continue;
            }

            if (!closest || distance < closest.distance) {
                closest = {
                    entity: entity,
                    distance: distance
                };
            }
        }

        return closest;
    }
}
