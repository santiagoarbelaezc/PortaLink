<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class ReportsController
{
    private static bool $tableEnsured = false;

    private function ensureActivityTable(): void
    {
        if (self::$tableEnsured) return;
        try {
            Database::query("
                CREATE TABLE IF NOT EXISTS system_activity_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    action VARCHAR(255) NOT NULL,
                    details LONGTEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
            self::$tableEnsured = true;
        } catch (Exception $err) {
            error_log('[Reports] Error ensuring activity table: ' . $err->getMessage());
        }
    }

    public function getActivityLogs(Request $request, Response $response): void
    {
        try {
            $this->ensureActivityTable();
            $stmt = Database::query("
                SELECT l.*, u.nombre as user_name 
                FROM system_activity_logs l 
                LEFT JOIN usuarios u ON l.user_id = u.id 
                ORDER BY l.created_at DESC 
                LIMIT 50
            ");
            $logs = $stmt->fetchAll();
            foreach ($logs as &$log) {
                if (isset($log['details']) && is_string($log['details'])) {
                    $decoded = json_decode($log['details'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $log['details'] = $decoded;
                    }
                }
            }
            $response->json(['logs' => $logs]);
        } catch (Exception $err) {
            error_log('[Reports] getActivityLogs error: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al obtener registros de actividad']);
        }
    }

    public function logActivity(Request $request, Response $response): void
    {
        try {
            $this->ensureActivityTable();
            $userId = $request->user->id ?? null;
            $action = $request->body['action'] ?? null;
            $details = $request->body['details'] ?? [];

            if (!$action) {
                $response->status(400)->json(['message' => 'La acción es obligatoria']);
                return;
            }

            Database::query(
                "INSERT INTO system_activity_logs (user_id, action, details) VALUES (?, ?, ?)",
                [$userId ?: null, $action, json_encode($details, JSON_UNESCAPED_UNICODE)]
            );

            $response->status(201)->json(['message' => 'Actividad registrada']);
        } catch (Exception $err) {
            error_log('[Reports] logActivity error: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al registrar actividad']);
        }
    }
}
