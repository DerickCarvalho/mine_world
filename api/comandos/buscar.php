<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();
$data = request_data();

$commandId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
$commandKey = normalize_command_key($data['command_key'] ?? '');

$command = null;
if ($commandId !== false && $commandId !== null && (int) $commandId > 0) {
    $command = find_runtime_command_by_id($service, (int) $commandId);
} elseif ($commandKey !== '') {
    $command = find_runtime_command_by_key($service, $commandKey);
}

if ($command === null) {
    respond_error('Comando nao encontrado.', 404);
}

respond_ok('Comando carregado com sucesso.', $command);
