const express = require('express');
const router = express.Router();
const postController = require('../../controllers/post/postController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const rateLimit = require('express-rate-limit');

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many posts, please slow down.'
});

router.post('/', authMiddleware, postLimiter, postController.createPost);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;