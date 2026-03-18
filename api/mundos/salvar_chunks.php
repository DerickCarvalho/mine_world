<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$worldId = (int) ($data['id'] ?? $data['id_mundo'] ?? 0);
$chunks = world_normalize_chunk_payloads($data['chunks'] ?? []);

if ($worldId <= 0) {
    respond_error('Informe um mundo valido para salvar os chunks.', 422);
}

$world = find_world_by_owner($service, $worldId, (int) $user['id']);
if ($world === null) {
    respond_error('Mundo nao encontrado para a conta autenticada.', 404);
}

$result = save_world_chunks($service, $worldId, $chunks);

respond_ok(
    'Chunks salvos com sucesso.',
    [
        'saved_count' => $result['saved_count'],
        'cached_chunks_count' => $result['cached_chunks_count'],
    ]
);
