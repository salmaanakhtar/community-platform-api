const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow/followController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.post('/user/:userId', authMiddleware, followController.followUser);
router.delete('/user/:userId', authMiddleware, followController.unfollowUser);
router.post('/hashtag/:hashtag', authMiddleware, followController.followHashtag);
router.delete('/hashtag/:hashtag', authMiddleware, followController.unfollowHashtag);

module.exports = router;