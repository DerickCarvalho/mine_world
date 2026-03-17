<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            "CREATE TABLE IF NOT EXISTS mundos (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                usuario_id BIGINT UNSIGNED NOT NULL,
                nome VARCHAR(80) NOT NULL,
                seed VARCHAR(32) NOT NULL,
                algorithm_version VARCHAR(20) NOT NULL DEFAULT 'v1',
                ultimo_jogado_em TIMESTAMP NULL DEFAULT NULL,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_mundos_usuario_id (usuario_id),
                CONSTRAINT fk_mundos_usuario
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS mundos');
    }
};
