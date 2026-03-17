<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/../dependencias/utils.php';

$user = require_auth_user();
$service = new funcoesPDO();
$config = ensure_user_config($service, (int) $user['id']);

respond_ok('Configuracoes carregadas com sucesso.', $config);
