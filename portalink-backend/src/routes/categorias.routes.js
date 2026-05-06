const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', categoriasController.getAll);

// Rutas protegidas (Gestión)
router.post('/', authMiddleware, categoriasController.create);
router.put('/:id', authMiddleware, categoriasController.update);
router.delete('/:id', authMiddleware, categoriasController.delete);

module.exports = router;
