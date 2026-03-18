import { BLOCK_TYPES, getBlockDefinitionById, getBlockFaceBaseColor } from './BlockTypes.js';

const SHADING = Object.freeze({
    top: 1,
    bottom: 0.56,
    north: 0.82,
    south: 0.92,
    east: 0.86,
    west: 0.78
});

let textureCatalog = {};

function getFaceBucket(direction) {
    if (direction === 'top') {
        return 'top';
    }

    if (direction === 'bottom') {
        return 'bottom';
    }

    return 'side';
}

export function setBlockTextureCatalog(catalog) {
    textureCatalog = catalog && typeof catalog === 'object' ? catalog : {};
}

export function getFaceMaterial(blockType, direction) {
    const definition = getBlockDefinitionById(blockType);
    const faceBucket = getFaceBucket(direction);
    const color = getBlockFaceBaseColor(blockType, direction);
    const texture = textureCatalog[definition.key] && textureCatalog[definition.key][faceBucket]
        ? textureCatalog[definition.key][faceBucket]
        : null;

    let alpha = 1;
    if (blockType === BLOCK_TYPES.water) {
        alpha = direction === 'top' ? 0.68 : 0.52;
    } else if (blockType === BLOCK_TYPES.leaves) {
        alpha = 0.76;
    }

    return {
        color: color,
        shade: SHADING[direction] || 0.84,
        alpha: alpha,
        textureKey: texture ? texture.path : null,
        mergeable: !texture,
        mergeKey: texture ? null : [blockType, direction, alpha].join(':')
    };
}
