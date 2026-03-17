import { BLOCK_TYPES } from './BlockTypes.js';

const COLORS = Object.freeze({
    grassTop: { r: 97, g: 176, b: 86 },
    grassSide: { r: 106, g: 132, b: 75 },
    dirt: { r: 124, g: 90, b: 60 },
    stone: { r: 129, g: 136, b: 145 }
});

const SHADING = Object.freeze({
    top: 1,
    north: 0.82,
    south: 0.92,
    east: 0.86,
    west: 0.78
});

export function getFaceMaterial(blockType, direction) {
    if (blockType === BLOCK_TYPES.grass) {
        if (direction === 'top') {
            return { color: COLORS.grassTop, shade: SHADING.top };
        }

        return { color: COLORS.grassSide, shade: SHADING[direction] || 0.85 };
    }

    if (blockType === BLOCK_TYPES.dirt) {
        return { color: COLORS.dirt, shade: SHADING[direction] || 0.84 };
    }

    return { color: COLORS.stone, shade: SHADING[direction] || 0.8 };
}
