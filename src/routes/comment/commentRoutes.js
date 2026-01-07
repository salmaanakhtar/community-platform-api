const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment/commentController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const rateLimit = require('express-rate-limit');

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many comments, please slow down.'
});

router.post('/:postId/comments', authMiddleware, commentLimiter, commentController.createComment);
router.get('/:postId/comments', authMiddleware, commentController.getComments);
router.delete('/:postId/comments/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;