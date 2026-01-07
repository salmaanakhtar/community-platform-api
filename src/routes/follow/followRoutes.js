const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow/followController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const rateLimit = require('express-rate-limit');

const followLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many follow actions, please slow down.'
});

router.post('/user/:userId', authMiddleware, followLimiter, followController.followUser);
router.delete('/user/:userId', authMiddleware, followLimiter, followController.unfollowUser);
router.get('/:userId/status', authMiddleware, followController.checkFollowStatus);
router.post('/hashtag/:hashtag', authMiddleware, followLimiter, followController.followHashtag);
router.delete('/hashtag/:hashtag', authMiddleware, followLimiter, followController.unfollowHashtag);

module.exports = router;