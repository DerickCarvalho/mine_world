<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$worldId = (int) ($data['id'] ?? $data['id_mundo'] ?? 0);
$chunks = world_normalize_chunk_requests($data['chunks'] ?? []);

if ($worldId <= 0) {
    respond_error('Informe um mundo valido para carregar os chunks.', 422);
}

$world = find_world_by_owner($service, $worldId, (int) $user['id']);
if ($world === null) {
    respond_error('Mundo nao encontrado para a conta autenticada.', 404);
}

if ($chunks === []) {
    respond_ok(
        'Nenhum chunk solicitado.',
        [
            'chunks' => [],
            'cached_chunks_count' => world_count_cached_chunks_by_world_id($service, $worldId),
        ]
    );
}

$savedChunks = load_world_chunks_by_world_id_and_coords($service, $worldId, $chunks);

respond_ok(
    'Chunks carregados com sucesso.',
    [
        'chunks' => array_map(static function (array $chunk): array {
            return [
                'chunk_x' => (int) $chunk['chunk_x'],
                'chunk_z' => (int) $chunk['chunk_z'],
                'schema_version' => (int) $chunk['schema_version'],
                'data_base64' => $chunk['data_base64'],
                'atualizado_em' => $chunk['atualizado_em'],
            ];
        }, $savedChunks),
        'cached_chunks_count' => world_count_cached_chunks_by_world_id($service, $worldId),
    ]
);
