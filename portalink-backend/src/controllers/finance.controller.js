const db = require('../config/db');

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search, min_price, max_price, date_from, date_to } = req.query;

        // Base conditions for invoices
        let conditions = ['i.user_id = $1'];
        let params = [userId];
        let idx = 2;

        if (search) {
            conditions.push(`c.name ILIKE $${idx++}`);
            params.push(`%${search}%`);
        }
        if (min_price) {
            conditions.push(`i.total_amount >= $${idx++}`);
            params.push(min_price);
        }
        if (max_price) {
            conditions.push(`i.total_amount <= $${idx++}`);
            params.push(max_price);
        }
        if (date_from) {
            conditions.push(`i.issue_date >= $${idx++}`);
            params.push(date_from);
        }
        if (date_to) {
            conditions.push(`i.issue_date <= $${idx++}`);
            params.push(date_to);
        }

        const whereClause = conditions.join(' AND ');

        // 1. KPI Queries
        const kpiQuery = `
            SELECT 
                COALESCE(SUM(i.total_amount), 0) AS total_facturado,
                COALESCE(SUM(CASE WHEN i.status = 'PAGADA' THEN i.total_amount ELSE 0 END), 0) AS total_pagado,
                COALESCE(SUM(CASE WHEN i.status IN ('DRAFT', 'ENVIADA', 'VENCIDA') THEN i.total_amount ELSE 0 END), 0) AS total_por_cobrar,
                COUNT(DISTINCT i.client_id) AS clientes_facturados
            FROM finance_invoices i
            JOIN finance_clients c ON i.client_id = c.id
            WHERE ${whereClause}
        `;
        const kpiResult = await db.query(kpiQuery, params);
        const kpi = kpiResult.rows[0];

        // 2. Ledger (Latest Invoices)
        const ledgerQuery = `
            SELECT 
                i.id, i.invoice_number, i.total_amount, i.status, i.issue_date, i.due_date,
                c.name as client_name
            FROM finance_invoices i
            JOIN finance_clients c ON i.client_id = c.id
            WHERE ${whereClause}
            ORDER BY i.created_at DESC
            LIMIT 50
        `;
        const ledgerResult = await db.query(ledgerQuery, params);

        res.json({
            ok: true,
            kpis: {
                total_facturado: parseFloat(kpi.total_facturado),
                total_pagado: parseFloat(kpi.total_pagado),
                total_por_cobrar: parseFloat(kpi.total_por_cobrar),
                clientes_facturados: parseInt(kpi.clientes_facturados, 10)
            },
            ledger: ledgerResult.rows
        });
    } catch (error) {
        console.error('[Finance] Dashboard error:', error);
        res.status(500).json({ ok: false, message: 'Error al cargar el dashboard financiero' });
    }
};

// ════════════════════════════════════════════════════════════
// CLIENTES
// ════════════════════════════════════════════════════════════
exports.getClients = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM finance_clients WHERE user_id = $1 ORDER BY name ASC',
            [req.user.id]
        );
        res.json({ ok: true, clients: result.rows });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al obtener clientes' });
    }
};

exports.createClient = async (req, res) => {
    const { name, email, phone, company, tax_id, address } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO finance_clients (user_id, name, email, phone, company, tax_id, address) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, name, email, phone, company, tax_id, address]
        );
        res.status(201).json({ ok: true, client: result.rows[0] });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al crear cliente' });
    }
};

exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, company, tax_id, address } = req.body;
    try {
        const result = await db.query(
            `UPDATE finance_clients 
             SET name = $1, email = $2, phone = $3, company = $4, tax_id = $5, address = $6 
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [name, email, phone, company, tax_id, address, id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
        res.json({ ok: true, client: result.rows[0] });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al actualizar cliente' });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM finance_clients WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
        res.json({ ok: true, message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al eliminar cliente. Verifica que no tenga facturas asociadas.' });
    }
};

// ════════════════════════════════════════════════════════════
// SERVICIOS
// ════════════════════════════════════════════════════════════
exports.getServices = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM finance_services WHERE user_id = $1 ORDER BY name ASC',
            [req.user.id]
        );
        res.json({ ok: true, services: result.rows });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al obtener servicios' });
    }
};

exports.createService = async (req, res) => {
    const { name, description, price } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO finance_services (user_id, name, description, price) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, name, description, price]
        );
        res.status(201).json({ ok: true, service: result.rows[0] });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al crear servicio' });
    }
};

exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    try {
        const result = await db.query(
            `UPDATE finance_services 
             SET name = $1, description = $2, price = $3 
             WHERE id = $4 AND user_id = $5 RETURNING *`,
            [name, description, price, id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });
        res.json({ ok: true, service: result.rows[0] });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al actualizar servicio' });
    }
};

exports.deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM finance_services WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rowCount === 0) return res.status(404).json({ ok: false, message: 'Servicio no encontrado' });
        res.json({ ok: true, message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al eliminar servicio' });
    }
};

// ════════════════════════════════════════════════════════════
// CUENTAS DE COBRO (FACTURAS)
// ════════════════════════════════════════════════════════════
exports.getInvoices = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT i.*, c.name as client_name 
             FROM finance_invoices i
             JOIN finance_clients c ON i.client_id = c.id
             WHERE i.user_id = $1 
             ORDER BY i.created_at DESC`,
            [req.user.id]
        );
        res.json({ ok: true, invoices: result.rows });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al obtener cuentas de cobro' });
    }
};

exports.getInvoiceDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const invoiceResult = await db.query(
            `SELECT i.*, c.name as client_name, c.email, c.phone, c.company, c.tax_id
             FROM finance_invoices i
             JOIN finance_clients c ON i.client_id = c.id
             WHERE i.id = $1 AND i.user_id = $2`,
            [id, req.user.id]
        );
        if (invoiceResult.rowCount === 0) return res.status(404).json({ ok: false, message: 'Cuenta de cobro no encontrada' });

        const itemsResult = await db.query('SELECT * FROM finance_invoice_items WHERE invoice_id = $1', [id]);
        
        const invoice = invoiceResult.rows[0];
        invoice.items = itemsResult.rows;

        res.json({ ok: true, invoice });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al obtener cuenta de cobro' });
    }
};

exports.createInvoice = async (req, res) => {
    const { client_id, invoice_number, issue_date, due_date, items, notes } = req.body;
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        let subtotal = 0;
        
        // 1. Calcular subtotal
        if (items && items.length > 0) {
            items.forEach(item => {
                subtotal += (parseFloat(item.quantity) * parseFloat(item.unit_price));
            });
        }
        
        const total_amount = subtotal; // Assuming tax = 0 for now

        // 2. Insertar factura
        const invoiceRes = await client.query(
            `INSERT INTO finance_invoices 
             (user_id, client_id, invoice_number, issue_date, due_date, status, subtotal, tax_amount, total_amount, notes) 
             VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, 0, $7, $8) RETURNING *`,
            [req.user.id, client_id, invoice_number, issue_date, due_date, subtotal, total_amount, notes]
        );
        
        const invoiceId = invoiceRes.rows[0].id;
        
        // 3. Insertar items
        if (items && items.length > 0) {
            const itemQueries = items.map(item => {
                const total_price = parseFloat(item.quantity) * parseFloat(item.unit_price);
                return client.query(
                    `INSERT INTO finance_invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [invoiceId, item.service_id || null, item.description, item.quantity, item.unit_price, total_price]
                );
            });
            await Promise.all(itemQueries);
        }

        await client.query('COMMIT');
        res.status(201).json({ ok: true, invoice: invoiceRes.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al crear cuenta de cobro' });
    } finally {
        client.release();
    }
};

exports.updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'ENVIADA', 'PAGADA', 'ANULADA', etc.
    try {
        const result = await db.query(
            `UPDATE finance_invoices SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
            [status, id, req.user.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ ok: false, message: 'Factura no encontrada' });
        res.json({ ok: true, invoice: result.rows[0] });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al cambiar el estado' });
    }
};
