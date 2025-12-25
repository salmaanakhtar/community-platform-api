const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification/notificationController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);

module.exports = router;