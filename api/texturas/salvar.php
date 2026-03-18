<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/auth/require_auth.php';
require_once __DIR__ . '/_common.php';

$user = require_auth_user();
$service = new funcoesPDO();
$data = request_data();
$blockKey = normalize_texture_block_key($data['block_key'] ?? '');
$block = get_texture_block_or_fail($blockKey);
$current = find_texture_row($service, $blockKey) ?? [];

$newFiles = [
    'top' => trim((string) ($current['top_filename'] ?? '')),
    'side' => trim((string) ($current['side_filename'] ?? '')),
    'bottom' => trim((string) ($current['bottom_filename'] ?? '')),
];

$facesByInput = [
    'top' => 'top_image',
    'side' => 'side_image',
    'bottom' => 'bottom_image',
];

$createdFiles = [];
$filesToDelete = [];
$changed = false;

try {
    foreach ($facesByInput as $face => $inputName) {
        $removeRequested = normalize_bool($data['remove_' . $face] ?? 0) === 1;

        if ($removeRequested) {
            if ($newFiles[$face] !== '') {
                $filesToDelete[] = $newFiles[$face];
                $newFiles[$face] = '';
                $changed = true;
            }

            continue;
        }

        if (!array_key_exists($inputName, $_FILES)) {
            continue;
        }

        $saved = validate_uploaded_texture($_FILES[$inputName], $blockKey, $face);
        if (($saved['has_file'] ?? false) !== true) {
            continue;
        }

        if ($newFiles[$face] !== '') {
            $filesToDelete[] = $newFiles[$face];
        }

        $newFiles[$face] = $saved['filename'];
        $createdFiles[] = $saved['filename'];
        $changed = true;
    }

    if (!$changed) {
        respond_error('Envie ao menos uma imagem ou solicite a remocao de uma textura existente.', 422);
    }

    $service->transaction(function () use ($service, $blockKey, $newFiles, $user): void {
        save_texture_record($service, $blockKey, $newFiles, (int) $user['id']);
    });

    foreach ($filesToDelete as $filename) {
        if (!in_array($filename, $createdFiles, true)) {
            delete_texture_file($filename);
        }
    }

    $updated = find_texture_row($service, $blockKey);
    respond_ok('Texturas do bloco salvas com sucesso.', build_texture_payload($block, $updated));
} catch (Throwable $exception) {
    foreach ($createdFiles as $filename) {
        delete_texture_file($filename);
    }

    respond_error($exception->getMessage() !== '' ? $exception->getMessage() : 'Nao foi possivel salvar as texturas.', 500);
}
