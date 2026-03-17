<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/../dependencias/utils.php';

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
