<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$blockKey = normalize_texture_block_key($data['block_key'] ?? '');
$block = get_texture_block_or_fail($blockKey);
$current = find_texture_row($service, $blockKey);

if ($current === null) {
    respond_ok('Nenhuma textura cadastrada para remover.', build_texture_payload($block, null));
}

$service->execute(
    'DELETE FROM blocos_texturas
     WHERE block_key = :block_key',
    [':block_key' => $blockKey]
);

delete_texture_file($current['top_filename'] ?? null);
delete_texture_file($current['side_filename'] ?? null);
delete_texture_file($current['bottom_filename'] ?? null);

respond_ok('Texturas removidas com sucesso.', build_texture_payload($block, null));
