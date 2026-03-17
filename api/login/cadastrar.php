<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/pdo/funcoesPDO.php';
require_once __DIR__ . '/../dependencias/utils.php';
require_once __DIR__ . '/../dependencias/auth/jwt_helper.php';

$data = request_data();
$nomeExibicao = trim((string) ($data['nome_exibicao'] ?? ''));
$login = sanitize_login((string) ($data['login'] ?? ''));
$senha = (string) ($data['senha'] ?? '');
$confirmarSenha = (string) ($data['confirmar_senha'] ?? '');

if ($nomeExibicao === '' || mb_strlen($nomeExibicao) < 3) {
    respond_error('Informe um nome de exibicao com pelo menos 3 caracteres.', 422);
}

if ($login === '' || strlen($login) < 3) {
    respond_error('Informe um login valido com pelo menos 3 caracteres.', 422);
}

if (strlen($senha) < 6) {
    respond_error('A senha precisa ter pelo menos 6 caracteres.', 422);
}

if ($senha !== $confirmarSenha) {
    respond_error('As senhas nao coincidem.', 422);
}

$service = new funcoesPDO();
$existingUser = $service->selectOne(
    'SELECT id FROM usuarios WHERE login = :login LIMIT 1',
    [':login' => $login]
);

if ($existingUser !== null) {
    respond_error('Ja existe uma conta com esse login.', 409);
}

$defaults = default_user_config();
$createdUser = $service->transaction(function (PDO $pdo, funcoesPDO $db) use ($login, $nomeExibicao, $senha, $defaults): array {
    $userId = $db->insert(
        'INSERT INTO usuarios (login, nome_exibicao, senha_hash, status)
         VALUES (:login, :nome_exibicao, :senha_hash, :status)',
        [
            ':login' => $login,
            ':nome_exibicao' => $nomeExibicao,
            ':senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
            ':status' => 1,
        ]
    );

    $db->insert(
        'INSERT INTO usuarios_configuracoes (usuario_id, render_distance, mouse_sensitivity, master_volume, invert_y)
         VALUES (:usuario_id, :render_distance, :mouse_sensitivity, :master_volume, :invert_y)',
        [
            ':usuario_id' => $userId,
            ':render_distance' => $defaults['render_distance'],
            ':mouse_sensitivity' => $defaults['mouse_sensitivity'],
            ':master_volume' => $defaults['master_volume'],
            ':invert_y' => $defaults['invert_y'],
        ]
    );

    $user = $db->selectOne(
        'SELECT id, login, nome_exibicao, status
         FROM usuarios
         WHERE id = :id
         LIMIT 1',
        [':id' => $userId]
    );

    return $user ?? [];
});

if ($createdUser === []) {
    respond_error('Nao foi possivel criar a conta.', 500);
}

$token = issue_user_token($createdUser);
respond_ok('Conta criada com sucesso.', response_user_payload($createdUser, $defaults, $token), 201);
