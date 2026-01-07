const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message/messageController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.get('/conversations', authMiddleware, messageController.getConversations);
router.post('/conversations', authMiddleware, messageController.createConversation);
router.post('/', authMiddleware, messageController.sendMessage);
router.get('/conversations/:conversationId', authMiddleware, messageController.getMessages);
router.put('/conversations/:conversationId/read', authMiddleware, messageController.markRead);
router.get('/permissions/:userId', authMiddleware, messageController.checkMessagingPermissions);

module.exports = router;