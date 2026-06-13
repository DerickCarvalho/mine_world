const B = '/assets/textures/mc/block/';

export const BLOCK_TEXTURE_CATALOG = Object.freeze({
    grass:        { top: { path: B + 'grass_block_top.png' },        side: { path: B + 'grass_block_side.png' },    bottom: { path: B + 'dirt.png' } },
    dirt:         { top: { path: B + 'dirt.png' },                   side: { path: B + 'dirt.png' },               bottom: { path: B + 'dirt.png' } },
    stone:        { top: { path: B + 'stone.png' },                  side: { path: B + 'stone.png' },              bottom: { path: B + 'stone.png' } },
    sand:         { top: { path: B + 'sand.png' },                   side: { path: B + 'sand.png' },               bottom: { path: B + 'sand.png' } },
    wood:         { top: { path: B + 'oak_log_top.png' },            side: { path: B + 'oak_log.png' },            bottom: { path: B + 'oak_log_top.png' } },
    leaves:       { top: { path: B + 'oak_leaves.png' },             side: { path: B + 'oak_leaves.png' },         bottom: { path: B + 'oak_leaves.png' } },
    bedrock:      { top: { path: B + 'bedrock.png' },                side: { path: B + 'bedrock.png' },            bottom: { path: B + 'bedrock.png' } },
    coal_ore:     { top: { path: B + 'coal_ore.png' },               side: { path: B + 'coal_ore.png' },           bottom: { path: B + 'coal_ore.png' } },
    iron_ore:     { top: { path: B + 'iron_ore.png' },               side: { path: B + 'iron_ore.png' },           bottom: { path: B + 'iron_ore.png' } },
    gold_ore:     { top: { path: B + 'gold_ore.png' },               side: { path: B + 'gold_ore.png' },           bottom: { path: B + 'gold_ore.png' } },
    planks:       { top: { path: B + 'oak_planks.png' },             side: { path: B + 'oak_planks.png' },         bottom: { path: B + 'oak_planks.png' } },
    cobblestone:  { top: { path: B + 'cobblestone.png' },            side: { path: B + 'cobblestone.png' },        bottom: { path: B + 'cobblestone.png' } },
    bricks:       { top: { path: B + 'bricks.png' },                 side: { path: B + 'bricks.png' },             bottom: { path: B + 'bricks.png' } },
    glass:        { top: { path: B + 'glass.png' },                  side: { path: B + 'glass.png' },              bottom: { path: B + 'glass.png' } },
    workbench:    { top: { path: B + 'crafting_table_top.png' },     side: { path: B + 'crafting_table_front.png' }, bottom: { path: B + 'oak_planks.png' } },
    furnace:      { top: { path: B + 'furnace_top.png' },            side: { path: B + 'furnace_front.png' },      bottom: { path: B + 'furnace_side.png' } },
    chest:        { top: { path: B + 'oak_planks.png' },             side: { path: B + 'oak_planks.png' },         bottom: { path: B + 'oak_planks.png' } },
    gravel:       { top: { path: B + 'gravel.png' },                 side: { path: B + 'gravel.png' },             bottom: { path: B + 'gravel.png' } },
    snow:         { top: { path: B + 'snow.png' },                   side: { path: B + 'snow.png' },               bottom: { path: B + 'snow.png' } },
    red_sand:     { top: { path: B + 'red_sand.png' },               side: { path: B + 'red_sand.png' },           bottom: { path: B + 'red_sand.png' } },
    cactus:       { top: { path: B + 'cactus_top.png' },             side: { path: B + 'cactus_side.png' },        bottom: { path: B + 'cactus_bottom.png' } },
    diamond_ore:  { top: { path: B + 'diamond_ore.png' },            side: { path: B + 'diamond_ore.png' },        bottom: { path: B + 'diamond_ore.png' } },
    lapis_ore:    { top: { path: B + 'lapis_ore.png' },              side: { path: B + 'lapis_ore.png' },          bottom: { path: B + 'lapis_ore.png' } },
    flower:       { top: { path: B + 'poppy.png' },                  side: { path: B + 'poppy.png' },              bottom: { path: B + 'poppy.png' } },
    tall_grass:   { top: { path: B + 'grass.png' },                  side: { path: B + 'grass.png' },              bottom: { path: B + 'grass.png' } },
    torch:        { top: { path: B + 'torch.png' },                   side: { path: B + 'torch.png' },              bottom: { path: B + 'torch.png' } },
});

export function getBlockFacePath(blockKey, direction) {
    const entry = BLOCK_TEXTURE_CATALOG[blockKey];
    if (!entry) { return null; }
    const bucket = direction === 'top' ? 'top' : direction === 'bottom' ? 'bottom' : 'side';
    return entry[bucket] ? entry[bucket].path : null;
}
