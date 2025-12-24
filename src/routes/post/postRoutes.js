const express = require('express');
const router = express.Router();
const postController = require('../../controllers/post/postController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const upload = require('../../utils/uploads/uploadMiddleware');

router.post('/', authMiddleware, upload.single('media'), postController.createPost);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;