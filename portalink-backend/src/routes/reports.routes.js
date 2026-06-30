const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

const verifyToken = require('../middleware/auth.middleware');

// Obtener el log de actividad
router.get('/logs', verifyToken, reportsController.getActivityLogs);

// Registrar una nueva actividad
router.post('/logs', verifyToken, reportsController.logActivity);

module.exports = router;
