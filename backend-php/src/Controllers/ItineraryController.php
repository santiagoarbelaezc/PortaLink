<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Config\Mailer;
use Exception;

class ItineraryController
{
    private static bool $schemaEnsured = false;

    private function ensureItinerarySchema(): void
    {
        if (self::$schemaEnsured) return;
        try {
            // 1. Crear tabla itinerary_tasks si no existe
            Database::query("
                CREATE TABLE IF NOT EXISTS itinerary_tasks (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  title VARCHAR(255) NOT NULL,
                  description TEXT NULL,
                  type VARCHAR(50) DEFAULT 'general',
                  task_date DATE NOT NULL,
                  task_time TIME NULL,
                  reminder_email VARCHAR(255) DEFAULT 'arbelaezz.c11@gmail.com',
                  reminder_sent TINYINT(1) DEFAULT 0,
                  reminder_sent_at DATETIME NULL,
                  status VARCHAR(50) DEFAULT 'pending',
                  completed TINYINT(1) DEFAULT 0,
                  completed_at DATETIME NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (user_id),
                  INDEX (task_date),
                  CONSTRAINT fk_itinerary_tasks_usuario FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. Crear tabla itinerary_notifications si no existe
            Database::query("
                CREATE TABLE IF NOT EXISTS itinerary_notifications (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  task_id INT NULL,
                  type VARCHAR(100) DEFAULT 'reminder',
                  title VARCHAR(255) NULL,
                  message TEXT NULL,
                  is_read TINYINT(1) DEFAULT 0,
                  seen TINYINT(1) DEFAULT 0,
                  seen_at DATETIME NULL,
                  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX (user_id),
                  CONSTRAINT fk_itinerary_notif_usuario FOREIGN KEY (user_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                  CONSTRAINT fk_itinerary_notif_task FOREIGN KEY (task_id) REFERENCES itinerary_tasks (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. Verificar y migrar columnas si la tabla ya existía de antes
            $stmt = Database::query("SHOW COLUMNS FROM itinerary_tasks LIKE 'completed'");
            if (!$stmt->fetch()) {
                Database::query("ALTER TABLE itinerary_tasks ADD COLUMN completed TINYINT(1) DEFAULT 0 AFTER status");
                Database::query("ALTER TABLE itinerary_tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            }

            $stmtRem = Database::query("SHOW COLUMNS FROM itinerary_tasks LIKE 'reminder_email'");
            if (!$stmtRem->fetch()) {
                Database::query("ALTER TABLE itinerary_tasks ADD COLUMN reminder_email VARCHAR(255) DEFAULT 'arbelaezz.c11@gmail.com' AFTER task_time");
                Database::query("ALTER TABLE itinerary_tasks ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0 AFTER reminder_email");
                Database::query("ALTER TABLE itinerary_tasks ADD COLUMN reminder_sent_at DATETIME NULL AFTER reminder_sent");
            }

            $stmtNotif = Database::query("SHOW COLUMNS FROM itinerary_notifications LIKE 'seen'");
            if (!$stmtNotif->fetch()) {
                Database::query("ALTER TABLE itinerary_notifications ADD COLUMN seen TINYINT(1) DEFAULT 0 AFTER is_read");
                Database::query("ALTER TABLE itinerary_notifications ADD COLUMN seen_at DATETIME NULL AFTER seen");
                Database::query("ALTER TABLE itinerary_notifications ADD COLUMN sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_at");
            }

            // 4. Verificar índice único para evitar duplicados al usar INSERT IGNORE
            try {
                Database::query("ALTER TABLE itinerary_notifications ADD UNIQUE INDEX uk_user_task (user_id, task_id)");
            } catch (Exception $idxErr) {
                // Si ya existe, ignorar error
            }

            self::$schemaEnsured = true;
        } catch (Exception $err) {
            error_log('[Itinerary] Error ensuring schema columns: ' . $err->getMessage());
        }
    }

    private function buildFilters(int $userId, array $query): array
    {
        $conditions = ['t.user_id = $1'];
        $params = [$userId];
        $idx = 2;

        if (!empty($query['type']) && in_array($query['type'], ['work', 'personal', 'urgent'])) {
            $conditions[] = "t.type = \${$idx}";
            $params[] = $query['type'];
            $idx++;
        }

        if (isset($query['completed']) && $query['completed'] !== '') {
            $conditions[] = "t.completed = \${$idx}";
            $params[] = ($query['completed'] === 'true' || $query['completed'] === '1' || $query['completed'] === true);
            $idx++;
        }

        if (!empty($query['date_from'])) {
            $conditions[] = "t.task_date >= \${$idx}";
            $params[] = $query['date_from'];
            $idx++;
        }

        if (!empty($query['date_to'])) {
            $conditions[] = "t.task_date <= \${$idx}";
            $params[] = $query['date_to'];
            $idx++;
        }

        if (!empty($query['week_start'])) {
            $conditions[] = "t.task_date >= \${$idx}";
            $params[] = $query['week_start'];
            $idx++;

            $weekEndStr = date('Y-m-d', strtotime($query['week_start'] . ' + 6 days'));
            $conditions[] = "t.task_date <= \${$idx}";
            $params[] = $weekEndStr;
            $idx++;
        }

        return ['where' => implode(' AND ', $conditions), 'params' => $params];
    }

    public function getTasks(Request $request, Response $response): void
    {
        try {
            $this->ensureItinerarySchema();
            $this->checkAndSendDueReminders();
            $filters = $this->buildFilters((int)$request->user->id, $request->query);
            $stmt = Database::query(
                "SELECT
                    t.id, t.user_id, t.title, t.description,
                    t.type, t.task_date, t.task_time, t.completed,
                    t.completed_at, t.created_at, t.updated_at
                 FROM itinerary_tasks t
                  WHERE {$filters['where']}
                  ORDER BY t.task_date ASC, (t.task_time IS NULL) ASC, t.task_time ASC, t.created_at ASC",
                $filters['params']
            );
            $tasks = $stmt->fetchAll();

            $response->json([
                'ok' => true,
                'count' => count($tasks),
                'tasks' => $tasks
            ]);
        } catch (Exception $err) {
            error_log('[Itinerary] getTasks error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener las tareas']);
        }
    }

    public function getWeek(Request $request, Response $response): void
    {
        $weekStart = $request->query['week_start'] ?? null;

        if (!$weekStart || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStart)) {
            $response->status(400)->json(['ok' => false, 'message' => 'Parámetro week_start requerido (YYYY-MM-DD)']);
            return;
        }

        try {
            $this->ensureItinerarySchema();
            $weekEndStr = date('Y-m-d', strtotime($weekStart . ' + 6 days'));

            $stmt = Database::query(
                "SELECT
                    t.id, t.title, t.description,
                    t.type, t.task_date AS task_date,
                    t.task_time AS task_time,
                    t.completed, t.completed_at, t.created_at
                 FROM itinerary_tasks t
                 WHERE t.user_id = $1
                   AND t.task_date BETWEEN $2 AND $3
                 ORDER BY t.task_date ASC, (t.task_time IS NULL) ASC, t.task_time ASC",
                [$request->user->id, $weekStart, $weekEndStr]
            );

            $response->json([
                'ok' => true,
                'week_start' => $weekStart,
                'week_end' => $weekEndStr,
                'tasks' => $stmt->fetchAll()
            ]);
        } catch (Exception $err) {
            error_log('[Itinerary] getWeek error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener la semana', 'details' => $err->getMessage()]);
        }
    }

    public function getToday(Request $request, Response $response): void
    {
        $userId = (int)$request->user->id;
        try {
            $this->ensureItinerarySchema();
            $this->checkAndSendDueReminders();
            $stmt = Database::query(
                "SELECT
                    t.id, t.title, t.description, t.type,
                    t.task_date AS task_date,
                    t.task_time AS task_time,
                    t.completed
                 FROM itinerary_tasks t
                 WHERE t.user_id = $1
                   AND t.task_date = CURRENT_DATE
                 ORDER BY (t.task_time IS NULL) ASC, t.task_time ASC",
                [$userId]
            );
            $tasks = $stmt->fetchAll();

            if (count($tasks) > 0) {
                $taskIds = array_column($tasks, 'id');
                $params = [$userId];
                $placeholders = [];
                foreach ($taskIds as $i => $tid) {
                    $idx = $i + 2;
                    $placeholders[] = "(\$1, \${$idx})";
                    $params[] = $tid;
                }
                $valuesSql = implode(', ', $placeholders);

                Database::query(
                    "INSERT IGNORE INTO itinerary_notifications (user_id, task_id)
                     VALUES {$valuesSql}",
                    $params
                );
            }

            $nowHours = (int)date('G');
            $nowMinutes = (int)date('i');
            $totalNowMinutes = $nowHours * 60 + $nowMinutes;

            $classified = [
                'current'   => [],
                'upcoming'  => [],
                'overdue'   => [],
                'no_time'   => [],
                'completed' => []
            ];

            foreach ($tasks as $task) {
                if (!empty($task['completed'])) {
                    $classified['completed'][] = $task;
                } elseif (empty($task['task_time'])) {
                    $classified['no_time'][] = $task;
                } else {
                    $parts = explode(':', $task['task_time']);
                    $h = (int)($parts[0] ?? 0);
                    $m = (int)($parts[1] ?? 0);
                    $taskMin = $h * 60 + $m;

                    if ($taskMin <= $totalNowMinutes && $totalNowMinutes < $taskMin + 60) {
                        $classified['current'][] = $task;
                    } elseif ($taskMin < $totalNowMinutes) {
                        $classified['overdue'][] = $task;
                    } else {
                        $classified['upcoming'][] = $task;
                    }
                }
            }

            $stmtUnseen = Database::query(
                "SELECT COUNT(*) AS unseen
                 FROM itinerary_notifications n
                 INNER JOIN itinerary_tasks t ON t.id = n.task_id
                 WHERE n.user_id = $1
                   AND n.seen = FALSE
                   AND t.task_date = CURRENT_DATE
                   AND t.completed = FALSE",
                [$userId]
            );
            $rowUnseen = $stmtUnseen->fetch();
            $unseen = (int)($rowUnseen['unseen'] ?? 0);

            $response->json(array_merge([
                'ok' => true,
                'date' => date('Y-m-d'),
                'unseen' => $unseen
            ], $classified));
        } catch (Exception $err) {
            error_log('[Itinerary] getToday error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener las tareas de hoy']);
        }
    }

    public function getNotifications(Request $request, Response $response): void
    {
        $userId = (int)$request->user->id;
        try {
            $this->ensureItinerarySchema();
            $stmt = Database::query(
                "SELECT
                    n.id AS notif_id, n.seen, n.sent_at,
                    t.id AS task_id, t.title, t.type,
                    t.task_date AS task_date,
                    t.task_time AS task_time,
                    t.completed
                 FROM itinerary_notifications n
                 INNER JOIN itinerary_tasks t ON t.id = n.task_id
                 WHERE n.user_id = $1
                   AND t.task_date = CURRENT_DATE
                 ORDER BY (t.task_time IS NULL) ASC, t.task_time ASC",
                [$userId]
            );
            $rows = $stmt->fetchAll();

            $unseen = 0;
            foreach ($rows as $r) {
                if (empty($r['seen']) && empty($r['completed'])) {
                    $unseen++;
                }
            }

            $response->json([
                'ok' => true,
                'unseen' => $unseen,
                'notifications' => $rows
            ]);
        } catch (Exception $err) {
            error_log('[Itinerary] getNotifications error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener notificaciones']);
        }
    }

    public function markNotificationSeen(Request $request, Response $response): void
    {
        $userId = (int)$request->user->id;
        $taskId = (int)($request->params['taskId'] ?? 0);
        try {
            $this->ensureItinerarySchema();
            Database::query(
                "UPDATE itinerary_notifications
                 SET seen = TRUE, seen_at = NOW()
                 WHERE user_id = $1 AND task_id = $2",
                [$userId, $taskId]
            );
            $response->json(['ok' => true, 'message' => 'Notificación marcada como vista']);
        } catch (Exception $err) {
            error_log('[Itinerary] markNotificationSeen error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar notificación']);
        }
    }

    public function createTask(Request $request, Response $response): void
    {
        $title = $request->body['title'] ?? null;
        $description = $request->body['description'] ?? null;
        $type = $request->body['type'] ?? 'work';
        $taskDate = $request->body['task_date'] ?? null;
        $taskTime = $request->body['task_time'] ?? null;

        if (!$title || !$taskDate) {
            $response->status(400)->json(['ok' => false, 'message' => 'Los campos title y task_date son obligatorios']);
            return;
        }

        $todayStr = date('Y-m-d');
        $maxStr = date('Y-m-d', strtotime('+65 days'));

        if ($taskDate < $todayStr || $taskDate > $maxStr) {
            $response->status(400)->json(['ok' => false, 'message' => 'La fecha debe estar entre hoy y los próximos 65 días']);
            return;
        }

        $reminderEmail = trim($request->body['reminder_email'] ?? 'arbelaezz.c11@gmail.com');
        if (empty($reminderEmail)) {
            $reminderEmail = 'arbelaezz.c11@gmail.com';
        }

        try {
            $this->ensureItinerarySchema();
            $stmt = Database::query(
                "INSERT INTO itinerary_tasks (user_id, title, description, type, task_date, task_time, reminder_email)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, title, description, type,
                           task_date AS task_date,
                           task_time AS task_time,
                           reminder_email,
                           completed, created_at",
                [
                    $request->user->id,
                    trim($title),
                    $description ? trim($description) : null,
                    $type,
                    $taskDate,
                    $taskTime ?: null,
                    $reminderEmail
                ]
            );

            $createdTask = $stmt->fetch();

            // Enviar correo de confirmación de actividad agendada a arbelaezz.c11@gmail.com
            $userName = $request->user->nombre ?? $request->user->name ?? 'Santiago';
            try {
                Mailer::sendTaskReminderEmail($reminderEmail, $userName, $createdTask, false);
            } catch (Exception $mailErr) {
                error_log('[Itinerary] Error al enviar correo de confirmación de tarea: ' . $mailErr->getMessage());
            }

            // Chequeo de recordatorios pendientes de 2 horas
            $this->checkAndSendDueReminders();

            $response->status(201)->json(['ok' => true, 'task' => $createdTask]);
        } catch (Exception $err) {
            error_log('[Itinerary] createTask error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear la tarea']);
        }
    }

    public function updateTask(Request $request, Response $response): void
    {
        $id = (int)($request->params['id'] ?? 0);
        $title = $request->body['title'] ?? null;
        $description = $request->body['description'] ?? null;
        $type = $request->body['type'] ?? 'work';
        $taskDate = $request->body['task_date'] ?? null;
        $taskTime = $request->body['task_time'] ?? null;

        if (!$title || !$taskDate) {
            $response->status(400)->json(['ok' => false, 'message' => 'title y task_date son obligatorios']);
            return;
        }

        try {
            $this->ensureItinerarySchema();
            $stmtCheck = Database::query('SELECT id FROM itinerary_tasks WHERE id = $1 AND user_id = $2', [$id, $request->user->id]);
            if (!$stmtCheck->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Tarea no encontrada']);
                return;
            }

            $stmt = Database::query(
                "UPDATE itinerary_tasks
                 SET title = $1, description = $2, type = $3,
                     task_date = $4, task_time = $5
                 WHERE id = $6 AND user_id = $7
                 RETURNING id, title, description, type,
                           task_date AS task_date,
                           task_time AS task_time,
                           completed, updated_at",
                [
                    trim($title),
                    $description ? trim($description) : null,
                    $type,
                    $taskDate,
                    $taskTime ?: null,
                    $id,
                    $request->user->id
                ]
            );

            $response->json(['ok' => true, 'task' => $stmt->fetch()]);
        } catch (Exception $err) {
            error_log('[Itinerary] updateTask error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar la tarea']);
        }
    }

    public function toggleTask(Request $request, Response $response): void
    {
        $id = (int)($request->params['id'] ?? 0);
        try {
            $this->ensureItinerarySchema();
            $stmt = Database::query(
                "UPDATE itinerary_tasks
                 SET
                     completed    = NOT completed,
                     completed_at = CASE WHEN NOT completed THEN NOW() ELSE NULL END
                 WHERE id = $1 AND user_id = $2
                 RETURNING id, completed, completed_at",
                [$id, $request->user->id]
            );

            $task = $stmt->fetch();
            if (!$task) {
                $response->status(404)->json(['ok' => false, 'message' => 'Tarea no encontrada']);
                return;
            }

            $response->json(['ok' => true, 'task' => $task]);
        } catch (Exception $err) {
            error_log('[Itinerary] toggleTask error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al cambiar el estado de la tarea']);
        }
    }

    public function deleteTask(Request $request, Response $response): void
    {
        $id = (int)($request->params['id'] ?? 0);
        try {
            $this->ensureItinerarySchema();
            $stmt = Database::query('DELETE FROM itinerary_tasks WHERE id = $1 AND user_id = $2 RETURNING id', [$id, $request->user->id]);
            $row = $stmt->fetch();

            if (!$row) {
                $response->status(404)->json(['ok' => false, 'message' => 'Tarea no encontrada o no tienes permiso para eliminarla']);
                return;
            }

            $response->json(['ok' => true, 'message' => 'Tarea eliminada correctamente', 'id' => $row['id']]);
        } catch (Exception $err) {
            error_log('[Itinerary] deleteTask error: ' . $err->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar la tarea']);
        }
    }

    /**
     * Procesa y envía recordatorios 2 horas antes de las actividades.
     */
    public function checkAndSendDueReminders(): array
    {
        $this->ensureItinerarySchema();
        $processed = [];

        try {
            $now = new \DateTime();

            // Buscar tareas no completadas con hora asignada donde aún no se haya enviado recordatorio
            $stmt = Database::query(
                "SELECT t.id, t.user_id, t.title, t.description, t.type, t.task_date, t.task_time,
                        COALESCE(t.reminder_email, 'arbelaezz.c11@gmail.com') as reminder_email,
                        u.nombre as user_nombre
                 FROM itinerary_tasks t
                 LEFT JOIN usuarios u ON u.id = t.user_id
                 WHERE t.completed = 0
                   AND (t.reminder_sent = 0 OR t.reminder_sent IS NULL)
                   AND t.task_time IS NOT NULL
                   AND t.task_date >= CURRENT_DATE - INTERVAL 1 DAY
                   AND t.task_date <= CURRENT_DATE + INTERVAL 1 DAY"
            );

            $candidateTasks = $stmt->fetchAll();

            foreach ($candidateTasks as $task) {
                $taskDateStr = $task['task_date'];
                $taskTimeStr = substr($task['task_time'], 0, 5);
                $taskDateTime = \DateTime::createFromFormat('Y-m-d H:i', "{$taskDateStr} {$taskTimeStr}");

                if (!$taskDateTime) {
                    continue;
                }

                // Diferencia en segundos entre la tarea y la hora actual
                $diffSeconds = $taskDateTime->getTimestamp() - $now->getTimestamp();

                // Umbral: Entre -30 minutos y 2 horas y 5 minutos hacia adelante (hasta 7500 segundos)
                if ($diffSeconds >= -1800 && $diffSeconds <= 7500) {
                    $targetEmail = !empty($task['reminder_email']) ? $task['reminder_email'] : 'arbelaezz.c11@gmail.com';
                    $recipientName = !empty($task['user_nombre']) ? $task['user_nombre'] : 'Santiago';

                    $sent = Mailer::sendTaskReminderEmail($targetEmail, $recipientName, $task, true);

                    if ($sent) {
                        Database::query(
                            "UPDATE itinerary_tasks
                             SET reminder_sent = 1, reminder_sent_at = NOW()
                             WHERE id = $1",
                            [$task['id']]
                        );
                        $processed[] = [
                            'task_id' => $task['id'],
                            'title' => $task['title'],
                            'email' => $targetEmail,
                            'status' => 'sent'
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log('[Itinerary] checkAndSendDueReminders error: ' . $e->getMessage());
        }

        return $processed;
    }

    /**
     * Endpoint para consultar y despachar recordatorios manualmente o vía cron
     */
    public function checkReminders(Request $request, Response $response): void
    {
        $processed = $this->checkAndSendDueReminders();
        $response->json([
            'ok' => true,
            'message' => count($processed) . ' recordatorio(s) de 2 horas procesado(s)',
            'processed' => $processed
        ]);
    }
}
