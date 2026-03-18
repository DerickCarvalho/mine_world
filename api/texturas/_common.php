<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/utils.php';
require_once __DIR__ . '/../dependencias/block_catalog.php';

const TEXTURE_MAX_BYTES = 5120;

function textures_storage_dir(): string
{
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '_texturas';
}

function textures_public_path(string $filename): string
{
    return '_texturas/' . ltrim($filename, '/\\');
}

function texture_allowed_mime_map(): array
{
    return [
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/jpeg' => 'jpg',
        'image/gif' => 'gif',
    ];
}

function ensure_textures_storage_dir(): string
{
    $directory = textures_storage_dir();

    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        respond_error('Nao foi possivel preparar a pasta de texturas.', 500);
    }

    return $directory;
}

function normalize_texture_block_key($value): string
{
    return preg_replace('/[^a-z0-9_-]/', '', strtolower(trim((string) $value))) ?? '';
}

function get_texture_block_or_fail(string $blockKey): array
{
    $block = get_block_catalog_entry($blockKey);

    if ($block === null) {
        respond_error('Bloco informado nao existe no catalogo atual.', 422);
    }

    return $block;
}

function list_texture_rows(funcoesPDO $service): array
{
    $rows = $service->select(
        'SELECT block_key, top_filename, side_filename, bottom_filename, updated_by_user_id, criado_em, atualizado_em
         FROM blocos_texturas
         ORDER BY block_key ASC'
    );

    $map = [];
    foreach ($rows as $row) {
        $map[(string) $row['block_key']] = $row;
    }

    return $map;
}

function find_texture_row(funcoesPDO $service, string $blockKey): ?array
{
    return $service->selectOne(
        'SELECT block_key, top_filename, side_filename, bottom_filename, updated_by_user_id, criado_em, atualizado_em
         FROM blocos_texturas
         WHERE block_key = :block_key
         LIMIT 1',
        [':block_key' => $blockKey]
    );
}

function texture_file_payload(?string $filename): ?array
{
    $trimmed = trim((string) $filename);

    if ($trimmed === '') {
        return null;
    }

    return [
        'filename' => $trimmed,
        'path' => textures_public_path($trimmed),
    ];
}

function build_texture_payload(array $block, ?array $row): array
{
    return [
        'block_key' => $block['key'],
        'block_name' => $block['name'],
        'block_id' => $block['id'],
        'base_colors' => $block['base_colors'],
        'texturable' => (bool) $block['texturable'],
        'textures' => [
            'top' => texture_file_payload($row['top_filename'] ?? null),
            'side' => texture_file_payload($row['side_filename'] ?? null),
            'bottom' => texture_file_payload($row['bottom_filename'] ?? null),
        ],
        'updated_at' => $row['atualizado_em'] ?? null,
        'created_at' => $row['criado_em'] ?? null,
    ];
}

function list_texture_catalog(funcoesPDO $service): array
{
    $rowsByBlock = list_texture_rows($service);
    $output = [];

    foreach (block_catalog() as $block) {
        $output[] = build_texture_payload($block, $rowsByBlock[$block['key']] ?? null);
    }

    return $output;
}

function validate_uploaded_texture(array $file, string $blockKey, string $face): array
{
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_NO_FILE) {
        return ['has_file' => false];
    }

    if ($error !== UPLOAD_ERR_OK) {
        respond_error('Falha ao enviar a textura de ' . $face . ' do bloco ' . $blockKey . '.', 422);
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    $size = (int) ($file['size'] ?? 0);
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        respond_error('O upload recebido para ' . $face . ' esta invalido.', 422);
    }

    if ($size <= 0 || $size > TEXTURE_MAX_BYTES) {
        respond_error('Cada imagem deve ter no maximo 5 KB.', 422);
    }

    $imageInfo = @getimagesize($tmpName);
    if ($imageInfo === false) {
        respond_error('O arquivo enviado para ' . $face . ' nao e uma imagem valida.', 422);
    }

    $mime = (string) ($imageInfo['mime'] ?? '');
    $mimeMap = texture_allowed_mime_map();
    if (!array_key_exists($mime, $mimeMap)) {
        respond_error('Formato de imagem nao suportado para ' . $face . '.', 422);
    }

    $filename = $blockKey . '_' . $face . '_' . bin2hex(random_bytes(6)) . '.' . $mimeMap[$mime];
    $destination = ensure_textures_storage_dir() . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($tmpName, $destination)) {
        respond_error('Nao foi possivel salvar a textura enviada.', 500);
    }

    return [
        'has_file' => true,
        'filename' => $filename,
        'absolute_path' => $destination,
    ];
}

function delete_texture_file(?string $filename): void
{
    $trimmed = trim((string) $filename);
    if ($trimmed === '') {
        return;
    }

    $path = textures_storage_dir() . DIRECTORY_SEPARATOR . $trimmed;
    if (is_file($path)) {
        @unlink($path);
    }
}

function save_texture_record(funcoesPDO $service, string $blockKey, array $filenames, int $userId): void
{
    $allEmpty = trim((string) ($filenames['top'] ?? '')) === ''
        && trim((string) ($filenames['side'] ?? '')) === ''
        && trim((string) ($filenames['bottom'] ?? '')) === '';

    if ($allEmpty) {
        $service->execute(
            'DELETE FROM blocos_texturas
             WHERE block_key = :block_key',
            [':block_key' => $blockKey]
        );

        return;
    }

    $service->execute(
        'INSERT INTO blocos_texturas
            (block_key, top_filename, side_filename, bottom_filename, updated_by_user_id, criado_em, atualizado_em)
         VALUES
            (:block_key, :top_filename, :side_filename, :bottom_filename, :updated_by_user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
            top_filename = VALUES(top_filename),
            side_filename = VALUES(side_filename),
            bottom_filename = VALUES(bottom_filename),
            updated_by_user_id = VALUES(updated_by_user_id),
            atualizado_em = CURRENT_TIMESTAMP',
        [
            ':block_key' => $blockKey,
            ':top_filename' => $filenames['top'] !== '' ? $filenames['top'] : null,
            ':side_filename' => $filenames['side'] !== '' ? $filenames['side'] : null,
            ':bottom_filename' => $filenames['bottom'] !== '' ? $filenames['bottom'] : null,
            ':updated_by_user_id' => $userId,
        ]
    );
}
