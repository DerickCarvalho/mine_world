<?php

declare(strict_types=1);

require_once __DIR__ . '/pdo/funcoesPDO.php';

function app_config(?string $key = null, $default = null)
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }

    if ($key === null || $key === '') {
        return $config;
    }

    $segments = explode('.', $key);
    $value = $config;

    foreach ($segments as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return $default;
        }

        $value = $value[$segment];
    }

    return $value;
}

function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function respond_ok(string $message, $data = null, int $statusCode = 200): void
{
    json_response([
        'status' => 'OK',
        'message' => $message,
        'data' => $data,
    ], $statusCode);
}

function respond_error(string $message, int $statusCode = 400, $data = null): void
{
    json_response([
        'status' => 'ERROR',
        'message' => $message,
        'data' => $data,
    ], $statusCode);
}

function respond_unauthorized(string $message = 'Sessao invalida.'): void
{
    json_response([
        'status' => 'UNAUTHORIZED',
        'message' => $message,
        'data' => null,
    ], 401);
}

function request_data(): array
{
    $data = array_merge($_GET ?? [], $_POST ?? []);
    $rawBody = file_get_contents('php://input') ?: '';
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if ($rawBody !== '' && str_contains($contentType, 'application/json')) {
        $decoded = json_decode($rawBody, true);
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    return $data;
}

function sanitize_login(string $login): string
{
    $normalized = strtolower(trim($login));
    return preg_replace('/[^a-z0-9._-]/', '', $normalized) ?? '';
}

function default_user_config(): array
{
    return [
        'render_distance' => 6,
        'mouse_sensitivity' => 1.0,
        'master_volume' => 80,
        'invert_y' => 0,
    ];
}

function normalize_bool($value): int
{
    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    if (is_numeric($value)) {
        return (int) ((int) $value > 0);
    }

    $normalized = strtolower(trim((string) $value));
    return in_array($normalized, ['1', 'true', 'sim', 'yes', 'on'], true) ? 1 : 0;
}

function ensure_user_config(funcoesPDO $pdo, int $userId): array
{
    $config = $pdo->selectOne(
        'SELECT usuario_id, render_distance, mouse_sensitivity, master_volume, invert_y
         FROM usuarios_configuracoes
         WHERE usuario_id = :usuario_id
         LIMIT 1',
        [':usuario_id' => $userId]
    );

    if ($config !== null) {
        return [
            'render_distance' => (int) $config['render_distance'],
            'mouse_sensitivity' => (float) $config['mouse_sensitivity'],
            'master_volume' => (int) $config['master_volume'],
            'invert_y' => (int) $config['invert_y'],
        ];
    }

    $defaults = default_user_config();
    $pdo->insert(
        'INSERT INTO usuarios_configuracoes
            (usuario_id, render_distance, mouse_sensitivity, master_volume, invert_y)
         VALUES
            (:usuario_id, :render_distance, :mouse_sensitivity, :master_volume, :invert_y)',
        [
            ':usuario_id' => $userId,
            ':render_distance' => $defaults['render_distance'],
            ':mouse_sensitivity' => $defaults['mouse_sensitivity'],
            ':master_volume' => $defaults['master_volume'],
            ':invert_y' => $defaults['invert_y'],
        ]
    );

    return $defaults;
}

function response_user_payload(array $user, ?array $config = null, ?string $token = null): array
{
    return [
        'token' => $token,
        'user' => [
            'id' => (int) $user['id'],
            'login' => $user['login'],
            'nome_exibicao' => $user['nome_exibicao'],
            'status' => (int) $user['status'],
        ],
        'config' => $config,
    ];
}
