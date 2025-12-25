const express = require('express');
const router = express.Router();
const feedController = require('../../controllers/feed/feedController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.get('/', authMiddleware, feedController.getFeed);

module.exports = router;