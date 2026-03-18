<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();

$commandKey = normalize_command_key($data['command_key'] ?? '');
$label = normalize_command_label($data['label'] ?? '');
$description = normalize_command_description($data['description'] ?? '');
$active = normalize_bool($data['active'] ?? 1);

if (strlen($commandKey) < 2 || strlen($commandKey) > 32) {
    respond_error('Informe um identificador de comando entre 2 e 32 caracteres.', 422);
}

if ($description === '' || strlen($description) < 8) {
    respond_error('Descreva com mais detalhes o que o comando deve fazer.', 422);
}

if (find_runtime_command_by_key($service, $commandKey) !== null) {
    respond_error('Ja existe um comando com esse identificador.', 422);
}

$evaluation = evaluate_command_request($commandKey, $description, $label);
if (($evaluation['possible'] ?? false) !== true) {
    respond_error($evaluation['validation_reason'] ?? 'Nao foi possivel criar esse comando agora.', 422, [
        'possible' => false,
    ]);
}

$commandId = $service->insert(
    'INSERT INTO comandos_runtime
        (command_key, label, description, capability_key, validation_status, validation_reason, definition_json, active, created_by_user_id, criado_em, atualizado_em)
     VALUES
        (:command_key, :label, :description, :capability_key, :validation_status, :validation_reason, :definition_json, :active, :created_by_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    [
        ':command_key' => $commandKey,
        ':label' => $evaluation['label'],
        ':description' => $description,
        ':capability_key' => $evaluation['capability_key'],
        ':validation_status' => $evaluation['validation_status'],
        ':validation_reason' => $evaluation['validation_reason'],
        ':definition_json' => encode_command_definition($evaluation['definition']),
        ':active' => $active,
        ':created_by_user_id' => (int) $user['id'],
    ]
);

$command = find_runtime_command_by_id($service, $commandId);
respond_ok('Comando criado com sucesso.', $command, 201);
