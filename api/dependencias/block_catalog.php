<?php

declare(strict_types=1);

function block_catalog(): array
{
    static $catalog = null;

    if ($catalog !== null) {
        return $catalog;
    }

    $catalog = [
        [
            'id' => 1,
            'key' => 'grass',
            'name' => 'Grama',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 97, 'g' => 176, 'b' => 86],
                'side' => ['r' => 106, 'g' => 132, 'b' => 75],
                'bottom' => ['r' => 124, 'g' => 90, 'b' => 60],
            ],
        ],
        [
            'id' => 2,
            'key' => 'dirt',
            'name' => 'Terra',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 124, 'g' => 90, 'b' => 60],
                'side' => ['r' => 124, 'g' => 90, 'b' => 60],
                'bottom' => ['r' => 124, 'g' => 90, 'b' => 60],
            ],
        ],
        [
            'id' => 3,
            'key' => 'stone',
            'name' => 'Pedra',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 129, 'g' => 136, 'b' => 145],
                'side' => ['r' => 129, 'g' => 136, 'b' => 145],
                'bottom' => ['r' => 129, 'g' => 136, 'b' => 145],
            ],
        ],
        [
            'id' => 4,
            'key' => 'sand',
            'name' => 'Areia',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 214, 'g' => 198, 'b' => 126],
                'side' => ['r' => 214, 'g' => 198, 'b' => 126],
                'bottom' => ['r' => 214, 'g' => 198, 'b' => 126],
            ],
        ],
        [
            'id' => 5,
            'key' => 'water',
            'name' => 'Agua',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 76, 'g' => 144, 'b' => 212],
                'side' => ['r' => 76, 'g' => 144, 'b' => 212],
                'bottom' => ['r' => 76, 'g' => 144, 'b' => 212],
            ],
        ],
        [
            'id' => 6,
            'key' => 'wood',
            'name' => 'Madeira',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 132, 'g' => 97, 'b' => 59],
                'side' => ['r' => 132, 'g' => 97, 'b' => 59],
                'bottom' => ['r' => 132, 'g' => 97, 'b' => 59],
            ],
        ],
        [
            'id' => 7,
            'key' => 'leaves',
            'name' => 'Folhas',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 78, 'g' => 148, 'b' => 77],
                'side' => ['r' => 78, 'g' => 148, 'b' => 77],
                'bottom' => ['r' => 78, 'g' => 148, 'b' => 77],
            ],
        ],
        [
            'id' => 8,
            'key' => 'bedrock',
            'name' => 'Bedrock',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 42, 'g' => 47, 'b' => 54],
                'side' => ['r' => 42, 'g' => 47, 'b' => 54],
                'bottom' => ['r' => 42, 'g' => 47, 'b' => 54],
            ],
        ],
        [
            'id' => 9,
            'key' => 'coal_ore',
            'name' => 'Minerio de Carvao',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 92, 'g' => 96, 'b' => 102],
                'side' => ['r' => 92, 'g' => 96, 'b' => 102],
                'bottom' => ['r' => 92, 'g' => 96, 'b' => 102],
            ],
        ],
        [
            'id' => 10,
            'key' => 'iron_ore',
            'name' => 'Minerio de Ferro',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 168, 'g' => 138, 'b' => 112],
                'side' => ['r' => 168, 'g' => 138, 'b' => 112],
                'bottom' => ['r' => 168, 'g' => 138, 'b' => 112],
            ],
        ],
        [
            'id' => 11,
            'key' => 'gold_ore',
            'name' => 'Minerio de Ouro',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 198, 'g' => 168, 'b' => 74],
                'side' => ['r' => 198, 'g' => 168, 'b' => 74],
                'bottom' => ['r' => 198, 'g' => 168, 'b' => 74],
            ],
        ],
        [
            'id' => 12,
            'key' => 'planks',
            'name' => 'Tabuas',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 184, 'g' => 142, 'b' => 84],
                'side' => ['r' => 184, 'g' => 142, 'b' => 84],
                'bottom' => ['r' => 184, 'g' => 142, 'b' => 84],
            ],
        ],
        [
            'id' => 13,
            'key' => 'cobblestone',
            'name' => 'Pedregulho',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 104, 'g' => 110, 'b' => 118],
                'side' => ['r' => 104, 'g' => 110, 'b' => 118],
                'bottom' => ['r' => 104, 'g' => 110, 'b' => 118],
            ],
        ],
        [
            'id' => 14,
            'key' => 'bricks',
            'name' => 'Tijolos',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 156, 'g' => 82, 'b' => 66],
                'side' => ['r' => 156, 'g' => 82, 'b' => 66],
                'bottom' => ['r' => 156, 'g' => 82, 'b' => 66],
            ],
        ],
        [
            'id' => 15,
            'key' => 'glass',
            'name' => 'Vidro',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 188, 'g' => 216, 'b' => 226],
                'side' => ['r' => 188, 'g' => 216, 'b' => 226],
                'bottom' => ['r' => 188, 'g' => 216, 'b' => 226],
            ],
        ],
        [
            'id' => 16,
            'key' => 'stick',
            'name' => 'Graveto',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 156, 'g' => 118, 'b' => 72],
                'side' => ['r' => 156, 'g' => 118, 'b' => 72],
                'bottom' => ['r' => 156, 'g' => 118, 'b' => 72],
            ],
        ],
        [
            'id' => 17,
            'key' => 'workbench',
            'name' => 'Bancada',
            'texturable' => true,
            'base_colors' => [
                'top' => ['r' => 142, 'g' => 96, 'b' => 54],
                'side' => ['r' => 126, 'g' => 84, 'b' => 48],
                'bottom' => ['r' => 110, 'g' => 74, 'b' => 42],
            ],
        ],
        [
            'id' => 18,
            'key' => 'wood_pickaxe',
            'name' => 'Picareta de Madeira',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 188, 'g' => 144, 'b' => 86],
                'side' => ['r' => 188, 'g' => 144, 'b' => 86],
                'bottom' => ['r' => 188, 'g' => 144, 'b' => 86],
            ],
        ],
        [
            'id' => 19,
            'key' => 'wood_axe',
            'name' => 'Machado de Madeira',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 176, 'g' => 124, 'b' => 78],
                'side' => ['r' => 176, 'g' => 124, 'b' => 78],
                'bottom' => ['r' => 176, 'g' => 124, 'b' => 78],
            ],
        ],
        [
            'id' => 20,
            'key' => 'wood_sword',
            'name' => 'Espada de Madeira',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 198, 'g' => 154, 'b' => 94],
                'side' => ['r' => 198, 'g' => 154, 'b' => 94],
                'bottom' => ['r' => 198, 'g' => 154, 'b' => 94],
            ],
        ],
        [
            'id' => 21,
            'key' => 'stone_pickaxe',
            'name' => 'Picareta de Pedra',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 138, 'g' => 144, 'b' => 154],
                'side' => ['r' => 138, 'g' => 144, 'b' => 154],
                'bottom' => ['r' => 138, 'g' => 144, 'b' => 154],
            ],
        ],
        [
            'id' => 22,
            'key' => 'stone_axe',
            'name' => 'Machado de Pedra',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 126, 'g' => 132, 'b' => 142],
                'side' => ['r' => 126, 'g' => 132, 'b' => 142],
                'bottom' => ['r' => 126, 'g' => 132, 'b' => 142],
            ],
        ],
        [
            'id' => 23,
            'key' => 'stone_sword',
            'name' => 'Espada de Pedra',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 164, 'g' => 170, 'b' => 180],
                'side' => ['r' => 164, 'g' => 170, 'b' => 180],
                'bottom' => ['r' => 164, 'g' => 170, 'b' => 180],
            ],
        ],
        [
            'id' => 24,
            'key' => 'raw_pork',
            'name' => 'Carne Crua',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 214, 'g' => 132, 'b' => 136],
                'side' => ['r' => 214, 'g' => 132, 'b' => 136],
                'bottom' => ['r' => 214, 'g' => 132, 'b' => 136],
            ],
        ],
        [
            'id' => 25,
            'key' => 'cloth',
            'name' => 'L',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 226, 'g' => 228, 'b' => 232],
                'side' => ['r' => 226, 'g' => 228, 'b' => 232],
                'bottom' => ['r' => 226, 'g' => 228, 'b' => 232],
            ],
        ],
        [
            'id' => 26,
            'key' => 'fang',
            'name' => 'Presa',
            'texturable' => false,
            'base_colors' => [
                'top' => ['r' => 212, 'g' => 214, 'b' => 188],
                'side' => ['r' => 212, 'g' => 214, 'b' => 188],
                'bottom' => ['r' => 212, 'g' => 214, 'b' => 188],
            ],
        ],
    ];

    return $catalog;
}

function block_catalog_by_key(): array
{
    static $map = null;

    if ($map !== null) {
        return $map;
    }

    $map = [];
    foreach (block_catalog() as $block) {
        $map[$block['key']] = $block;
    }

    return $map;
}

function get_block_catalog_entry(string $blockKey): ?array
{
    $map = block_catalog_by_key();
    return $map[$blockKey] ?? null;
}
