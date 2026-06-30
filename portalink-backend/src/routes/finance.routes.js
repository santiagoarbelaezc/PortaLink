const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const financeController = require('../controllers/finance.controller');

// Todas las rutas financieras requieren autenticación
router.use(authMiddleware);

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
router.get('/dashboard', financeController.getDashboard);

// ════════════════════════════════════════════════════════════
// CLIENTES
// ════════════════════════════════════════════════════════════
router.get('/clients', financeController.getClients);
router.post('/clients', financeController.createClient);
router.put('/clients/:id', financeController.updateClient);
router.delete('/clients/:id', financeController.deleteClient);

// ════════════════════════════════════════════════════════════
// SERVICIOS
// ════════════════════════════════════════════════════════════
router.get('/services', financeController.getServices);
router.post('/services', financeController.createService);
router.put('/services/:id', financeController.updateService);
router.delete('/services/:id', financeController.deleteService);

// ════════════════════════════════════════════════════════════
// CUENTAS DE COBRO
// ════════════════════════════════════════════════════════════
router.get('/invoices', financeController.getInvoices);
router.post('/invoices', financeController.createInvoice);
router.get('/invoices/:id', financeController.getInvoiceDetails);
router.put('/invoices/:id/status', financeController.updateInvoiceStatus);

module.exports = router;
