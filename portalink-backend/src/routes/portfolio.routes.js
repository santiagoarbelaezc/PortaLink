const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/config', portfolioController.getConfig);
router.get('/skills', portfolioController.getSkills);
router.get('/proyectos', portfolioController.getProyectos);

// Rutas protegidas (Gestión Dashboard)
router.post('/config/:seccion', authMiddleware, portfolioController.updateSection);
router.post('/skills', authMiddleware, portfolioController.addSkill);
router.post('/proyectos', authMiddleware, portfolioController.addProyecto);

module.exports = router;
