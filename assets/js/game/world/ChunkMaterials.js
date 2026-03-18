import { BLOCK_TYPES } from './BlockTypes.js';

const COLORS = Object.freeze({
    grassTop: { r: 97, g: 176, b: 86 },
    grassSide: { r: 106, g: 132, b: 75 },
    dirt: { r: 124, g: 90, b: 60 },
    stone: { r: 129, g: 136, b: 145 },
    sand: { r: 214, g: 198, b: 126 },
    water: { r: 76, g: 144, b: 212 },
    wood: { r: 132, g: 97, b: 59 },
    leaves: { r: 78, g: 148, b: 77 },
    bedrock: { r: 42, g: 47, b: 54 }
});

const SHADING = Object.freeze({
    top: 1,
    bottom: 0.56,
    north: 0.82,
    south: 0.92,
    east: 0.86,
    west: 0.78
});

export function getFaceMaterial(blockType, direction) {
    if (blockType === BLOCK_TYPES.grass) {
        if (direction === 'top') {
            return { color: COLORS.grassTop, shade: SHADING.top, alpha: 1 };
        }

        return { color: COLORS.grassSide, shade: SHADING[direction] || 0.85, alpha: 1 };
    }

    if (blockType === BLOCK_TYPES.dirt) {
        return { color: COLORS.dirt, shade: SHADING[direction] || 0.84, alpha: 1 };
    }

    if (blockType === BLOCK_TYPES.sand) {
        return { color: COLORS.sand, shade: SHADING[direction] || 0.9, alpha: 1 };
    }

    if (blockType === BLOCK_TYPES.water) {
        return { color: COLORS.water, shade: SHADING[direction] || 0.82, alpha: direction === 'top' ? 0.68 : 0.52 };
    }

    if (blockType === BLOCK_TYPES.wood) {
        return { color: COLORS.wood, shade: SHADING[direction] || 0.85, alpha: 1 };
    }

    if (blockType === BLOCK_TYPES.leaves) {
        return { color: COLORS.leaves, shade: SHADING[direction] || 0.88, alpha: 0.76 };
    }

    if (blockType === BLOCK_TYPES.bedrock) {
        return { color: COLORS.bedrock, shade: SHADING[direction] || 0.74, alpha: 1 };
    }

    return { color: COLORS.stone, shade: SHADING[direction] || 0.8, alpha: 1 };
}
