<?php

return [
    'app' => [
        'name' => 'MineWorld',
    ],
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'database' => 'mineworld_db',
        'username' => 'root',
        'password' => 'Senha123#',
        'charset' => 'utf8mb4',
    ],
    'jwt' => [
        'secret' => getenv('MINEWORLD_JWT_SECRET') ?: 'mineworld-local-jwt-secret-20260317',
        'ttl' => (int) (getenv('MINEWORLD_JWT_TTL') ?: 43200),
    ],
];
