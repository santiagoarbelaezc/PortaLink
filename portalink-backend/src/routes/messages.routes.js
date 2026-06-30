const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', messagesController.sendMessage);
router.get('/', verifyToken, messagesController.getMessages);
router.put('/:id/read', verifyToken, messagesController.updateStatus);
router.delete('/:id', verifyToken, messagesController.deleteMessage);

module.exports = router;
