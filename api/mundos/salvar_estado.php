<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$worldId = (int) ($data['id'] ?? $data['id_mundo'] ?? 0);
$rawState = $data['state'] ?? null;
$state = decode_world_state_payload($rawState);

if ($worldId <= 0) {
    respond_error('Informe um mundo valido para salvar.', 422);
}

if (!is_array($state)) {
    respond_error('Informe um estado valido para salvar o mundo.', 422);
}

$world = find_world_by_owner($service, $worldId, (int) $user['id']);

if ($world === null) {
    respond_error('Mundo nao encontrado para a conta autenticada.', 404);
}

$savedState = save_world_state($service, $worldId, $state);
$freshWorld = find_world_by_owner($service, $worldId, (int) $user['id']);

respond_ok(
    'Estado do mundo salvo com sucesso.',
    [
        'world' => $freshWorld ? world_payload($freshWorld) : world_payload($world),
        'save_state' => $savedState,
    ]
);
