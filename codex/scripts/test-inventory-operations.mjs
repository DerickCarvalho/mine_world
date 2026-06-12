import assert from "node:assert/strict";
import {
  INVENTORY_CLICK,
  applyInventoryClick,
  applyPrimaryClick,
  applySecondaryClick
} from "../../assets/js/game/inventory/InventoryOperations.js";
import {
  canCraftRecipe,
  craftRecipe,
  getRecipeById,
  listRecipeStates
} from "../../assets/js/game/inventory/CraftingCatalog.js";

const stack = (blockId, quantity) => ({ block_id: blockId, quantity });
const quantity = (value) => value ? value.quantity : 0;
const total = (...values) => values.reduce((sum, value) => sum + quantity(value), 0);

{
  const source = stack("stone", 12);
  const result = applyPrimaryClick(source, null);

  assert.deepEqual(result, { slot: null, cursorStack: stack("stone", 12) });
  assert.deepEqual(source, stack("stone", 12));
}

{
  const result = applyPrimaryClick(null, stack("stone", 12));

  assert.deepEqual(result, { slot: stack("stone", 12), cursorStack: null });
}

{
  const result = applyPrimaryClick(stack("stone", 60), stack("stone", 10));

  assert.deepEqual(result, {
    slot: stack("stone", 64),
    cursorStack: stack("stone", 6)
  });
  assert.equal(total(result.slot, result.cursorStack), 70);
}

{
  const result = applyPrimaryClick(stack("dirt", 7), stack("stone", 12));

  assert.deepEqual(result, {
    slot: stack("stone", 12),
    cursorStack: stack("dirt", 7)
  });
  assert.equal(total(result.slot, result.cursorStack), 19);
}

{
  const odd = applySecondaryClick(stack("stone", 9), null);
  const even = applySecondaryClick(stack("stone", 8), null);

  assert.deepEqual(odd, {
    slot: stack("stone", 4),
    cursorStack: stack("stone", 5)
  });
  assert.deepEqual(even, {
    slot: stack("stone", 4),
    cursorStack: stack("stone", 4)
  });
}

{
  const emptySlot = applySecondaryClick(null, stack("stone", 3));
  const matchingSlot = applySecondaryClick(stack("stone", 63), stack("stone", 3));
  const fullSlot = applySecondaryClick(stack("stone", 64), stack("stone", 3));
  const differentSlot = applySecondaryClick(stack("dirt", 2), stack("stone", 3));

  assert.deepEqual(emptySlot, {
    slot: stack("stone", 1),
    cursorStack: stack("stone", 2)
  });
  assert.deepEqual(matchingSlot, {
    slot: stack("stone", 64),
    cursorStack: stack("stone", 2)
  });
  assert.deepEqual(fullSlot, {
    slot: stack("stone", 64),
    cursorStack: stack("stone", 3)
  });
  assert.deepEqual(differentSlot, {
    slot: stack("dirt", 2),
    cursorStack: stack("stone", 3)
  });
}

{
  const slots = [stack("stone", 63), null];
  const result = applyInventoryClick(
    slots,
    stack("stone", 3),
    0,
    INVENTORY_CLICK.SECONDARY
  );

  assert.deepEqual(result, {
    slots: [stack("stone", 64), null],
    cursorStack: stack("stone", 2)
  });
  assert.deepEqual(slots, [stack("stone", 63), null]);
}

{
  const slots = [
    stack("wood", 2),
    stack("stone", 3),
    stack("planks", 4),
    stack("stick", 2),
    stack("sand", 3),
    stack("coal_ore", 1),
    ...new Array(21).fill(null)
  ];
  const planksRecipe = getRecipeById("planks_from_wood");
  const workbenchRecipe = getRecipeById("workbench_from_planks");
  const woodPickaxeRecipe = getRecipeById("wood_pickaxe");
  const cobbleRecipe = getRecipeById("cobble_from_stone");
  const glassRecipe = getRecipeById("glass_from_sand_and_coal");

  assert.equal(canCraftRecipe(slots, planksRecipe), true);
  assert.equal(canCraftRecipe(slots, workbenchRecipe), true);
  assert.equal(canCraftRecipe(slots, woodPickaxeRecipe), true);
  assert.equal(canCraftRecipe(slots, cobbleRecipe), true);
  assert.equal(canCraftRecipe(slots, glassRecipe), true);

  const craftedPlanks = craftRecipe(slots, planksRecipe);
  assert.equal(craftedPlanks.crafted, true);
  assert.equal(craftedPlanks.slots.some((slot) => slot && slot.block_id === "planks"), true);

  const craftedWorkbench = craftRecipe(slots, workbenchRecipe);
  assert.equal(craftedWorkbench.crafted, true);
  assert.equal(craftedWorkbench.slots.some((slot) => slot && slot.block_id === "workbench"), true);

  const craftedPickaxe = craftRecipe(slots, woodPickaxeRecipe);
  assert.equal(craftedPickaxe.crafted, true);
  assert.equal(craftedPickaxe.slots.some((slot) => slot && slot.block_id === "wood_pickaxe"), true);

  const states = listRecipeStates(craftedPlanks.slots);
  assert.equal(states.some((entry) => entry.id === "planks_from_wood" && entry.craftable === true), true);
  assert.equal(states.some((entry) => entry.id === "wood_pickaxe"), true);
  assert.equal(states.some((entry) => entry.id === "gold_bricks" && entry.craftable === false), true);
}

console.log("InventoryOperations: cliques e crafting conservaram itens, respeitaram pilhas, liberaram novas receitas e expuseram estados corretos.");
