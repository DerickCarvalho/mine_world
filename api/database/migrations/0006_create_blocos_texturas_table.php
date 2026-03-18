<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            "CREATE TABLE IF NOT EXISTS blocos_texturas (
                block_key VARCHAR(32) NOT NULL PRIMARY KEY,
                top_filename VARCHAR(255) NULL DEFAULT NULL,
                side_filename VARCHAR(255) NULL DEFAULT NULL,
                bottom_filename VARCHAR(255) NULL DEFAULT NULL,
                updated_by_user_id BIGINT UNSIGNED NULL DEFAULT NULL,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_blocos_texturas_updated_by_user (updated_by_user_id),
                CONSTRAINT fk_blocos_texturas_updated_by_user
                    FOREIGN KEY (updated_by_user_id) REFERENCES usuarios(id)
                    ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS blocos_texturas');
    }
};
