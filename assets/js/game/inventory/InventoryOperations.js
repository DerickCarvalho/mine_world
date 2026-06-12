export const INVENTORY_CLICK = Object.freeze({
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
});

function cloneStack(stack) {
    return stack ? { ...stack } : null;
}

function getQuantity(stack) {
    return stack && Number.isFinite(stack.quantity)
        ? Math.max(0, Math.floor(stack.quantity))
        : 0;
}

function getStackLimit(maxStack) {
    return Number.isFinite(maxStack) && maxStack > 0
        ? Math.floor(maxStack)
        : 64;
}

function isSameItem(first, second) {
    return Boolean(first && second && first.block_id === second.block_id);
}

function withQuantity(stack, quantity) {
    return quantity > 0 ? { ...stack, quantity } : null;
}

export function applyPrimaryClick(slot, cursorStack, maxStack = 64) {
    const slotQuantity = getQuantity(slot);
    const cursorQuantity = getQuantity(cursorStack);

    if (cursorQuantity === 0) {
        return {
            slot: null,
            cursorStack: withQuantity(slot, slotQuantity)
        };
    }

    if (slotQuantity === 0) {
        return {
            slot: withQuantity(cursorStack, cursorQuantity),
            cursorStack: null
        };
    }

    if (!isSameItem(slot, cursorStack)) {
        return {
            slot: withQuantity(cursorStack, cursorQuantity),
            cursorStack: withQuantity(slot, slotQuantity)
        };
    }

    const availableSpace = Math.max(0, getStackLimit(maxStack) - slotQuantity);
    const movedQuantity = Math.min(availableSpace, cursorQuantity);

    return {
        slot: withQuantity(slot, slotQuantity + movedQuantity),
        cursorStack: withQuantity(cursorStack, cursorQuantity - movedQuantity)
    };
}

export function applySecondaryClick(slot, cursorStack, maxStack = 64) {
    const slotQuantity = getQuantity(slot);
    const cursorQuantity = getQuantity(cursorStack);

    if (cursorQuantity === 0) {
        const pickedQuantity = Math.ceil(slotQuantity / 2);

        return {
            slot: withQuantity(slot, slotQuantity - pickedQuantity),
            cursorStack: withQuantity(slot, pickedQuantity)
        };
    }

    const canPlaceOne = slotQuantity === 0
        || (isSameItem(slot, cursorStack) && slotQuantity < getStackLimit(maxStack));

    if (!canPlaceOne) {
        return {
            slot: cloneStack(slot),
            cursorStack: cloneStack(cursorStack)
        };
    }

    return {
        slot: withQuantity(slot || cursorStack, slotQuantity + 1),
        cursorStack: withQuantity(cursorStack, cursorQuantity - 1)
    };
}

export function applyInventoryClick(
    slots,
    cursorStack,
    slotIndex,
    click = INVENTORY_CLICK.PRIMARY,
    maxStack = 64
) {
    const nextSlots = Array.isArray(slots) ? slots.map(cloneStack) : [];
    const index = Number(slotIndex);

    if (!Number.isInteger(index) || index < 0 || index >= nextSlots.length) {
        return {
            slots: nextSlots,
            cursorStack: cloneStack(cursorStack)
        };
    }

    const operation = click === INVENTORY_CLICK.SECONDARY
        ? applySecondaryClick
        : applyPrimaryClick;
    const result = operation(nextSlots[index], cursorStack, maxStack);
    nextSlots[index] = result.slot;

    return {
        slots: nextSlots,
        cursorStack: result.cursorStack
    };
}
