const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (para el tracking del frontend)
router.post('/registrar', statsController.registrarVisita);

// Rutas protegidas (para el dashboard)
router.get('/resumen', authMiddleware, statsController.getResumen);
router.get('/grafica', authMiddleware, statsController.getGrafica);
router.get('/logs', authMiddleware, statsController.getLogs);
router.get('/productos', authMiddleware, statsController.getTopProductos);

module.exports = router;
