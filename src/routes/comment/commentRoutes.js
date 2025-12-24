const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment/commentController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.post('/post/:postId', authMiddleware, commentController.createComment);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;