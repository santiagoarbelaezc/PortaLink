<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\VaultCrypto;
use Exception;
use PDO;

class FinanceController
{
    private static bool $paymentColumnsEnsured = false;
    private static bool $clientColumnsEnsured = false;

    /**
     * Verifica estrictamente que exista un usuario autenticado con ID numérico válido.
     */
    private function requireAuthenticatedUser(Request $request, Response $response): ?int
    {
        if (!$request->user || empty($request->user->id) || (int)$request->user->id <= 0) {
            $response->status(401)->json([
                'ok' => false,
                'message' => 'Autenticación requerida para acceder al módulo financiero'
            ]);
            return null;
        }
        return (int)$request->user->id;
    }

    /**
     * Verifica que un client_id pertenezca estrictamente al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsClient(int $clientId, int $userId): bool
    {
        if ($clientId <= 0 || $userId <= 0) return false;
        $stmt = Database::query(
            'SELECT id FROM finance_clients WHERE id = $1 AND user_id = $2 LIMIT 1',
            [$clientId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Verifica que un service_id pertenezca estrictamente al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsService(int $serviceId, int $userId): bool
    {
        if ($serviceId <= 0 || $userId <= 0) return false;
        $stmt = Database::query(
            'SELECT id FROM finance_services WHERE id = $1 AND user_id = $2 LIMIT 1',
            [$serviceId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Verifica que una cuenta de cobro (invoice_id) pertenezca al usuario autenticado (Anti-IDOR).
     */
    private function userOwnsInvoice(int $invoiceId, int $userId): bool
    {
        if ($invoiceId <= 0 || $userId <= 0) return false;
        $stmt = Database::query(
            'SELECT id FROM finance_invoices WHERE id = $1 AND user_id = $2 LIMIT 1',
            [$invoiceId, $userId]
        );
        return (bool)$stmt->fetch();
    }

    /**
     * Cifra un campo sensible en reposo con AES-256-GCM (VaultCrypto).
     */
    public static function encryptField(?string $value): ?string
    {
        if ($value === null) return null;
        $trimmed = trim($value);
        if ($trimmed === '') return null;
        return VaultCrypto::encryptContent($trimmed);
    }

    /**
     * Descifra un campo sensible en memoria (compatible con texto plano histórico).
     */
    public static function decryptField(?string $value): ?string
    {
        if ($value === null || $value === '') return $value;
        return VaultCrypto::decryptContent($value);
    }

    public static function decryptClientRow(array $row): array
    {
        if (isset($row['tax_id']) && is_string($row['tax_id'])) {
            $row['tax_id'] = self::decryptField($row['tax_id']);
        }
        if (isset($row['address']) && is_string($row['address'])) {
            $row['address'] = self::decryptField($row['address']);
        }
        if (isset($row['notes']) && is_string($row['notes'])) {
            $row['notes'] = self::decryptField($row['notes']);
        }
        return $row;
    }

    public static function decryptPaymentRow(array $row): array
    {
        if (isset($row['notes']) && is_string($row['notes'])) {
            $row['notes'] = self::decryptField($row['notes']);
        }
        return $row;
    }

    public static function decryptInvoiceRow(array $row): array
    {
        if (isset($row['notes']) && is_string($row['notes'])) {
            $row['notes'] = self::decryptField($row['notes']);
        }
        if (isset($row['payment_notes']) && is_string($row['payment_notes'])) {
            $row['payment_notes'] = self::decryptField($row['payment_notes']);
        }
        if (isset($row['tax_id']) && is_string($row['tax_id'])) {
            $row['tax_id'] = self::decryptField($row['tax_id']);
        }
        if (isset($row['payments']) && is_array($row['payments'])) {
            $row['payments'] = array_map([self::class, 'decryptPaymentRow'], $row['payments']);
        }
        return $row;
    }

    public static function decryptTransactionRow(array $row): array
    {
        if (isset($row['notes']) && is_string($row['notes'])) {
            $row['notes'] = self::decryptField($row['notes']);
        }
        return $row;
    }

    /**
     * Valida estrictamente ítems, cantidades, precios unitarios e impuestos de una cuenta de cobro.
     */
    public static function validateInvoiceItemsAndAmounts(array $items, float $taxAmount): array
    {
        if (!is_finite($taxAmount) || $taxAmount < 0 || $taxAmount > 999999999999.99) {
            return [
                'ok' => false,
                'message' => 'El monto de impuestos no puede ser negativo ni exceder el límite permitido'
            ];
        }

        $subtotal = 0.0;
        foreach ($items as $item) {
            if (!is_array($item)) {
                return ['ok' => false, 'message' => 'Formato de ítem de cuenta de cobro inválido'];
            }
            $qty = isset($item['quantity']) ? (float)$item['quantity'] : 1.0;
            $unitPrice = isset($item['unit_price']) ? (float)$item['unit_price'] : 0.0;

            if (!is_finite($qty) || $qty <= 0 || $qty > 1000000) {
                return [
                    'ok' => false,
                    'message' => 'La cantidad de cada ítem debe ser mayor a cero'
                ];
            }
            if (!is_finite($unitPrice) || $unitPrice < 0 || $unitPrice > 999999999999.99) {
                return [
                    'ok' => false,
                    'message' => 'El precio unitario de los ítems no puede ser negativo'
                ];
            }

            $subtotal += ($qty * $unitPrice);
        }

        $totalAmount = $subtotal + $taxAmount;
        if (!is_finite($totalAmount) || $totalAmount < 0 || $totalAmount > 999999999999.99) {
            return [
                'ok' => false,
                'message' => 'El monto total calculado de la cuenta de cobro es inválido'
            ];
        }

        return [
            'ok' => true,
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($taxAmount, 2),
            'total_amount' => round($totalAmount, 2)
        ];
    }

    private function ensureClientColumns(): void
    {
        if (self::$clientColumnsEnsured) return;
        try {
            try {
                Database::query('ALTER TABLE finance_clients ADD COLUMN IF NOT EXISTS notes TEXT;');
            } catch (\Throwable $e) {}
            try {
                Database::query('ALTER TABLE finance_clients MODIFY COLUMN tax_id TEXT NULL;');
            } catch (\Throwable $e) {}
            self::$clientColumnsEnsured = true;
        } catch (\Throwable $e) {
            error_log('[Finance] ensureClientColumns error: ' . $e->getMessage());
        }
    }

    private function ensureInvoicePaymentColumns(): void
    {
        if (self::$paymentColumnsEnsured) return;
        try {
            Database::query("
                CREATE TABLE IF NOT EXISTS `finance_invoice_payments` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `invoice_id` INT NOT NULL,
                  `user_id` INT NOT NULL,
                  `amount` DECIMAL(15, 2) NOT NULL,
                  `payment_date` DATE NOT NULL,
                  `payment_method` VARCHAR(100) NOT NULL,
                  `notes` TEXT NULL,
                  `transaction_id` INT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX (`invoice_id`),
                  INDEX (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            try {
                Database::query("ALTER TABLE `finance_invoices` ADD `title` VARCHAR(255) NULL");
            } catch (\Throwable $ex) {}
            self::$paymentColumnsEnsured = true;
        } catch (\Throwable $e) {
            error_log('[Finance] ensureInvoicePaymentColumns error: ' . $e->getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════
    // DASHBOARD
    // ════════════════════════════════════════════════════════════
    public function getDashboard(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureInvoicePaymentColumns();
            $search = $request->query['search'] ?? null;
            $minPrice = $request->query['min_price'] ?? null;
            $maxPrice = $request->query['max_price'] ?? null;
            $dateFrom = $request->query['date_from'] ?? null;
            $dateTo = $request->query['date_to'] ?? null;

            $conditions = ['i.user_id = $1'];
            $params = [$userId];
            $idx = 2;

            if ($search) {
                $conditions[] = "c.name LIKE \${$idx}";
                $params[] = "%{$search}%";
                $idx++;
            }
            if ($minPrice !== null && $minPrice !== '') {
                $conditions[] = "i.total_amount >= \${$idx}";
                $params[] = (float)$minPrice;
                $idx++;
            }
            if ($maxPrice !== null && $maxPrice !== '') {
                $conditions[] = "i.total_amount <= \${$idx}";
                $params[] = (float)$maxPrice;
                $idx++;
            }
            if ($dateFrom) {
                $conditions[] = "COALESCE(i.due_date, i.issue_date) >= \${$idx}";
                $params[] = $dateFrom;
                $idx++;
            }
            if ($dateTo) {
                $conditions[] = "COALESCE(i.due_date, i.issue_date) <= \${$idx}";
                $params[] = $dateTo;
                $idx++;
            }

            $whereClause = implode(' AND ', $conditions);

            // 1. KPI Queries
            $kpiQuery = "
                SELECT 
                    COALESCE(SUM(i.total_amount), 0) AS total_facturado,
                    COALESCE(SUM(
                        COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id), 
                                 CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END)
                    ), 0) AS total_pagado,
                    COUNT(DISTINCT i.client_id) AS clientes_facturados
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id AND c.user_id = i.user_id
                WHERE {$whereClause}
            ";
            $stmtKpi = Database::query($kpiQuery, $params);
            $kpi = $stmtKpi->fetch();

            $totalFacturado = (float)($kpi['total_facturado'] ?? 0);
            $totalPagado = (float)($kpi['total_pagado'] ?? 0);
            $totalPorCobrar = max(0, $totalFacturado - $totalPagado);

            // 2. Ledger (Latest Invoices)
            $ledgerQuery = "
                SELECT 
                    i.id, i.invoice_number, i.title, i.total_amount, i.status, i.issue_date, i.due_date,
                    i.paid_at, i.payment_method, i.payment_notes, i.created_at AS updated_at,
                    COALESCE(c.name, 'Cliente') as client_name,
                    COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id), 
                             CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END) AS paid_amount
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id AND c.user_id = i.user_id
                WHERE {$whereClause}
                ORDER BY i.created_at DESC
                LIMIT 50
            ";
            $stmtLedger = Database::query($ledgerQuery, $params);
            $ledger = array_map([self::class, 'decryptInvoiceRow'], $stmtLedger->fetchAll());

            $response->json([
                'ok' => true,
                'kpis' => [
                    'total_facturado' => $totalFacturado,
                    'total_pagado' => $totalPagado,
                    'total_por_cobrar' => $totalPorCobrar,
                    'clientes_facturados' => (int)($kpi['clientes_facturados'] ?? 0)
                ],
                'ledger' => $ledger
            ]);
        } catch (Exception $error) {
            error_log('[Finance] Dashboard error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al cargar el dashboard financiero']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // CLIENTES
    // ════════════════════════════════════════════════════════════
    public function getClients(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $stmt = Database::query(
                'SELECT * FROM finance_clients WHERE user_id = $1 ORDER BY name ASC',
                [$userId]
            );
            $clients = array_map([self::class, 'decryptClientRow'], $stmt->fetchAll());
            $response->json(['ok' => true, 'clients' => $clients]);
        } catch (Exception $error) {
            error_log('[Finance] getClients error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener clientes']);
        }
    }

    public function createClient(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $name = trim((string)($request->body['name'] ?? ''));
        $email = isset($request->body['email']) ? trim((string)$request->body['email']) : null;
        $phone = isset($request->body['phone']) ? trim((string)$request->body['phone']) : null;
        $company = isset($request->body['company']) ? trim((string)$request->body['company']) : null;
        $taxId = isset($request->body['tax_id']) ? trim((string)$request->body['tax_id']) : null;
        $address = isset($request->body['address']) ? trim((string)$request->body['address']) : null;
        $notes = isset($request->body['notes']) ? trim((string)$request->body['notes']) : null;

        if ($name === '') {
            $response->status(400)->json(['ok' => false, 'message' => 'El nombre del cliente es obligatorio']);
            return;
        }

        try {
            $this->ensureClientColumns();

            $encTaxId = self::encryptField($taxId);
            $encAddress = self::encryptField($address);
            $encNotes = self::encryptField($notes);

            $stmt = Database::query(
                "INSERT INTO finance_clients (user_id, name, email, phone, company, tax_id, address, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [$userId, $name, $email ?: null, $phone ?: null, $company ?: null, $encTaxId, $encAddress, $encNotes]
            );
            $client = $stmt->fetch();
            if ($client) {
                $client = self::decryptClientRow($client);
            }
            $response->status(201)->json(['ok' => true, 'client' => $client]);
        } catch (Exception $error) {
            error_log('Error al crear cliente: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear cliente']);
        }
    }

    public function updateClient(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        $name = trim((string)($request->body['name'] ?? ''));
        $email = isset($request->body['email']) ? trim((string)$request->body['email']) : null;
        $phone = isset($request->body['phone']) ? trim((string)$request->body['phone']) : null;
        $company = isset($request->body['company']) ? trim((string)$request->body['company']) : null;
        $taxId = isset($request->body['tax_id']) ? trim((string)$request->body['tax_id']) : null;
        $address = isset($request->body['address']) ? trim((string)$request->body['address']) : null;
        $notes = isset($request->body['notes']) ? trim((string)$request->body['notes']) : null;

        if ($id <= 0 || $name === '') {
            $response->status(400)->json(['ok' => false, 'message' => 'Datos de cliente inválidos']);
            return;
        }

        try {
            $this->ensureClientColumns();

            if (!$this->userOwnsClient($id, $userId)) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }

            $encTaxId = self::encryptField($taxId);
            $encAddress = self::encryptField($address);
            $encNotes = self::encryptField($notes);

            $stmt = Database::query(
                "UPDATE finance_clients 
                 SET name = $1, email = $2, phone = $3, company = $4, tax_id = $5, address = $6, notes = $7 
                 WHERE id = $8 AND user_id = $9 RETURNING *",
                [$name, $email ?: null, $phone ?: null, $company ?: null, $encTaxId, $encAddress, $encNotes, $id, $userId]
            );
            $client = $stmt->fetch();
            if (!$client) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'client' => self::decryptClientRow($client)]);
        } catch (Exception $error) {
            error_log('Error al actualizar cliente: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar cliente']);
        }
    }

    public function deleteClient(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        try {
            if (!$this->userOwnsClient($id, $userId)) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }
            $stmt = Database::query('DELETE FROM finance_clients WHERE id = $1 AND user_id = $2 RETURNING id', [$id, $userId]);
            if (!$stmt->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'message' => 'Cliente eliminado']);
        } catch (Exception $error) {
            error_log('[Finance] deleteClient error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar cliente. Verifica que no tenga facturas asociadas.']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // SERVICIOS
    // ════════════════════════════════════════════════════════════
    private function ensureServicesTable(): void
    {
        try {
            $pdo = Database::getConnection();
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `finance_services` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` INT NOT NULL,
                  `name` VARCHAR(255) NOT NULL,
                  `description` TEXT NULL,
                  `price` DECIMAL(15, 2) DEFAULT 0.00,
                  `category` VARCHAR(50) DEFAULT 'desarrollo',
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX (`user_id`),
                  CONSTRAINT `fk_finance_services_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $stmt = $pdo->query("SHOW COLUMNS FROM `finance_services` LIKE 'category'");
            if (!$stmt->fetch()) {
                $pdo->exec("ALTER TABLE `finance_services` ADD COLUMN `category` VARCHAR(50) DEFAULT 'desarrollo' AFTER `price`");
            }
        } catch (\Throwable $e) {
            error_log('[Finance] ensureServicesTable error: ' . $e->getMessage());
        }
    }

    private function ensureSoftwareProposalsTable(): void
    {
        try {
            $pdo = Database::getConnection();
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `finance_software_proposals` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` INT NOT NULL,
                  `service_id` INT NULL,
                  `project_title` VARCHAR(255) NOT NULL,
                  `client_name` VARCHAR(255) NOT NULL,
                  `client_company` VARCHAR(255) NULL,
                  `client_email` VARCHAR(255) NULL,
                  `client_phone` VARCHAR(100) NULL,
                  `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                  `payment_terms` VARCHAR(255) NULL,
                  `delivery_time` VARCHAR(255) NULL,
                  `warranty` VARCHAR(255) NULL,
                  `items` LONGTEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX (`user_id`),
                  INDEX (`service_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $stmt = $pdo->query("SHOW COLUMNS FROM `finance_software_proposals` LIKE 'updated_at'");
            if (!$stmt->fetch()) {
                $pdo->exec("ALTER TABLE `finance_software_proposals` ADD COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            }
        } catch (\Throwable $e) {
            error_log('[Finance] ensureSoftwareProposalsTable error: ' . $e->getMessage());
        }
    }

    public function getServices(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureServicesTable();
            $this->ensureSoftwareProposalsTable();
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('
                SELECT s.*, 
                       p.id AS proposal_id, 
                       p.project_title, 
                       p.client_name, 
                       p.client_company, 
                       p.client_email, 
                       p.client_phone, 
                       p.total_amount AS proposal_total_amount, 
                       p.payment_terms, 
                       p.delivery_time, 
                       p.warranty, 
                       p.items AS proposal_items
                FROM finance_services s
                LEFT JOIN finance_software_proposals p ON p.id = (
                    SELECT p2.id FROM finance_software_proposals p2 
                    WHERE p2.service_id = s.id AND p2.user_id = s.user_id 
                    ORDER BY p2.id DESC LIMIT 1
                )
                WHERE s.user_id = ? 
                ORDER BY s.id DESC
            ');
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $services = array_map(function ($row) {
                if (isset($row['proposal_items']) && is_string($row['proposal_items'])) {
                    $row['proposal_items'] = json_decode($row['proposal_items'], true) ?: [];
                }
                return $row;
            }, $rows);

            $response->json(['ok' => true, 'services' => $services]);
        } catch (\Throwable $error) {
            error_log('Error al obtener servicios: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener servicios']);
        }
    }

    public function createService(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $this->ensureServicesTable();
        $name = trim((string)($request->body['name'] ?? ''));
        $description = isset($request->body['description']) ? trim((string)$request->body['description']) : null;
        $price = (float)($request->body['price'] ?? $request->body['unitPrice'] ?? 0);
        $category = trim((string)($request->body['category'] ?? 'desarrollo'));

        if ($name === '' || $price < 0 || !is_finite($price)) {
            $response->status(400)->json(['ok' => false, 'message' => 'Nombre y precio válido del servicio son obligatorios']);
            return;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO finance_services (user_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $name, $description, $price, $category]);
            $id = $pdo->lastInsertId();

            if ($category === 'adquisicion') {
                $this->ensureSoftwareProposalsTable();
                $cleanTitle = preg_replace('/^\[(Adquisición|Adquisicion)\]\s*/i', '', $name);
                $stmtProp = $pdo->prepare("
                    INSERT INTO finance_software_proposals 
                    (user_id, service_id, project_title, client_name, total_amount, items)
                    VALUES (?, ?, ?, 'Cliente Particular / Corporativo', ?, '[]')
                ");
                $stmtProp->execute([$userId, $id, $cleanTitle ?: 'Propuesta Comercial de Software', $price]);
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtFetch->execute([$id, $userId]);
            $service = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            $response->status(201)->json(['ok' => true, 'service' => $service]);
        } catch (\Throwable $error) {
            error_log('Error al crear servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear servicio']);
        }
    }

    public function updateService(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $this->ensureServicesTable();
        $id = (int)($request->params['id'] ?? 0);
        $name = trim((string)($request->body['name'] ?? ''));
        $description = isset($request->body['description']) ? trim((string)$request->body['description']) : null;
        $price = (float)($request->body['price'] ?? $request->body['unitPrice'] ?? 0);
        $category = trim((string)($request->body['category'] ?? 'desarrollo'));

        if ($id <= 0 || $name === '' || $price < 0 || !is_finite($price)) {
            $response->status(400)->json(['ok' => false, 'message' => 'Datos de servicio inválidos']);
            return;
        }

        try {
            if (!$this->userOwnsService($id, $userId)) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }

            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE finance_services SET name = ?, description = ?, price = ?, category = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$name, $description, $price, $category, $id, $userId]);

            if ($category === 'adquisicion') {
                $this->ensureSoftwareProposalsTable();
                $cleanTitle = preg_replace('/^\[(Adquisición|Adquisicion)\]\s*/i', '', $name);
                $stmtCheck = $pdo->prepare("SELECT id FROM finance_software_proposals WHERE service_id = ? AND user_id = ?");
                $stmtCheck->execute([$id, $userId]);
                $propRow = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                if ($propRow) {
                    $stmtUpP = $pdo->prepare("UPDATE finance_software_proposals SET project_title = ?, total_amount = ? WHERE id = ? AND user_id = ?");
                    $stmtUpP->execute([$cleanTitle ?: 'Propuesta Comercial de Software', $price, $propRow['id'], $userId]);
                } else {
                    $stmtInP = $pdo->prepare("
                        INSERT INTO finance_software_proposals 
                        (user_id, service_id, project_title, client_name, total_amount, items)
                        VALUES (?, ?, ?, 'Cliente Particular / Corporativo', ?, '[]')
                    ");
                    $stmtInP->execute([$userId, $id, $cleanTitle ?: 'Propuesta Comercial de Software', $price]);
                }
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtFetch->execute([$id, $userId]);
            $service = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            if (!$service) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'service' => $service]);
        } catch (\Throwable $error) {
            error_log('Error al actualizar servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar servicio']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // PROPUESTAS COMERCIALES DE SOFTWARE (ADQUISICIONES)
    // ════════════════════════════════════════════════════════════
    public function getSoftwareProposals(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureSoftwareProposalsTable();
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM finance_software_proposals WHERE user_id = ? ORDER BY created_at DESC');
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $proposals = array_map(function ($row) {
                if (isset($row['items']) && is_string($row['items'])) {
                    $row['items'] = json_decode($row['items'], true) ?: [];
                }
                return $row;
            }, $rows);

            $response->json(['ok' => true, 'proposals' => $proposals]);
        } catch (\Throwable $error) {
            error_log('Error al obtener propuestas de software: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener propuestas']);
        }
    }

    private function sanitizeProposalItems($items): array
    {
        $dedupedItems = [];
        $seenTitles = [];
        if (is_array($items)) {
            foreach ($items as $it) {
                if (!is_array($it)) continue;
                $t = trim($it['title'] ?? '');
                $key = mb_strtolower($t);
                if ($key === '') continue;
                if (!isset($seenTitles[$key])) {
                    $seenTitles[$key] = true;
                    $dedupedItems[] = [
                        'title' => $t,
                        'description' => trim($it['description'] ?? 'Especificaciones técnicas acordadas.'),
                        'included' => !isset($it['included']) || $it['included'] !== false
                    ];
                }
            }
        }
        return $dedupedItems;
    }

    public function createSoftwareProposal(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $this->ensureServicesTable();
        $this->ensureSoftwareProposalsTable();

        $projectTitle = trim($request->body['projectTitle'] ?? $request->body['project_title'] ?? 'Ecosistema Digital PortaLink');
        $clientName = trim($request->body['clientName'] ?? $request->body['client_name'] ?? 'Cliente');
        $clientCompany = trim($request->body['clientCompany'] ?? $request->body['client_company'] ?? '');
        $clientEmail = trim($request->body['clientEmail'] ?? $request->body['client_email'] ?? '');
        $clientPhone = trim($request->body['clientPhone'] ?? $request->body['client_phone'] ?? '');
        $totalAmount = (float)($request->body['totalAmount'] ?? $request->body['total_amount'] ?? 0);
        $paymentTerms = trim($request->body['paymentTerms'] ?? $request->body['payment_terms'] ?? '');
        $deliveryTime = trim($request->body['deliveryTime'] ?? $request->body['delivery_time'] ?? '');
        $warranty = trim($request->body['warranty'] ?? '');
        $items = $request->body['items'] ?? [];

        if ($totalAmount < 0 || !is_finite($totalAmount)) {
            $response->status(400)->json(['ok' => false, 'message' => 'El monto total de la propuesta no puede ser negativo']);
            return;
        }

        try {
            $pdo = Database::getConnection();

            // 1. Resumen de entregables desduplicados para la descripción del servicio
            $dedupedItems = $this->sanitizeProposalItems($items);
            $activeItems = [];
            foreach ($dedupedItems as $it) {
                if ($it['included'] && !empty($it['title'])) {
                    $activeItems[] = $it['title'];
                }
            }
            $itemsSummary = !empty($activeItems) ? ' • Entregables: ' . implode(' | ', $activeItems) : '';
            $companyStr = !empty($clientCompany) ? " ({$clientCompany})" : '';
            $paymentStr = !empty($paymentTerms) ? " • Pago: {$paymentTerms}" : '';
            $timeStr = !empty($deliveryTime) ? " • Tiempo: {$deliveryTime}" : '';

            $serviceDesc = "[Adquisición de Software] Propuesta para {$clientName}{$companyStr}{$paymentStr}{$timeStr}{$itemsSummary}";
            $serviceName = "[Adquisición] {$projectTitle}";

            // 2. Insertar en finance_services (para que aparezca en el catálogo con categoría 'adquisicion')
            $stmtService = $pdo->prepare("
                INSERT INTO finance_services (user_id, name, description, price, category) 
                VALUES (?, ?, ?, ?, 'adquisicion')
            ");
            $stmtService->execute([$userId, $serviceName, $serviceDesc, $totalAmount]);
            $serviceId = $pdo->lastInsertId();

            $stmtFetchS = $pdo->prepare("SELECT * FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtFetchS->execute([$serviceId, $userId]);
            $savedService = $stmtFetchS->fetch(PDO::FETCH_ASSOC);

            // 3. Insertar en finance_software_proposals con entregables validados
            $stmtProposal = $pdo->prepare("
                INSERT INTO finance_software_proposals 
                (user_id, service_id, project_title, client_name, client_company, client_email, client_phone, total_amount, payment_terms, delivery_time, warranty, items)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtProposal->execute([
                $userId,
                $serviceId,
                $projectTitle,
                $clientName,
                $clientCompany,
                $clientEmail,
                $clientPhone,
                $totalAmount,
                $paymentTerms,
                $deliveryTime,
                $warranty,
                json_encode($dedupedItems, JSON_UNESCAPED_UNICODE)
            ]);
            $proposalId = $pdo->lastInsertId();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Propuesta comercial guardada exitosamente en la base de datos',
                'proposalId' => $proposalId,
                'serviceId' => $serviceId,
                'service' => $savedService
            ]);
        } catch (\Throwable $error) {
            error_log('Error al guardar propuesta de software en backend: ' . $error->getMessage());
            $response->status(500)->json([
                'ok' => false,
                'message' => 'Error al guardar la propuesta de software'
            ]);
        }
    }

    public function updateSoftwareProposal(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        $this->ensureServicesTable();
        $this->ensureSoftwareProposalsTable();

        $projectTitle = trim($request->body['projectTitle'] ?? $request->body['project_title'] ?? 'Ecosistema Digital PortaLink');
        $clientName = trim($request->body['clientName'] ?? $request->body['client_name'] ?? 'Cliente');
        $clientCompany = trim($request->body['clientCompany'] ?? $request->body['client_company'] ?? '');
        $clientEmail = trim($request->body['clientEmail'] ?? $request->body['client_email'] ?? '');
        $clientPhone = trim($request->body['clientPhone'] ?? $request->body['client_phone'] ?? '');
        $totalAmount = (float)($request->body['totalAmount'] ?? $request->body['total_amount'] ?? 0);
        $paymentTerms = trim($request->body['paymentTerms'] ?? $request->body['payment_terms'] ?? '');
        $deliveryTime = trim($request->body['deliveryTime'] ?? $request->body['delivery_time'] ?? '');
        $warranty = trim($request->body['warranty'] ?? '');
        $items = $request->body['items'] ?? [];

        if ($id <= 0 || $totalAmount < 0 || !is_finite($totalAmount)) {
            $response->status(400)->json(['ok' => false, 'message' => 'Datos de propuesta inválidos']);
            return;
        }

        try {
            $pdo = Database::getConnection();

            // 1. Resumen de entregables desduplicados para la descripción
            $dedupedItems = $this->sanitizeProposalItems($items);
            $activeItems = [];
            foreach ($dedupedItems as $it) {
                if ($it['included'] && !empty($it['title'])) {
                    $activeItems[] = $it['title'];
                }
            }
            $itemsSummary = !empty($activeItems) ? ' • Entregables: ' . implode(' | ', $activeItems) : '';
            $companyStr = !empty($clientCompany) ? " ({$clientCompany})" : '';
            $paymentStr = !empty($paymentTerms) ? " • Pago: {$paymentTerms}" : '';
            $timeStr = !empty($deliveryTime) ? " • Tiempo: {$deliveryTime}" : '';

            $serviceDesc = "[Adquisición de Software] Propuesta para {$clientName}{$companyStr}{$paymentStr}{$timeStr}{$itemsSummary}";
            $serviceName = "[Adquisición] {$projectTitle}";

            // 2. Buscar propuesta por id o por service_id perteneciente al usuario
            $stmtCheck = $pdo->prepare("SELECT id, service_id FROM finance_software_proposals WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $userId]);
            $prop = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$prop) {
                $stmtCheckS = $pdo->prepare("SELECT id, service_id FROM finance_software_proposals WHERE service_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1");
                $stmtCheckS->execute([$id, $userId]);
                $prop = $stmtCheckS->fetch(PDO::FETCH_ASSOC);
            }

            if ($prop) {
                $propId = $prop['id'];
                $serviceId = !empty($prop['service_id']) ? $prop['service_id'] : $id;

                $stmtUp = $pdo->prepare("
                    UPDATE finance_software_proposals 
                    SET project_title = ?, client_name = ?, client_company = ?, client_email = ?, client_phone = ?,
                        total_amount = ?, payment_terms = ?, delivery_time = ?, warranty = ?, items = ?
                    WHERE id = ? AND user_id = ?
                ");
                $stmtUp->execute([
                    $projectTitle, $clientName, $clientCompany, $clientEmail, $clientPhone,
                    $totalAmount, $paymentTerms, $deliveryTime, $warranty, json_encode($dedupedItems, JSON_UNESCAPED_UNICODE),
                    $propId, $userId
                ]);

                if (!empty($serviceId)) {
                    $stmtS = $pdo->prepare("
                        UPDATE finance_services 
                        SET name = ?, description = ?, price = ?, category = 'adquisicion'
                        WHERE id = ? AND user_id = ?
                    ");
                    $stmtS->execute([$serviceName, $serviceDesc, $totalAmount, $serviceId, $userId]);
                }
            } else {
                // Verificar que si el ID correspondía a finance_services, realmente pertenezca al usuario
                $stmtCheckServ = $pdo->prepare("SELECT id FROM finance_services WHERE id = ? AND user_id = ?");
                $stmtCheckServ->execute([$id, $userId]);
                $hasService = $stmtCheckServ->fetch(PDO::FETCH_ASSOC);

                if (!$hasService) {
                    $response->status(404)->json(['ok' => false, 'message' => 'Propuesta o servicio no encontrado']);
                    return;
                }

                $serviceId = $id;
                $stmtS = $pdo->prepare("
                    UPDATE finance_services 
                    SET name = ?, description = ?, price = ?, category = 'adquisicion'
                    WHERE id = ? AND user_id = ?
                ");
                $stmtS->execute([$serviceName, $serviceDesc, $totalAmount, $serviceId, $userId]);

                $stmtProposal = $pdo->prepare("
                    INSERT INTO finance_software_proposals 
                    (user_id, service_id, project_title, client_name, client_company, client_email, client_phone, total_amount, payment_terms, delivery_time, warranty, items)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmtProposal->execute([
                    $userId,
                    $serviceId,
                    $projectTitle,
                    $clientName,
                    $clientCompany,
                    $clientEmail,
                    $clientPhone,
                    $totalAmount,
                    $paymentTerms,
                    $deliveryTime,
                    $warranty,
                    json_encode($dedupedItems, JSON_UNESCAPED_UNICODE)
                ]);
                $propId = $pdo->lastInsertId();
            }

            $response->json([
                'ok' => true,
                'message' => 'Propuesta comercial actualizada correctamente',
                'proposalId' => $propId,
                'serviceId' => $serviceId ?? null
            ]);
        } catch (\Throwable $error) {
            error_log('Error al actualizar propuesta de software: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar propuesta']);
        }
    }

    public function deleteSoftwareProposal(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        try {
            $pdo = Database::getConnection();
            $stmtCheck = $pdo->prepare("SELECT id, service_id FROM finance_software_proposals WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $userId]);
            $prop = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$prop) {
                $response->status(404)->json(['ok' => false, 'message' => 'Propuesta no encontrada']);
                return;
            }

            // Eliminar servicio asociado si existe
            if (!empty($prop['service_id'])) {
                $delService = $pdo->prepare("DELETE FROM finance_services WHERE id = ? AND user_id = ?");
                $delService->execute([$prop['service_id'], $userId]);
            }

            $delProp = $pdo->prepare("DELETE FROM finance_software_proposals WHERE id = ? AND user_id = ?");
            $delProp->execute([$id, $userId]);

            $response->json(['ok' => true, 'message' => 'Propuesta eliminada correctamente']);
        } catch (\Throwable $error) {
            error_log('Error al eliminar propuesta de software: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar propuesta']);
        }
    }

    public function deleteService(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        try {
            $pdo = Database::getConnection();
            $stmtCheck = $pdo->prepare("SELECT id FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $userId]);
            if (!$stmtCheck->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }

            // Eliminar propuesta de software asociada si existiese
            $delProp = $pdo->prepare("DELETE FROM finance_software_proposals WHERE service_id = ? AND user_id = ?");
            $delProp->execute([$id, $userId]);

            $stmtDel = $pdo->prepare("DELETE FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtDel->execute([$id, $userId]);
            $response->json(['ok' => true, 'message' => 'Servicio eliminado']);
        } catch (\Throwable $error) {
            error_log('Error al eliminar servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar servicio']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // CUENTAS DE COBRO (FACTURAS) & ABONOS PARCIALES
    // ════════════════════════════════════════════════════════════
    public function getInvoices(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, COALESCE(c.name, 'Cliente') as client_name, c.company as company,
                        COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id), 
                                 CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END) AS paid_amount
                 FROM finance_invoices i
                 LEFT JOIN finance_clients c ON i.client_id = c.id AND c.user_id = i.user_id
                 WHERE i.user_id = $1 
                 ORDER BY i.created_at DESC",
                [$userId]
            );
            $invoices = $stmt->fetchAll();

            // Pre-cargar todos los abonos del usuario en una sola consulta indexada por invoice_id
            $paymentsByInvoice = [];
            try {
                $stmtAllPay = Database::query(
                    "SELECT * FROM finance_invoice_payments WHERE user_id = $1 ORDER BY payment_date DESC, id DESC",
                    [$userId]
                );
                foreach ($stmtAllPay->fetchAll() as $pRow) {
                    $invKey = (int)($pRow['invoice_id'] ?? 0);
                    $paymentsByInvoice[$invKey][] = self::decryptPaymentRow($pRow);
                }
            } catch (\Throwable $pe) {}

            foreach ($invoices as &$inv) {
                $total = (float)($inv['total_amount'] ?? 0);
                $paid = (float)($inv['paid_amount'] ?? 0);
                $inv['paid_amount'] = $paid;
                $inv['pending_amount'] = max(0, $total - $paid);
                $inv['payments'] = $paymentsByInvoice[(int)$inv['id']] ?? [];
                $inv = self::decryptInvoiceRow($inv);
            }

            $response->json(['ok' => true, 'invoices' => $invoices]);
        } catch (\Throwable $error) {
            error_log('[Finance] getInvoices error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener cuentas de cobro']);
        }
    }

    public function getInvoiceDetails(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, COALESCE(c.name, 'Cliente') as client_name, c.email, c.phone, c.company, c.tax_id,
                        COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id), 
                                 CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END) AS paid_amount
                 FROM finance_invoices i
                 LEFT JOIN finance_clients c ON i.client_id = c.id AND c.user_id = i.user_id
                 WHERE i.id = $1 AND i.user_id = $2",
                [$id, $userId]
            );
            $invoice = $stmt->fetch();
            if (!$invoice) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cuenta de cobro no encontrada']);
                return;
            }

            $total = (float)($invoice['total_amount'] ?? 0);
            $paid = (float)($invoice['paid_amount'] ?? 0);
            $invoice['paid_amount'] = $paid;
            $invoice['pending_amount'] = max(0, $total - $paid);

            try {
                $stmtPay = Database::query(
                    "SELECT * FROM finance_invoice_payments WHERE invoice_id = $1 AND user_id = $2 ORDER BY payment_date DESC, id DESC",
                    [$invoice['id'], $userId]
                );
                $invoice['payments'] = array_map([self::class, 'decryptPaymentRow'], $stmtPay->fetchAll());
            } catch (\Throwable $pe) {
                $invoice['payments'] = [];
            }

            $stmtItems = Database::query(
                "SELECT it.*, COALESCE(s.name, it.description) as service_name
                 FROM finance_invoice_items it
                 LEFT JOIN finance_services s ON it.service_id = s.id AND s.user_id = $2
                 WHERE it.invoice_id = $1",
                [$id, $userId]
            );
            $invoice['items'] = $stmtItems->fetchAll();
            $invoice = self::decryptInvoiceRow($invoice);

            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            error_log('[Finance] getInvoiceDetails error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener cuenta de cobro']);
        }
    }

    public function createInvoice(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
        $invoiceNumber = trim((string)($request->body['invoice_number'] ?? ''));
        $title = isset($request->body['title']) ? trim((string)$request->body['title']) : null;
        $issueDate = $request->body['issue_date'] ?? null;
        $dueDate = $request->body['due_date'] ?? null;
        $items = is_array($request->body['items'] ?? null) ? $request->body['items'] : [];
        $notes = isset($request->body['notes']) ? (string)$request->body['notes'] : null;
        $status = $request->body['status'] ?? null;
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = isset($request->body['payment_method']) ? trim((string)$request->body['payment_method']) : null;
        $paymentNotes = isset($request->body['payment_notes']) ? (string)$request->body['payment_notes'] : null;
        $taxAmount = (float)($request->body['tax_amount'] ?? 0);

        if ($invoiceNumber === '') {
            $invoiceNumber = 'PL-' . date('Y') . '-' . random_int(1000, 9999);
        }

        // 1. Validación Anti-IDOR de client_id y service_id
        if ($clientId !== null && !$this->userOwnsClient($clientId, $userId)) {
            $response->status(403)->json(['ok' => false, 'message' => 'El cliente seleccionado no existe o no pertenece a tu cuenta']);
            return;
        }
        foreach ($items as $it) {
            if (!empty($it['service_id'])) {
                $srvId = (int)$it['service_id'];
                if ($srvId > 0 && !$this->userOwnsService($srvId, $userId)) {
                    $response->status(403)->json(['ok' => false, 'message' => 'Uno de los servicios seleccionados no pertenece a tu cuenta']);
                    return;
                }
            }
        }

        // 2. Validación de integridad contable (cantidades, precios e impuestos)
        $validation = self::validateInvoiceItemsAndAmounts($items, $taxAmount);
        if (!$validation['ok']) {
            $response->status(400)->json(['ok' => false, 'message' => $validation['message']]);
            return;
        }

        $subtotal = $validation['subtotal'];
        $taxAmount = $validation['tax_amount'];
        $totalAmount = $validation['total_amount'];

        $this->ensureInvoicePaymentColumns();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $invoiceStatus = ($status === 'PAGADA' || $status === 'Pagada') ? 'PAGADA' : (($status === 'ENVIADA' || $status === 'Enviada') ? 'ENVIADA' : 'DRAFT');
            $paidAtVal = $invoiceStatus === 'PAGADA' ? ($paidAt ?: date('Y-m-d H:i:s')) : null;

            $encNotes = self::encryptField($notes);
            $encPaymentNotes = self::encryptField($paymentNotes);

            $stmtInsert = $pdo->prepare(
                "INSERT INTO finance_invoices 
                 (user_id, client_id, invoice_number, title, issue_date, due_date, status, subtotal, tax_amount, total_amount, notes, paid_at, payment_method, payment_notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmtInsert->execute([
                $userId, $clientId, $invoiceNumber, $title ?: null, $issueDate, $dueDate, $invoiceStatus,
                $subtotal, $taxAmount, $totalAmount, $encNotes, $paidAtVal, $paymentMethod ?: null, $encPaymentNotes
            ]);
            $invoiceId = $pdo->lastInsertId();

            if (count($items) > 0) {
                $stmtItem = $pdo->prepare(
                    "INSERT INTO finance_invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
                     VALUES (?, ?, ?, ?, ?, ?)"
                );
                foreach ($items as $item) {
                    $qty = (float)($item['quantity'] ?? 1);
                    $unitPrice = (float)($item['unit_price'] ?? 0);
                    $totalPrice = round($qty * $unitPrice, 2);
                    $srvId = !empty($item['service_id']) ? (int)$item['service_id'] : null;
                    $stmtItem->execute([
                        $invoiceId,
                        $srvId,
                        $item['description'] ?? null,
                        $qty,
                        $unitPrice,
                        $totalPrice
                    ]);
                }
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtFetch->execute([$invoiceId, $userId]);
            $invoice = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($invoice) {
                $invoice = self::decryptInvoiceRow($invoice);
            }

            $pdo->commit();
            $response->status(201)->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('Error al crear cuenta de cobro: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear cuenta de cobro']);
        }
    }

    public function updateInvoice(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
        $title = isset($request->body['title']) ? trim((string)$request->body['title']) : null;
        $issueDate = $request->body['issue_date'] ?? null;
        $dueDate = $request->body['due_date'] ?? null;
        $items = is_array($request->body['items'] ?? null) ? $request->body['items'] : [];
        $notes = isset($request->body['notes']) ? (string)$request->body['notes'] : null;
        $status = $request->body['status'] ?? null;
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = isset($request->body['payment_method']) ? trim((string)$request->body['payment_method']) : null;
        $paymentNotes = isset($request->body['payment_notes']) ? (string)$request->body['payment_notes'] : null;
        $taxAmount = (float)($request->body['tax_amount'] ?? 0);

        if ($id <= 0) {
            $response->status(400)->json(['ok' => false, 'message' => 'ID de cuenta de cobro inválido']);
            return;
        }

        // 1. Validación Anti-IDOR de client_id y service_id
        if ($clientId !== null && !$this->userOwnsClient($clientId, $userId)) {
            $response->status(403)->json(['ok' => false, 'message' => 'El cliente seleccionado no existe o no pertenece a tu cuenta']);
            return;
        }
        foreach ($items as $it) {
            if (!empty($it['service_id'])) {
                $srvId = (int)$it['service_id'];
                if ($srvId > 0 && !$this->userOwnsService($srvId, $userId)) {
                    $response->status(403)->json(['ok' => false, 'message' => 'Uno de los servicios seleccionados no pertenece a tu cuenta']);
                    return;
                }
            }
        }

        // 2. Validación de integridad contable
        $validation = self::validateInvoiceItemsAndAmounts($items, $taxAmount);
        if (!$validation['ok']) {
            $response->status(400)->json(['ok' => false, 'message' => $validation['message']]);
            return;
        }

        $subtotal = $validation['subtotal'];
        $taxAmount = $validation['tax_amount'];
        $totalAmount = $validation['total_amount'];

        $this->ensureInvoicePaymentColumns();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $stmtCheck = $pdo->prepare("SELECT id FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $userId]);
            if (!$stmtCheck->fetch()) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Cuenta de cobro no encontrada']);
                return;
            }

            // Recalcular estado conservando intactos todos los abonos realizados
            $stmtPaid = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) AS paid_sum FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?");
            $stmtPaid->execute([$id, $userId]);
            $paidSum = (float)($stmtPaid->fetch(PDO::FETCH_ASSOC)['paid_sum'] ?? 0);

            if ($paidSum >= $totalAmount - 0.01 && $totalAmount > 0) {
                $invoiceStatus = 'PAGADA';
            } elseif ($paidSum > 0) {
                $invoiceStatus = 'PARCIAL';
            } else {
                $invoiceStatus = ($status === 'PAGADA' || $status === 'Pagada') ? 'PAGADA' : (($status === 'ENVIADA' || $status === 'Enviada') ? 'ENVIADA' : 'DRAFT');
            }
            $paidAtVal = $invoiceStatus === 'PAGADA' ? ($paidAt ?: date('Y-m-d H:i:s')) : null;

            $encNotes = self::encryptField($notes);
            $encPaymentNotes = self::encryptField($paymentNotes);

            $stmtUpdate = $pdo->prepare(
                "UPDATE finance_invoices 
                 SET client_id = ?, title = ?, issue_date = ?, due_date = ?, status = ?, subtotal = ?, tax_amount = ?, total_amount = ?, notes = ?, paid_at = ?, payment_method = ?, payment_notes = ?
                 WHERE id = ? AND user_id = ?"
            );
            $stmtUpdate->execute([
                $clientId, $title ?: null, $issueDate, $dueDate, $invoiceStatus, $subtotal, $taxAmount, $totalAmount,
                $encNotes, $paidAtVal, $paymentMethod ?: null, $encPaymentNotes, $id, $userId
            ]);

            $stmtDel = $pdo->prepare("DELETE FROM finance_invoice_items WHERE invoice_id = ?");
            $stmtDel->execute([$id]);

            if (count($items) > 0) {
                $stmtItem = $pdo->prepare(
                    "INSERT INTO finance_invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
                     VALUES (?, ?, ?, ?, ?, ?)"
                );
                foreach ($items as $item) {
                    $qty = (float)($item['quantity'] ?? 1);
                    $unitPrice = (float)($item['unit_price'] ?? 0);
                    $totalPrice = round($qty * $unitPrice, 2);
                    $desc = $item['description'] ?? $item['service_name'] ?? 'Servicio';
                    $srvId = !empty($item['service_id']) ? (int)$item['service_id'] : null;
                    $stmtItem->execute([
                        $id,
                        $srvId,
                        $desc,
                        $qty,
                        $unitPrice,
                        $totalPrice
                    ]);
                }
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtFetch->execute([$id, $userId]);
            $invoice = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($invoice) {
                $invoice = self::decryptInvoiceRow($invoice);
            }

            $pdo->commit();
            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('Error al actualizar cuenta de cobro: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar cuenta de cobro']);
        }
    }

    public function updateInvoiceStatus(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        $status = strtoupper(trim((string)($request->body['status'] ?? '')));
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = isset($request->body['payment_method']) ? trim((string)$request->body['payment_method']) : null;
        $paymentNotes = isset($request->body['payment_notes']) ? (string)$request->body['payment_notes'] : null;

        if ($id <= 0 || $status === '') {
            $response->status(400)->json(['ok' => false, 'message' => 'Datos de estado inválidos']);
            return;
        }

        try {
            $this->ensureInvoicePaymentColumns();

            if (!$this->userOwnsInvoice($id, $userId)) {
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }

            $encPaymentNotes = self::encryptField($paymentNotes);

            if ($status === 'PAGADA') {
                $query = "UPDATE finance_invoices 
                          SET status = $1, 
                              paid_at = COALESCE($4, NOW()), 
                              payment_method = $5, 
                              payment_notes = $6 
                          WHERE id = $2 AND user_id = $3 RETURNING *";
                $params = [$status, $id, $userId, $paidAt ?: date('Y-m-d H:i:s'), $paymentMethod ?: null, $encPaymentNotes];
            } else {
                $query = "UPDATE finance_invoices SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *";
                $params = [$status, $id, $userId];
            }

            $stmt = Database::query($query, $params);
            $invoice = $stmt->fetch();
            if (!$invoice) {
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }
            $response->json(['ok' => true, 'invoice' => self::decryptInvoiceRow($invoice)]);
        } catch (Exception $error) {
            error_log('[Finance] updateInvoiceStatus error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al cambiar el estado']);
        }
    }

    public function deleteInvoice(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $id = (int)($request->params['id'] ?? 0);
        $this->ensureInvoicePaymentColumns();
        $this->ensureTransactionsTable();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();
            $stmtCheck = $pdo->prepare("SELECT id FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $userId]);
            if (!$stmtCheck->fetch()) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }

            // 1. Eliminar transacciones financieras asociadas a los abonos de esta factura
            $stmtPayTx = $pdo->prepare("SELECT transaction_id FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ? AND transaction_id IS NOT NULL");
            $stmtPayTx->execute([$id, $userId]);
            $txIds = $stmtPayTx->fetchAll(PDO::FETCH_COLUMN);
            if (!empty($txIds)) {
                $stmtDelTx = $pdo->prepare("DELETE FROM finance_transactions WHERE id = ? AND user_id = ?");
                foreach ($txIds as $txId) {
                    $stmtDelTx->execute([(int)$txId, $userId]);
                }
            }

            // 2. Eliminar abonos asociados a la factura
            $stmtDelPayments = $pdo->prepare("DELETE FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?");
            $stmtDelPayments->execute([$id, $userId]);

            // 3. Eliminar ítems de la factura
            $stmtDelItems = $pdo->prepare("DELETE FROM finance_invoice_items WHERE invoice_id = ?");
            $stmtDelItems->execute([$id]);

            // 4. Eliminar factura
            $stmtDelInv = $pdo->prepare("DELETE FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtDelInv->execute([$id, $userId]);

            $pdo->commit();
            $response->json(['ok' => true, 'message' => 'Cuenta de cobro eliminada con éxito']);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('[Finance] deleteInvoice error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar cuenta de cobro']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // REGISTRO DE ABONOS PARCIALES POR PLAZOS
    // ════════════════════════════════════════════════════════════
    public function addInvoicePayment(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $invoiceId = (int)($request->params['id'] ?? 0);
        $amount = (float)($request->body['amount'] ?? 0);
        $paymentDate = $request->body['payment_date'] ?? date('Y-m-d');
        $paymentMethod = trim((string)($request->body['payment_method'] ?? 'Transferencia Bancaria'));
        $notes = isset($request->body['notes']) ? (string)$request->body['notes'] : null;

        if ($invoiceId <= 0 || !is_finite($amount) || $amount <= 0) {
            $response->status(400)->json(['ok' => false, 'message' => 'El monto del abono debe ser mayor a 0']);
            return;
        }

        $this->ensureInvoicePaymentColumns();
        $this->ensureTransactionsTable();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            // 1. Fetch invoice & client belonging strictly to user
            $stmtInv = $pdo->prepare("
                SELECT i.*, c.name as client_name 
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id AND c.user_id = i.user_id
                WHERE i.id = ? AND i.user_id = ?
            ");
            $stmtInv->execute([$invoiceId, $userId]);
            $invoice = $stmtInv->fetch(PDO::FETCH_ASSOC);

            if (!$invoice) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }

            // Calculate current paid sum
            $stmtSum = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as paid_sum FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?");
            $stmtSum->execute([$invoiceId, $userId]);
            $currentPaid = (float)($stmtSum->fetch(PDO::FETCH_ASSOC)['paid_sum'] ?? 0);

            if ($currentPaid == 0 && $invoice['status'] === 'PAGADA') {
                $currentPaid = (float)$invoice['total_amount'];
            }

            $totalAmount = (float)$invoice['total_amount'];
            $pendingAmount = max(0, $totalAmount - $currentPaid);

            if ($amount > $pendingAmount + 0.01) {
                $pdo->rollBack();
                $response->status(400)->json([
                    'ok' => false,
                    'message' => 'El monto del abono ($' . number_format($amount, 0) . ') supera el saldo pendiente ($' . number_format($pendingAmount, 0) . ')'
                ]);
                return;
            }

            $encNotes = self::encryptField($notes);
            $txRawNotes = $notes ?: ('Abono registrado para la cuenta de cobro ' . $invoice['invoice_number']);
            $encTxNotes = self::encryptField($txRawNotes);

            // 2. Insert transaction into finance_transactions
            $concept = "Abono a Cuenta #" . ($invoice['invoice_number'] ?: $invoice['id']);
            $stmtTx = $pdo->prepare("
                INSERT INTO finance_transactions 
                (user_id, type, concept, category, client_id, amount_cop, amount_usd, currency, transaction_date, status, payment_method, notes)
                VALUES (?, 'INGRESO', ?, 'Facturación', ?, ?, 0.00, 'COP', ?, 'COMPLETADO', ?, ?)
            ");
            $stmtTx->execute([
                $userId,
                $concept,
                $invoice['client_id'] ?: null,
                $amount,
                $paymentDate,
                $paymentMethod,
                $encTxNotes
            ]);
            $transactionId = $pdo->lastInsertId();

            // 3. Insert into finance_invoice_payments
            $stmtPay = $pdo->prepare("
                INSERT INTO finance_invoice_payments
                (invoice_id, user_id, amount, payment_date, payment_method, notes, transaction_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmtPay->execute([
                $invoiceId,
                $userId,
                $amount,
                $paymentDate,
                $paymentMethod,
                $encNotes,
                $transactionId
            ]);
            $paymentId = $pdo->lastInsertId();

            // 4. Recalculate invoice status
            $newPaidTotal = $currentPaid + $amount;
            $newStatus = ($newPaidTotal >= $totalAmount - 0.01) ? 'PAGADA' : 'PARCIAL';
            $paidAt = ($newStatus === 'PAGADA') ? date('Y-m-d H:i:s') : null;

            $stmtUpdInv = $pdo->prepare("
                UPDATE finance_invoices
                SET status = ?, paid_at = COALESCE(paid_at, ?), payment_method = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmtUpdInv->execute([$newStatus, $paidAt, $paymentMethod, $invoiceId, $userId]);

            $pdo->commit();

            $response->status(201)->json([
                'ok' => true,
                'message' => 'Abono registrado correctamente',
                'payment' => [
                    'id' => (int)$paymentId,
                    'invoice_id' => (int)$invoiceId,
                    'amount' => $amount,
                    'payment_date' => $paymentDate,
                    'payment_method' => $paymentMethod,
                    'notes' => $notes,
                    'transaction_id' => (int)$transactionId
                ],
                'invoice_status' => $newStatus,
                'paid_amount' => $newPaidTotal,
                'pending_amount' => max(0, $totalAmount - $newPaidTotal)
            ]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('[Finance] addInvoicePayment error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al registrar abono']);
        }
    }

    public function getInvoicePayments(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $invoiceId = (int)($request->params['id'] ?? 0);

        try {
            $this->ensureInvoicePaymentColumns();
            if (!$this->userOwnsInvoice($invoiceId, $userId)) {
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }

            $stmt = Database::query("
                SELECT * FROM finance_invoice_payments
                WHERE invoice_id = $1 AND user_id = $2
                ORDER BY payment_date DESC, id DESC
            ", [$invoiceId, $userId]);

            $payments = array_map([self::class, 'decryptPaymentRow'], $stmt->fetchAll());
            $response->json(['ok' => true, 'payments' => $payments]);
        } catch (Exception $error) {
            error_log('[Finance] getInvoicePayments error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener historial de abonos']);
        }
    }

    public function deleteInvoicePayment(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        $paymentId = (int)($request->params['paymentId'] ?? 0);
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $stmtCheck = $pdo->prepare("SELECT * FROM finance_invoice_payments WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$paymentId, $userId]);
            $payment = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$payment) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Abono no encontrado']);
                return;
            }

            $invoiceId = (int)$payment['invoice_id'];
            $transactionId = $payment['transaction_id'];

            // 1. Delete payment record
            $stmtDelP = $pdo->prepare("DELETE FROM finance_invoice_payments WHERE id = ? AND user_id = ?");
            $stmtDelP->execute([$paymentId, $userId]);

            // 2. Delete transaction record if exists
            if ($transactionId) {
                $stmtDelT = $pdo->prepare("DELETE FROM finance_transactions WHERE id = ? AND user_id = ?");
                $stmtDelT->execute([$transactionId, $userId]);
            }

            // 3. Recalculate invoice status & total paid
            $stmtInv = $pdo->prepare("SELECT total_amount FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtInv->execute([$invoiceId, $userId]);
            $invRow = $stmtInv->fetch(PDO::FETCH_ASSOC);
            $totalAmount = (float)($invRow['total_amount'] ?? 0);

            $stmtSum = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as paid_sum FROM finance_invoice_payments WHERE invoice_id = ? AND user_id = ?");
            $stmtSum->execute([$invoiceId, $userId]);
            $newPaidTotal = (float)($stmtSum->fetch(PDO::FETCH_ASSOC)['paid_sum'] ?? 0);

            $newStatus = 'DRAFT';
            if ($newPaidTotal >= $totalAmount - 0.01 && $totalAmount > 0) {
                $newStatus = 'PAGADA';
            } elseif ($newPaidTotal > 0) {
                $newStatus = 'PARCIAL';
            } else {
                $newStatus = 'ENVIADA';
            }

            $stmtUpdInv = $pdo->prepare("UPDATE finance_invoices SET status = ? WHERE id = ? AND user_id = ?");
            $stmtUpdInv->execute([$newStatus, $invoiceId, $userId]);

            $pdo->commit();

            $response->json([
                'ok' => true,
                'message' => 'Abono eliminado y saldo recalculado',
                'invoice_status' => $newStatus,
                'paid_amount' => $newPaidTotal,
                'pending_amount' => max(0, $totalAmount - $newPaidTotal)
            ]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('[Finance] deleteInvoicePayment error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar abono']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // CONTROL FINANCIERO (TRANSACCIONES REALES & DATO SINCRONIZADO)
    // ════════════════════════════════════════════════════════════
    private function ensureTransactionsTable(): void
    {
        try {
            $pdo = Database::getConnection();
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `finance_transactions` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` INT NOT NULL,
                  `type` VARCHAR(20) NOT NULL DEFAULT 'INGRESO',
                  `concept` VARCHAR(255) NOT NULL,
                  `category` VARCHAR(100) NOT NULL,
                  `client_id` INT NULL,
                  `amount_cop` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                  `amount_usd` DECIMAL(15, 2) NULL DEFAULT 0.00,
                  `currency` VARCHAR(10) DEFAULT 'COP',
                  `transaction_date` DATE NOT NULL,
                  `status` VARCHAR(50) DEFAULT 'COMPLETADO',
                  `payment_method` VARCHAR(100) NULL,
                  `notes` TEXT NULL,
                  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  INDEX (`user_id`),
                  INDEX (`transaction_date`),
                  INDEX (`type`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } catch (Exception $e) {
            error_log('[Finance] ensureTransactionsTable error: ' . $e->getMessage());
        }
    }

    public function getControlSummary(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureInvoicePaymentColumns();
            $this->ensureTransactionsTable();

            // 1. Recaudo Real de Facturas (Incluye facturas PAGADA y abonos parciales sin duplicar)
            $stmtFacturas = Database::query(
                "SELECT COALESCE(SUM(
                    COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id AND p.user_id = i.user_id),
                             CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END)
                 ), 0) AS total_pagado 
                 FROM finance_invoices i WHERE i.user_id = $1",
                [$userId]
            );
            $facturasPagadas = (float)($stmtFacturas->fetch()['total_pagado'] ?? 0);

            // 2. Ingresos Manuales de Transacciones (excluyendo abonos automáticos de facturas para evitar doble contabilización)
            $stmtIngresos = Database::query(
                "SELECT COALESCE(SUM(t.amount_cop), 0) AS total_ingresos 
                 FROM finance_transactions t
                 WHERE t.user_id = $1 
                   AND t.type = 'INGRESO'
                   AND NOT EXISTS (
                       SELECT 1 FROM finance_invoice_payments p 
                       WHERE p.transaction_id = t.id AND p.user_id = t.user_id
                   )",
                [$userId]
            );
            $ingresosManuales = (float)($stmtIngresos->fetch()['total_ingresos'] ?? 0);

            // 3. Egresos / Gastos Manuales
            $stmtEgresos = Database::query(
                "SELECT COALESCE(SUM(amount_cop), 0) AS total_egresos 
                 FROM finance_transactions WHERE user_id = $1 AND type = 'EGRESO'",
                [$userId]
            );
            $egresosManuales = (float)($stmtEgresos->fetch()['total_egresos'] ?? 0);

            // 4. Clientes Activos
            $stmtClients = Database::query(
                "SELECT COUNT(DISTINCT client_id) AS total_clientes 
                 FROM finance_invoices WHERE user_id = $1",
                [$userId]
            );
            $clientesActivos = (int)($stmtClients->fetch()['total_clientes'] ?? 0);

            // Consolidado exacto sin doble contabilidad
            $totalIngresos = $facturasPagadas + $ingresosManuales;
            $utilidadNeta = $totalIngresos - $egresosManuales;
            $margenNeto = $totalIngresos > 0 ? round(($utilidadNeta / $totalIngresos) * 100, 1) : 0;
            $mrrPromedio = round($totalIngresos / 12, 0);

            $response->json([
                'ok' => true,
                'summary' => [
                    'arr_total' => $totalIngresos,
                    'mrr_promedio' => $mrrPromedio,
                    'utilidad_neta' => $utilidadNeta,
                    'margen_neto_pct' => $margenNeto,
                    'egresos_total' => $egresosManuales,
                    'facturas_pagadas_total' => $facturasPagadas,
                    'ingresos_manuales_total' => $ingresosManuales,
                    'clientes_activos' => $clientesActivos
                ]
            ]);
        } catch (Exception $error) {
            error_log('[Finance] getControlSummary error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al calcular resumen financiero']);
        }
    }

    public function getTransactions(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureTransactionsTable();
            $search = $request->query['search'] ?? null;
            $type = $request->query['type'] ?? null;

            $conditions = ['t.user_id = $1'];
            $params = [$userId];
            $idx = 2;

            if ($search) {
                $conditions[] = "(t.concept LIKE \${$idx} OR t.category LIKE \${$idx} OR c.name LIKE \${$idx})";
                $params[] = "%{$search}%";
                $idx++;
            }
            if ($type) {
                $conditions[] = "t.type = \${$idx}";
                $params[] = strtoupper($type);
                $idx++;
            }

            $whereClause = implode(' AND ', $conditions);
            $query = "
                SELECT t.*, c.name AS client_name 
                FROM finance_transactions t
                LEFT JOIN finance_clients c ON t.client_id = c.id AND c.user_id = t.user_id
                WHERE {$whereClause}
                ORDER BY t.transaction_date DESC, t.id DESC
                LIMIT 100
            ";
            $stmt = Database::query($query, $params);
            $transactions = array_map([self::class, 'decryptTransactionRow'], $stmt->fetchAll());

            $response->json(['ok' => true, 'transactions' => $transactions]);
        } catch (Exception $error) {
            error_log('[Finance] getTransactions error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener transacciones']);
        }
    }

    public function createTransaction(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $this->ensureTransactionsTable();

            $type = strtoupper(trim((string)($request->body['type'] ?? 'INGRESO')));
            $concept = trim((string)($request->body['concept'] ?? ''));
            $category = trim((string)($request->body['category'] ?? 'General'));
            $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
            $amountCop = (float)($request->body['amount_cop'] ?? 0);
            $amountUsd = (float)($request->body['amount_usd'] ?? ($amountCop / 4000));
            $currency = strtoupper(trim((string)($request->body['currency'] ?? 'COP')));
            $transactionDate = $request->body['transaction_date'] ?? date('Y-m-d');
            $status = strtoupper(trim((string)($request->body['status'] ?? 'COMPLETADO')));
            $paymentMethod = trim((string)($request->body['payment_method'] ?? 'Transferencia'));
            $notes = isset($request->body['notes']) ? (string)$request->body['notes'] : null;

            // Validaciones Estrictas Backend
            if ($concept === '') {
                $response->status(400)->json(['ok' => false, 'message' => 'El concepto de la transacción es obligatorio']);
                return;
            }
            if (!is_finite($amountCop) || $amountCop <= 0 || $amountCop > 999999999999.99) {
                $response->status(400)->json(['ok' => false, 'message' => 'El monto debe ser un valor numérico mayor a cero']);
                return;
            }
            if (!in_array($type, ['INGRESO', 'EGRESO'], true)) {
                $response->status(400)->json(['ok' => false, 'message' => 'El tipo de transacción debe ser INGRESO o EGRESO']);
                return;
            }
            if ($clientId !== null && !$this->userOwnsClient($clientId, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'El cliente seleccionado no pertenece a tu cuenta']);
                return;
            }

            $encNotes = self::encryptField($notes);

            $stmt = Database::query(
                "INSERT INTO finance_transactions 
                 (user_id, type, concept, category, client_id, amount_cop, amount_usd, currency, transaction_date, status, payment_method, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
                [$userId, $type, $concept, $category, $clientId, $amountCop, $amountUsd, $currency, $transactionDate, $status, $paymentMethod, $encNotes]
            );
            $tx = $stmt->fetch();
            if ($tx) {
                $tx = self::decryptTransactionRow($tx);
            }

            $response->status(201)->json(['ok' => true, 'message' => 'Transacción registrada exitosamente', 'transaction' => $tx]);
        } catch (Exception $error) {
            error_log('[Finance] createTransaction error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al guardar la transacción']);
        }
    }

    public function updateTransaction(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $id = (int)($request->params['id'] ?? 0);

            $type = strtoupper(trim((string)($request->body['type'] ?? 'INGRESO')));
            $concept = trim((string)($request->body['concept'] ?? ''));
            $category = trim((string)($request->body['category'] ?? 'General'));
            $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
            $amountCop = (float)($request->body['amount_cop'] ?? 0);
            $amountUsd = (float)($request->body['amount_usd'] ?? ($amountCop / 4000));
            $currency = strtoupper(trim((string)($request->body['currency'] ?? 'COP')));
            $transactionDate = $request->body['transaction_date'] ?? date('Y-m-d');
            $status = strtoupper(trim((string)($request->body['status'] ?? 'COMPLETADO')));
            $paymentMethod = trim((string)($request->body['payment_method'] ?? 'Transferencia'));
            $notes = isset($request->body['notes']) ? (string)$request->body['notes'] : null;

            if ($id <= 0 || $concept === '' || !is_finite($amountCop) || $amountCop <= 0 || !in_array($type, ['INGRESO', 'EGRESO'], true)) {
                $response->status(400)->json(['ok' => false, 'message' => 'Datos de transacción inválidos']);
                return;
            }
            if ($clientId !== null && !$this->userOwnsClient($clientId, $userId)) {
                $response->status(403)->json(['ok' => false, 'message' => 'El cliente seleccionado no pertenece a tu cuenta']);
                return;
            }

            $encNotes = self::encryptField($notes);

            $stmt = Database::query(
                "UPDATE finance_transactions 
                 SET type = $1, concept = $2, category = $3, client_id = $4, amount_cop = $5, amount_usd = $6, currency = $7, transaction_date = $8, status = $9, payment_method = $10, notes = $11
                 WHERE id = $12 AND user_id = $13 RETURNING *",
                [$type, $concept, $category, $clientId, $amountCop, $amountUsd, $currency, $transactionDate, $status, $paymentMethod, $encNotes, $id, $userId]
            );
            $tx = $stmt->fetch();
            if (!$tx) {
                $response->status(404)->json(['ok' => false, 'message' => 'Transacción no encontrada']);
                return;
            }

            $response->json(['ok' => true, 'message' => 'Transacción actualizada', 'transaction' => self::decryptTransactionRow($tx)]);
        } catch (Exception $error) {
            error_log('[Finance] updateTransaction error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar transacción']);
        }
    }

    public function deleteTransaction(Request $request, Response $response): void
    {
        $userId = $this->requireAuthenticatedUser($request, $response);
        if ($userId === null) return;

        try {
            $id = (int)($request->params['id'] ?? 0);

            $stmt = Database::query(
                "DELETE FROM finance_transactions WHERE id = $1 AND user_id = $2 RETURNING id",
                [$id, $userId]
            );
            if (!$stmt->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Transacción no encontrada']);
                return;
            }

            $response->json(['ok' => true, 'message' => 'Transacción eliminada exitosamente']);
        } catch (Exception $error) {
            error_log('[Finance] deleteTransaction error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar transacción']);
        }
    }
}
