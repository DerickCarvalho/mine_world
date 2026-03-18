<?php

return new class {
    public function up(PDO $db): void
    {
        $commands = [
            [
                'command_key' => 'fly',
                'label' => 'Alternar Fly',
                'description' => 'Ativar ou desativar a permissao de voo do jogador via duplo espaco.',
                'capability_key' => 'toggle_fly',
                'definition' => [
                    'usage' => '/fly',
                    'hint' => 'Ativa ou desativa a permissao de voo por duplo espaco.',
                    'arguments' => [],
                ],
            ],
            [
                'command_key' => 'spawnmob',
                'label' => 'Spawn de Mob',
                'description' => 'Criar um mob suportado perto do jogador. Inicialmente apenas gato.',
                'capability_key' => 'spawn_mob',
                'definition' => [
                    'usage' => '/spawnmob gato',
                    'hint' => 'Cria um mob suportado perto do jogador. No momento apenas gato.',
                    'arguments' => [
                        ['name' => 'mob', 'type' => 'string', 'enum' => ['gato']],
                    ],
                ],
            ],
        ];

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

        foreach ($commands as $command) {
            $statement->execute([
                ':command_key' => $command['command_key'],
                ':label' => $command['label'],
                ':description' => $command['description'],
                ':capability_key' => $command['capability_key'],
                ':validation_status' => 'validated',
                ':validation_reason' => 'Comando suportado pelo runtime atual.',
                ':definition_json' => json_encode($command['definition'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':active' => 1,
            ]);
        }
    }

    public function down(PDO $db): void
    {
        $db->exec("DELETE FROM comandos_runtime WHERE command_key IN ('fly', 'spawnmob')");
    }
};