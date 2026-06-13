// P = planks, S = stick, C = cobblestone, I = iron_ingot, G = gold_ingot, D = diamond, W = wheat
// null = empty cell

export const SHAPED_RECIPES = Object.freeze([
    // --- Wood tools (2x2 and 3x3) ---
    {
        id: 'planks_from_wood', type: 'shapeless',
        inputs: [{ block_id: 'wood', quantity: 1 }],
        output: { block_id: 'planks', quantity: 4 }
    },
    {
        id: 'sticks_from_planks', type: 'shaped', width: 1, height: 2,
        pattern: [['planks'], ['planks']],
        output: { block_id: 'stick', quantity: 4 }
    },
    {
        id: 'workbench_from_planks', type: 'shaped', width: 2, height: 2,
        pattern: [['planks', 'planks'], ['planks', 'planks']],
        output: { block_id: 'workbench', quantity: 1 }
    },
    // Wood tools
    {
        id: 'wood_pickaxe', type: 'shaped', width: 3, height: 3,
        pattern: [['planks', 'planks', 'planks'], [null, 'stick', null], [null, 'stick', null]],
        output: { block_id: 'wood_pickaxe', quantity: 1 }
    },
    {
        id: 'wood_axe', type: 'shaped', width: 2, height: 3,
        pattern: [['planks', 'planks'], ['planks', 'stick'], [null, 'stick']],
        output: { block_id: 'wood_axe', quantity: 1 }
    },
    {
        id: 'wood_sword', type: 'shaped', width: 1, height: 3,
        pattern: [['planks'], ['planks'], ['stick']],
        output: { block_id: 'wood_sword', quantity: 1 }
    },
    {
        id: 'wood_shovel', type: 'shaped', width: 1, height: 3,
        pattern: [['planks'], ['stick'], ['stick']],
        output: { block_id: 'wood_shovel', quantity: 1 }
    },
    {
        id: 'wood_hoe', type: 'shaped', width: 2, height: 3,
        pattern: [['planks', 'planks'], [null, 'stick'], [null, 'stick']],
        output: { block_id: 'wood_hoe', quantity: 1 }
    },
    // Stone tools
    {
        id: 'stone_pickaxe', type: 'shaped', width: 3, height: 3,
        pattern: [['cobblestone', 'cobblestone', 'cobblestone'], [null, 'stick', null], [null, 'stick', null]],
        output: { block_id: 'stone_pickaxe', quantity: 1 }
    },
    {
        id: 'stone_axe', type: 'shaped', width: 2, height: 3,
        pattern: [['cobblestone', 'cobblestone'], ['cobblestone', 'stick'], [null, 'stick']],
        output: { block_id: 'stone_axe', quantity: 1 }
    },
    {
        id: 'stone_sword', type: 'shaped', width: 1, height: 3,
        pattern: [['cobblestone'], ['cobblestone'], ['stick']],
        output: { block_id: 'stone_sword', quantity: 1 }
    },
    {
        id: 'stone_shovel', type: 'shaped', width: 1, height: 3,
        pattern: [['cobblestone'], ['stick'], ['stick']],
        output: { block_id: 'stone_shovel', quantity: 1 }
    },
    {
        id: 'stone_hoe', type: 'shaped', width: 2, height: 3,
        pattern: [['cobblestone', 'cobblestone'], [null, 'stick'], [null, 'stick']],
        output: { block_id: 'stone_hoe', quantity: 1 }
    },
    // Iron tools
    {
        id: 'iron_pickaxe', type: 'shaped', width: 3, height: 3,
        pattern: [['iron_ingot', 'iron_ingot', 'iron_ingot'], [null, 'stick', null], [null, 'stick', null]],
        output: { block_id: 'iron_pickaxe', quantity: 1 }
    },
    {
        id: 'iron_axe', type: 'shaped', width: 2, height: 3,
        pattern: [['iron_ingot', 'iron_ingot'], ['iron_ingot', 'stick'], [null, 'stick']],
        output: { block_id: 'iron_axe', quantity: 1 }
    },
    {
        id: 'iron_sword', type: 'shaped', width: 1, height: 3,
        pattern: [['iron_ingot'], ['iron_ingot'], ['stick']],
        output: { block_id: 'iron_sword', quantity: 1 }
    },
    {
        id: 'iron_shovel', type: 'shaped', width: 1, height: 3,
        pattern: [['iron_ingot'], ['stick'], ['stick']],
        output: { block_id: 'iron_shovel', quantity: 1 }
    },
    {
        id: 'iron_hoe', type: 'shaped', width: 2, height: 3,
        pattern: [['iron_ingot', 'iron_ingot'], [null, 'stick'], [null, 'stick']],
        output: { block_id: 'iron_hoe', quantity: 1 }
    },
    // Gold tools
    {
        id: 'gold_pickaxe', type: 'shaped', width: 3, height: 3,
        pattern: [['gold_ingot', 'gold_ingot', 'gold_ingot'], [null, 'stick', null], [null, 'stick', null]],
        output: { block_id: 'gold_pickaxe', quantity: 1 }
    },
    {
        id: 'gold_axe', type: 'shaped', width: 2, height: 3,
        pattern: [['gold_ingot', 'gold_ingot'], ['gold_ingot', 'stick'], [null, 'stick']],
        output: { block_id: 'gold_axe', quantity: 1 }
    },
    {
        id: 'gold_sword', type: 'shaped', width: 1, height: 3,
        pattern: [['gold_ingot'], ['gold_ingot'], ['stick']],
        output: { block_id: 'gold_sword', quantity: 1 }
    },
    // Diamond tools
    {
        id: 'diamond_pickaxe', type: 'shaped', width: 3, height: 3,
        pattern: [['diamond', 'diamond', 'diamond'], [null, 'stick', null], [null, 'stick', null]],
        output: { block_id: 'diamond_pickaxe', quantity: 1 }
    },
    {
        id: 'diamond_axe', type: 'shaped', width: 2, height: 3,
        pattern: [['diamond', 'diamond'], ['diamond', 'stick'], [null, 'stick']],
        output: { block_id: 'diamond_axe', quantity: 1 }
    },
    {
        id: 'diamond_sword', type: 'shaped', width: 1, height: 3,
        pattern: [['diamond'], ['diamond'], ['stick']],
        output: { block_id: 'diamond_sword', quantity: 1 }
    },
    // Functional blocks
    {
        id: 'chest', type: 'shaped', width: 3, height: 3,
        pattern: [['planks', 'planks', 'planks'], ['planks', null, 'planks'], ['planks', 'planks', 'planks']],
        output: { block_id: 'chest', quantity: 1 }
    },
    {
        id: 'furnace', type: 'shaped', width: 3, height: 3,
        pattern: [['cobblestone', 'cobblestone', 'cobblestone'], ['cobblestone', null, 'cobblestone'], ['cobblestone', 'cobblestone', 'cobblestone']],
        output: { block_id: 'furnace', quantity: 1 }
    },
    {
        id: 'torch', type: 'shaped', width: 1, height: 2,
        pattern: [['coal'], ['stick']],
        output: { block_id: 'torch', quantity: 4 }
    },
    // Food/misc
    {
        id: 'bowl', type: 'shaped', width: 3, height: 2,
        pattern: [['planks', null, 'planks'], [null, 'planks', null]],
        output: { block_id: 'bowl', quantity: 4 }
    },
    {
        id: 'bread', type: 'shaped', width: 3, height: 1,
        pattern: [['wheat', 'wheat', 'wheat']],
        output: { block_id: 'bread', quantity: 1 }
    },
    // Block compression
    {
        id: 'gold_bricks', type: 'shaped', width: 2, height: 2,
        pattern: [['gold_ingot', 'gold_ingot'], ['gold_ingot', 'gold_ingot']],
        output: { block_id: 'gold_bricks', quantity: 4 }
    },
    // Smelting shortcuts (crafting proxy until furnace is interactive)
    {
        id: 'cobble_from_stone', type: 'shapeless',
        inputs: [{ block_id: 'stone', quantity: 1 }],
        output: { block_id: 'cobblestone', quantity: 1 }
    },
    {
        id: 'glass_from_sand_and_coal', type: 'shapeless',
        inputs: [{ block_id: 'sand', quantity: 1 }, { block_id: 'coal_ore', quantity: 1 }],
        output: { block_id: 'glass', quantity: 1 }
    }
]);

// --- Pattern matching engine ---

function tryMatchAt(gridSlots, gridWidth, gridHeight, recipe, rowOff, colOff, mirror) {
    const pat = recipe.pattern;
    const patRows = pat.length;
    const patCols = pat[0] ? pat[0].length : 0;

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            const gridSlot = gridSlots[r * gridWidth + c];
            const actual = gridSlot ? gridSlot.block_id : null;

            const pr = r - rowOff;
            const rawPc = c - colOff;
            const pc = mirror ? (patCols - 1 - rawPc) : rawPc;

            let expected = null;
            if (pr >= 0 && pr < patRows && pc >= 0 && pc < patCols) {
                expected = pat[pr][pc] || null;
            }

            if (expected !== actual) return false;
        }
    }
    return true;
}

function matchShapedRecipe(gridSlots, gridWidth, recipe) {
    const gridHeight = Math.round(gridSlots.length / gridWidth);
    const patRows = recipe.pattern.length;
    const patCols = recipe.pattern[0] ? recipe.pattern[0].length : 0;

    const maxRowOff = gridHeight - patRows;
    const maxColOff = gridWidth - patCols;

    if (maxRowOff < 0 || maxColOff < 0) return false;

    for (let rowOff = 0; rowOff <= maxRowOff; rowOff++) {
        for (let colOff = 0; colOff <= maxColOff; colOff++) {
            if (tryMatchAt(gridSlots, gridWidth, gridHeight, recipe, rowOff, colOff, false)) {
                return true;
            }
            if (tryMatchAt(gridSlots, gridWidth, gridHeight, recipe, rowOff, colOff, true)) {
                return true;
            }
        }
    }
    return false;
}

function matchShapelessRecipe(gridSlots, recipe) {
    const counts = new Map();
    for (const slot of gridSlots) {
        if (!slot) continue;
        counts.set(slot.block_id, (counts.get(slot.block_id) || 0) + 1);
    }

    const needed = new Map();
    for (const input of recipe.inputs) {
        needed.set(input.block_id, (needed.get(input.block_id) || 0) + input.quantity);
    }

    // Grid must contain exactly the required items — no extra
    const gridItemCount = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    const neededItemCount = Array.from(needed.values()).reduce((a, b) => a + b, 0);
    if (gridItemCount !== neededItemCount) return false;

    for (const [id, qty] of needed) {
        if ((counts.get(id) || 0) < qty) return false;
    }
    return true;
}

// Returns the matching recipe or null
export function getRecipeForGrid(gridSlots, gridWidth) {
    if (!Array.isArray(gridSlots) || gridSlots.length === 0) return null;

    const hasAny = gridSlots.some(s => s !== null);
    if (!hasAny) return null;

    for (const recipe of SHAPED_RECIPES) {
        if (recipe.type === 'shaped') {
            if (matchShapedRecipe(gridSlots, gridWidth, recipe)) return recipe;
        } else {
            if (matchShapelessRecipe(gridSlots, recipe)) return recipe;
        }
    }
    return null;
}

// Consume one round of ingredients from the craft grid (each filled cell -1)
export function consumeGridIngredients(gridSlots) {
    return gridSlots.map(slot => {
        if (!slot) return null;
        const qty = slot.quantity - 1;
        return qty > 0 ? { block_id: slot.block_id, quantity: qty } : null;
    });
}

// Add recipe output into inventory slots; returns { slots, overflow }
export function addOutputToInventory(inventorySlots, recipe) {
    if (!recipe) return { slots: inventorySlots.slice(), overflow: 0 };
    const { block_id, quantity } = recipe.output;
    const maxStack = 64;
    const newSlots = inventorySlots.map(s => s ? { ...s } : null);
    let remaining = quantity;

    for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        const s = newSlots[i];
        if (!s || s.block_id !== block_id || s.quantity >= maxStack) continue;
        const add = Math.min(maxStack - s.quantity, remaining);
        newSlots[i] = { block_id, quantity: s.quantity + add };
        remaining -= add;
    }
    for (let i = 0; i < newSlots.length && remaining > 0; i++) {
        if (newSlots[i]) continue;
        newSlots[i] = { block_id, quantity: Math.min(maxStack, remaining) };
        remaining -= Math.min(maxStack, remaining);
    }

    return { slots: newSlots, overflow: remaining };
}

// Return grid items back to inventory slots
export function returnGridToInventory(inventorySlots, gridSlots) {
    const combined = addOutputToInventory(inventorySlots, null);
    let newInv = combined.slots;
    for (const slot of gridSlots) {
        if (!slot) continue;
        const r = addOutputToInventory(newInv, { output: { block_id: slot.block_id, quantity: slot.quantity } });
        newInv = r.slots;
    }
    return newInv;
}

// --- Legacy API (kept for creative mode compatibility) ---

function cloneSlot(slot) {
    return slot ? { ...slot } : null;
}

export function listCraftingRecipes() {
    return SHAPED_RECIPES.slice();
}

export function getRecipeById(recipeId) {
    return SHAPED_RECIPES.find(r => r.id === recipeId) || null;
}

export function countInventoryItems(slots) {
    const counts = new Map();
    for (const slot of Array.isArray(slots) ? slots : []) {
        if (!slot || !slot.block_id) continue;
        counts.set(slot.block_id, (counts.get(slot.block_id) || 0) + Math.max(0, Math.floor(Number(slot.quantity || 0))));
    }
    return counts;
}

export function canCraftRecipe(slots, recipe) {
    if (!recipe) return false;
    if (recipe.type === 'shapeless') {
        const counts = countInventoryItems(slots);
        return recipe.inputs.every(input => (counts.get(input.block_id) || 0) >= input.quantity);
    }
    // For shaped in legacy mode, use inventory item counts vs flattened pattern
    const needed = new Map();
    for (const row of (recipe.pattern || [])) {
        for (const cell of (row || [])) {
            if (cell) needed.set(cell, (needed.get(cell) || 0) + 1);
        }
    }
    const counts = countInventoryItems(slots);
    for (const [id, qty] of needed) {
        if ((counts.get(id) || 0) < qty) return false;
    }
    return true;
}

export function listRecipeStates(slots) {
    return SHAPED_RECIPES.map(recipe => ({
        ...recipe,
        craftable: canCraftRecipe(slots, recipe)
    }));
}

export function craftRecipe(slots, recipe) {
    if (!recipe || !canCraftRecipe(slots, recipe)) {
        return { crafted: false, slots: Array.isArray(slots) ? slots.map(cloneSlot) : [] };
    }

    const nextSlots = Array.isArray(slots) ? slots.map(cloneSlot) : [];

    // Build consumption list from pattern or inputs
    const toConsume = [];
    if (recipe.type === 'shapeless') {
        for (const input of recipe.inputs) {
            toConsume.push({ block_id: input.block_id, quantity: input.quantity });
        }
    } else {
        const tally = new Map();
        for (const row of (recipe.pattern || [])) {
            for (const cell of (row || [])) {
                if (cell) tally.set(cell, (tally.get(cell) || 0) + 1);
            }
        }
        for (const [id, qty] of tally) {
            toConsume.push({ block_id: id, quantity: qty });
        }
    }

    const pending = toConsume.map(i => ({ ...i }));
    for (let idx = 0; idx < nextSlots.length; idx++) {
        const slot = nextSlots[idx];
        if (!slot) continue;
        const p = pending.find(x => x.block_id === slot.block_id && x.quantity > 0);
        if (!p) continue;
        const consumed = Math.min(slot.quantity, p.quantity);
        slot.quantity -= consumed;
        p.quantity -= consumed;
        if (slot.quantity <= 0) nextSlots[idx] = null;
    }

    const { block_id, quantity } = recipe.output;
    let outputRemaining = quantity;
    for (let idx = 0; idx < nextSlots.length && outputRemaining > 0; idx++) {
        const slot = nextSlots[idx];
        if (!slot || slot.block_id !== block_id || slot.quantity >= 64) continue;
        const moved = Math.min(64 - slot.quantity, outputRemaining);
        slot.quantity += moved;
        outputRemaining -= moved;
    }
    for (let idx = 0; idx < nextSlots.length && outputRemaining > 0; idx++) {
        if (nextSlots[idx]) continue;
        const moved = Math.min(64, outputRemaining);
        nextSlots[idx] = { block_id, quantity: moved };
        outputRemaining -= moved;
    }

    if (outputRemaining > 0) {
        return { crafted: false, slots: Array.isArray(slots) ? slots.map(cloneSlot) : [] };
    }

    return { crafted: true, slots: nextSlots };
}
