<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();
$data = request_data();

$validatedOnly = normalize_bool($data['validated'] ?? 0) === 1;
$activeOnly = normalize_bool($data['active'] ?? 0) === 1;

respond_ok('Comandos carregados com sucesso.', [
    'commands' => list_runtime_commands($service, $validatedOnly, $activeOnly),
]);
