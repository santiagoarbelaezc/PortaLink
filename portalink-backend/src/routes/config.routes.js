const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/', verifyToken, configController.getSettings);
router.put('/', verifyToken, configController.updateSettings);

module.exports = router;
