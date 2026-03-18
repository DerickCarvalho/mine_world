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
