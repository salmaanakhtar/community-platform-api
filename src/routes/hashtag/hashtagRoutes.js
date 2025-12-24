const express = require('express');
const router = express.Router();
const hashtagController = require('../../controllers/hashtag/hashtagController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.post('/', authMiddleware, hashtagController.createHashtag);
router.get('/:name', hashtagController.getHashtagFeed);
router.post('/:name/follow', authMiddleware, hashtagController.followHashtag);

module.exports = router;