<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class ConfigController
{
    private static bool $tableEnsured = false;

    private function ensureConfigTable(): void
    {
        if (self::$tableEnsured) return;
        self::$tableEnsured = true;
        try {
            Database::query("CREATE TABLE IF NOT EXISTS system_settings (
                `key` VARCHAR(100) PRIMARY KEY,
                `value` TEXT NOT NULL,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            Database::query("INSERT IGNORE INTO system_settings (`key`, `value`) VALUES ('rotbot_active', 'true')");
        } catch (Exception $e) {}
    }

    public function getSettings(Request $request, Response $response): void
    {
        try {
            $this->ensureConfigTable();
            $stmt = Database::query('SELECT `key`, `value` FROM system_settings');
            $rows = $stmt->fetchAll();

            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['key']] = $row['value'];
            }

            $response->json(['settings' => $settings]);
        } catch (Exception $err) {
            error_log('[Config] getSettings error: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al cargar las configuraciones']);
        }
    }

    public function updateSettings(Request $request, Response $response): void
    {
        try {
            $user = $request->user;
            if (!$user || strtolower($user->rol ?? '') !== 'admin') {
                $response->status(403)->json(['message' => 'Permisos insuficientes']);
                return;
            }

            $this->ensureConfigTable();
            $settings = $request->body['settings'] ?? [];

            if (!is_array($settings)) {
                $response->status(400)->json(['message' => 'Formato de configuraciones inválido']);
                return;
            }

            foreach ($settings as $key => $value) {
                if (is_string($key)) {
                    Database::query(
                        "INSERT INTO system_settings (`key`, `value`, `updated_at`) VALUES ($1, $2, CURRENT_TIMESTAMP)
                         ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = CURRENT_TIMESTAMP",
                        [$key, is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE)]
                    );
                }
            }

            $response->json(['message' => 'Configuraciones actualizadas']);
        } catch (Exception $err) {
            error_log('[Config] updateSettings error: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al guardar configuraciones']);
        }
    }
}
