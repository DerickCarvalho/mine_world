<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            "CREATE TABLE IF NOT EXISTS comandos_runtime (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                command_key VARCHAR(48) NOT NULL,
                label VARCHAR(80) NOT NULL,
                description TEXT NOT NULL,
                capability_key VARCHAR(48) NOT NULL,
                validation_status VARCHAR(24) NOT NULL DEFAULT 'validated',
                validation_reason VARCHAR(255) NOT NULL,
                definition_json LONGTEXT NULL DEFAULT NULL,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_by_user_id BIGINT UNSIGNED NULL DEFAULT NULL,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_comandos_runtime_command_key (command_key),
                INDEX idx_comandos_runtime_validation (validation_status, active),
                INDEX idx_comandos_runtime_created_by_user (created_by_user_id),
                CONSTRAINT fk_comandos_runtime_created_by_user
                    FOREIGN KEY (created_by_user_id) REFERENCES usuarios(id)
                    ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );

        $definitionJson = json_encode([
            'usage' => '/tp x y z',
            'hint' => 'Teletransporta o jogador para as coordenadas informadas.',
            'arguments' => [
                ['name' => 'x', 'type' => 'number'],
                ['name' => 'y', 'type' => 'number'],
                ['name' => 'z', 'type' => 'number'],
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $statement = $db->prepare(
            'INSERT INTO comandos_runtime
                (command_key, label, description, capability_key, validation_status, validation_reason, definition_json, active, created_by_user_id)
             VALUES
                (:command_key, :label, :description, :capability_key, :validation_status, :validation_reason, :definition_json, :active, NULL)
             ON DUPLICATE KEY UPDATE
                label = VALUES(label),
                description = VALUES(description),
                capability_key = VALUES(capability_key),
                validation_status = VALUES(validation_status),
                validation_reason = VALUES(validation_reason),
                definition_json = VALUES(definition_json),
                active = VALUES(active)'
        );

        $statement->execute([
            ':command_key' => 'tp',
            ':label' => 'Teleporte',
            ':description' => 'Teletransportar o jogador para coordenadas X Y Z dentro do mundo.',
            ':capability_key' => 'teleport',
            ':validation_status' => 'validated',
            ':validation_reason' => 'Comando suportado pelo runtime atual.',
            ':definition_json' => $definitionJson,
            ':active' => 1,
        ]);
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS comandos_runtime');
    }
};
