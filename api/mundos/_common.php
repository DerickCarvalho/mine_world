<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/../dependencias/utils.php';

const WORLD_SAVE_SCHEMA_VERSION = 3;
const WORLD_PLAYER_MAX_HEALTH = 10;
const WORLD_INVENTORY_SLOT_COUNT = 27;
const WORLD_HOTBAR_SLOT_COUNT = 9;
const WORLD_MAX_STACK_SIZE = 64;
const WORLD_MAX_MUTATIONS = 8000;
const WORLD_MIN_X = -1000.0;
const WORLD_MAX_X = 999.999;
const WORLD_MIN_Z = -1000.0;
const WORLD_MAX_Z = 999.999;
const WORLD_MIN_Y = 0.0;
const WORLD_MAX_Y = 100.0;
const WORLD_BLOCK_MIN_Y = 0;
const WORLD_BLOCK_MAX_Y = 99;
const WORLD_MIN_PITCH = -1.3;
const WORLD_MAX_PITCH = 1.3;
const WORLD_TAU = M_PI * 2;
const WORLD_ALLOWED_BLOCK_IDS = ['air', 'grass', 'dirt', 'stone', 'sand', 'water', 'wood', 'leaves', 'bedrock'];
const WORLD_INVENTORY_BLOCK_IDS = ['grass', 'dirt', 'stone', 'sand', 'wood', 'leaves'];
const WORLD_CHUNK_SIZE = 16;
const WORLD_CHUNK_HEIGHT = 100;
const WORLD_CHUNK_SCHEMA_VERSION = 1;
const WORLD_MAX_CHUNK_BATCH = 64;
const WORLD_CHUNK_DATA_BYTES = WORLD_CHUNK_SIZE * WORLD_CHUNK_SIZE * WORLD_CHUNK_HEIGHT;
const WORLD_MIN_CHUNK_X = -63;
const WORLD_MAX_CHUNK_X = 62;
const WORLD_MIN_CHUNK_Z = -63;
const WORLD_MAX_CHUNK_Z = 62;

function world_payload(array $world): array
{
    return [
        'id' => (int) $world['id'],
        'nome' => $world['nome'],
        'seed' => $world['seed'],
        'algorithm_version' => $world['algorithm_version'],
        'ultimo_jogado_em' => $world['ultimo_jogado_em'],
        'criado_em' => $world['criado_em'],
        'atualizado_em' => $world['atualizado_em'],
    ];
}

function world_text_length(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value);
    }

    return strlen($value);
}

function validate_world_name(string $name): string
{
    $normalized = trim($name);

    if (world_text_length($normalized) < 3) {
        respond_error('O nome do mundo precisa ter pelo menos 3 caracteres.', 422);
    }

    if (world_text_length($normalized) > 80) {
        respond_error('O nome do mundo pode ter no maximo 80 caracteres.', 422);
    }

    return $normalized;
}

function normalize_world_seed(?string $seed): string
{
    $normalized = trim((string) $seed);

    if ($normalized === '') {
        return strtoupper(bin2hex(random_bytes(8)));
    }

    if (world_text_length($normalized) > 32) {
        respond_error('A seed pode ter no maximo 32 caracteres.', 422);
    }

    return $normalized;
}

function find_world_by_owner(funcoesPDO $service, int $worldId, int $userId): ?array
{
    return $service->selectOne(
        'SELECT id, usuario_id, nome, seed, algorithm_version, ultimo_jogado_em, criado_em, atualizado_em
         FROM mundos
         WHERE id = :id AND usuario_id = :usuario_id
         LIMIT 1',
        [
            ':id' => $worldId,
            ':usuario_id' => $userId,
        ]
    );
}

function world_numeric_or_null($value): ?float
{
    if (is_int($value) || is_float($value)) {
        $number = (float) $value;
        return is_finite($number) ? $number : null;
    }

    if (is_string($value)) {
        $trimmed = trim($value);
        if ($trimmed === '' || !is_numeric($trimmed)) {
            return null;
        }

        $number = (float) $trimmed;
        return is_finite($number) ? $number : null;
    }

    return null;
}

function world_normalize_angle(float $angle): float
{
    $normalized = fmod($angle, WORLD_TAU);

    if ($normalized > M_PI) {
        $normalized -= WORLD_TAU;
    }

    if ($normalized < -M_PI) {
        $normalized += WORLD_TAU;
    }

    return $normalized;
}

function world_clamp(float $value, float $min, float $max): float
{
    return max($min, min($max, $value));
}

function world_clamp_int(int $value, int $min, int $max): int
{
    return max($min, min($max, $value));
}

function world_normalize_bool($value): bool
{
    return $value === true || $value === 1 || $value === '1';
}

function world_normalize_optional_position($value): ?array
{
    if (!is_array($value)) {
        return null;
    }

    $x = world_numeric_or_null($value['x'] ?? null);
    $y = world_numeric_or_null($value['y'] ?? null);
    $z = world_numeric_or_null($value['z'] ?? null);

    if ($x === null || $y === null || $z === null) {
        return null;
    }

    if ($x < WORLD_MIN_X || $x > WORLD_MAX_X || $z < WORLD_MIN_Z || $z > WORLD_MAX_Z || $y < WORLD_MIN_Y || $y > WORLD_MAX_Y) {
        return null;
    }

    return [
        'x' => round($x, 3),
        'y' => round($y, 3),
        'z' => round($z, 3),
    ];
}

function decode_world_state_payload($rawState): ?array
{
    if (is_array($rawState)) {
        return $rawState;
    }

    if (!is_string($rawState) || trim($rawState) === '') {
        return null;
    }

    $decoded = json_decode($rawState, true);
    return is_array($decoded) ? $decoded : null;
}

function world_is_allowed_block_id(string $blockId): bool
{
    return in_array($blockId, WORLD_ALLOWED_BLOCK_IDS, true);
}

function world_is_inventory_block_id(string $blockId): bool
{
    return in_array($blockId, WORLD_INVENTORY_BLOCK_IDS, true);
}

function world_normalize_block_id($value, bool $allowAir = true, bool $inventoryOnly = false): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }

    $normalized = strtolower(trim($value));
    if (!$allowAir && $normalized === 'air') {
        return null;
    }

    if ($inventoryOnly) {
        return world_is_inventory_block_id($normalized) ? $normalized : null;
    }

    return world_is_allowed_block_id($normalized) ? $normalized : null;
}

function world_normalize_inventory_slot($slot): ?array
{
    if (!is_array($slot)) {
        return null;
    }

    $blockId = world_normalize_block_id($slot['block_id'] ?? null, false, true);
    $quantity = filter_var($slot['quantity'] ?? null, FILTER_VALIDATE_INT);

    if ($blockId === null || $quantity === false || $quantity <= 0) {
        return null;
    }

    return [
        'block_id' => $blockId,
        'quantity' => world_clamp_int((int) $quantity, 1, WORLD_MAX_STACK_SIZE),
    ];
}

function world_normalize_inventory_slots($slots): array
{
    $source = is_array($slots) ? array_values($slots) : [];
    $normalized = [];

    for ($index = 0; $index < WORLD_INVENTORY_SLOT_COUNT; $index += 1) {
        $normalized[] = world_normalize_inventory_slot($source[$index] ?? null);
    }

    return $normalized;
}

function world_normalize_mutations($mutations): ?array
{
    if (!is_array($mutations)) {
        return [];
    }

    $deduped = [];

    foreach ($mutations as $mutation) {
        if (!is_array($mutation)) {
            continue;
        }

        $x = filter_var($mutation['x'] ?? null, FILTER_VALIDATE_INT);
        $y = filter_var($mutation['y'] ?? null, FILTER_VALIDATE_INT);
        $z = filter_var($mutation['z'] ?? null, FILTER_VALIDATE_INT);
        $blockId = world_normalize_block_id($mutation['block_id'] ?? null, true, false);

        if ($x === false || $y === false || $z === false || $blockId === null) {
            continue;
        }

        if ($x < WORLD_MIN_X || $x > WORLD_MAX_X || $z < WORLD_MIN_Z || $z > WORLD_MAX_Z || $y < WORLD_BLOCK_MIN_Y || $y > WORLD_BLOCK_MAX_Y) {
            continue;
        }

        $deduped[$x . ':' . $y . ':' . $z] = [
            'x' => (int) $x,
            'y' => (int) $y,
            'z' => (int) $z,
            'block_id' => $blockId,
        ];
    }

    if (count($deduped) > WORLD_MAX_MUTATIONS) {
        return null;
    }

    return array_values($deduped);
}

function normalize_world_save_state(?array $state): ?array
{
    if ($state === null) {
        return null;
    }

    $schemaVersion = (int) ($state['schema_version'] ?? 1);
    if (!in_array($schemaVersion, [1, 2, WORLD_SAVE_SCHEMA_VERSION], true)) {
        return null;
    }

    $player = isset($state['player']) && is_array($state['player']) ? $state['player'] : null;
    if ($player === null) {
        return null;
    }

    $position = isset($player['position']) && is_array($player['position']) ? $player['position'] : null;
    $rotation = isset($player['rotation']) && is_array($player['rotation']) ? $player['rotation'] : null;

    if ($position === null || $rotation === null) {
        return null;
    }

    $x = world_numeric_or_null($position['x'] ?? null);
    $y = world_numeric_or_null($position['y'] ?? null);
    $z = world_numeric_or_null($position['z'] ?? null);
    $yaw = world_numeric_or_null($rotation['yaw'] ?? null);
    $pitch = world_numeric_or_null($rotation['pitch'] ?? null);

    if ($x === null || $y === null || $z === null || $yaw === null || $pitch === null) {
        return null;
    }

    if ($x < WORLD_MIN_X || $x > WORLD_MAX_X || $z < WORLD_MIN_Z || $z > WORLD_MAX_Z || $y < WORLD_MIN_Y || $y > WORLD_MAX_Y) {
        return null;
    }

    $selectedHotbarIndex = world_clamp_int((int) ($player['selected_hotbar_index'] ?? 0), 0, WORLD_HOTBAR_SLOT_COUNT - 1);
    $inventory = isset($state['inventory']) && is_array($state['inventory']) ? $state['inventory'] : [];
    $world = isset($state['world']) && is_array($state['world']) ? $state['world'] : [];
    $mutations = world_normalize_mutations($world['block_mutations'] ?? $world['modified_blocks'] ?? []);

    if ($mutations === null) {
        return null;
    }

    $rawHealth = filter_var($player['health'] ?? WORLD_PLAYER_MAX_HEALTH, FILTER_VALIDATE_INT);
    $health = $rawHealth === false ? WORLD_PLAYER_MAX_HEALTH : world_clamp_int((int) $rawHealth, 0, WORLD_PLAYER_MAX_HEALTH);
    $dead = world_normalize_bool($player['dead'] ?? false) || $health <= 0;
    $flyEnabled = world_normalize_bool($player['fly_enabled'] ?? false);
    $flyActive = $flyEnabled && world_normalize_bool($player['fly_active'] ?? false);
    $spawnPosition = world_normalize_optional_position($player['spawn_position'] ?? null);

    return [
        'schema_version' => WORLD_SAVE_SCHEMA_VERSION,
        'player' => [
            'position' => [
                'x' => round($x, 3),
                'y' => round($y, 3),
                'z' => round($z, 3),
            ],
            'rotation' => [
                'yaw' => round(world_normalize_angle($yaw), 6),
                'pitch' => round(world_clamp($pitch, WORLD_MIN_PITCH, WORLD_MAX_PITCH), 6),
            ],
            'selected_hotbar_index' => $selectedHotbarIndex,
            'health' => $dead ? 0 : $health,
            'max_health' => WORLD_PLAYER_MAX_HEALTH,
            'dead' => $dead ? 1 : 0,
            'fly_enabled' => $flyEnabled ? 1 : 0,
            'fly_active' => $flyActive ? 1 : 0,
            'spawn_position' => $spawnPosition,
        ],
        'inventory' => [
            'slots' => world_normalize_inventory_slots($inventory['slots'] ?? []),
        ],
        'world' => [
            'block_mutations' => $mutations,
        ],
    ];
}

function build_world_state_payload_from_row(array $row): ?array
{
    $decoded = decode_world_state_payload($row['estado_json'] ?? null);

    if ($decoded === null) {
        $decoded = [
            'schema_version' => (int) ($row['schema_version'] ?? 1),
            'player' => [
                'position' => [
                    'x' => (float) ($row['player_x'] ?? 0),
                    'y' => (float) ($row['player_y'] ?? 0),
                    'z' => (float) ($row['player_z'] ?? 0),
                ],
                'rotation' => [
                    'yaw' => (float) ($row['player_yaw'] ?? 0),
                    'pitch' => (float) ($row['player_pitch'] ?? 0),
                ],
            ],
            'world' => [
                'block_mutations' => [],
            ],
        ];
    }

    $normalized = normalize_world_save_state($decoded);
    if ($normalized === null) {
        return null;
    }

    $normalized['saved_at'] = $row['salvo_em'] ?? null;
    return $normalized;
}

function load_world_state_by_world_id(funcoesPDO $service, int $worldId): ?array
{
    $row = $service->selectOne(
        'SELECT mundo_id, schema_version, player_x, player_y, player_z, player_yaw, player_pitch, estado_json, salvo_em
         FROM mundos_estado
         WHERE mundo_id = :mundo_id
         LIMIT 1',
        [':mundo_id' => $worldId]
    );

    if ($row === null) {
        return null;
    }

    return build_world_state_payload_from_row($row);
}

function save_world_state(funcoesPDO $service, int $worldId, array $state): array
{
    $normalizedState = normalize_world_save_state($state);
    if ($normalizedState === null) {
        respond_error('O estado informado para salvar o mundo e invalido.', 422);
    }

    $jsonPayload = json_encode($normalizedState, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($jsonPayload)) {
        respond_error('Nao foi possivel serializar o estado do mundo para salvamento.', 500);
    }

    $service->transaction(function (PDO $db, funcoesPDO $pdo) use ($worldId, $normalizedState, $jsonPayload): void {
        $pdo->execute(
            'INSERT INTO mundos_estado
                (mundo_id, schema_version, player_x, player_y, player_z, player_yaw, player_pitch, estado_json, salvo_em)
             VALUES
                (:mundo_id, :schema_version, :player_x, :player_y, :player_z, :player_yaw, :player_pitch, :estado_json, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE
                schema_version = VALUES(schema_version),
                player_x = VALUES(player_x),
                player_y = VALUES(player_y),
                player_z = VALUES(player_z),
                player_yaw = VALUES(player_yaw),
                player_pitch = VALUES(player_pitch),
                estado_json = VALUES(estado_json),
                salvo_em = CURRENT_TIMESTAMP',
            [
                ':mundo_id' => $worldId,
                ':schema_version' => $normalizedState['schema_version'],
                ':player_x' => $normalizedState['player']['position']['x'],
                ':player_y' => $normalizedState['player']['position']['y'],
                ':player_z' => $normalizedState['player']['position']['z'],
                ':player_yaw' => $normalizedState['player']['rotation']['yaw'],
                ':player_pitch' => $normalizedState['player']['rotation']['pitch'],
                ':estado_json' => $jsonPayload,
            ]
        );

        $pdo->execute(
            'UPDATE mundos
             SET ultimo_jogado_em = CURRENT_TIMESTAMP
             WHERE id = :id',
            [':id' => $worldId]
        );
    });

    $savedState = load_world_state_by_world_id($service, $worldId);
    if ($savedState !== null) {
        return $savedState;
    }

    $normalizedState['saved_at'] = date('Y-m-d H:i:s');
    return $normalizedState;
}

function world_chunk_key(int $chunkX, int $chunkZ): string
{
    return $chunkX . ':' . $chunkZ;
}

function world_is_valid_chunk_coord(int $chunkX, int $chunkZ): bool
{
    if ($chunkX < WORLD_MIN_CHUNK_X || $chunkX > WORLD_MAX_CHUNK_X || $chunkZ < WORLD_MIN_CHUNK_Z || $chunkZ > WORLD_MAX_CHUNK_Z) {
        return false;
    }

    $startX = $chunkX * WORLD_CHUNK_SIZE;
    $endX = $startX + WORLD_CHUNK_SIZE - 1;
    $startZ = $chunkZ * WORLD_CHUNK_SIZE;
    $endZ = $startZ + WORLD_CHUNK_SIZE - 1;

    return $endX >= (int) WORLD_MIN_X
        && $startX <= (int) WORLD_MAX_X
        && $endZ >= (int) WORLD_MIN_Z
        && $startZ <= (int) WORLD_MAX_Z;
}

function world_normalize_chunk_requests($chunks): array
{
    if (!is_array($chunks)) {
        return [];
    }

    $deduped = [];

    foreach ($chunks as $chunk) {
        if (!is_array($chunk)) {
            continue;
        }

        $chunkX = filter_var($chunk['chunk_x'] ?? null, FILTER_VALIDATE_INT);
        $chunkZ = filter_var($chunk['chunk_z'] ?? null, FILTER_VALIDATE_INT);

        if ($chunkX === false || $chunkZ === false) {
            continue;
        }

        $chunkX = (int) $chunkX;
        $chunkZ = (int) $chunkZ;

        if (!world_is_valid_chunk_coord($chunkX, $chunkZ)) {
            continue;
        }

        $deduped[world_chunk_key($chunkX, $chunkZ)] = [
            'chunk_x' => $chunkX,
            'chunk_z' => $chunkZ,
        ];
    }

    if (count($deduped) > WORLD_MAX_CHUNK_BATCH) {
        respond_error('O lote de chunks excede o limite permitido nesta fase.', 422);
    }

    return array_values($deduped);
}

function world_normalize_chunk_payloads($chunks): array
{
    if (!is_array($chunks)) {
        return [];
    }

    $normalized = [];

    foreach ($chunks as $chunk) {
        if (!is_array($chunk)) {
            continue;
        }

        $requests = world_normalize_chunk_requests([[
            'chunk_x' => $chunk['chunk_x'] ?? null,
            'chunk_z' => $chunk['chunk_z'] ?? null,
        ]]);

        if (count($requests) !== 1) {
            continue;
        }

        $base64 = trim((string) ($chunk['data_base64'] ?? ''));
        if ($base64 === '') {
            continue;
        }

        $decoded = base64_decode($base64, true);
        if (!is_string($decoded) || strlen($decoded) !== WORLD_CHUNK_DATA_BYTES) {
            continue;
        }

        $normalized[world_chunk_key($requests[0]['chunk_x'], $requests[0]['chunk_z'])] = [
            'chunk_x' => $requests[0]['chunk_x'],
            'chunk_z' => $requests[0]['chunk_z'],
            'schema_version' => WORLD_CHUNK_SCHEMA_VERSION,
            'data_base64' => base64_encode($decoded),
        ];
    }

    if (count($normalized) > WORLD_MAX_CHUNK_BATCH) {
        respond_error('O lote de chunks excede o limite permitido nesta fase.', 422);
    }

    return array_values($normalized);
}

function world_count_cached_chunks_by_world_id(funcoesPDO $service, int $worldId): int
{
    $row = $service->selectOne(
        'SELECT COUNT(*) AS total
         FROM mundos_chunks
         WHERE mundo_id = :mundo_id',
        [':mundo_id' => $worldId]
    );

    return (int) ($row['total'] ?? 0);
}

function load_world_chunks_by_world_id_and_coords(funcoesPDO $service, int $worldId, array $chunks): array
{
    $requested = world_normalize_chunk_requests($chunks);
    if ($requested === []) {
        return [];
    }

    $conditions = [];
    $params = [':mundo_id' => $worldId];

    foreach ($requested as $index => $chunk) {
        $conditions[] = '(chunk_x = :chunk_x_' . $index . ' AND chunk_z = :chunk_z_' . $index . ')';
        $params[':chunk_x_' . $index] = $chunk['chunk_x'];
        $params[':chunk_z_' . $index] = $chunk['chunk_z'];
    }

    return $service->select(
        'SELECT chunk_x, chunk_z, schema_version, data_base64, atualizado_em
         FROM mundos_chunks
         WHERE mundo_id = :mundo_id
           AND (' . implode(' OR ', $conditions) . ')
         ORDER BY chunk_x ASC, chunk_z ASC',
        $params
    );
}

function save_world_chunks(funcoesPDO $service, int $worldId, array $chunks): array
{
    $normalizedChunks = world_normalize_chunk_payloads($chunks);
    if ($normalizedChunks === []) {
        return [
            'saved_count' => 0,
            'cached_chunks_count' => world_count_cached_chunks_by_world_id($service, $worldId),
        ];
    }

    $service->transaction(function (PDO $db) use ($worldId, $normalizedChunks): void {
        $statement = $db->prepare(
            'INSERT INTO mundos_chunks
                (mundo_id, chunk_x, chunk_z, schema_version, data_base64, criado_em, atualizado_em)
             VALUES
                (:mundo_id, :chunk_x, :chunk_z, :schema_version, :data_base64, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE
                schema_version = VALUES(schema_version),
                data_base64 = VALUES(data_base64),
                atualizado_em = CURRENT_TIMESTAMP'
        );

        foreach ($normalizedChunks as $chunk) {
            $statement->execute([
                ':mundo_id' => $worldId,
                ':chunk_x' => $chunk['chunk_x'],
                ':chunk_z' => $chunk['chunk_z'],
                ':schema_version' => $chunk['schema_version'],
                ':data_base64' => $chunk['data_base64'],
            ]);
        }
    });

    return [
        'saved_count' => count($normalizedChunks),
        'cached_chunks_count' => world_count_cached_chunks_by_world_id($service, $worldId),
    ];
}
