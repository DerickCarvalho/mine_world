<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/../dependencias/utils.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$config = ensure_user_config($service, (int) $user['id']);

if (array_key_exists('render_distance', $data)) {
    $renderDistance = (int) $data['render_distance'];
    if ($renderDistance < 2 || $renderDistance > 10) {
        respond_error('A distancia de render deve ficar entre 2 e 10.', 422);
    }
    $config['render_distance'] = $renderDistance;
}

if (array_key_exists('mouse_sensitivity', $data)) {
    $mouseSensitivity = (float) $data['mouse_sensitivity'];
    if ($mouseSensitivity < 0.1 || $mouseSensitivity > 3.0) {
        respond_error('A sensibilidade do mouse deve ficar entre 0.1 e 3.0.', 422);
    }
    $config['mouse_sensitivity'] = $mouseSensitivity;
}

if (array_key_exists('master_volume', $data)) {
    $masterVolume = (int) $data['master_volume'];
    if ($masterVolume < 0 || $masterVolume > 100) {
        respond_error('O volume principal deve ficar entre 0 e 100.', 422);
    }
    $config['master_volume'] = $masterVolume;
}

if (array_key_exists('invert_y', $data)) {
    $config['invert_y'] = normalize_bool($data['invert_y']);
}

$service->execute(
    'UPDATE usuarios_configuracoes
     SET render_distance = :render_distance,
         mouse_sensitivity = :mouse_sensitivity,
         master_volume = :master_volume,
         invert_y = :invert_y
     WHERE usuario_id = :usuario_id',
    [
        ':render_distance' => $config['render_distance'],
        ':mouse_sensitivity' => $config['mouse_sensitivity'],
        ':master_volume' => $config['master_volume'],
        ':invert_y' => $config['invert_y'],
        ':usuario_id' => (int) $user['id'],
    ]
);

respond_ok('Configuracoes salvas com sucesso.', $config);
