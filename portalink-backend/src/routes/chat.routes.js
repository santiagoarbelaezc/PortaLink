const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const optionalAuth = require('../middleware/optional-auth.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/chat/send — Enviar mensaje (requiere auth)
router.post('/send', authMiddleware, chatController.sendMessage);

// GET /api/chat/history — Obtener historial (requiere auth)
router.get('/history', authMiddleware, chatController.getHistory);

// GET /api/chat/usage — Consultar uso diario (requiere auth)
router.get('/usage', authMiddleware, chatController.getUsage);

// DELETE /api/chat/clear — Limpiar historial (requiere auth)
router.delete('/clear', authMiddleware, chatController.clearHistory);

module.exports = router;
