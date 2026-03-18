const BLOCK_DEFINITIONS = Object.freeze([
    {
        id: 0,
        key: 'air',
        name: 'Ar',
        solid: false,
        opaque: false,
        breakable: false,
        collectable: false,
        placeable: false,
        maxStack: 0,
        baseColors: {
            top: { r: 0, g: 0, b: 0 },
            side: { r: 0, g: 0, b: 0 },
            bottom: { r: 0, g: 0, b: 0 }
        }
    },
    {
        id: 1,
        key: 'grass',
        name: 'Grama',
        solid: true,
        opaque: true,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 97, g: 176, b: 86 },
            side: { r: 106, g: 132, b: 75 },
            bottom: { r: 124, g: 90, b: 60 }
        }
    },
    {
        id: 2,
        key: 'dirt',
        name: 'Terra',
        solid: true,
        opaque: true,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 124, g: 90, b: 60 },
            side: { r: 124, g: 90, b: 60 },
            bottom: { r: 124, g: 90, b: 60 }
        }
    },
    {
        id: 3,
        key: 'stone',
        name: 'Pedra',
        solid: true,
        opaque: true,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 129, g: 136, b: 145 },
            side: { r: 129, g: 136, b: 145 },
            bottom: { r: 129, g: 136, b: 145 }
        }
    },
    {
        id: 4,
        key: 'sand',
        name: 'Areia',
        solid: true,
        opaque: true,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 214, g: 198, b: 126 },
            side: { r: 214, g: 198, b: 126 },
            bottom: { r: 214, g: 198, b: 126 }
        }
    },
    {
        id: 5,
        key: 'water',
        name: 'Agua',
        solid: false,
        opaque: false,
        breakable: false,
        collectable: false,
        placeable: false,
        maxStack: 0,
        baseColors: {
            top: { r: 76, g: 144, b: 212 },
            side: { r: 76, g: 144, b: 212 },
            bottom: { r: 76, g: 144, b: 212 }
        }
    },
    {
        id: 6,
        key: 'wood',
        name: 'Madeira',
        solid: true,
        opaque: true,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 132, g: 97, b: 59 },
            side: { r: 132, g: 97, b: 59 },
            bottom: { r: 132, g: 97, b: 59 }
        }
    },
    {
        id: 7,
        key: 'leaves',
        name: 'Folhas',
        solid: true,
        opaque: false,
        breakable: true,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 78, g: 148, b: 77 },
            side: { r: 78, g: 148, b: 77 },
            bottom: { r: 78, g: 148, b: 77 }
        }
    },
    {
        id: 8,
        key: 'bedrock',
        name: 'Bedrock',
        solid: true,
        opaque: true,
        breakable: false,
        collectable: false,
        placeable: false,
        maxStack: 0,
        baseColors: {
            top: { r: 42, g: 47, b: 54 },
            side: { r: 42, g: 47, b: 54 },
            bottom: { r: 42, g: 47, b: 54 }
        }
    }
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

function getFaceBucket(direction) {
    if (direction === 'top') {
        return 'top';
    }

    if (direction === 'bottom') {
        return 'bottom';
    }

    return 'side';
}

export function listBlockDefinitions() {
    return BLOCK_DEFINITIONS.slice();
}

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

export function getBlockFaceBaseColor(blockIdOrKey, direction) {
    const definition = typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey)
        : getBlockDefinitionById(blockIdOrKey);

    return definition.baseColors[getFaceBucket(direction)] || definition.baseColors.side;
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
