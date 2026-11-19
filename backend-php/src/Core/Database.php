<?php

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => true,
            ];

            $dbConnection = $_ENV['DB_CONNECTION'] ?? getenv('DB_CONNECTION');

            if ($dbConnection === 'mysql' || $dbConnection === 'mysqli') {
                $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
                $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
                $dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE');
                $user = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'root';
                $password = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?? $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';

                if (!$dbname) {
                    throw new RuntimeException("ERROR: DB_NAME no está configurada en .env para conexión MySQL");
                }

                $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            } else {
                // Soportar DATABASE_URL (para MySQL o PostgreSQL)
                $url = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
                if (!$url) {
                    throw new RuntimeException("ERROR: DATABASE_URL o DB_CONNECTION no están configuradas en .env");
                }

                $parsed = parse_url($url);
                if (!$parsed || !isset($parsed['host'], $parsed['path'])) {
                    throw new RuntimeException("ERROR: DATABASE_URL formato inválido");
                }

                $host = $parsed['host'];
                $port = $parsed['port'] ?? ($parsed['scheme'] === 'mysql' ? 3306 : 5432);
                $user = $parsed['user'] ?? ($parsed['scheme'] === 'mysql' ? 'root' : 'postgres');
                $password = $parsed['pass'] ?? '';
                $dbname = ltrim($parsed['path'], '/');

                if ($parsed['scheme'] === 'mysql' || $parsed['scheme'] === 'mysqli') {
                    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                } else {
                    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";
                }
            }

            try {
                self::$instance = new PDO($dsn, $user, $password, $options);
            } catch (PDOException $e) {
                throw new RuntimeException("Error conectando a Base de Datos: " . $e->getMessage(), (int)$e->getCode(), $e);
            }
        }

        return self::$instance;
    }

    /**
     * Helper universal para ejecutar consultas con conversión de parámetros y soporte MySQL/PostgreSQL
     */
    public static function query(string $sql, array $params = []): \PDOStatement
    {
        $pdo = self::getConnection();

        // 1. Convertir marcadores posicionales $1, $2 a parámetros de PDO con nombres únicos por ocurrencia
        if (!empty($params) && preg_match('/\$[0-9]+/', $sql)) {
            $newParams = [];
            $paramCounts = [];
            $paramValues = array_values($params);
            $sql = preg_replace_callback('/\$([0-9]+)/', function ($matches) use (&$newParams, &$paramCounts, $paramValues) {
                $num = $matches[1];
                $idx = (int)$num - 1;
                $val = $paramValues[$idx] ?? null;
                $count = ($paramCounts[$num] = ($paramCounts[$num] ?? 0) + 1);
                $pName = ':pg_p_' . $num . '_' . $count;
                $newParams[$pName] = $val;
                return $pName;
            }, $sql);

            $params = $newParams;
        }

        // 2. Soporte y emulación transparente de RETURNING en MySQL
        if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql' && preg_match('/\s+RETURNING\s+([a-zA-Z0-9_\*, `]+)\s*$/i', $sql, $retMatches)) {
            $returningCols = trim($retMatches[1]);
            $cleanSql = preg_replace('/\s+RETURNING\s+.*$/i', '', $sql);

            // Si es un INSERT INTO
            if (preg_match('/^\s*INSERT\s+INTO\s+([a-zA-Z0-9_`]+)/i', $cleanSql, $tableMatch)) {
                $table = trim($tableMatch[1], '`');
                $stmt = $pdo->prepare($cleanSql);
                $stmt->execute($params);
                $lastId = $pdo->lastInsertId();

                $selStmt = $pdo->prepare("SELECT {$returningCols} FROM `{$table}` WHERE id = ?");
                $selStmt->execute([$lastId]);
                return $selStmt;
            }

            // Si es un UPDATE
            if (preg_match('/^\s*UPDATE\s+([a-zA-Z0-9_`]+)\s+SET/i', $cleanSql, $tableMatch)) {
                $table = trim($tableMatch[1], '`');
                $matchedId = self::findMatchingIdForWhere($pdo, $table, $cleanSql, $params);

                $stmt = $pdo->prepare($cleanSql);
                $stmt->execute($params);

                if ($matchedId !== null) {
                    $selStmt = $pdo->prepare("SELECT {$returningCols} FROM `{$table}` WHERE id = ?");
                    $selStmt->execute([$matchedId]);
                    return $selStmt;
                }

                return $pdo->query("SELECT {$returningCols} FROM `{$table}` WHERE 1 = 0");
            }

            // Si es un DELETE
            if (preg_match('/^\s*DELETE\s+FROM\s+([a-zA-Z0-9_`]+)/i', $cleanSql, $tableMatch)) {
                $table = trim($tableMatch[1], '`');
                $matchedId = self::findMatchingIdForWhere($pdo, $table, $cleanSql, $params);

                $stmt = $pdo->prepare($cleanSql);
                $stmt->execute($params);

                $pdo->exec("CREATE TEMPORARY TABLE IF NOT EXISTS _tmp_ret (id INT)");
                $pdo->exec("TRUNCATE TABLE _tmp_ret");

                if ($matchedId !== null && $stmt->rowCount() > 0) {
                    $insTmp = $pdo->prepare("INSERT INTO _tmp_ret VALUES (?)");
                    $insTmp->execute([$matchedId]);
                }
                return $pdo->query("SELECT * FROM _tmp_ret");
            }
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Extrae la cláusula WHERE y sus parámetros vinculados para verificar propiedad/existencia
     * antes de emular RETURNING en MySQL (previene exfiltración IDOR cuando user_id no coincide).
     */
    public static function extractWhereClauseAndParams(string $cleanSql, array $params): ?array
    {
        if (!preg_match('/\s+WHERE\s+(.+)$/is', $cleanSql, $whereMatch)) {
            return null;
        }
        $whereClause = trim($whereMatch[1]);
        $whereParams = [];

        if (preg_match_all('/:([a-zA-Z0-9_]+)/', $whereClause, $placeholderMatches)) {
            foreach ($placeholderMatches[1] as $ph) {
                if (array_key_exists(':' . $ph, $params)) {
                    $whereParams[':' . $ph] = $params[':' . $ph];
                } elseif (array_key_exists($ph, $params)) {
                    $whereParams[':' . $ph] = $params[$ph];
                }
            }
        } elseif (str_contains($whereClause, '?')) {
            $qCount = substr_count($whereClause, '?');
            $values = array_values($params);
            $whereParams = array_slice($values, -$qCount);
        }

        return [
            'where' => $whereClause,
            'params' => $whereParams
        ];
    }

    private static function findMatchingIdForWhere(PDO $pdo, string $table, string $cleanSql, array $params): mixed
    {
        $extracted = self::extractWhereClauseAndParams($cleanSql, $params);
        if (!$extracted) {
            return null;
        }
        $checkStmt = $pdo->prepare("SELECT id FROM `{$table}` WHERE {$extracted['where']} LIMIT 1");
        $checkStmt->execute($extracted['params']);
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        return $row['id'] ?? null;
    }

    /**
     * Ejecuta una consulta y retorna una única fila como array asociativo o null si no existe
     */
    public static function queryOne(string $sql, array $params = []): ?array
    {
        $stmt = self::query($sql, $params);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Ejecuta una consulta y retorna todas las filas como array de arrays asociativos
     */
    public static function queryAll(string $sql, array $params = []): array
    {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
