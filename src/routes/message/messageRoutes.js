const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message/messageController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.post('/conversation', authMiddleware, messageController.createConversation);
router.post('/send', authMiddleware, messageController.sendMessage);
router.get('/conversation/:conversationId', authMiddleware, messageController.getMessages);
router.put('/conversation/:conversationId/read', authMiddleware, messageController.markRead);

module.exports = router;