export const CRAFTING_RECIPES = Object.freeze([
    {
        id: 'planks_from_wood',
        name: 'Tabuas',
        description: 'Transforma troncos em tabuas para construcao.',
        inputs: [{ block_id: 'wood', quantity: 1 }],
        output: { block_id: 'planks', quantity: 4 }
    },
    {
        id: 'sticks_from_planks',
        name: 'Gravetos',
        description: 'Converte tabuas em gravetos para ferramentas simples.',
        inputs: [{ block_id: 'planks', quantity: 2 }],
        output: { block_id: 'stick', quantity: 4 }
    },
    {
        id: 'workbench_from_planks',
        name: 'Bancada',
        description: 'Monta uma bancada basica para progressao do survival.',
        inputs: [{ block_id: 'planks', quantity: 4 }],
        output: { block_id: 'workbench', quantity: 1 }
    },
    {
        id: 'wood_pickaxe',
        name: 'Picareta de Madeira',
        description: 'Ferramenta inicial para mineracao leve.',
        inputs: [
            { block_id: 'planks', quantity: 3 },
            { block_id: 'stick', quantity: 2 }
        ],
        output: { block_id: 'wood_pickaxe', quantity: 1 }
    },
    {
        id: 'wood_axe',
        name: 'Machado de Madeira',
        description: 'Ferramenta inicial para madeira e combate basico.',
        inputs: [
            { block_id: 'planks', quantity: 3 },
            { block_id: 'stick', quantity: 2 }
        ],
        output: { block_id: 'wood_axe', quantity: 1 }
    },
    {
        id: 'wood_sword',
        name: 'Espada de Madeira',
        description: 'Arma simples para o primeiro combate.',
        inputs: [
            { block_id: 'planks', quantity: 2 },
            { block_id: 'stick', quantity: 1 }
        ],
        output: { block_id: 'wood_sword', quantity: 1 }
    },
    {
        id: 'cobble_from_stone',
        name: 'Pedregulho',
        description: 'Quebra pedra em um bloco mais bruto para alvenaria.',
        inputs: [{ block_id: 'stone', quantity: 2 }],
        output: { block_id: 'cobblestone', quantity: 2 }
    },
    {
        id: 'stone_pickaxe',
        name: 'Picareta de Pedra',
        description: 'Versao mais forte da picareta inicial.',
        inputs: [
            { block_id: 'cobblestone', quantity: 3 },
            { block_id: 'stick', quantity: 2 }
        ],
        output: { block_id: 'stone_pickaxe', quantity: 1 }
    },
    {
        id: 'stone_axe',
        name: 'Machado de Pedra',
        description: 'Versao mais forte do machado inicial.',
        inputs: [
            { block_id: 'cobblestone', quantity: 3 },
            { block_id: 'stick', quantity: 2 }
        ],
        output: { block_id: 'stone_axe', quantity: 1 }
    },
    {
        id: 'stone_sword',
        name: 'Espada de Pedra',
        description: 'Arma de curto alcance melhor para mobs hostis.',
        inputs: [
            { block_id: 'cobblestone', quantity: 2 },
            { block_id: 'stick', quantity: 1 }
        ],
        output: { block_id: 'stone_sword', quantity: 1 }
    },
    {
        id: 'bricks_from_stone_and_sand',
        name: 'Tijolos',
        description: 'Compacta pedra e areia em blocos de tijolo simples.',
        inputs: [
            { block_id: 'stone', quantity: 2 },
            { block_id: 'sand', quantity: 2 }
        ],
        output: { block_id: 'bricks', quantity: 2 }
    },
    {
        id: 'glass_from_sand_and_coal',
        name: 'Vidro',
        description: 'Refina areia usando minerio de carvao como combustivel simplificado.',
        inputs: [
            { block_id: 'sand', quantity: 3 },
            { block_id: 'coal_ore', quantity: 1 }
        ],
        output: { block_id: 'glass', quantity: 2 }
    },
    {
        id: 'gold_bricks',
        name: 'Tijolos dourados',
        description: 'Une ouro bruto e tijolos para decoracao valiosa.',
        inputs: [
            { block_id: 'gold_ore', quantity: 1 },
            { block_id: 'bricks', quantity: 2 }
        ],
        output: { block_id: 'bricks', quantity: 3 }
    }
]);

function cloneSlot(slot) {
    return slot ? { ...slot } : null;
}

export function listCraftingRecipes() {
    return CRAFTING_RECIPES.slice();
}

export function getRecipeById(recipeId) {
    return CRAFTING_RECIPES.find((recipe) => recipe.id === recipeId) || null;
}

export function countInventoryItems(slots) {
    const counts = new Map();
    for (const slot of Array.isArray(slots) ? slots : []) {
        if (!slot || !slot.block_id) {
            continue;
        }
        counts.set(slot.block_id, (counts.get(slot.block_id) || 0) + Math.max(0, Math.floor(Number(slot.quantity || 0))));
    }
    return counts;
}

export function canCraftRecipe(slots, recipe) {
    if (!recipe) {
        return false;
    }

    const counts = countInventoryItems(slots);
    return recipe.inputs.every((input) => (counts.get(input.block_id) || 0) >= input.quantity);
}

export function listRecipeStates(slots) {
    return CRAFTING_RECIPES.map(function (recipe) {
        return {
            ...recipe,
            craftable: canCraftRecipe(slots, recipe)
        };
    });
}

export function craftRecipe(slots, recipe) {
    if (!recipe || !canCraftRecipe(slots, recipe)) {
        return {
            crafted: false,
            slots: Array.isArray(slots) ? slots.map(cloneSlot) : []
        };
    }

    const nextSlots = Array.isArray(slots) ? slots.map(cloneSlot) : [];
    const remainingInputs = recipe.inputs.map((input) => ({ ...input }));

    for (let index = 0; index < nextSlots.length; index += 1) {
        const slot = nextSlots[index];
        if (!slot) {
            continue;
        }

        const pending = remainingInputs.find((input) => input.block_id === slot.block_id && input.quantity > 0);
        if (!pending) {
            continue;
        }

        const consumed = Math.min(slot.quantity, pending.quantity);
        slot.quantity -= consumed;
        pending.quantity -= consumed;
        if (slot.quantity <= 0) {
            nextSlots[index] = null;
        }
    }

    let outputRemaining = recipe.output.quantity;
    for (let index = 0; index < nextSlots.length && outputRemaining > 0; index += 1) {
        const slot = nextSlots[index];
        if (!slot || slot.block_id !== recipe.output.block_id || slot.quantity >= 64) {
            continue;
        }

        const moved = Math.min(64 - slot.quantity, outputRemaining);
        slot.quantity += moved;
        outputRemaining -= moved;
    }

    for (let index = 0; index < nextSlots.length && outputRemaining > 0; index += 1) {
        if (nextSlots[index]) {
            continue;
        }

        const moved = Math.min(64, outputRemaining);
        nextSlots[index] = {
            block_id: recipe.output.block_id,
            quantity: moved
        };
        outputRemaining -= moved;
    }

    if (outputRemaining > 0) {
        return {
            crafted: false,
            slots: Array.isArray(slots) ? slots.map(cloneSlot) : []
        };
    }

    return {
        crafted: true,
        slots: nextSlots
    };
}
