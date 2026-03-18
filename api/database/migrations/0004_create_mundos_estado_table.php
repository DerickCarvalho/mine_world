<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            "CREATE TABLE IF NOT EXISTS mundos_estado (
                mundo_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
                schema_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
                player_x DECIMAL(10,3) NOT NULL,
                player_y DECIMAL(10,3) NOT NULL,
                player_z DECIMAL(10,3) NOT NULL,
                player_yaw DECIMAL(12,6) NOT NULL,
                player_pitch DECIMAL(12,6) NOT NULL,
                estado_json LONGTEXT NOT NULL,
                salvo_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_mundos_estado_mundo
                    FOREIGN KEY (mundo_id) REFERENCES mundos(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS mundos_estado');
    }
};
