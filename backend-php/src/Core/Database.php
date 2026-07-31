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

        // 1. Convertir marcadores posicionales $1, $2 a parámetros de PDO :pg_param_1, :pg_param_2
        if (!empty($params) && preg_match('/\$[0-9]+/', $sql)) {
            $sql = preg_replace_callback('/\$([0-9]+)/', function ($matches) {
                return ':pg_param_' . $matches[1];
            }, $sql);

            $newParams = [];
            foreach ($params as $key => $val) {
                if (is_int($key)) {
                    $newParams[':pg_param_' . ($key + 1)] = $val;
                } else {
                    $newParams[$key] = $val;
                }
            }
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
                $stmt = $pdo->prepare($cleanSql);
                $stmt->execute($params);

                // Intentar extraer el ID para devolver el registro actualizado
                $idVal = null;
                if (preg_match('/WHERE\s+id\s*=\s*:?([a-zA-Z0-9_]+)/i', $cleanSql, $idMatch)) {
                    $paramKey = $idMatch[1];
                    $idVal = $params[$paramKey] ?? $params[':' . $paramKey] ?? null;
                }
                if (!$idVal) {
                    $idVal = $params[':pg_param_2'] ?? $params[':pg_param_1'] ?? $params[1] ?? $params[0] ?? null;
                }

                if ($idVal) {
                    $selStmt = $pdo->prepare("SELECT {$returningCols} FROM `{$table}` WHERE id = ?");
                    $selStmt->execute([$idVal]);
                    return $selStmt;
                }
                return $stmt;
            }

            // Si es un DELETE
            if (preg_match('/^\s*DELETE\s+FROM\s+([a-zA-Z0-9_`]+)/i', $cleanSql, $tableMatch)) {
                $table = trim($tableMatch[1], '`');
                $idVal = null;
                if (preg_match('/WHERE\s+id\s*=\s*:?([a-zA-Z0-9_]+)/i', $cleanSql, $idMatch)) {
                    $paramKey = $idMatch[1];
                    $idVal = $params[$paramKey] ?? $params[':' . $paramKey] ?? $params[':pg_param_1'] ?? $params[0] ?? null;
                }
                $stmt = $pdo->prepare($cleanSql);
                $stmt->execute($params);

                if ($idVal && (strtolower($returningCols) === 'id' || $returningCols === '*')) {
                    $pdo->exec("CREATE TEMPORARY TABLE IF NOT EXISTS _tmp_ret (id INT)");
                    $pdo->exec("TRUNCATE TABLE _tmp_ret");
                    $insTmp = $pdo->prepare("INSERT INTO _tmp_ret VALUES (?)");
                    $insTmp->execute([$idVal]);
                    return $pdo->query("SELECT * FROM _tmp_ret");
                }
                return $stmt;
            }
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
