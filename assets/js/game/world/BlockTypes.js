const BLOCK_DEFINITIONS = Object.freeze([
    { id: 0, key: 'air', name: 'Ar', solid: false, opaque: false, breakable: false, collectable: false, placeable: false, maxStack: 0 },
    { id: 1, key: 'grass', name: 'Grama', solid: true, opaque: true, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 2, key: 'dirt', name: 'Terra', solid: true, opaque: true, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 3, key: 'stone', name: 'Pedra', solid: true, opaque: true, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 4, key: 'sand', name: 'Areia', solid: true, opaque: true, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 5, key: 'water', name: 'Agua', solid: false, opaque: false, breakable: false, collectable: false, placeable: false, maxStack: 0 },
    { id: 6, key: 'wood', name: 'Madeira', solid: true, opaque: true, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 7, key: 'leaves', name: 'Folhas', solid: true, opaque: false, breakable: true, collectable: true, placeable: true, maxStack: 64 },
    { id: 8, key: 'bedrock', name: 'Bedrock', solid: true, opaque: true, breakable: false, collectable: false, placeable: false, maxStack: 0 }
]);

export const BLOCK_TYPES = Object.freeze(
    BLOCK_DEFINITIONS.reduce(function (accumulator, definition) {
        accumulator[definition.key] = definition.id;
        return accumulator;
    }, {})
);

export const BLOCK_SAVE_KEYS = Object.freeze(BLOCK_DEFINITIONS.map(function (definition) {
    return definition.key;
}));

const BLOCK_KEYS_BY_ID = Object.freeze(BLOCK_DEFINITIONS.map(function (definition) {
    return definition.key;
}));

const BLOCK_DEFINITIONS_BY_KEY = new Map(BLOCK_DEFINITIONS.map(function (definition) {
    return [definition.key, definition];
}));

const BLOCK_DEFINITIONS_BY_ID = new Map(BLOCK_DEFINITIONS.map(function (definition) {
    return [definition.id, definition];
}));

export function getBlockDefinitionById(blockId) {
    return BLOCK_DEFINITIONS_BY_ID.get(Number(blockId)) || BLOCK_DEFINITIONS[0];
}

export function getBlockDefinitionByKey(blockKey) {
    return BLOCK_DEFINITIONS_BY_KEY.get(String(blockKey || 'air')) || BLOCK_DEFINITIONS[0];
}

export function getBlockIdByKey(blockKey) {
    return getBlockDefinitionByKey(blockKey).id;
}

export function getBlockKeyById(blockId) {
    return BLOCK_KEYS_BY_ID[Number(blockId)] || 'air';
}

export function getBlockName(blockIdOrKey) {
    return typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey).name
        : getBlockDefinitionById(blockIdOrKey).name;
}

export function isSolidBlock(blockId) {
    return getBlockDefinitionById(blockId).solid;
}

export function isOpaqueBlock(blockId) {
    return getBlockDefinitionById(blockId).opaque;
}

export function isBreakableBlock(blockId) {
    return getBlockDefinitionById(blockId).breakable;
}

export function isCollectableBlock(blockId) {
    return getBlockDefinitionById(blockId).collectable;
}

export function isPlaceableBlock(blockId) {
    return getBlockDefinitionById(blockId).placeable;
}

export function getBlockMaxStack(blockIdOrKey) {
    return typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey).maxStack
        : getBlockDefinitionById(blockIdOrKey).maxStack;
}
