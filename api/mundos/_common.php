<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/../dependencias/utils.php';

const WORLD_SAVE_SCHEMA_VERSION = 1;
const WORLD_MIN_X = -2500.0;
const WORLD_MAX_X = 2499.999;
const WORLD_MIN_Z = -2500.0;
const WORLD_MAX_Z = 2499.999;
const WORLD_MIN_Y = 0.0;
const WORLD_MAX_Y = 120.0;
const WORLD_MIN_PITCH = -1.3;
const WORLD_MAX_PITCH = 1.3;
const WORLD_TAU = M_PI * 2;

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

function normalize_world_save_state(?array $state): ?array
{
    if ($state === null) {
        return null;
    }

    $schemaVersion = (int) ($state['schema_version'] ?? WORLD_SAVE_SCHEMA_VERSION);
    if ($schemaVersion !== WORLD_SAVE_SCHEMA_VERSION) {
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

    $world = isset($state['world']) && is_array($state['world']) ? $state['world'] : [];
    $modifiedBlocks = isset($world['modified_blocks']) && is_array($world['modified_blocks'])
        ? array_values($world['modified_blocks'])
        : [];

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
        ],
        'world' => [
            'modified_blocks' => $modifiedBlocks,
        ],
    ];
}

function build_world_state_payload_from_row(array $row): ?array
{
    $decoded = decode_world_state_payload($row['estado_json'] ?? null);

    if ($decoded === null) {
        $decoded = [
            'schema_version' => (int) ($row['schema_version'] ?? WORLD_SAVE_SCHEMA_VERSION),
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
                'modified_blocks' => [],
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
