<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();

$commandId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
if ($commandId === false || $commandId === null || (int) $commandId <= 0) {
    respond_error('Informe um comando valido para editar.', 422);
}

$existing = find_runtime_command_by_id($service, (int) $commandId);
if ($existing === null) {
    respond_error('Comando nao encontrado.', 404);
}

$commandKey = normalize_command_key($data['command_key'] ?? $existing['command_key']);
$label = normalize_command_label($data['label'] ?? $existing['label']);
$description = normalize_command_description($data['description'] ?? $existing['description']);
$active = array_key_exists('active', $data) ? normalize_bool($data['active']) : (int) $existing['active'];

if (strlen($commandKey) < 2 || strlen($commandKey) > 32) {
    respond_error('Informe um identificador de comando entre 2 e 32 caracteres.', 422);
}

if ($description === '' || strlen($description) < 8) {
    respond_error('Descreva com mais detalhes o que o comando deve fazer.', 422);
}

$other = find_runtime_command_by_key($service, $commandKey);
if ($other !== null && (int) $other['id'] !== (int) $existing['id']) {
    respond_error('Ja existe outro comando com esse identificador.', 422);
}

$evaluation = evaluate_command_request($commandKey, $description, $label);
if (($evaluation['possible'] ?? false) !== true) {
    respond_error($evaluation['validation_reason'] ?? 'Nao foi possivel atualizar esse comando agora.', 422, [
        'possible' => false,
    ]);
}

$service->execute(
    'UPDATE comandos_runtime
     SET command_key = :command_key,
         label = :label,
         description = :description,
         capability_key = :capability_key,
         validation_status = :validation_status,
         validation_reason = :validation_reason,
         definition_json = :definition_json,
         active = :active,
         created_by_user_id = :created_by_user_id,
         atualizado_em = CURRENT_TIMESTAMP
     WHERE id = :id',
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
        ':id' => (int) $existing['id'],
    ]
);

respond_ok('Comando atualizado com sucesso.', find_runtime_command_by_id($service, (int) $existing['id']));
