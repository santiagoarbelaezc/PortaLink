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
        // Ya están creados por schema_mysql.sql
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
                    COALESCE(SUM(CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END), 0) AS total_pagado,
                    COALESCE(SUM(CASE WHEN i.status IN ('DRAFT', 'ENVIADA', 'VENCIDA') THEN i.total_amount ELSE 0 END), 0) AS total_por_cobrar,
                    COUNT(DISTINCT i.client_id) AS clientes_facturados
                FROM finance_invoices i
                JOIN finance_clients c ON i.client_id = c.id
                WHERE {$whereClause}
            ";
            $stmtKpi = Database::query($kpiQuery, $params);
            $kpi = $stmtKpi->fetch();

            // 2. Ledger (Latest Invoices)
            $ledgerQuery = "
                SELECT 
                    i.id, i.invoice_number, i.total_amount, i.status, i.issue_date, i.due_date,
                    i.paid_at, i.payment_method, i.payment_notes, i.created_at AS updated_at,
                    c.name as client_name
                FROM finance_invoices i
                JOIN finance_clients c ON i.client_id = c.id
                WHERE {$whereClause}
                ORDER BY i.created_at DESC
                LIMIT 50
            ";
            $stmtLedger = Database::query($ledgerQuery, $params);
            $ledger = $stmtLedger->fetchAll();

            $response->json([
                'ok' => true,
                'kpis' => [
                    'total_facturado' => (float)($kpi['total_facturado'] ?? 0),
                    'total_pagado' => (float)($kpi['total_pagado'] ?? 0),
                    'total_por_cobrar' => (float)($kpi['total_por_cobrar'] ?? 0),
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
            $stmt = Database::query(
                'SELECT * FROM finance_services WHERE user_id = $1 ORDER BY name ASC',
                [$request->user->id]
            );
            $response->json(['ok' => true, 'services' => $stmt->fetchAll()]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener servicios']);
        }
    }

    public function createService(Request $request, Response $response): void
    {
        $name = $request->body['name'] ?? null;
        $description = $request->body['description'] ?? null;
        $price = $request->body['price'] ?? null;

        try {
            $stmt = Database::query(
                "INSERT INTO finance_services (user_id, name, description, price) 
                 VALUES ($1, $2, $3, $4) RETURNING *",
                [$request->user->id, $name, $description, $price]
            );
            $response->status(201)->json(['ok' => true, 'service' => $stmt->fetch()]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al crear servicio']);
        }
    }

    public function updateService(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        $name = $request->body['name'] ?? null;
        $description = $request->body['description'] ?? null;
        $price = $request->body['price'] ?? null;

        try {
            $stmt = Database::query(
                "UPDATE finance_services 
                 SET name = $1, description = $2, price = $3 
                 WHERE id = $4 AND user_id = $5 RETURNING *",
                [$name, $description, $price, $id, $request->user->id]
            );
            $service = $stmt->fetch();
            if (!$service) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'service' => $service]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar servicio']);
        }
    }

    public function deleteService(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        try {
            $stmt = Database::query('DELETE FROM finance_services WHERE id = $1 AND user_id = $2 RETURNING id', [$id, $request->user->id]);
            if (!$stmt->fetch()) {
                $response->status(404)->json(['ok' => false, 'message' => 'Servicio no encontrado']);
                return;
            }
            $response->json(['ok' => true, 'message' => 'Servicio eliminado']);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al eliminar servicio']);
        }
    }

    // ════════════════════════════════════════════════════════════
    // CUENTAS DE COBRO (FACTURAS)
    // ════════════════════════════════════════════════════════════
    public function getInvoices(Request $request, Response $response): void
    {
        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, c.name as client_name 
                 FROM finance_invoices i
                 JOIN finance_clients c ON i.client_id = c.id
                 WHERE i.user_id = $1 
                 ORDER BY i.created_at DESC",
                [$request->user->id]
            );
            $response->json(['ok' => true, 'invoices' => $stmt->fetchAll()]);
        } catch (Exception $error) {
            $response->status(500)->json(['ok' => false, 'message' => 'Error al obtener cuentas de cobro']);
        }
    }

    public function getInvoiceDetails(Request $request, Response $response): void
    {
        $id = $request->params['id'] ?? null;
        try {
            $this->ensureInvoicePaymentColumns();
            $stmt = Database::query(
                "SELECT i.*, c.name as client_name, c.email, c.phone, c.company, c.tax_id
                 FROM finance_invoices i
                 JOIN finance_clients c ON i.client_id = c.id
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

            $stmtInvoice = Database::query(
                "INSERT INTO finance_invoices 
                 (user_id, client_id, invoice_number, issue_date, due_date, status, subtotal, tax_amount, total_amount, notes, paid_at, payment_method, payment_notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
                [
                    $request->user->id, $clientId, $invoiceNumber, $issueDate, $dueDate, $invoiceStatus,
                    $subtotal, $taxAmount, $totalAmount, $notes ?: null, $paidAtVal, $paymentMethod ?: null, $paymentNotes ?: null
                ]
            );
            $invoice = $stmtInvoice->fetch(PDO::FETCH_ASSOC);
            $invoiceId = $invoice['id'];

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

            $invoiceStatus = ($status === 'PAGADA' || $status === 'Pagada') ? 'PAGADA' : (($status === 'ENVIADA' || $status === 'Enviada') ? 'ENVIADA' : 'DRAFT');
            $paidAtVal = $invoiceStatus === 'PAGADA' ? ($paidAt ?: date('Y-m-d H:i:s')) : null;

            $stmtUpdate = Database::query(
                "UPDATE finance_invoices 
                 SET client_id = ?, issue_date = ?, due_date = ?, status = ?, subtotal = ?, tax_amount = ?, total_amount = ?, notes = ?, paid_at = ?, payment_method = ?, payment_notes = ?
                 WHERE id = ? AND user_id = ? RETURNING *",
                [
                    $clientId, $issueDate, $dueDate, $invoiceStatus, $subtotal, $taxAmount, $totalAmount,
                    $notes ?: null, $paidAtVal, $paymentMethod ?: null, $paymentNotes ?: null, $id, $request->user->id
                ]
            );
            $invoice = $stmtUpdate->fetch(PDO::FETCH_ASSOC);

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

            $pdo->commit();
            $response->json(['ok' => true, 'invoice' => $invoice]);
        } catch (Exception $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('updateInvoice error: ' . $error->getMessage());
            $response->status(500)->json(['ok' => false, 'message' => 'Error al actualizar cuenta de cobro']);
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
}
