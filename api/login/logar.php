<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/pdo/funcoesPDO.php';
require_once __DIR__ . '/../dependencias/utils.php';
require_once __DIR__ . '/../dependencias/auth/jwt_helper.php';

$data = request_data();
$login = sanitize_login((string) ($data['login'] ?? ''));
$senha = (string) ($data['senha'] ?? '');

if ($login === '' || $senha === '') {
    respond_error('Informe login e senha para continuar.', 422);
}

$service = new funcoesPDO();
$user = $service->selectOne(
    'SELECT id, login, nome_exibicao, senha_hash, status
     FROM usuarios
     WHERE login = :login
     LIMIT 1',
    [':login' => $login]
);

if ($user === null || (int) $user['status'] !== 1) {
    respond_error('Credenciais invalidas.', 401);
}

if (!password_verify($senha, $user['senha_hash'])) {
    respond_error('Credenciais invalidas.', 401);
}

$config = ensure_user_config($service, (int) $user['id']);
$token = issue_user_token($user);

respond_ok('Login realizado com sucesso.', response_user_payload($user, $config, $token));
