<?php

declare(strict_types=1);

require_once __DIR__ . '/../utils.php';

function base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64url_decode(string $value): string
{
    $padding = strlen($value) % 4;
    if ($padding > 0) {
        $value .= str_repeat('=', 4 - $padding);
    }

    $decoded = base64_decode(strtr($value, '-_', '+/'), true);
    if ($decoded === false) {
        throw new RuntimeException('Token malformado.');
    }

    return $decoded;
}

function jwt_encode_token(array $payload): string
{
    $header = [
        'alg' => 'HS256',
        'typ' => 'JWT',
    ];

    $encodedHeader = base64url_encode(json_encode($header, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $encodedPayload = base64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $signature = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, app_config('jwt.secret'), true);

    return $encodedHeader . '.' . $encodedPayload . '.' . base64url_encode($signature);
}

function jwt_decode_token(string $token): array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        throw new RuntimeException('Token malformado.');
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
    $header = json_decode(base64url_decode($encodedHeader), true);
    $payload = json_decode(base64url_decode($encodedPayload), true);

    if (!is_array($header) || !is_array($payload) || ($header['alg'] ?? '') !== 'HS256') {
        throw new RuntimeException('Token invalido.');
    }

    $expectedSignature = base64url_encode(hash_hmac(
        'sha256',
        $encodedHeader . '.' . $encodedPayload,
        app_config('jwt.secret'),
        true
    ));

    if (!hash_equals($expectedSignature, $encodedSignature)) {
        throw new RuntimeException('Assinatura invalida.');
    }

    if (isset($payload['exp']) && time() >= (int) $payload['exp']) {
        throw new RuntimeException('Token expirado.');
    }

    return $payload;
}

function issue_user_token(array $user): string
{
    $issuedAt = time();
    $ttl = (int) app_config('jwt.ttl', 43200);

    return jwt_encode_token([
        'sub' => (int) $user['id'],
        'login' => $user['login'],
        'iat' => $issuedAt,
        'exp' => $issuedAt + $ttl,
    ]);
}

function get_bearer_token(): ?string
{
    $header = '';

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = (string) $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if ($header === '' || !preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return null;
    }

    return trim($matches[1]);
}
