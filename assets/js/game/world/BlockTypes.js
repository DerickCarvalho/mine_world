const BLOCK_DEFINITIONS = Object.freeze([
    {
        id: 0,
        key: 'air',
        name: 'Ar',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
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
        hardness: 0.55,
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
        hardness: 0.5,
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
        hardness: 1.35,
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
        hardness: 0.4,
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
        hardness: Number.POSITIVE_INFINITY,
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
        hardness: 0.9,
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
        hardness: 0.25,
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
        hardness: Number.POSITIVE_INFINITY,
        collectable: false,
        placeable: false,
        maxStack: 0,
        baseColors: {
            top: { r: 42, g: 47, b: 54 },
            side: { r: 42, g: 47, b: 54 },
            bottom: { r: 42, g: 47, b: 54 }
        }
    },
    {
        id: 9,
        key: 'coal_ore',
        name: 'Minerio de Carvao',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.6,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 92, g: 96, b: 102 },
            side: { r: 92, g: 96, b: 102 },
            bottom: { r: 92, g: 96, b: 102 }
        }
    },
    {
        id: 10,
        key: 'iron_ore',
        name: 'Minerio de Ferro',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.85,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 168, g: 138, b: 112 },
            side: { r: 168, g: 138, b: 112 },
            bottom: { r: 168, g: 138, b: 112 }
        }
    },
    {
        id: 11,
        key: 'gold_ore',
        name: 'Minerio de Ouro',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.95,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 198, g: 168, b: 74 },
            side: { r: 198, g: 168, b: 74 },
            bottom: { r: 198, g: 168, b: 74 }
        }
    },
    {
        id: 12,
        key: 'planks',
        name: 'Tabuas',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 0.8,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 184, g: 142, b: 84 },
            side: { r: 184, g: 142, b: 84 },
            bottom: { r: 184, g: 142, b: 84 }
        }
    },
    {
        id: 13,
        key: 'cobblestone',
        name: 'Pedregulho',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.5,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 104, g: 110, b: 118 },
            side: { r: 104, g: 110, b: 118 },
            bottom: { r: 104, g: 110, b: 118 }
        }
    },
    {
        id: 14,
        key: 'bricks',
        name: 'Tijolos',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.7,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 156, g: 82, b: 66 },
            side: { r: 156, g: 82, b: 66 },
            bottom: { r: 156, g: 82, b: 66 }
        }
    },
    {
        id: 15,
        key: 'glass',
        name: 'Vidro',
        solid: true,
        opaque: false,
        breakable: true,
        hardness: 0.35,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 188, g: 216, b: 226 },
            side: { r: 188, g: 216, b: 226 },
            bottom: { r: 188, g: 216, b: 226 }
        }
    },
    {
        id: 16,
        key: 'stick',
        name: 'Graveto',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 64,
        baseColors: {
            top: { r: 156, g: 118, b: 72 },
            side: { r: 156, g: 118, b: 72 },
            bottom: { r: 156, g: 118, b: 72 }
        }
    },
    {
        id: 17,
        key: 'workbench',
        name: 'Bancada',
        solid: true,
        opaque: true,
        breakable: true,
        hardness: 1.15,
        collectable: true,
        placeable: true,
        maxStack: 64,
        baseColors: {
            top: { r: 142, g: 96, b: 54 },
            side: { r: 126, g: 84, b: 48 },
            bottom: { r: 110, g: 74, b: 42 }
        }
    },
    {
        id: 18,
        key: 'wood_pickaxe',
        name: 'Picareta de Madeira',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 188, g: 144, b: 86 },
            side: { r: 188, g: 144, b: 86 },
            bottom: { r: 188, g: 144, b: 86 }
        }
    },
    {
        id: 19,
        key: 'wood_axe',
        name: 'Machado de Madeira',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 176, g: 124, b: 78 },
            side: { r: 176, g: 124, b: 78 },
            bottom: { r: 176, g: 124, b: 78 }
        }
    },
    {
        id: 20,
        key: 'wood_sword',
        name: 'Espada de Madeira',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 198, g: 154, b: 94 },
            side: { r: 198, g: 154, b: 94 },
            bottom: { r: 198, g: 154, b: 94 }
        }
    },
    {
        id: 21,
        key: 'stone_pickaxe',
        name: 'Picareta de Pedra',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 138, g: 144, b: 154 },
            side: { r: 138, g: 144, b: 154 },
            bottom: { r: 138, g: 144, b: 154 }
        }
    },
    {
        id: 22,
        key: 'stone_axe',
        name: 'Machado de Pedra',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 126, g: 132, b: 142 },
            side: { r: 126, g: 132, b: 142 },
            bottom: { r: 126, g: 132, b: 142 }
        }
    },
    {
        id: 23,
        key: 'stone_sword',
        name: 'Espada de Pedra',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 1,
        baseColors: {
            top: { r: 164, g: 170, b: 180 },
            side: { r: 164, g: 170, b: 180 },
            bottom: { r: 164, g: 170, b: 180 }
        }
    },
    {
        id: 24,
        key: 'raw_pork',
        name: 'Carne Crua',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 16,
        baseColors: {
            top: { r: 214, g: 132, b: 136 },
            side: { r: 214, g: 132, b: 136 },
            bottom: { r: 214, g: 132, b: 136 }
        }
    },
    {
        id: 25,
        key: 'cloth',
        name: 'L',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 32,
        baseColors: {
            top: { r: 226, g: 228, b: 232 },
            side: { r: 226, g: 228, b: 232 },
            bottom: { r: 226, g: 228, b: 232 }
        }
    },
    {
        id: 26,
        key: 'fang',
        name: 'Presa',
        solid: false,
        opaque: false,
        breakable: false,
        hardness: Number.POSITIVE_INFINITY,
        collectable: true,
        placeable: false,
        maxStack: 32,
        baseColors: {
            top: { r: 212, g: 214, b: 188 },
            side: { r: 212, g: 214, b: 188 },
            bottom: { r: 212, g: 214, b: 188 }
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

export function getBlockHardness(blockIdOrKey) {
    const definition = typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey)
        : getBlockDefinitionById(blockIdOrKey);

    return Number.isFinite(definition.hardness) && definition.hardness > 0
        ? definition.hardness
        : Number.POSITIVE_INFINITY;
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

export function isEdibleBlock(blockIdOrKey) {
    const definition = typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey)
        : getBlockDefinitionById(blockIdOrKey);

    return definition.key === 'raw_pork';
}

export function getBlockNutrition(blockIdOrKey) {
    const definition = typeof blockIdOrKey === 'string'
        ? getBlockDefinitionByKey(blockIdOrKey)
        : getBlockDefinitionById(blockIdOrKey);

    if (definition.key === 'raw_pork') {
        return 3;
    }

    return 0;
}

export function listPlaceableBlockDefinitions() {
    return BLOCK_DEFINITIONS.filter(function (definition) {
        return definition.placeable;
    });
}
