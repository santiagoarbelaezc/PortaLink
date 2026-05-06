const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/servicios.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', serviciosController.getAll);

// Rutas protegidas
router.post('/', authMiddleware, serviciosController.create);
router.put('/:id', authMiddleware, serviciosController.update);
router.delete('/:id', authMiddleware, serviciosController.delete);

module.exports = router;
