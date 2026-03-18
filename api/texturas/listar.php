<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();

respond_ok('Texturas carregadas com sucesso.', [
    'blocks' => list_texture_catalog($service),
    'max_texture_bytes' => TEXTURE_MAX_BYTES,
]);
