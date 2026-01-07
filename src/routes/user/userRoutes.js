const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.get('/:id', authMiddleware, userController.getUserById);
router.get('/:id/posts', authMiddleware, userController.getUserPosts);
router.get('/:userId/block-status', authMiddleware, userController.checkBlockStatus);
router.post('/:userId/block', authMiddleware, userController.blockUser);
router.delete('/:userId/block', authMiddleware, userController.unblockUser);

module.exports = router;