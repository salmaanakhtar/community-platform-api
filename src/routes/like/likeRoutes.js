const express = require('express');
const router = express.Router();
const likeController = require('../../controllers/like/likeController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.post('/post/:postId', authMiddleware, likeController.likePost);
router.delete('/post/:postId', authMiddleware, likeController.unlikePost);

module.exports = router;