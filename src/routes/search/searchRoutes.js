const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/search/searchController');
const authMiddleware = require('../../middlewares/auth/authMiddleware');

router.get('/', authMiddleware, searchController.search);
router.get('/posts', authMiddleware, searchController.searchPosts);
router.get('/users', authMiddleware, searchController.searchUsers);

module.exports = router;