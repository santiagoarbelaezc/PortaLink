const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', productosController.getAll);
router.get('/:id', productosController.getById);

// Rutas protegidas (Gestión)
router.post('/', authMiddleware, productosController.create);
router.put('/:id', authMiddleware, productosController.update);
router.delete('/:id', authMiddleware, productosController.delete);

module.exports = router;
