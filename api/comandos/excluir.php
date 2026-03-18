<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$commandId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);

if ($commandId === false || $commandId === null || (int) $commandId <= 0) {
    respond_error('Informe um comando valido para excluir.', 422);
}

$existing = find_runtime_command_by_id($service, (int) $commandId);
if ($existing === null) {
    respond_error('Comando nao encontrado.', 404);
}

$service->execute(
    'DELETE FROM comandos_runtime
     WHERE id = :id',
    [':id' => (int) $commandId]
);

respond_ok('Comando excluido com sucesso.', [
    'id' => (int) $commandId,
]);
