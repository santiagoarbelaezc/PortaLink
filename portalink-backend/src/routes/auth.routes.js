const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.get('/captcha', authController.getCaptcha);
router.post('/register', authController.register);
router.get('/users', authController.getUsers);
router.put('/password', verifyToken, authController.updatePassword);

module.exports = router;
