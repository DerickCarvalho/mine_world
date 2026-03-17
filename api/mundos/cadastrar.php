<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$worldName = validate_world_name((string) ($data['nome'] ?? ''));
$seed = normalize_world_seed($data['seed'] ?? null);
$algorithmVersion = 'v1';

$worldId = $service->insert(
    'INSERT INTO mundos (usuario_id, nome, seed, algorithm_version)
     VALUES (:usuario_id, :nome, :seed, :algorithm_version)',
    [
        ':usuario_id' => (int) $user['id'],
        ':nome' => $worldName,
        ':seed' => $seed,
        ':algorithm_version' => $algorithmVersion,
    ]
);

$world = find_world_by_owner($service, $worldId, (int) $user['id']);

if ($world === null) {
    respond_error('O mundo foi criado, mas nao foi possivel carregar os metadados.', 500);
}

respond_ok(
    'Mundo criado com sucesso.',
    [
        'world' => world_payload($world),
    ],
    201
);
