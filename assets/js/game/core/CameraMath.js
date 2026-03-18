const TAU = Math.PI * 2;
const MAX_PITCH = 1.3;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function normalizeAngle(angle) {
    if (!Number.isFinite(angle)) {
        return 0;
    }

    let normalized = angle % TAU;

    if (normalized > Math.PI) {
        normalized -= TAU;
    }

    if (normalized < -Math.PI) {
        normalized += TAU;
    }

    return normalized;
}

export function clampPitch(pitch) {
    if (!Number.isFinite(pitch)) {
        return 0;
    }

    return clamp(pitch, -MAX_PITCH, MAX_PITCH);
}

export function getForwardVector(yaw) {
    return {
        x: -Math.sin(yaw),
        z: Math.cos(yaw)
    };
}

export function getRightVector(yaw) {
    return {
        x: Math.cos(yaw),
        z: Math.sin(yaw)
    };
}

export function createCameraTransform(camera) {
    const normalizedYaw = normalizeAngle(camera && camera.yaw ? camera.yaw : 0);
    const normalizedPitch = clampPitch(camera && camera.pitch ? camera.pitch : 0);

    return {
        position: camera.position,
        yaw: normalizedYaw,
        pitch: normalizedPitch,
        sinYaw: Math.sin(-normalizedYaw),
        cosYaw: Math.cos(-normalizedYaw),
        sinPitch: Math.sin(normalizedPitch),
        cosPitch: Math.cos(normalizedPitch)
    };
}

export function worldToCameraSpace(point, transform) {
    const dx = point.x - transform.position.x;
    const dy = point.y - transform.position.y;
    const dz = point.z - transform.position.z;
    const yawX = dx * transform.cosYaw - dz * transform.sinYaw;
    const yawZ = dx * transform.sinYaw + dz * transform.cosYaw;

    return {
        x: yawX,
        y: dy * transform.cosPitch - yawZ * transform.sinPitch,
        z: dy * transform.sinPitch + yawZ * transform.cosPitch
    };
}
