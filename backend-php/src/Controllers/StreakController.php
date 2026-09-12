<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class StreakController
{
    private static bool $schemaEnsured = false;

    private function ensureSchema(): void
    {
        if (self::$schemaEnsured) return;
        try {
            Database::query("
                CREATE TABLE IF NOT EXISTS daily_streaks (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  streak_count INT DEFAULT 1,
                  longest_streak INT DEFAULT 1,
                  last_active_date DATE NOT NULL,
                  login_done TINYINT(1) DEFAULT 1,
                  robot_talk_done TINYINT(1) DEFAULT 0,
                  library_study_done TINYINT(1) DEFAULT 0,
                  history_json TEXT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY unique_user_streak (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            self::$schemaEnsured = true;
        } catch (Exception $e) {
            error_log('[StreakController] Error ensuring schema: ' . $e->getMessage());
        }
    }

    private function getUserId(Request $req): int
    {
        if (isset($req->user)) {
            if (is_object($req->user) && isset($req->user->id)) {
                return (int)$req->user->id;
            }
            if (is_array($req->user) && isset($req->user['id'])) {
                return (int)$req->user['id'];
            }
        }
        return 1;
    }

    public function getStreak(Request $req, Response $res): void
    {
        $this->ensureSchema();
        $userId = $this->getUserId($req);
        
        // Usar la fecha local reportada por el cliente si es válida para evitar desfaces de zona horaria
        $clientToday = $req->query['today'] ?? null;
        $today = ($clientToday && preg_match('/^\d{4}-\d{2}-\d{2}$/', $clientToday)) ? $clientToday : date('Y-m-d');

        try {
            $record = Database::queryOne(
                "SELECT * FROM daily_streaks WHERE user_id = ?",
                [$userId]
            );

            if (!$record) {
                // Primer registro
                Database::query(
                    "INSERT INTO daily_streaks (user_id, streak_count, longest_streak, last_active_date, login_done, robot_talk_done, library_study_done, history_json) 
                     VALUES (?, 1, 1, ?, 1, 0, 0, ?)",
                    [$userId, $today, json_encode([$today])]
                );
                $record = Database::queryOne("SELECT * FROM daily_streaks WHERE user_id = ?", [$userId]);
            } else {
                $lastDate = $record['last_active_date'];
                
                if ($lastDate !== $today) {
                    $diffDays = (int)round((strtotime($today . ' 00:00:00 UTC') - strtotime($lastDate . ' 00:00:00 UTC')) / 86400);
                    $history = json_decode($record['history_json'] ?? '[]', true) ?: [];
                    if (!in_array($today, $history)) {
                        $history[] = $today;
                        if (count($history) > 400) {
                            array_shift($history);
                        }
                    }

                    if ($diffDays === 1) {
                        // Día consecutivo: racha continúa
                        $newStreak = (int)$record['streak_count'] + 1;
                        $newLongest = max($newStreak, (int)$record['longest_streak']);
                        Database::query(
                            "UPDATE daily_streaks 
                             SET streak_count = ?, longest_streak = ?, last_active_date = ?, login_done = 1, robot_talk_done = 0, library_study_done = 0, history_json = ? 
                             WHERE user_id = ?",
                            [$newStreak, $newLongest, $today, json_encode(array_values(array_unique($history))), $userId]
                        );
                    } else if ($diffDays > 1) {
                        // Racha rota: vuelve a 1
                        $newStreak = 1;
                        Database::query(
                            "UPDATE daily_streaks 
                             SET streak_count = ?, last_active_date = ?, login_done = 1, robot_talk_done = 0, library_study_done = 0, history_json = ? 
                             WHERE user_id = ?",
                            [$newStreak, $today, json_encode(array_values(array_unique($history))), $userId]
                        );
                    }
                    $record = Database::queryOne("SELECT * FROM daily_streaks WHERE user_id = ?", [$userId]);
                } else {
                    // Mismo día: asegurar que hoy esté en el historial y login_done esté en 1
                    $history = json_decode($record['history_json'] ?? '[]', true) ?: [];
                    if (!in_array($today, $history) || !(bool)$record['login_done']) {
                        if (!in_array($today, $history)) {
                            $history[] = $today;
                        }
                        Database::query(
                            "UPDATE daily_streaks SET history_json = ?, login_done = 1 WHERE user_id = ?",
                            [json_encode(array_values(array_unique($history))), $userId]
                        );
                        $record = Database::queryOne("SELECT * FROM daily_streaks WHERE user_id = ?", [$userId]);
                    }
                }
            }

            $res->json([
                'ok' => true,
                'data' => [
                    'streakCount' => (int)$record['streak_count'],
                    'longestStreak' => (int)$record['longest_streak'],
                    'lastActiveDate' => $record['last_active_date'],
                    'today' => $today,
                    'actions' => [
                        'login' => (bool)$record['login_done'],
                        'robot' => (bool)$record['robot_talk_done'],
                        'library' => (bool)$record['library_study_done']
                    ],
                    'history' => json_decode($record['history_json'] ?? '[]', true) ?: []
                ]
            ]);
        } catch (Exception $e) {
            $res->status(500)->json([
                'ok' => false,
                'message' => 'Error al obtener racha: ' . $e->getMessage()
            ]);
        }
    }

    public function recordAction(Request $req, Response $res): void
    {
        $this->ensureSchema();
        $userId = $this->getUserId($req);
        $body = $req->body ?: [];
        $action = $body['action'] ?? '';
        
        $clientToday = $body['today'] ?? ($req->query['today'] ?? null);
        $today = ($clientToday && preg_match('/^\d{4}-\d{2}-\d{2}$/', $clientToday)) ? $clientToday : date('Y-m-d');

        if (!in_array($action, ['login', 'robot', 'library'])) {
            $res->status(400)->json([
                'ok' => false,
                'message' => 'Acción no válida. Permitidas: login, robot, library'
            ]);
            return;
        }

        try {
            // Asegurar que exista
            $record = Database::queryOne("SELECT * FROM daily_streaks WHERE user_id = ?", [$userId]);
            if (!$record) {
                Database::query(
                    "INSERT INTO daily_streaks (user_id, streak_count, longest_streak, last_active_date, login_done, robot_talk_done, library_study_done, history_json) 
                     VALUES (?, 1, 1, ?, 1, 0, 0, ?)",
                    [$userId, $today, json_encode([$today])]
                );
            }

            $column = match($action) {
                'login' => 'login_done',
                'robot' => 'robot_talk_done',
                'library' => 'library_study_done',
            };

            $history = json_decode($record['history_json'] ?? '[]', true) ?: [];
            if (!in_array($today, $history)) {
                $history[] = $today;
            }

            Database::query(
                "UPDATE daily_streaks SET {$column} = 1, last_active_date = ?, history_json = ? WHERE user_id = ?",
                [$today, json_encode(array_values(array_unique($history))), $userId]
            );

            $updated = Database::queryOne("SELECT * FROM daily_streaks WHERE user_id = ?", [$userId]);

            $res->json([
                'ok' => true,
                'message' => "Acción {$action} registrada exitosamente",
                'data' => [
                    'streakCount' => (int)$updated['streak_count'],
                    'longestStreak' => (int)$updated['longest_streak'],
                    'lastActiveDate' => $updated['last_active_date'],
                    'today' => $today,
                    'actions' => [
                        'login' => (bool)$updated['login_done'],
                        'robot' => (bool)$updated['robot_talk_done'],
                        'library' => (bool)$updated['library_study_done']
                    ],
                    'history' => json_decode($updated['history_json'] ?? '[]', true) ?: []
                ]
            ]);
        } catch (Exception $e) {
            $res->status(500)->json([
                'ok' => false,
                'message' => 'Error al registrar acción: ' . $e->getMessage()
            ]);
        }
    }
}
