const Post = require('../../models/postModel');
const User = require('../../models/userModel');
const Follow = require('../../models/followModel');

exports.search = async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;
  try {
    const [users, posts] = await Promise.all([
      User.find({ $text: { $search: q } }).select('username email profilePicture bio'),
      Post.find({ $text: { $search: q }, deleted: false }).populate('author', 'username')
    ]);

    // Filter out current user
    const filteredUsers = users.filter(user => user._id.toString() !== userId);
    const filteredPosts = posts.filter(post => post.author._id.toString() !== userId);

    // Format users with counts
    const formattedUsers = await Promise.all(filteredUsers.map(async (user) => {
      const followersCount = await Follow.countDocuments({ following: user._id, type: 'user' });
      const followingCount = await Follow.countDocuments({ follower: user._id, type: 'user' });
      const postsCount = await Post.countDocuments({ author: user._id, deleted: false });
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        followersCount,
        followingCount,
        postsCount
      };
    }));

    // Format posts
    const formattedPosts = filteredPosts.map(post => ({
      _id: post._id,
      content: post.text,
      author: post.author,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      highlightedContent: post.text // For now, no highlighting on backend
    }));

    res.json({ users: formattedUsers, posts: formattedPosts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchPosts = async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;
  try {
    const posts = await Post.find({ $text: { $search: q }, deleted: false }).populate('author', 'username');
    const filteredPosts = posts.filter(post => post.author._id.toString() !== userId);
    const formattedPosts = filteredPosts.map(post => ({
      _id: post._id,
      content: post.text,
      author: post.author,
      createdAt: post.createdAt,
      likesCount: post.likes.length,
      commentsCount: post.comments.length
    }));
    res.json(formattedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;
  try {
    const users = await User.find({ $text: { $search: q } }).select('username email profilePicture bio');
    const filteredUsers = users.filter(user => user._id.toString() !== userId);
    const formattedUsers = await Promise.all(filteredUsers.map(async (user) => {
      const followersCount = await Follow.countDocuments({ following: user._id, type: 'user' });
      const followingCount = await Follow.countDocuments({ follower: user._id, type: 'user' });
      const postsCount = await Post.countDocuments({ author: user._id, deleted: false });
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        followersCount,
        followingCount,
        postsCount
      };
    }));
    res.json(formattedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};