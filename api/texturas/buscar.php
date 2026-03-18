<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$blockKey = normalize_texture_block_key($data['block_key'] ?? '');
$block = get_texture_block_or_fail($blockKey);
$row = find_texture_row($service, $blockKey);

respond_ok('Textura do bloco carregada com sucesso.', build_texture_payload($block, $row));
