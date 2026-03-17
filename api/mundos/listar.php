<?php

declare(strict_types=1);

require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$worlds = $service->select(
    'SELECT id, usuario_id, nome, seed, algorithm_version, ultimo_jogado_em, criado_em, atualizado_em
     FROM mundos
     WHERE usuario_id = :usuario_id
     ORDER BY atualizado_em DESC, id DESC',
    [':usuario_id' => (int) $user['id']]
);

respond_ok(
    'Mundos carregados com sucesso.',
    [
        'worlds' => array_map('world_payload', $worlds),
    ]
);
