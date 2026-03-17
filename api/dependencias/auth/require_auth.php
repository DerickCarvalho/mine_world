<?php

declare(strict_types=1);

require_once __DIR__ . '/../pdo/funcoesPDO.php';
require_once __DIR__ . '/../utils.php';
require_once __DIR__ . '/jwt_helper.php';

function require_auth_user(): array
{
    $token = get_bearer_token();
    if ($token === null || $token === '') {
        respond_unauthorized('Token de sessao nao informado.');
    }

    try {
        $payload = jwt_decode_token($token);
    } catch (Throwable $exception) {
        respond_unauthorized('Sessao invalida ou expirada.');
    }

    $userId = (int) ($payload['sub'] ?? 0);
    if ($userId <= 0) {
        respond_unauthorized('Sessao invalida.');
    }

    $pdo = new funcoesPDO();
    $user = $pdo->selectOne(
        'SELECT id, login, nome_exibicao, status, criado_em, atualizado_em
         FROM usuarios
         WHERE id = :id
         LIMIT 1',
        [':id' => $userId]
    );

    if ($user === null || (int) $user['status'] !== 1) {
        respond_unauthorized('Sessao invalida ou usuario inativo.');
    }

    return $user;
}
