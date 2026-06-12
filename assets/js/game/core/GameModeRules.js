export const GAME_MODES = Object.freeze({
    SURVIVAL: 'survival',
    CREATIVE: 'creative'
});

export function normalizeGameMode(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === GAME_MODES.CREATIVE ? GAME_MODES.CREATIVE : GAME_MODES.SURVIVAL;
}

export function isCreativeMode(value) {
    return normalizeGameMode(value) === GAME_MODES.CREATIVE;
}

export function isSurvivalMode(value) {
    return normalizeGameMode(value) === GAME_MODES.SURVIVAL;
}
