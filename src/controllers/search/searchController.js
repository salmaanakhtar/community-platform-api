const Post = require('../../models/postModel');
const User = require('../../models/userModel');

exports.searchPosts = async (req, res) => {
  const { q } = req.query;
  try {
    const posts = await Post.find({ $text: { $search: q }, deleted: false }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({ $text: { $search: q } }).select('username email profilePicture');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
};