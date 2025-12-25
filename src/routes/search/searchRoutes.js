const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/search/searchController');

router.get('/posts', searchController.searchPosts);
router.get('/users', searchController.searchUsers);

module.exports = router;