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
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    action VARCHAR(255) NOT NULL,
                    details JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
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
            $response->json(['logs' => $stmt->fetchAll()]);
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
                "INSERT INTO system_activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                [$userId ?: null, $action, json_encode($details, JSON_UNESCAPED_UNICODE)]
            );

            $response->status(201)->json(['message' => 'Actividad registrada']);
        } catch (Exception $err) {
            error_log('[Reports] logActivity error: ' . $err->getMessage());
            $response->status(500)->json(['message' => 'Error al registrar actividad']);
        }
    }
}
