<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/utils.php';

function normalize_command_key($value): string
{
    $normalized = strtolower(trim((string) $value));
    $normalized = preg_replace('/[^a-z0-9_]/', '', $normalized) ?? '';
    return ltrim($normalized, '/');
}

function normalize_command_label($value): string
{
    return trim((string) $value);
}

function normalize_command_description($value): string
{
    return trim((string) $value);
}

function normalize_command_text_for_match(string $value): string
{
    $normalized = function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);

    return strtr($normalized, [
        'a' => 'a',
        'á' => 'a',
        'à' => 'a',
        'ã' => 'a',
        'â' => 'a',
        'é' => 'e',
        'ê' => 'e',
        'í' => 'i',
        'ó' => 'o',
        'ô' => 'o',
        'õ' => 'o',
        'ú' => 'u',
        'ç' => 'c',
    ]);
}

function command_capability_catalog(): array
{
    return [
        'teleport' => [
            'label' => 'Teleporte',
            'hint' => 'Teletransporta o jogador para as coordenadas informadas.',
            'usage_pattern' => '/%s x y z',
            'keywords' => [
                'teleport',
                'teletransport',
                'teleporte',
                'tp',
                'mover instantaneamente',
                'transportar para coordenadas',
            ],
        ],
    ];
}

function evaluate_command_request(string $commandKey, string $description, string $label): array
{
    $normalizedDescription = normalize_command_text_for_match($description);
    $catalog = command_capability_catalog();

    foreach ($catalog as $capabilityKey => $capability) {
        foreach ($capability['keywords'] as $keyword) {
            if (str_contains($normalizedDescription, $keyword) || $commandKey === 'tp') {
                return [
                    'possible' => true,
                    'capability_key' => $capabilityKey,
                    'validation_status' => 'validated',
                    'validation_reason' => 'Descricao compativel com uma capacidade suportada pelo runtime atual.',
                    'definition' => [
                        'usage' => sprintf($capability['usage_pattern'], $commandKey),
                        'hint' => $capability['hint'],
                        'arguments' => [
                            ['name' => 'x', 'type' => 'number'],
                            ['name' => 'y', 'type' => 'number'],
                            ['name' => 'z', 'type' => 'number'],
                        ],
                    ],
                    'label' => $label !== '' ? $label : $capability['label'],
                ];
            }
        }
    }

    return [
        'possible' => false,
        'capability_key' => null,
        'validation_status' => 'unsupported',
        'validation_reason' => 'Ainda nao existe executor para a descricao informada neste momento.',
        'definition' => null,
        'label' => $label,
    ];
}

function encode_command_definition(?array $definition): ?string
{
    if ($definition === null) {
        return null;
    }

    return json_encode($definition, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function decode_command_definition($value): ?array
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : null;
}

function map_command_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'command_key' => (string) $row['command_key'],
        'label' => (string) $row['label'],
        'description' => (string) $row['description'],
        'capability_key' => (string) $row['capability_key'],
        'validation_status' => (string) $row['validation_status'],
        'validation_reason' => (string) $row['validation_reason'],
        'definition' => decode_command_definition($row['definition_json'] ?? null),
        'active' => (int) $row['active'],
        'created_by_user_id' => $row['created_by_user_id'] !== null ? (int) $row['created_by_user_id'] : null,
        'created_at' => $row['criado_em'] ?? null,
        'updated_at' => $row['atualizado_em'] ?? null,
    ];
}

function list_runtime_commands(funcoesPDO $service, bool $validatedOnly = false, bool $activeOnly = false): array
{
    $conditions = [];
    $params = [];

    if ($validatedOnly) {
        $conditions[] = 'validation_status = :validation_status';
        $params[':validation_status'] = 'validated';
    }

    if ($activeOnly) {
        $conditions[] = 'active = :active';
        $params[':active'] = 1;
    }

    $sql = 'SELECT id, command_key, label, description, capability_key, validation_status, validation_reason, definition_json, active, created_by_user_id, criado_em, atualizado_em
            FROM comandos_runtime';

    if ($conditions !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY command_key ASC';

    return array_map('map_command_row', $service->select($sql, $params));
}

function find_runtime_command_by_id(funcoesPDO $service, int $commandId): ?array
{
    $row = $service->selectOne(
        'SELECT id, command_key, label, description, capability_key, validation_status, validation_reason, definition_json, active, created_by_user_id, criado_em, atualizado_em
         FROM comandos_runtime
         WHERE id = :id
         LIMIT 1',
        [':id' => $commandId]
    );

    return $row ? map_command_row($row) : null;
}

function find_runtime_command_by_key(funcoesPDO $service, string $commandKey): ?array
{
    $row = $service->selectOne(
        'SELECT id, command_key, label, description, capability_key, validation_status, validation_reason, definition_json, active, created_by_user_id, criado_em, atualizado_em
         FROM comandos_runtime
         WHERE command_key = :command_key
         LIMIT 1',
        [':command_key' => $commandKey]
    );

    return $row ? map_command_row($row) : null;
}
