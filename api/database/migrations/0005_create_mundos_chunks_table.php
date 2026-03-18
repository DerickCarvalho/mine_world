<?php

return new class {
    public function up(PDO $db): void
    {
        $db->exec(
            "CREATE TABLE IF NOT EXISTS mundos_chunks (
                mundo_id BIGINT UNSIGNED NOT NULL,
                chunk_x INT NOT NULL,
                chunk_z INT NOT NULL,
                schema_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
                data_base64 MEDIUMTEXT NOT NULL,
                criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (mundo_id, chunk_x, chunk_z),
                CONSTRAINT fk_mundos_chunks_mundo
                    FOREIGN KEY (mundo_id) REFERENCES mundos(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }

    public function down(PDO $db): void
    {
        $db->exec('DROP TABLE IF EXISTS mundos_chunks');
    }
};
