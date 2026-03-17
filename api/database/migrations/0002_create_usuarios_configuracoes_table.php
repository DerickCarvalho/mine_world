<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            'CREATE TABLE IF NOT EXISTS usuarios_configuracoes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                usuario_id BIGINT UNSIGNED NOT NULL UNIQUE,
                render_distance TINYINT UNSIGNED NOT NULL DEFAULT 6,
                mouse_sensitivity DECIMAL(4,2) NOT NULL DEFAULT 1.00,
                master_volume TINYINT UNSIGNED NOT NULL DEFAULT 80,
                invert_y TINYINT(1) NOT NULL DEFAULT 0,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_usuarios_configuracoes_usuario
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS usuarios_configuracoes');
    }
};
