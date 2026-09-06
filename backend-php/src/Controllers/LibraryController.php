<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;

class LibraryController
{
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

            // Self-healing: asegurar columnas si la tabla existía previamente sin ellas
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
            $this->ensureTables();
            $userId = $request->user->id ?? null;

            $sql = "
                SELECT 
                    f.*,
                    COUNT(DISTINCT m.id) AS notebook_count,
                    COUNT(DISTINCT p.id) AS pages_count
                FROM notebook_folders f
                LEFT JOIN notebook_modules m ON m.folder_id = f.id
                LEFT JOIN notebook_pages p ON p.notebook_id = m.id
                WHERE (f.user_id = $1 OR f.user_id IS NULL)
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
            $this->ensureTables();
            $userId = $request->user->id ?? null;
            $name = trim($request->body['name'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#2563eb');
            $icon = trim($request->body['icon'] ?? 'folder');

            if (empty($name)) {
                $response->status(400)->json(['ok' => false, 'message' => 'El nombre de la carpeta es requerido']);
                return;
            }

            $sql = "INSERT INTO notebook_folders (user_id, name, description, color, icon) 
                    VALUES ($1, $2, $3, $4, $5) RETURNING *";

            $stmt = Database::query($sql, [$userId, $name, $description, $color, $icon]);
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
            $id = $request->params['id'] ?? null;
            $name = trim($request->body['name'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#2563eb');
            $icon = trim($request->body['icon'] ?? 'folder');

            if (!$id || empty($name)) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID y nombre son requeridos']);
                return;
            }

            $sql = "UPDATE notebook_folders 
                    SET name = $1, description = $2, color = $3, icon = $4, updated_at = NOW() 
                    WHERE id = $5 RETURNING *";

            $stmt = Database::query($sql, [$name, $description, $color, $icon, $id]);
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
            $id = $request->params['id'] ?? null;
            if (!$id) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de carpeta requerido']);
                return;
            }

            Database::query("DELETE FROM notebook_folders WHERE id = $1", [$id]);

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
            $this->ensureTables();
            $folderId = $request->query['folder_id'] ?? null;
            $userId = $request->user->id ?? null;

            $sql = "
                SELECT 
                    m.*,
                    f.name AS folder_name,
                    f.color AS folder_color,
                    COUNT(p.id) AS pages_count
                FROM notebook_modules m
                JOIN notebook_folders f ON f.id = m.folder_id
                LEFT JOIN notebook_pages p ON p.notebook_id = m.id
                WHERE (m.user_id = $1 OR m.user_id IS NULL)
            ";

            $params = [$userId];

            if ($folderId) {
                $sql .= " AND m.folder_id = $2";
                $params[] = $folderId;
            }

            $sql .= " GROUP BY m.id ORDER BY m.is_favorite DESC, m.order_index ASC, m.created_at DESC";

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
            $this->ensureTables();
            $userId = $request->user->id ?? null;
            $folderId = $request->body['folder_id'] ?? null;
            $title = trim($request->body['title'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#3b82f6');
            $icon = trim($request->body['icon'] ?? 'book');

            if (!$folderId || empty($title)) {
                $response->status(400)->json(['ok' => false, 'message' => 'Debes indicar la carpeta y el título del cuaderno']);
                return;
            }

            $sql = "INSERT INTO notebook_modules (folder_id, user_id, title, description, color, icon) 
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

            $stmt = Database::query($sql, [$folderId, $userId, $title, $description, $color, $icon]);
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
            $id = $request->params['id'] ?? null;
            $title = trim($request->body['title'] ?? '');
            $description = trim($request->body['description'] ?? '');
            $color = trim($request->body['color'] ?? '#3b82f6');
            $icon = trim($request->body['icon'] ?? 'book');
            $isFavorite = isset($request->body['is_favorite']) ? ($request->body['is_favorite'] ? 1 : 0) : null;

            if (!$id) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
                return;
            }

            if ($isFavorite !== null && empty($title)) {
                // Solo actualización de favorito
                $stmt = Database::query("UPDATE notebook_modules SET is_favorite = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [$isFavorite, $id]);
            } else {
                $stmt = Database::query(
                    "UPDATE notebook_modules SET title = $1, description = $2, color = $3, icon = $4, is_favorite = COALESCE($5, is_favorite), updated_at = NOW() WHERE id = $6 RETURNING *",
                    [$title, $description, $color, $icon, $isFavorite, $id]
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
            $id = $request->params['id'] ?? null;
            if (!$id) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
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
    // APUNTES / PÁGINAS (NIVEL 3)
    // ──────────────────────────────────────────────────────────────

    public function getPages(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $notebookId = $request->query['notebook_id'] ?? null;

            if (!$notebookId) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de cuaderno requerido']);
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

            $response->json(['ok' => true, 'data' => $pages]);
        } catch (Exception $e) {
            error_log('[LibraryController] getPages error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener los apuntes']);
        }
    }

    public function createPage(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $notebookId = $request->body['notebook_id'] ?? null;
            $title = trim($request->body['title'] ?? 'Nuevo Apunte');
            $content = $request->body['content'] ?? '';
            $tags = trim($request->body['tags'] ?? '');

            if (!$notebookId) {
                $response->status(400)->json(['ok' => false, 'message' => 'Debes especificar el cuaderno perteneciente']);
                return;
            }

            $sql = "INSERT INTO notebook_pages (notebook_id, title, content, tags) 
                    VALUES ($1, $2, $3, $4) RETURNING *";

            $stmt = Database::query($sql, [$notebookId, $title, $content, $tags]);
            $page = $stmt->fetch();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Apunte creado exitosamente',
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
            $this->ensureTables();
            $id = $request->params['id'] ?? null;
            if (!$id) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de apunte requerido']);
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
                $params[] = $content;
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
                $response->json(['ok' => true, 'message' => 'Sin cambios', 'data' => $page]);
                return;
            }

            $params[] = $id;
            $sql = "UPDATE notebook_pages SET " . implode(', ', $updates) . " WHERE id = $" . $idx . " RETURNING *";

            $stmt = Database::query($sql, $params);
            $page = $stmt->fetch();

            $response->json([
                'ok' => true,
                'message' => 'Apunte guardado correctamente',
                'data' => $page
            ]);
        } catch (Exception $e) {
            error_log('[LibraryController] updatePage error: ' . $e->getMessage());
            $response->status(500)->json([
                'ok' => false, 
                'message' => 'Error al actualizar el apunte: ' . $e->getMessage()
            ]);
        }
    }

    public function deletePage(Request $request, Response $response): void
    {
        try {
            $id = $request->params['id'] ?? null;
            if (!$id) {
                $response->status(400)->json(['ok' => false, 'message' => 'ID de apunte requerido']);
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
    // BUSCADOR GLOBAL MULTI-CUADERNO
    // ──────────────────────────────────────────────────────────────

    public function searchLibrary(Request $request, Response $response): void
    {
        try {
            $this->ensureTables();
            $query = trim($request->query['q'] ?? '');
            if (empty($query)) {
                $response->json(['ok' => true, 'data' => []]);
                return;
            }

            $userId = $request->user->id ?? null;
            $searchTerm = '%' . $query . '%';

            // Dividir en términos si hay varias palabras
            $rawWords = preg_split('/\s+/', $query);
            $words = array_values(array_filter($rawWords, fn($w) => mb_strlen($w) >= 2));

            $conditions = [];
            $params = [];
            $pIdx = 1;

            // Condición 1: coincidencia con la frase completa
            $conditions[] = "(p.title LIKE $" . $pIdx . " OR p.content LIKE $" . $pIdx . " OR p.tags LIKE $" . $pIdx . " OR m.title LIKE $" . $pIdx . " OR f.name LIKE $" . $pIdx . ")";
            $params[] = $searchTerm;
            $pIdx++;

            // Condición 2: si hay varias palabras, encontrar apuntes que contengan todas las palabras clave
            if (count($words) > 1 && count($words) <= 5) {
                $wordConds = [];
                foreach ($words as $word) {
                    $wordConds[] = "(p.title LIKE $" . $pIdx . " OR p.content LIKE $" . $pIdx . " OR p.tags LIKE $" . $pIdx . ")";
                    $params[] = '%' . $word . '%';
                    $pIdx++;
                }
                $conditions[] = "(" . implode(' AND ', $wordConds) . ")";
            }

            $whereClause = "(" . implode(' OR ', $conditions) . ")";
            if ($userId) {
                $whereClause = "(f.user_id = $" . $pIdx . " OR f.user_id IS NULL) AND " . $whereClause;
                $params[] = $userId;
                $pIdx++;
            }

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
                WHERE {$whereClause}
                ORDER BY 
                    (CASE WHEN p.title LIKE $" . 1 . " THEN 1 ELSE 0 END) DESC,
                    (CASE WHEN p.content LIKE $" . 1 . " THEN 1 ELSE 0 END) DESC,
                    p.updated_at DESC
                LIMIT 40
            ";

            $stmt = Database::query($sql, $params);
            $results = $stmt->fetchAll();

            $response->json(['ok' => true, 'data' => $results]);
        } catch (Exception $e) {
            error_log('[LibraryController] searchLibrary error: ' . $e->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al realizar la búsqueda: ' . $e->getMessage()]);
        }
    }
}
