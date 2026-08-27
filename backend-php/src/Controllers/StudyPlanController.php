<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class StudyPlanController
{
    /**
     * Asegura que la tabla de planes de estudio exista en MySQL
     */
    private function ensureTables(): void
    {
        try {
            $db = Database::getConnection();
            $db->exec("
                CREATE TABLE IF NOT EXISTS `robot_study_plans` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` INT NULL,
                  `title` VARCHAR(255) NOT NULL,
                  `level` VARCHAR(20) NOT NULL DEFAULT 'A1',
                  `category` VARCHAR(50) NOT NULL DEFAULT 'grammar',
                  `content` LONGTEXT NULL,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (`user_id`),
                  INDEX (`level`),
                  INDEX (`category`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (Exception $e) {
            error_log('[StudyPlanController] ensureTables warning: ' . $e->getMessage());
        }
    }

    /**
     * Endpoint: GET /api/robot/study-plans
     * Devuelve todas las lecciones y planes de estudio almacenados en la base de datos
     */
    public function getAll(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $userId = $request->user->id ?? null;

            if ($userId) {
                $sql = "SELECT * FROM robot_study_plans WHERE (user_id = $1 OR user_id IS NULL) ORDER BY is_active DESC, updated_at DESC";
                $stmt = Database::query($sql, [$userId]);
            } else {
                $sql = "SELECT * FROM robot_study_plans ORDER BY is_active DESC, updated_at DESC";
                $stmt = Database::query($sql);
            }

            $rows = $stmt->fetchAll();
            $items = array_map(function ($row) {
                return [
                    'id' => (string)$row['id'],
                    'title' => $row['title'],
                    'level' => $row['level'],
                    'category' => $row['category'],
                    'content' => $row['content'] ?? '',
                    'isActive' => (bool)$row['is_active'],
                    'createdAt' => strtotime($row['created_at']) * 1000,
                    'updatedAt' => strtotime($row['updated_at']) * 1000,
                ];
            }, $rows);

            $response->json([
                'ok' => true,
                'data' => $items
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'error' => 'Error al obtener planes de estudio: ' . $e->getMessage(),
                'data' => []
            ]);
        }
    }

    /**
     * Endpoint: POST /api/robot/study-plans
     * Crea un nuevo plan de estudio en la base de datos
     */
    public function create(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $userId = $request->user->id ?? null;
            $body = $request->body;

            $title = trim($body['title'] ?? 'Nueva Lección de Inglés');
            $level = strtoupper(trim($body['level'] ?? 'A1'));
            $category = strtolower(trim($body['category'] ?? 'grammar'));
            $content = trim($body['content'] ?? '');
            $isActive = !empty($body['isActive']) ? 1 : 0;

            // Si se activa, desactivar los demás
            if ($isActive) {
                if ($userId) {
                    Database::query("UPDATE robot_study_plans SET is_active = 0 WHERE user_id = $1 OR user_id IS NULL", [$userId]);
                } else {
                    Database::query("UPDATE robot_study_plans SET is_active = 0");
                }
            }

            $sql = "INSERT INTO robot_study_plans (user_id, title, level, category, content, is_active) VALUES ($1, $2, $3, $4, $5, $6)";
            Database::query($sql, [$userId, $title, $level, $category, $content, $isActive]);

            $db = Database::getConnection();
            $newId = $db->lastInsertId();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Plan de estudio creado con éxito',
                'data' => [
                    'id' => (string)$newId,
                    'title' => $title,
                    'level' => $level,
                    'category' => $category,
                    'content' => $content,
                    'isActive' => (bool)$isActive,
                    'createdAt' => time() * 1000,
                    'updatedAt' => time() * 1000
                ]
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'error' => 'Error al crear plan de estudio: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Endpoint: PUT /api/robot/study-plans/:id
     * Actualiza un plan de estudio existente
     */
    public function update(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $id = $request->params['id'] ?? null;
            $userId = $request->user->id ?? null;
            $body = $request->body;

            if (!$id) {
                $response->status(400)->json(['ok' => false, 'error' => 'ID no proporcionado']);
                return;
            }

            $title = trim($body['title'] ?? 'Lección sin título');
            $level = strtoupper(trim($body['level'] ?? 'A1'));
            $category = strtolower(trim($body['category'] ?? 'grammar'));
            $content = trim($body['content'] ?? '');
            $isActive = !empty($body['isActive']) ? 1 : 0;

            if ($isActive) {
                if ($userId) {
                    Database::query("UPDATE robot_study_plans SET is_active = 0 WHERE user_id = $1 OR user_id IS NULL", [$userId]);
                } else {
                    Database::query("UPDATE robot_study_plans SET is_active = 0");
                }
            }

            $sql = "UPDATE robot_study_plans SET title = $1, level = $2, category = $3, content = $4, is_active = $5 WHERE id = $6";
            Database::query($sql, [$title, $level, $category, $content, $isActive, $id]);

            $response->json([
                'ok' => true,
                'message' => 'Plan de estudio actualizado',
                'data' => [
                    'id' => (string)$id,
                    'title' => $title,
                    'level' => $level,
                    'category' => $category,
                    'content' => $content,
                    'isActive' => (bool)$isActive,
                    'updatedAt' => time() * 1000
                ]
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'error' => 'Error al actualizar plan de estudio: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Endpoint: DELETE /api/robot/study-plans/:id
     * Elimina un plan de estudio
     */
    public function delete(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $id = $request->params['id'] ?? null;

            if (!$id) {
                $response->status(400)->json(['ok' => false, 'error' => 'ID no proporcionado']);
                return;
            }

            Database::query("DELETE FROM robot_study_plans WHERE id = $1", [$id]);

            $response->json([
                'ok' => true,
                'message' => 'Plan de estudio eliminado'
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'error' => 'Error al eliminar plan de estudio: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Endpoint: POST /api/robot/study-plans/:id/activate
     * Activa una lección específica y desactiva las demás
     */
    public function activate(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $id = $request->params['id'] ?? null;
            $userId = $request->user->id ?? null;

            if (!$id) {
                $response->status(400)->json(['ok' => false, 'error' => 'ID no proporcionado']);
                return;
            }

            if ($userId) {
                Database::query("UPDATE robot_study_plans SET is_active = 0 WHERE user_id = $1 OR user_id IS NULL", [$userId]);
            } else {
                Database::query("UPDATE robot_study_plans SET is_active = 0");
            }

            Database::query("UPDATE robot_study_plans SET is_active = 1 WHERE id = $1", [$id]);

            $stmt = Database::query("SELECT * FROM robot_study_plans WHERE id = $1 LIMIT 1", [$id]);
            $row = $stmt->fetch();

            $response->json([
                'ok' => true,
                'message' => 'Plan de estudio activado para Rotbot',
                'data' => $row ? [
                    'id' => (string)$row['id'],
                    'title' => $row['title'],
                    'level' => $row['level'],
                    'category' => $row['category'],
                    'content' => $row['content'] ?? '',
                    'isActive' => true,
                    'updatedAt' => time() * 1000
                ] : null
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'error' => 'Error al activar plan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Endpoint: GET /api/robot/study-plans/active
     * Obtiene el plan actualmente activo
     */
    public function getActive(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $userId = $request->user->id ?? null;

            if ($userId) {
                $stmt = Database::query("SELECT * FROM robot_study_plans WHERE is_active = 1 AND (user_id = $1 OR user_id IS NULL) LIMIT 1", [$userId]);
            } else {
                $stmt = Database::query("SELECT * FROM robot_study_plans WHERE is_active = 1 LIMIT 1");
            }

            $row = $stmt->fetch();

            $response->json([
                'ok' => true,
                'data' => $row ? [
                    'id' => (string)$row['id'],
                    'title' => $row['title'],
                    'level' => $row['level'],
                    'category' => $row['category'],
                    'content' => $row['content'] ?? '',
                    'isActive' => true,
                    'createdAt' => strtotime($row['created_at']) * 1000,
                    'updatedAt' => strtotime($row['updated_at']) * 1000,
                ] : null
            ]);
        } catch (Exception $e) {
            $response->status(500)->json([
                'ok' => false,
                'data' => null
            ]);
        }
    }
}
