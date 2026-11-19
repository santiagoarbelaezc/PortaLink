<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\VaultCrypto;
use App\Config\Cloudinary;
use App\Config\Groq;
use Exception;

class LibraryController
{
    private static bool $orphansChecked = false;

    /**
     * Verifica que exista un usuario autenticado válido en el Request (inyectado por AuthMiddleware).
     */
    private function requireAuthenticatedUser(Request $request, Response $response): ?int
    {
        $userId = (int)($request->user->id ?? 0);
        if ($userId <= 0) {
            $response->status(401)->json([
                'ok' => false,
                'message' => 'Acceso no autorizado: sesión JWT requerida para acceder a la biblioteca.'
            ]);
            return null;
        }

        $this->ensureTables();
        $this->claimOrphanRecordsForAdmin($request, $userId);

        return $userId;
    }

    /**
     * Si el usuario autenticado es administrador, vincula automáticamente a su cuenta
     * cualquier carpeta o cuaderno previo que tuviera user_id = NULL.
     */
    private function claimOrphanRecordsForAdmin(Request $request, int $userId): void
    {
        if (self::$orphansChecked) {
            return;
        }
        self::$orphansChecked = true;

        $role = strtolower(trim((string)($request->user->rol ?? '')));
        if (in_array($role, ['admin', 'administrador'], true)) {
            try {
                Database::query("UPDATE notebook_folders SET user_id = $1 WHERE user_id IS NULL", [$userId]);
                Database::query("UPDATE notebook_modules SET user_id = $1 WHERE user_id IS NULL", [$userId]);
            } catch (Exception $e) {
                error_log('[LibraryController] claimOrphanRecords warning: ' . $e->getMessage());
            }
        }
    }

    /**
     * Verifica que una carpeta pertenezca al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsFolder(int $folderId, int $userId): bool
    {
        $stmt = Database::query(
            "SELECT id FROM notebook_folders WHERE id = $1 AND user_id = $2 LIMIT 1",
            [$folderId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Verifica que un cuaderno pertenezca al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsNotebook(int $notebookId, int $userId): bool
    {
        $stmt = Database::query(
            "SELECT m.id
             FROM notebook_modules m
             JOIN notebook_folders f ON f.id = m.folder_id
             WHERE m.id = $1 AND f.user_id = $2
             LIMIT 1",
            [$notebookId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Verifica que una página/apunte pertenezca al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsPage(int $pageId, int $userId): bool
    {
        $stmt = Database::query(
            "SELECT p.id
             FROM notebook_pages p
             JOIN notebook_modules m ON m.id = p.notebook_id
             JOIN notebook_folders f ON f.id = m.folder_id
             WHERE p.id = $1 AND f.user_id = $2
             LIMIT 1",
            [$pageId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Asegurar que las tablas existan si no se han creado vía setup-db
     */
    private function ensureTables(): void
    {
        try {
            $db = Database::getConnection();
            $db->exec("
                CREATE TABLE IF NOT EXISTS `notebook_folders` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` INT NULL,
                  `name` VARCHAR(255) NOT NULL,
                  `description` TEXT NULL,
                  `color` VARCHAR(50) NOT NULL DEFAULT '#2563eb',
                  `icon` VARCHAR(50) NOT NULL DEFAULT 'folder',
                  `order_index` INT NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `notebook_modules` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `folder_id` INT NOT NULL,
                  `user_id` INT NULL,
                  `title` VARCHAR(255) NOT NULL,
                  `description` TEXT NULL,
                  `color` VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
                  `icon` VARCHAR(50) NOT NULL DEFAULT 'book',
                  `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
                  `order_index` INT NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (`folder_id`),
                  INDEX (`user_id`),
                  CONSTRAINT `fk_notebook_module_folder` FOREIGN KEY (`folder_id`) REFERENCES `notebook_folders` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `notebook_pages` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `notebook_id` INT NOT NULL,
                  `title` VARCHAR(255) NOT NULL,
                  `slug` VARCHAR(255) NULL,
                  `content` LONGTEXT NULL,
                  `tags` VARCHAR(255) NULL,
                  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
                  `order_index` INT NOT NULL DEFAULT 0,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (`notebook_id`),
                  CONSTRAINT `fk_notebook_page_notebook` FOREIGN KEY (`notebook_id`) REFERENCES `notebook_modules` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            try { $db->exec("ALTER TABLE `notebook_pages` ADD COLUMN `tags` VARCHAR(255) NULL"); } catch (Exception $e) {}
            try { $db->exec("ALTER TABLE `notebook_pages` ADD COLUMN `is_pinned` TINYINT(1) NOT NULL DEFAULT 0"); } catch (Exception $e) {}
            try { $db->exec("ALTER TABLE `notebook_pages` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}
        } catch (Exception $e) {
            error_log('[LibraryController] ensureTables warning: ' . $e->getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // CARPETAS (NIVEL 1)
    // ──────────────────────────────────────────────────────────────

    public function getFolders(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $sql = "
                SELECT 
                    f.*,
                    COUNT(DISTINCT m.id) AS notebook_count,
                    COUNT(DISTINCT p.id) AS pages_count
                FROM notebook_folders f
                LEFT JOIN notebook_modules m ON m.folder_id = f.id
                LEFT JOIN notebook_pages p ON p.notebook_id = m.id
                WHERE f.user_id = $1
                GROUP BY f.id
                ORDER BY f.order_index ASC, f.created_at DESC
            ";

            $stmt = Database::query($sql, [$userId]);
            $folders = $stmt->fetchAll();

            $response->json(['ok' => true, 'data' => $folders]);
        } catch (Exception $e) {
            error_log('[LibraryController] getFolders error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener las carpetas']);
        }
    }

    public function createFolder(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $name = trim($request->body['name'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#2563eb');
            $icon = trim($request->body['icon'] ?? 'folder');

            if (empty($name)) {
                $response->status(400)->json(['ok' => false, 'message' => 'El nombre de la carpeta es requerido']);
                return;
            }

            $maxStmt = Database::query(
                "SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM notebook_folders WHERE user_id = $1",
                [$userId]
            );
            $maxRow = $maxStmt->fetch();
            $nextOrder = (int)($maxRow['next_order'] ?? 0);

            $sql = "INSERT INTO notebook_folders (user_id, name, description, color, icon, order_index) 
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

            $stmt = Database::query($sql, [$userId, $name, $description, $color, $icon, $nextOrder]);
            $folder = $stmt->fetch();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Carpeta creada exitosamente',
                'data' => $folder
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] createFolder error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear la carpeta']);
        }
    }

    public function updateFolder(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $rawId = (string)($request->params['id'] ?? '');
            if ($rawId === 'reorder' || (isset($request->body['ordered_ids']) && is_array($request->body['ordered_ids']))) {
                $orderedIds = array_values(array_filter(array_map('intval', $request->body['ordered_ids'] ?? []), fn($v) => $v > 0));
                foreach ($orderedIds as $idx => $folderId) {
                    Database::query(
                        "UPDATE notebook_folders SET order_index = $1 WHERE id = $2 AND user_id = $3",
                        [$idx, $folderId, $userId]
                    );
                }
                $response->json([
                    'ok' => true,
                    'message' => 'Orden de carpetas actualizado exitosamente'
                ]);
                return;
            }

            $id = (int)$rawId;
            $name = trim($request->body['name'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#2563eb');
            $icon = trim($request->body['icon'] ?? 'folder');
            $orderIndex = isset($request->body['order_index']) ? (int)$request->body['order_index'] : null;

            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de carpeta requerido']);
                return;
            }

            if (!$this->userOwnsFolder($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para modificar esta carpeta']);
                return;
            }

            if ($orderIndex !== null && empty($name)) {
                $stmt = Database::query(
                    "UPDATE notebook_folders SET order_index = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *",
                    [$orderIndex, $id, $userId]
                );
            } else {
                if (empty($name)) {
                    $response->status(400)->json(['ok' => false, 'message' => 'ID y nombre son requeridos']);
                    return;
                }
                $sql = "UPDATE notebook_folders 
                        SET name = $1, description = $2, color = $3, icon = $4, order_index = COALESCE($5, order_index), updated_at = NOW() 
                        WHERE id = $6 AND user_id = $7 RETURNING *";
                $stmt = Database::query($sql, [$name, $description, $color, $icon, $orderIndex, $id, $userId]);
            }

            $folder = $stmt->fetch();

            $response->json([
                'ok' => true,
                'message' => 'Carpeta actualizada exitosamente',
                'data' => $folder
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] updateFolder error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar la carpeta']);
        }
    }

    public function deleteFolder(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $id = (int)($request->params['id'] ?? 0);
            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de carpeta requerido']);
                return;
            }

            if (!$this->userOwnsFolder($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para eliminar esta carpeta']);
                return;
            }

            Database::query("DELETE FROM notebook_folders WHERE id = $1 AND user_id = $2", [$id, $userId]);

            $response->json(['ok' => true, 'message' => 'Carpeta eliminada correctamente']);
        } catch (Exception $e) {
            error_log('[LibraryController] deleteFolder error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar la carpeta']);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // CUADERNOS / MÓDULOS (NIVEL 2)
    // ──────────────────────────────────────────────────────────────

    public function getNotebooks(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $folderId = isset($request->query['folder_id']) ? (int)$request->query['folder_id'] : null;

            $sql = "
                SELECT 
                    m.*,
                    f.name AS folder_name,
                    f.color AS folder_color,
                    COUNT(p.id) AS pages_count
                FROM notebook_modules m
                JOIN notebook_folders f ON f.id = m.folder_id
                LEFT JOIN notebook_pages p ON p.notebook_id = m.id
                WHERE f.user_id = $1
            ";

            $params = [$userId];

            if ($folderId) {
                $sql .= " AND m.folder_id = $2";
                $params[] = $folderId;
            }

            $sql .= " GROUP BY m.id ORDER BY m.order_index ASC, m.is_favorite DESC, m.created_at DESC";

            $stmt = Database::query($sql, $params);
            $notebooks = $stmt->fetchAll();

            $response->json(['ok' => true, 'data' => $notebooks]);
        } catch (Exception $e) {
            error_log('[LibraryController] getNotebooks error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener los cuadernos']);
        }
    }

    public function createNotebook(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $folderId = (int)($request->body['folder_id'] ?? 0);
            $title = trim($request->body['title'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#3b82f6');
            $icon = trim($request->body['icon'] ?? 'book');

            if ($folderId <= 0 || empty($title)) {
                $response->status(400)->json(['ok' => false, 'message' => 'Debes indicar la carpeta y el título del cuaderno']);
                return;
            }

            if (!$this->userOwnsFolder($folderId, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para crear cuadernos en esta carpeta']);
                return;
            }

            $maxStmt = Database::query(
                "SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM notebook_modules WHERE folder_id = $1",
                [$folderId]
            );
            $maxRow = $maxStmt->fetch();
            $nextOrder = (int)($maxRow['next_order'] ?? 0);

            $sql = "INSERT INTO notebook_modules (folder_id, user_id, title, description, color, icon, order_index) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";

            $stmt = Database::query($sql, [$folderId, $userId, $title, $description, $color, $icon, $nextOrder]);
            $notebook = $stmt->fetch();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Cuaderno creado exitosamente',
                'data' => $notebook
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] createNotebook error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear el cuaderno']);
        }
    }

    public function updateNotebook(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $rawId = (string)($request->params['id'] ?? '');
            if ($rawId === 'reorder' || (isset($request->body['ordered_ids']) && is_array($request->body['ordered_ids']))) {
                $orderedIds = array_values(array_filter(array_map('intval', $request->body['ordered_ids'] ?? []), fn($v) => $v > 0));
                foreach ($orderedIds as $idx => $notebookId) {
                    if ($this->userOwnsNotebook($notebookId, $userId)) {
                        Database::query(
                            "UPDATE notebook_modules SET order_index = $1 WHERE id = $2",
                            [$idx, $notebookId]
                        );
                    }
                }
                $response->json([
                    'ok' => true,
                    'message' => 'Orden de cuadernos actualizado exitosamente'
                ]);
                return;
            }

            $id = (int)$rawId;
            $title = trim($request->body['title'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#3b82f6');
            $icon = trim($request->body['icon'] ?? 'book');
            $isFavorite = isset($request->body['is_favorite']) ? ($request->body['is_favorite'] ? 1 : 0) : null;
            $orderIndex = isset($request->body['order_index']) ? (int)$request->body['order_index'] : null;

            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
                return;
            }

            if (!$this->userOwnsNotebook($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para modificar este cuaderno']);
                return;
            }

            if (($isFavorite !== null || $orderIndex !== null) && empty($title)) {
                $stmt = Database::query(
                    "UPDATE notebook_modules SET is_favorite = COALESCE($1, is_favorite), order_index = COALESCE($2, order_index), updated_at = NOW() WHERE id = $3 RETURNING *",
                    [$isFavorite, $orderIndex, $id]
                );
            } else {
                $stmt = Database::query(
                    "UPDATE notebook_modules SET title = $1, description = $2, color = $3, icon = $4, is_favorite = COALESCE($5, is_favorite), order_index = COALESCE($6, order_index), updated_at = NOW() WHERE id = $7 RETURNING *",
                    [$title, $description, $color, $icon, $isFavorite, $orderIndex, $id]
                );
            }

            $notebook = $stmt->fetch();

            $response->json([
                'ok' => true,
                'message' => 'Cuaderno actualizado exitosamente',
                'data' => $notebook
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] updateNotebook error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar el cuaderno']);
        }
    }

    public function deleteNotebook(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $id = (int)($request->params['id'] ?? 0);
            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
                return;
            }

            if (!$this->userOwnsNotebook($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para eliminar este cuaderno']);
                return;
            }

            Database::query("DELETE FROM notebook_modules WHERE id = $1", [$id]);

            $response->json(['ok' => true, 'message' => 'Cuaderno eliminado correctamente']);
        } catch (Exception $e) {
            error_log('[LibraryController] deleteNotebook error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar el cuaderno']);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // APUNTES / PÁGINAS (NIVEL 3 — CIFRADO AES-256-GCM EN REPOSO)
    // ──────────────────────────────────────────────────────────────

    public function getPages(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $notebookId = (int)($request->query['notebook_id'] ?? 0);

            if ($notebookId <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
                return;
            }

            if (!$this->userOwnsNotebook($notebookId, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para acceder a los apuntes de este cuaderno']);
                return;
            }

            $sql = "
                SELECT p.* 
                FROM notebook_pages p
                WHERE p.notebook_id = $1
                ORDER BY p.is_pinned DESC, p.order_index ASC, p.created_at DESC
            ";

            $stmt = Database::query($sql, [$notebookId]);
            $pages = $stmt->fetchAll();

            // Descifrar en memoria y migrar automáticamente apuntes antiguos en texto plano a AES-256-GCM
            foreach ($pages as &$page) {
                $rawContent = (string)($page['content'] ?? '');
                if ($rawContent !== '') {
                    if (!VaultCrypto::isEncrypted($rawContent)) {
                        try {
                            $encrypted = VaultCrypto::encryptContent($rawContent);
                            Database::query(
                                "UPDATE notebook_pages SET content = $1 WHERE id = $2",
                                [$encrypted, $page['id']]
                            );
                        } catch (Exception $ex) {
                            error_log('[LibraryController] Auto-encryption migration warning: ' . $ex->getMessage());
                        }
                    } else {
                        $page['content'] = VaultCrypto::decryptContent($rawContent);
                    }
                }
            }
            unset($page);

            $response->json(['ok' => true, 'data' => $pages]);
        } catch (Exception $e) {
            error_log('[LibraryController] getPages error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener los apuntes']);
        }
    }

    public function createPage(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $notebookId = (int)($request->body['notebook_id'] ?? 0);
            $title = trim($request->body['title'] ?? 'Nuevo Apunte');
            $plainContent = (string)($request->body['content'] ?? '');
            $tags = trim($request->body['tags'] ?? '');

            if ($notebookId <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'Debes especificar el cuaderno perteneciente']);
                return;
            }

            if (!$this->userOwnsNotebook($notebookId, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para crear apuntes en este cuaderno']);
                return;
            }

            // Cifrar contenido con AES-256-GCM antes de almacenar en MySQL
            $encryptedContent = VaultCrypto::encryptContent($plainContent);

            $sql = "INSERT INTO notebook_pages (notebook_id, title, content, tags) 
                    VALUES ($1, $2, $3, $4) RETURNING *";

            $stmt = Database::query($sql, [$notebookId, $title, $encryptedContent, $tags]);
            $page = $stmt->fetch();

            if (is_array($page)) {
                $page['content'] = $plainContent;
            }

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Apunte creado y cifrado exitosamente',
                'data' => $page
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] createPage error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear el apunte']);
        }
    }

    public function updatePage(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $id = (int)($request->params['id'] ?? 0);
            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de apunte requerido']);
                return;
            }

            if (!$this->userOwnsPage($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para modificar este apunte']);
                return;
            }

            $title = isset($request->body['title']) ? trim((string)$request->body['title']) : null;
            $content = isset($request->body['content']) ? (string)$request->body['content'] : null;
            $tags = isset($request->body['tags']) ? trim((string)$request->body['tags']) : null;
            $isPinned = isset($request->body['is_pinned']) ? ($request->body['is_pinned'] ? 1 : 0) : null;

            $updates = [];
            $params = [];
            $idx = 1;

            if ($title !== null && $title !== '') {
                $updates[] = "title = $" . $idx++;
                $params[] = $title;
            }
            if ($content !== null) {
                $updates[] = "content = $" . $idx++;
                $params[] = VaultCrypto::encryptContent($content);
            }
            if ($tags !== null) {
                $updates[] = "tags = $" . $idx++;
                $params[] = $tags;
            }
            if ($isPinned !== null) {
                $updates[] = "is_pinned = $" . $idx++;
                $params[] = $isPinned;
            }

            if (empty($updates)) {
                $stmt = Database::query("SELECT * FROM notebook_pages WHERE id = $1", [$id]);
                $page = $stmt->fetch();
                if (is_array($page) && isset($page['content'])) {
                    $page['content'] = VaultCrypto::decryptContent((string)$page['content']);
                }
                $response->json(['ok' => true, 'message' => 'Sin cambios', 'data' => $page]);
                return;
            }

            $params[] = $id;
            $sql = "UPDATE notebook_pages SET " . implode(', ', $updates) . " WHERE id = $" . $idx . " RETURNING *";

            $stmt = Database::query($sql, $params);
            $page = $stmt->fetch();

            if (is_array($page) && isset($page['content'])) {
                $page['content'] = VaultCrypto::decryptContent((string)$page['content']);
            }

            $response->json([
                'ok' => true,
                'message' => 'Apunte guardado y cifrado correctamente',
                'data' => $page
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] updatePage error: ' . $e->getMessage());
            $response->status(500)->json([
                'ok' => false, 
                'message' => 'Error al actualizar el apunte'
            ]);
        }
    }

    public function deletePage(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $id = (int)($request->params['id'] ?? 0);
            if ($id <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de apunte requerido']);
                return;
            }

            if (!$this->userOwnsPage($id, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'No tienes permiso para eliminar este apunte']);
                return;
            }

            Database::query("DELETE FROM notebook_pages WHERE id = $1", [$id]);

            $response->json(['ok' => true, 'message' => 'Apunte eliminado correctamente']);
        } catch (Exception $e) {
            error_log('[LibraryController] deletePage error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar el apunte']);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // BUSCADOR GLOBAL MULTI-CUADERNO (CON DESCIFRADO EN MEMORIA POR USUARIO)
    // ──────────────────────────────────────────────────────────────

    public function searchLibrary(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $query = trim($request->query['q'] ?? '');
            if (empty($query)) {
                $response->json(['ok' => true, 'data' => []]);
                return;
            }

            $rawWords = preg_split('/\s+/', mb_strtolower($query));
            $words = array_values(array_filter($rawWords, fn($w) => mb_strlen($w) >= 2));
            $needleFull = mb_strtolower($query);

            // Consultar únicamente los apuntes pertenecientes al usuario autenticado
            $sql = "
                SELECT 
                    p.id AS page_id,
                    p.title AS page_title,
                    p.content AS page_content,
                    p.tags,
                    p.updated_at,
                    m.id AS notebook_id,
                    m.title AS notebook_title,
                    m.color AS notebook_color,
                    f.id AS folder_id,
                    f.name AS folder_name
                FROM notebook_pages p
                JOIN notebook_modules m ON m.id = p.notebook_id
                JOIN notebook_folders f ON f.id = m.folder_id
                WHERE f.user_id = $1
                ORDER BY p.updated_at DESC
            ";

            $stmt = Database::query($sql, [$userId]);
            $allUserPages = $stmt->fetchAll();

            $matchedResults = [];

            foreach ($allUserPages as $row) {
                $rawContent = (string)($row['page_content'] ?? '');
                $decryptedContent = '';

                if ($rawContent !== '') {
                    try {
                        if (!VaultCrypto::isEncrypted($rawContent)) {
                            $decryptedContent = $rawContent;
                            $encrypted = VaultCrypto::encryptContent($rawContent);
                            Database::query("UPDATE notebook_pages SET content = $1 WHERE id = $2", [$encrypted, $row['page_id']]);
                        } else {
                            $decryptedContent = VaultCrypto::decryptContent($rawContent);
                        }
                    } catch (Exception $ex) {
                        $decryptedContent = '';
                    }
                }

                $titleLower = mb_strtolower((string)($row['page_title'] ?? ''));
                $contentLower = mb_strtolower($decryptedContent);
                $tagsLower = mb_strtolower((string)($row['tags'] ?? ''));
                $notebookLower = mb_strtolower((string)($row['notebook_title'] ?? ''));
                $folderLower = mb_strtolower((string)($row['folder_name'] ?? ''));

                $fullMatch = str_contains($titleLower, $needleFull)
                    || str_contains($contentLower, $needleFull)
                    || str_contains($tagsLower, $needleFull)
                    || str_contains($notebookLower, $needleFull)
                    || str_contains($folderLower, $needleFull);

                $wordsMatch = false;
                if (!$fullMatch && count($words) > 1 && count($words) <= 5) {
                    $allWordsFound = true;
                    foreach ($words as $w) {
                        if (!str_contains($titleLower, $w) && !str_contains($contentLower, $w) && !str_contains($tagsLower, $w)) {
                            $allWordsFound = false;
                            break;
                        }
                    }
                    $wordsMatch = $allWordsFound;
                }

                if ($fullMatch || $wordsMatch) {
                    $row['page_content'] = $decryptedContent;
                    $row['_score'] = (str_contains($titleLower, $needleFull) ? 20 : 0)
                        + (str_contains($contentLower, $needleFull) ? 10 : 0)
                        + ($wordsMatch ? 5 : 0);
                    $matchedResults[] = $row;
                }
            }

            usort($matchedResults, fn($a, $b) => ($b['_score'] <=> $a['_score']));

            $matchedResults = array_slice($matchedResults, 0, 40);
            foreach ($matchedResults as &$resItem) {
                unset($resItem['_score']);
            }
            unset($resItem);

            $response->json(['ok' => true, 'data' => $matchedResults]);
        } catch (Exception $e) {
            error_log('[LibraryController] searchLibrary error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al realizar la búsqueda']);
        }
    }

    /**
     * Subir imagen a Cloudinary para notas y apuntes de la biblioteca (Solo formatos raster seguros)
     */
    public function uploadImage(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $fileInput = null;

            $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
            if (empty($_FILES) && empty($_POST) && $contentLength > 0 && !str_contains($request->getHeader('content-type') ?? '', 'application/json')) {
                $postMaxSize = ini_get('post_max_size') ?: '30M';
                $response->status(400)->json([
                    'ok' => false,
                    'message' => "El tamaño del archivo supera el límite de subida del servidor (post_max_size: {$postMaxSize})."
                ]);
                return;
            }

            $uploadedFile = $request->files['file'] ?? $_FILES['file'] ?? $request->files['image'] ?? $_FILES['image'] ?? null;

            if ($uploadedFile && is_array($uploadedFile)) {
                $error = $uploadedFile['error'] ?? UPLOAD_ERR_OK;
                if ($error !== UPLOAD_ERR_OK) {
                    $maxUpload = ini_get('upload_max_filesize') ?: '25M';
                    $msg = match ($error) {
                        UPLOAD_ERR_INI_SIZE => "El archivo supera el tamaño máximo permitido por el servidor ({$maxUpload}).",
                        UPLOAD_ERR_FORM_SIZE => "El archivo supera el tamaño máximo permitido por el formulario.",
                        UPLOAD_ERR_PARTIAL => "El archivo se transfirió solo parcialmente. Intenta de nuevo.",
                        UPLOAD_ERR_NO_FILE => "No se recibió ningún archivo.",
                        UPLOAD_ERR_NO_TMP_DIR => "Falta la carpeta temporal en el servidor para almacenar la subida.",
                        UPLOAD_ERR_CANT_WRITE => "No se pudo escribir el archivo en el disco del servidor.",
                        UPLOAD_ERR_EXTENSION => "Una extensión del servidor detuvo la subida del archivo.",
                        default => "Error al transferir el archivo (código de error: {$error})"
                    };
                    $response->status(400)->json([
                        'ok' => false,
                        'message' => $msg
                    ]);
                    return;
                }

                if (!empty($uploadedFile['tmp_name']) && file_exists($uploadedFile['tmp_name'])) {
                    $fileInput = $uploadedFile;
                }
            }

            if (empty($fileInput)) {
                if (!empty($request->body['image'])) {
                    $fileInput = (string)$request->body['image'];
                } elseif (!empty($request->body['file'])) {
                    $fileInput = (string)$request->body['file'];
                }
            }

            if (empty($fileInput)) {
                $response->status(400)->json([
                    'ok' => false,
                    'message' => 'No se proporcionó ningún archivo o imagen para subir.'
                ]);
                return;
            }

            if (is_array($fileInput)) {
                $size = $fileInput['size'] ?? 0;
                if ($size > 20 * 1024 * 1024) {
                    $response->status(400)->json([
                        'ok' => false,
                        'message' => 'El archivo supera el tamaño máximo permitido de 20 MB.'
                    ]);
                    return;
                }

                if (function_exists('finfo_open') && !empty($fileInput['tmp_name'])) {
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mimeType = finfo_file($finfo, $fileInput['tmp_name']);
                    finfo_close($finfo);

                    // SVG removido por seguridad para prevenir Stored XSS
                    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'];
                    if (!in_array($mimeType, $allowedMimes, true)) {
                        $response->status(400)->json([
                            'ok' => false,
                            'message' => 'Formato no permitido por seguridad. Solo se aceptan imágenes raster (JPG, PNG, WEBP, GIF, AVIF).'
                        ]);
                        return;
                    }
                }
            } elseif (is_string($fileInput) && str_starts_with(strtolower(trim($fileInput)), 'data:image/svg')) {
                $response->status(400)->json([
                    'ok' => false,
                    'message' => 'Por seguridad no se permiten archivos SVG.'
                ]);
                return;
            }

            $uploadResult = Cloudinary::upload($fileInput, [
                'folder' => 'portalink_library_notes'
            ]);

            $response->status(200)->json([
                'ok' => true,
                'message' => 'Imagen subida exitosamente a Cloudinary',
                'url' => $uploadResult['secure_url'],
                'secure_url' => $uploadResult['secure_url'],
                'public_id' => $uploadResult['public_id'],
                'width' => $uploadResult['width'],
                'height' => $uploadResult['height'],
                'format' => $uploadResult['format'],
                'bytes' => $uploadResult['bytes']
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] uploadImage error: ' . $e->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al subir la imagen'
            ]);
        }
    }

    /**
     * Valida y analiza fragmentos de código con Groq IA (enmascarando cualquier secreto o .env antes del envío)
     */
    public function validateCode(Request $request, Response $response): void
    {
        try {
            $userId = $this->requireAuthenticatedUser($request, $response);
            if ($userId === null) return;

            $data = !empty($request->body) ? $request->body : (method_exists($request, 'getBody') ? $request->getBody() : []);
            if (empty($data)) {
                $rawInput = file_get_contents('php://input');
                if (!empty($rawInput)) {
                    $decoded = json_decode($rawInput, true);
                    if (is_array($decoded)) {
                        $data = $decoded;
                    }
                }
            }

            $code = trim($data['code'] ?? '');
            $language = strtolower(trim($data['language'] ?? 'código'));

            if (empty($code)) {
                $response->status(400)->json([
                    'ok' => false,
                    'message' => 'El fragmento de código no puede estar vacío.'
                ]);
                return;
            }

            // Enmascarar cualquier credencial o variable .env antes de enviarla a Groq
            $safeCode = VaultCrypto::redactSecretsForAi($code);

            $systemPrompt = "Eres un auditor y linter de código experto de clase mundial especializado en bases de datos (SQL) y lenguajes de programación modernos (Python, TypeScript, JavaScript, HTML, CSS, JSON). " .
                "Analiza con máxima precisión técnica el código proporcionado por el usuario en el lenguaje '{$language}'. " .
                "Debes verificar si tiene errores de sintaxis, palabras clave mal escritas (por ejemplo 'FORM' en vez de 'FROM' en SQL), errores semánticos, problemas de indentación o dos puntos faltantes en Python, llaves sin cerrar, o fallas en tiempo de ejecución. " .
                "REGLA CRÍTICA: Debes responder ÚNICAMENTE con un JSON válido y parseable, sin texto previo ni posterior, sin comillas triples markdown (sin ```json ni ```), con la siguiente estructura exacta: " .
                "{" .
                "\"isValid\": true|false, " .
                "\"status\": \"valid\"|\"warning\"|\"error\", " .
                "\"summary\": \"Resumen conciso en 1 línea (ej: 'Consulta SQL válida y optimizada' o 'Error de sintaxis: 'FORM' no es una cláusula SQL válida')\", " .
                "\"issues\": [{\"line\": 1, \"message\": \"Descripción del error\", \"severity\": \"error\"|\"warning\"}], " .
                "\"fixedCode\": \"El código completo corregido si había errores, o el mismo código si es correcto\", " .
                "\"explanation\": \"Explicación concisa y didáctica de 1 o 2 frases sobre qué estaba mal y cómo se corrigió.\"" .
                "}";

            $userPrompt = "Lenguaje: {$language}\nCódigo:\n```\n{$safeCode}\n```";

            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ];

            $groqRes = Groq::callGroq($messages, [
                'model' => 'openai/gpt-oss-120b',
                'temperature' => 1.0
            ]);

            $rawContent = trim($groqRes['content'] ?? '');

            $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', $rawContent);
            $cleanJson = preg_replace('/\s*```$/', '', $cleanJson);
            $cleanJson = trim($cleanJson);

            if (!str_starts_with($cleanJson, '{') && preg_match('/\{[\s\S]*\}/', $cleanJson, $jsonMatch)) {
                $cleanJson = $jsonMatch[0];
            }

            $parsed = json_decode($cleanJson, true);

            if (!is_array($parsed) || !isset($parsed['isValid'])) {
                $hasError = (stripos($rawContent, 'error') !== false || stripos($rawContent, 'incorrect') !== false);
                $parsed = [
                    'isValid' => !$hasError,
                    'status' => $hasError ? 'error' : 'valid',
                    'summary' => $hasError ? 'Se detectaron observaciones en el código' : 'Código válido',
                    'issues' => $hasError ? [['line' => 1, 'message' => substr($rawContent, 0, 120), 'severity' => 'error']] : [],
                    'fixedCode' => $safeCode,
                    'explanation' => $rawContent
                ];
            }

            $response->status(200)->json([
                'ok' => true,
                'data' => $parsed
            ]);
        } catch (\Throwable $e) {
            error_log('[LibraryController] validateCode error: ' . $e->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al validar el código'
            ]);
        }
    }
}
