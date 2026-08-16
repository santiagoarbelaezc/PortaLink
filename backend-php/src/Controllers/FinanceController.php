<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use Exception;
use PDO;

class FinanceController
{
    private static bool $paymentColumnsEnsured = false;

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
        try {
            $this->ensureInvoicePaymentColumns();
            $userId = $request->user->id;
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
            if ($minPrice) {
                $conditions[] = "i.total_amount >= \${$idx}";
                $params[] = $minPrice;
                $idx++;
            }
            if ($maxPrice) {
                $conditions[] = "i.total_amount <= \${$idx}";
                $params[] = $maxPrice;
                $idx++;
            }
            if ($dateFrom) {
                $conditions[] = "i.issue_date >= \${$idx}";
                $params[] = $dateFrom;
                $idx++;
            }
            if ($dateTo) {
                $conditions[] = "i.issue_date <= \${$idx}";
                $params[] = $dateTo;
                $idx++;
            }

            $whereClause = implode(' AND ', $conditions);

            // 1. KPI Queries
            $kpiQuery = "
                SELECT 
                    COALESCE(SUM(i.total_amount), 0) AS total_facturado,
                    COALESCE(SUM(
                        COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id), 
                                 CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END)
                    ), 0) AS total_pagado,
                    COUNT(DISTINCT i.client_id) AS clientes_facturados
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id
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
                    COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id), 
                             CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END) AS paid_amount
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id
                WHERE {$whereClause}
                ORDER BY i.created_at DESC
                LIMIT 50
            ";
            $stmtLedger = Database::query($ledgerQuery, $params);
            $ledger = $stmtLedger->fetchAll();

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
        try {
            $stmt = Database::query(
                'SELECT * FROM finance_clients WHERE user_id = $1 ORDER BY name ASC',
                [$request->user->id]
            );
            $response->json(['ok' => true, 'clients' => $stmt->fetchAll()]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener clientes']);
        }
    }

    public function createClient(Request $request, Response $response): void
    {
        $name = $request->body['name'] ?? null;
        $email = $request->body['email'] ?? null;
        $phone = $request->body['phone'] ?? null;
        $company = $request->body['company'] ?? null;
        $taxId = $request->body['tax_id'] ?? null;
        $address = $request->body['address'] ?? null;
        $notes = $request->body['notes'] ?? null;

        try {
            try {
                Database::query('ALTER TABLE finance_clients ADD COLUMN IF NOT EXISTS notes TEXT;');
            } catch (Exception $e) {}

            $stmt = Database::query(
                "INSERT INTO finance_clients (user_id, name, email, phone, company, tax_id, address, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [$request->user->id, $name, $email, $phone, $company, $taxId, $address, $notes ?: null]
            );
            $response->status(201)->json(['ok' => true, 'client' => $stmt->fetch()]);
        } catch (Exception $error) {
            error_log('Error al crear cliente: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear cliente']);
        }
    }

    public function updateClient(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        $name = $request->body['name'] ?? null;
        $email = $request->body['email'] ?? null;
        $phone = $request->body['phone'] ?? null;
        $company = $request->body['company'] ?? null;
        $taxId = $request->body['tax_id'] ?? null;
        $address = $request->body['address'] ?? null;
        $notes = $request->body['notes'] ?? null;

        try {
            try {
                Database::query('ALTER TABLE finance_clients ADD COLUMN IF NOT EXISTS notes TEXT;');
            } catch (Exception $e) {}

            $stmt = Database::query(
                "UPDATE finance_clients 
                 SET name = $1, email = $2, phone = $3, company = $4, tax_id = $5, address = $6, notes = $7 
                 WHERE id = $8 AND user_id = $9 RETURNING *",
                [$name, $email, $phone, $company, $taxId, $address, $notes ?: null, $id, $request->user->id]
            );
            $client = $stmt->fetch();
            if (!$client) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'client' => $client]);
        } catch (Exception $error) {
            error_log('Error al actualizar cliente: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar cliente']);
        }
    }

    public function deleteClient(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        try {
            $stmt = Database::query('DELETE FROM finance_clients WHERE id = $1 AND user_id = $2 RETURNING id', [$id, $request->user->id]);
            if (!$stmt->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cliente no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'message' => 'Cliente eliminado']);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar cliente. Verifica que no tenga facturas asociadas.']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // SERVICIOS
    // ════════════════════════════════════════════════════════════
    public function getServices(Request $request, Response $response): void
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT * FROM finance_services WHERE user_id = ? ORDER BY name ASC');
            $stmt->execute([$request->user->id]);
            $response->json(['ok' => true, 'services' => $stmt->fetchAll()]);
        } catch (\Throwable $error) {
            error_log('Error al obtener servicios: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener servicios: ' . $error->getMessage()]);
        }
    }

    public function createService(Request $request, Response $response): void
    {
        $name = $request->body['name'] ?? null;
        $description = $request->body['description'] ?? null;
        $price = $request->body['price'] ?? $request->body['unitPrice'] ?? 0;

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO finance_services (user_id, name, description, price) VALUES (?, ?, ?, ?)");
            $stmt->execute([$request->user->id, $name, $description, (float)$price]);
            $id = $pdo->lastInsertId();

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_services WHERE id = ?");
            $stmtFetch->execute([$id]);
            $service = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            $response->status(201)->json(['ok' => true, 'service' => $service]);
        } catch (\Throwable $error) {
            error_log('Error al crear servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear servicio: ' . $error->getMessage()]);
        }
    }

    public function updateService(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        $name = $request->body['name'] ?? null;
        $description = $request->body['description'] ?? null;
        $price = $request->body['price'] ?? $request->body['unitPrice'] ?? 0;

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("UPDATE finance_services SET name = ?, description = ?, price = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([$name, $description, (float)$price, $id, $request->user->id]);

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtFetch->execute([$id, $request->user->id]);
            $service = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            if (!$service) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'service' => $service]);
        } catch (\Throwable $error) {
            error_log('Error al actualizar servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar servicio: ' . $error->getMessage()]);
        }
    }

    public function deleteService(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        try {
            $pdo = Database::getConnection();
            $stmtCheck = $pdo->prepare("SELECT id FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $request->user->id]);
            if (!$stmtCheck->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }

            $stmtDel = $pdo->prepare("DELETE FROM finance_services WHERE id = ? AND user_id = ?");
            $stmtDel->execute([$id, $request->user->id]);
            $response->json(['ok' => true, 'message' => 'Servicio eliminado']);
        } catch (\Throwable $error) {
            error_log('Error al eliminar servicio: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar servicio: ' . $error->getMessage()]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // CUENTAS DE COBRO (FACTURAS) & ABONOS PARCIALES
    // ════════════════════════════════════════════════════════════
    public function getInvoices(Request $request, Response $response): void
    {
        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, COALESCE(c.name, 'Cliente') as client_name, c.company as company,
                        COALESCE((SELECT SUM(p.amount) FROM finance_invoice_payments p WHERE p.invoice_id = i.id), 
                                 CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END) AS paid_amount
                 FROM finance_invoices i
                 LEFT JOIN finance_clients c ON i.client_id = c.id
                 WHERE i.user_id = $1 
                 ORDER BY i.created_at DESC",
                [$request->user->id]
            );
            $invoices = $stmt->fetchAll();
            foreach ($invoices as &$inv) {
                $total = (float)($inv['total_amount'] ?? 0);
                $paid = (float)($inv['paid_amount'] ?? 0);
                $inv['paid_amount'] = $paid;
                $inv['pending_amount'] = max(0, $total - $paid);
                
                try {
                    $stmtPay = Database::query(
                        "SELECT * FROM finance_invoice_payments WHERE invoice_id = $1 ORDER BY payment_date DESC, id DESC",
                        [$inv['id']]
                    );
                    $inv['payments'] = $stmtPay->fetchAll();
                } catch (\Throwable $pe) {
                    $inv['payments'] = [];
                }
            }

            $response->json(['ok' => true, 'invoices' => $invoices]);
        } catch (\Throwable $error) {
            error_log('[Finance] getInvoices error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener cuentas de cobro: ' . $error->getMessage()]);
        }
    }

    public function getInvoiceDetails(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, COALESCE(c.name, 'Cliente') as client_name, c.email, c.phone, c.company, c.tax_id
                 FROM finance_invoices i
                 LEFT JOIN finance_clients c ON i.client_id = c.id
                 WHERE i.id = $1 AND i.user_id = $2",
                [$id, $request->user->id]
            );
            $invoice = $stmt->fetch();
            if (!$invoice) {
                $response->status(404)->json(['ok' => false, 'message' => 'Cuenta de cobro no encontrada']);
                return;
            }

            $stmtItems = Database::query(
                "SELECT it.*, COALESCE(s.name, it.description) as service_name
                 FROM finance_invoice_items it
                 LEFT JOIN finance_services s ON it.service_id = s.id
                 WHERE it.invoice_id = $1",
                [$id]
            );
            $invoice['items'] = $stmtItems->fetchAll();

            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener cuenta de cobro']);
        }
    }

    public function createInvoice(Request $request, Response $response): void
    {
        $clientId = $request->body['client_id'] ?? null;
        $invoiceNumber = $request->body['invoice_number'] ?? null;
        $title = $request->body['title'] ?? null;
        $issueDate = $request->body['issue_date'] ?? null;
        $dueDate = $request->body['due_date'] ?? null;
        $items = $request->body['items'] ?? [];
        $notes = $request->body['notes'] ?? null;
        $status = $request->body['status'] ?? null;
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = $request->body['payment_method'] ?? null;
        $paymentNotes = $request->body['payment_notes'] ?? null;

        $this->ensureInvoicePaymentColumns();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $subtotal = 0;
            if (is_array($items) && count($items) > 0) {
                foreach ($items as $item) {
                    $subtotal += ((float)($item['quantity'] ?? 0) * (float)($item['unit_price'] ?? 0));
                }
            }

            $taxAmount = (float)($request->body['tax_amount'] ?? 0);
            $totalAmount = $subtotal + $taxAmount;

            $invoiceStatus = ($status === 'PAGADA' || $status === 'Pagada') ? 'PAGADA' : (($status === 'ENVIADA' || $status === 'Enviada') ? 'ENVIADA' : 'DRAFT');
            $paidAtVal = $invoiceStatus === 'PAGADA' ? ($paidAt ?: date('Y-m-d H:i:s')) : null;

            $stmtInsert = $pdo->prepare(
                "INSERT INTO finance_invoices 
                 (user_id, client_id, invoice_number, title, issue_date, due_date, status, subtotal, tax_amount, total_amount, notes, paid_at, payment_method, payment_notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmtInsert->execute([
                $request->user->id, $clientId, $invoiceNumber, $title ?: null, $issueDate, $dueDate, $invoiceStatus,
                $subtotal, $taxAmount, $totalAmount, $notes ?: null, $paidAtVal, $paymentMethod ?: null, $paymentNotes ?: null
            ]);
            $invoiceId = $pdo->lastInsertId();

            if (is_array($items) && count($items) > 0) {
                $stmtItem = $pdo->prepare(
                    "INSERT INTO finance_invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
                     VALUES (?, ?, ?, ?, ?, ?)"
                );
                foreach ($items as $item) {
                    $totalPrice = (float)($item['quantity'] ?? 0) * (float)($item['unit_price'] ?? 0);
                    $stmtItem->execute([
                        $invoiceId,
                        $item['service_id'] ?? null,
                        $item['description'] ?? null,
                        $item['quantity'] ?? 0,
                        $item['unit_price'] ?? 0,
                        $totalPrice
                    ]);
                }
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_invoices WHERE id = ?");
            $stmtFetch->execute([$invoiceId]);
            $invoice = $stmtFetch->fetch(PDO::FETCH_ASSOC);

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
        $id = $request->params['id'] ?? null;
        $clientId = $request->body['client_id'] ?? null;
        $title = $request->body['title'] ?? null;
        $issueDate = $request->body['issue_date'] ?? null;
        $dueDate = $request->body['due_date'] ?? null;
        $items = $request->body['items'] ?? [];
        $notes = $request->body['notes'] ?? null;
        $status = $request->body['status'] ?? null;
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = $request->body['payment_method'] ?? null;
        $paymentNotes = $request->body['payment_notes'] ?? null;

        $this->ensureInvoicePaymentColumns();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $stmtCheck = $pdo->prepare("SELECT id FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $request->user->id]);
            if (!$stmtCheck->fetch()) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Cuenta de cobro no encontrada']);
                return;
            }

            $subtotal = 0;
            if (is_array($items) && count($items) > 0) {
                foreach ($items as $item) {
                    $subtotal += ((float)($item['quantity'] ?? 1) * (float)($item['unit_price'] ?? 0));
                }
            }

            $taxAmount = (float)($request->body['tax_amount'] ?? 0);
            $totalAmount = $subtotal + $taxAmount;

            // Recalcular estado conservando intactos todos los abonos realizados
            $stmtPaid = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) AS paid_sum FROM finance_invoice_payments WHERE invoice_id = ?");
            $stmtPaid->execute([$id]);
            $paidSum = (float)($stmtPaid->fetch(PDO::FETCH_ASSOC)['paid_sum'] ?? 0);

            if ($paidSum >= $totalAmount - 0.01 && $totalAmount > 0) {
                $invoiceStatus = 'PAGADA';
            } elseif ($paidSum > 0) {
                $invoiceStatus = 'PARCIAL';
            } else {
                $invoiceStatus = ($status === 'PAGADA' || $status === 'Pagada') ? 'PAGADA' : (($status === 'ENVIADA' || $status === 'Enviada') ? 'ENVIADA' : 'DRAFT');
            }
            $paidAtVal = $invoiceStatus === 'PAGADA' ? ($paidAt ?: date('Y-m-d H:i:s')) : null;

            $stmtUpdate = $pdo->prepare(
                "UPDATE finance_invoices 
                 SET client_id = ?, title = ?, issue_date = ?, due_date = ?, status = ?, subtotal = ?, tax_amount = ?, total_amount = ?, notes = ?, paid_at = ?, payment_method = ?, payment_notes = ?
                 WHERE id = ? AND user_id = ?"
            );
            $stmtUpdate->execute([
                $clientId, $title ?: null, $issueDate, $dueDate, $invoiceStatus, $subtotal, $taxAmount, $totalAmount,
                $notes ?: null, $paidAtVal, $paymentMethod ?: null, $paymentNotes ?: null, $id, $request->user->id
            ]);

            $stmtDel = $pdo->prepare("DELETE FROM finance_invoice_items WHERE invoice_id = ?");
            $stmtDel->execute([$id]);

            if (is_array($items) && count($items) > 0) {
                $stmtItem = $pdo->prepare(
                    "INSERT INTO finance_invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
                     VALUES (?, ?, ?, ?, ?, ?)"
                );
                foreach ($items as $item) {
                    $totalPrice = ((float)($item['quantity'] ?? 1) * (float)($item['unit_price'] ?? 0));
                    $desc = $item['description'] ?? $item['service_name'] ?? 'Servicio';
                    $stmtItem->execute([
                        $id,
                        $item['service_id'] ?? null,
                        $desc,
                        $item['quantity'] ?? 1,
                        $item['unit_price'] ?? 0,
                        $totalPrice
                    ]);
                }
            }

            $stmtFetch = $pdo->prepare("SELECT * FROM finance_invoices WHERE id = ?");
            $stmtFetch->execute([$id]);
            $invoice = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            $pdo->commit();
            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('Error al actualizar cuenta de cobro: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar cuenta de cobro: ' . $error->getMessage()]);
        }
    }

    public function updateInvoiceStatus(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        $status = $request->body['status'] ?? null;
        $paidAt = $request->body['paid_at'] ?? null;
        $paymentMethod = $request->body['payment_method'] ?? null;
        $paymentNotes = $request->body['payment_notes'] ?? null;

        try {
            $this->ensureInvoicePaymentColumns();

            if ($status === 'PAGADA' || $status === 'Pagada') {
                $query = "UPDATE finance_invoices 
                          SET status = $1, 
                              paid_at = COALESCE($4, NOW()), 
                              payment_method = $5, 
                              payment_notes = $6 
                          WHERE id = $2 AND user_id = $3 RETURNING *";
                $params = [$status, $id, $request->user->id, $paidAt ?: date('Y-m-d H:i:s'), $paymentMethod ?: null, $paymentNotes ?: null];
            } else {
                $query = "UPDATE finance_invoices SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *";
                $params = [$status, $id, $request->user->id];
            }

            $stmt = Database::query($query, $params);
            $invoice = $stmt->fetch();
            if (!$invoice) {
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }
            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            error_log('[Finance] updateInvoiceStatus error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al cambiar el estado']);
        }
    }

    public function deleteInvoice(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();
            $stmtCheck = $pdo->prepare("SELECT id FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$id, $request->user->id]);
            if (!$stmtCheck->fetch()) {
                $pdo->rollBack();
                $response->status(404)->json(['ok' => false, 'message' => 'Factura no encontrada']);
                return;
            }

            $stmtDelItems = $pdo->prepare("DELETE FROM finance_invoice_items WHERE invoice_id = ?");
            $stmtDelItems->execute([$id]);

            $stmtDelInv = $pdo->prepare("DELETE FROM finance_invoices WHERE id = ? AND user_id = ?");
            $stmtDelInv->execute([$id, $request->user->id]);

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
        $invoiceId = $request->params['id'] ?? null;
        $amount = (float)($request->body['amount'] ?? 0);
        $paymentDate = $request->body['payment_date'] ?? date('Y-m-d');
        $paymentMethod = $request->body['payment_method'] ?? 'Transferencia Bancaria';
        $notes = $request->body['notes'] ?? null;
        $userId = $request->user->id;

        if ($amount <= 0) {
            $response->status(400)->json(['ok' => false, 'message' => 'El monto del abono debe ser mayor a 0']);
            return;
        }

        $this->ensureInvoicePaymentColumns();
        $this->ensureTransactionsTable();
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            // 1. Fetch invoice & client
            $stmtInv = $pdo->prepare("
                SELECT i.*, c.name as client_name 
                FROM finance_invoices i
                LEFT JOIN finance_clients c ON i.client_id = c.id
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
            $stmtSum = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as paid_sum FROM finance_invoice_payments WHERE invoice_id = ?");
            $stmtSum->execute([$invoiceId]);
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
                $notes ?: ('Abono registrado para la cuenta de cobro ' . $invoice['invoice_number'])
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
                $notes ?: null,
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
        $invoiceId = $request->params['id'] ?? null;
        $userId = $request->user->id;

        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query("
                SELECT * FROM finance_invoice_payments
                WHERE invoice_id = $1 AND user_id = $2
                ORDER BY payment_date DESC, id DESC
            ", [$invoiceId, $userId]);

            $response->json(['ok' => true, 'payments' => $stmt->fetchAll()]);
        } catch (Exception $error) {
            error_log('[Finance] getInvoicePayments error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener historial de abonos']);
        }
    }

    public function deleteInvoicePayment(Request $request, Response $response): void
    {
        $paymentId = $request->params['paymentId'] ?? null;
        $userId = $request->user->id;
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

            $invoiceId = $payment['invoice_id'];
            $transactionId = $payment['transaction_id'];

            // 1. Delete payment record
            $stmtDelP = $pdo->prepare("DELETE FROM finance_invoice_payments WHERE id = ?");
            $stmtDelP->execute([$paymentId]);

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

            $stmtSum = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as paid_sum FROM finance_invoice_payments WHERE invoice_id = ?");
            $stmtSum->execute([$invoiceId]);
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
        try {
            $this->ensureTransactionsTable();
            $userId = $request->user->id;

            // 1. Facturas Pagadas (Sincronizado)
            $stmtFacturas = Database::query(
                "SELECT COALESCE(SUM(total_amount), 0) AS total_pagado 
                 FROM finance_invoices WHERE user_id = $1 AND status = 'PAGADA'",
                [$userId]
            );
            $facturasPagadas = (float)($stmtFacturas->fetch()['total_pagado'] ?? 0);

            // 2. Ingresos Manuales de Transacciones
            $stmtIngresos = Database::query(
                "SELECT COALESCE(SUM(amount_cop), 0) AS total_ingresos 
                 FROM finance_transactions WHERE user_id = $1 AND type = 'INGRESO'",
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

            // Consolidado
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
        try {
            $this->ensureTransactionsTable();
            $userId = $request->user->id;
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
                LEFT JOIN finance_clients c ON t.client_id = c.id
                WHERE {$whereClause}
                ORDER BY t.transaction_date DESC, t.id DESC
                LIMIT 100
            ";
            $stmt = Database::query($query, $params);
            $transactions = $stmt->fetchAll();

            $response->json(['ok' => true, 'transactions' => $transactions]);
        } catch (Exception $error) {
            error_log('[Finance] getTransactions error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener transacciones']);
        }
    }

    public function createTransaction(Request $request, Response $response): void
    {
        try {
            $this->ensureTransactionsTable();
            $userId = $request->user->id;

            $type = strtoupper($request->body['type'] ?? 'INGRESO');
            $concept = trim($request->body['concept'] ?? '');
            $category = trim($request->body['category'] ?? 'General');
            $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
            $amountCop = (float)($request->body['amount_cop'] ?? 0);
            $amountUsd = (float)($request->body['amount_usd'] ?? ($amountCop / 4000));
            $currency = strtoupper($request->body['currency'] ?? 'COP');
            $transactionDate = $request->body['transaction_date'] ?? date('Y-m-d');
            $status = strtoupper($request->body['status'] ?? 'COMPLETADO');
            $paymentMethod = $request->body['payment_method'] ?? 'Transferencia';
            $notes = $request->body['notes'] ?? null;

            // Validaciones Estrictas Backend
            if (empty($concept)) {
                $response->status(400)->json(['ok' => false, 'message' => 'El concepto de la transacción es obligatorio']);
                return;
            }
            if ($amountCop <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'El monto debe ser un valor numérico mayor a cero']);
                return;
            }
            if (!in_array($type, ['INGRESO', 'EGRESO'])) {
                $response->status(400)->json(['ok' => false, 'message' => 'El tipo de transacción debe ser INGRESO o EGRESO']);
                return;
            }

            $stmt = Database::query(
                "INSERT INTO finance_transactions 
                 (user_id, type, concept, category, client_id, amount_cop, amount_usd, currency, transaction_date, status, payment_method, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
                [$userId, $type, $concept, $category, $clientId, $amountCop, $amountUsd, $currency, $transactionDate, $status, $paymentMethod, $notes]
            );
            $tx = $stmt->fetch();

            $response->status(201)->json(['ok' => true, 'message' => 'Transacción registrada exitosamente', 'transaction' => $tx]);
        } catch (Exception $error) {
            error_log('[Finance] createTransaction error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al guardar la transacción']);
        }
    }

    public function updateTransaction(Request $request, Response $response): void
    {
        try {
            $id = (int)($request->params['id'] ?? 0);
            $userId = $request->user->id;

            $type = strtoupper($request->body['type'] ?? 'INGRESO');
            $concept = trim($request->body['concept'] ?? '');
            $category = trim($request->body['category'] ?? 'General');
            $clientId = !empty($request->body['client_id']) ? (int)$request->body['client_id'] : null;
            $amountCop = (float)($request->body['amount_cop'] ?? 0);
            $amountUsd = (float)($request->body['amount_usd'] ?? ($amountCop / 4000));
            $currency = strtoupper($request->body['currency'] ?? 'COP');
            $transactionDate = $request->body['transaction_date'] ?? date('Y-m-d');
            $status = strtoupper($request->body['status'] ?? 'COMPLETADO');
            $paymentMethod = $request->body['payment_method'] ?? 'Transferencia';
            $notes = $request->body['notes'] ?? null;

            if ($amountCop <= 0) {
                $response->status(400)->json(['ok' => false, 'message' => 'El monto debe ser mayor a cero']);
                return;
            }

            $stmt = Database::query(
                "UPDATE finance_transactions 
                 SET type = $1, concept = $2, category = $3, client_id = $4, amount_cop = $5, amount_usd = $6, currency = $7, transaction_date = $8, status = $9, payment_method = $10, notes = $11
                 WHERE id = $12 AND user_id = $13 RETURNING *",
                [$type, $concept, $category, $clientId, $amountCop, $amountUsd, $currency, $transactionDate, $status, $paymentMethod, $notes, $id, $userId]
            );
            $tx = $stmt->fetch();
            if (!$tx) {
                $response->status(404)->json(['ok' => false, 'message' => 'Transacción no encontrada']);
                return;
            }

            $response->json(['ok' => true, 'message' => 'Transacción actualizada', 'transaction' => $tx]);
        } catch (Exception $error) {
            error_log('[Finance] updateTransaction error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar transacción']);
        }
    }

    public function deleteTransaction(Request $request, Response $response): void
    {
        try {
            $id = (int)($request->params['id'] ?? 0);
            $userId = $request->user->id;

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
