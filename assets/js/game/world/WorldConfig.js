export const WORLD_CONFIG = Object.freeze({
    width: 5000,
    depth: 5000,
    height: 100,
    minSurfaceHeight: 3,
    maxSurfaceHeight: 84,
    chunkSize: 16,
    minX: -2500,
    maxX: 2499,
    minZ: -2500,
    maxZ: 2499,
    playerHeight: 1.72,
    playerRadius: 0.32,
    stepHeight: 0.65,
    baseMoveSpeed: 5.4,
    jumpVelocity: 8.2,
    gravity: 24,
    fov: 78,
    nearPlane: 0.08,
    farPlane: 220
});

export const DEFAULT_USER_CONFIG = Object.freeze({
    render_distance: 6,
    mouse_sensitivity: 1,
    invert_y: 0,
    master_volume: 80
});

export function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function isWithinWorldBounds(x, z) {
    return x >= WORLD_CONFIG.minX
        && x <= WORLD_CONFIG.maxX
        && z >= WORLD_CONFIG.minZ
        && z <= WORLD_CONFIG.maxZ;
}

export function getBlockCoord(value) {
    return Math.floor(value);
}

export function getChunkCoord(value) {
    return Math.floor(value / WORLD_CONFIG.chunkSize);
}

export function getRuntimeRenderRadius(renderDistance) {
    return clampNumber(Math.round(Number(renderDistance || DEFAULT_USER_CONFIG.render_distance) / 2), 2, 4);
}

export function normalizeRuntimeConfig(config) {
    const source = Object.assign({}, DEFAULT_USER_CONFIG, config || {});

    return {
        render_distance: clampNumber(Math.round(Number(source.render_distance || DEFAULT_USER_CONFIG.render_distance)), 2, 10),
        mouse_sensitivity: clampNumber(Number(source.mouse_sensitivity || DEFAULT_USER_CONFIG.mouse_sensitivity), 0.1, 3),
        master_volume: clampNumber(Math.round(Number(source.master_volume || DEFAULT_USER_CONFIG.master_volume)), 0, 100),
        invert_y: Number(source.invert_y) === 1 ? 1 : 0
    };
}
