<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$worldId = (int) ($data['id'] ?? $data['id_mundo'] ?? 0);

if ($worldId <= 0) {
    respond_error('Informe um mundo valido para continuar.', 422);
}

$world = find_world_by_owner($service, $worldId, (int) $user['id']);

if ($world === null) {
    respond_error('Mundo nao encontrado para a conta autenticada.', 404);
}

$saveState = load_world_state_by_world_id($service, $worldId);

respond_ok(
    'Mundo carregado com sucesso.',
    [
        'world' => world_payload($world),
        'save_state' => $saveState,
    ]
);
