<?php

declare(strict_types=1);

require_once __DIR__ . '/../dependencias/pdo/conexao.php';

$db = Conexao::getPdo();
$db->exec(
    'CREATE TABLE IF NOT EXISTS migrations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$migrationFiles = glob(__DIR__ . '/migrations/*.php') ?: [];
sort($migrationFiles);

$rollback = (($argv[1] ?? '') === 'rollback');

if ($rollback) {
    $lastMigration = $db->query('SELECT migration FROM migrations ORDER BY id DESC LIMIT 1')->fetchColumn();

    if ($lastMigration === false) {
        echo "Nenhuma migration para rollback.\n";
        exit(0);
    }

    $filePath = __DIR__ . '/migrations/' . $lastMigration;
    if (!is_file($filePath)) {
        fwrite(STDERR, "Arquivo da migration nao encontrado: {$lastMigration}\n");
        exit(1);
    }

    $migration = require $filePath;
    try {
        $migration->down($db);

        $tableExists = (bool) $db->query("SHOW TABLES LIKE 'migrations'")->fetchColumn();
        if ($tableExists) {
            $statement = $db->prepare('DELETE FROM migrations WHERE migration = :migration');
            $statement->execute([':migration' => $lastMigration]);
        }

        echo "Rollback executado: {$lastMigration}\n";
        exit(0);
    } catch (Throwable $exception) {
        fwrite(STDERR, "Falha no rollback: {$exception->getMessage()}\n");
        exit(1);
    }
}

$appliedMigrations = $db->query('SELECT migration FROM migrations ORDER BY id ASC')->fetchAll(PDO::FETCH_COLUMN);
$appliedMigrations = array_map('strval', $appliedMigrations);

$executedAny = false;

foreach ($migrationFiles as $migrationFile) {
    $migrationName = basename($migrationFile);

    if (in_array($migrationName, $appliedMigrations, true)) {
        continue;
    }

    $migration = require $migrationFile;
    try {
        $migration->up($db);

        $statement = $db->prepare('INSERT INTO migrations (migration) VALUES (:migration)');
        $statement->execute([':migration' => $migrationName]);

        $executedAny = true;
        echo "Migration aplicada: {$migrationName}\n";
    } catch (Throwable $exception) {
        fwrite(STDERR, "Falha ao aplicar {$migrationName}: {$exception->getMessage()}\n");
        exit(1);
    }
}

if (!$executedAny) {
    echo "Nenhuma migration pendente.\n";
}
