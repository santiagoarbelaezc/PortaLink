const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const optionalAuth = require('../middleware/optional-auth.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/chat/send — Enviar mensaje (público, con auth opcional)
router.post('/send', optionalAuth, chatController.sendMessage);

// GET /api/chat/history — Obtener historial (requiere auth)
router.get('/history', authMiddleware, chatController.getHistory);

// GET /api/chat/usage — Consultar uso diario (público, con auth opcional)
router.get('/usage', optionalAuth, chatController.getUsage);

// DELETE /api/chat/clear — Limpiar historial (requiere auth)
router.delete('/clear', authMiddleware, chatController.clearHistory);

module.exports = router;
