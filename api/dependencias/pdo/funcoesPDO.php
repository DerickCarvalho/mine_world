<?php

declare(strict_types=1);

require_once __DIR__ . '/conexao.php';

class funcoesPDO
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Conexao::getPdo();
    }

    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    public function select(string $sql, array $params = []): array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function selectOne(string $sql, array $params = []): ?array
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch();

        return $row === false ? null : $row;
    }

    public function execute(string $sql, array $params = []): int
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return $statement->rowCount();
    }

    public function insert(string $sql, array $params = []): int
    {
        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        return (int) $this->pdo->lastInsertId();
    }

    public function transaction(callable $callback)
    {
        $this->pdo->beginTransaction();

        try {
            $result = $callback($this->pdo, $this);
            $this->pdo->commit();

            return $result;
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            throw $exception;
        }
    }
}
