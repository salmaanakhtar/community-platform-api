const User = require('../../models/userModel');
const Follow = require('../../models/followModel');
const Post = require('../../models/postModel');
const mongoose = require('mongoose');

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const user = await User.findById(id).select('username email profilePicture bio');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const followersCount = await Follow.countDocuments({ following: id, type: 'user' });
    const followingCount = await Follow.countDocuments({ follower: id, type: 'user' });
    const postsCount = await Post.countDocuments({ author: id, deleted: false });

    const isFollowing = await Follow.findOne({ follower: userId, following: id, type: 'user' }) ? true : false;
    const currentUser = await User.findById(userId);
    const isBlocked = currentUser.blockedUsers ? currentUser.blockedUsers.some(blockedId => blockedId.toString() === id) : false;
    const isBlocking = user.blockedUsers ? user.blockedUsers.some(blockedId => blockedId.toString() === userId) : false;

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
      isBlocked,
      isBlocking
    };

    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserPosts = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find({ author: id, deleted: false })
      .populate('author', 'username profilePicture')
      .populate('likes', '_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      content: post.text,
      author: post.author,
      createdAt: post.createdAt,
      isDeleted: post.deleted,
      likes: post.likes,
      likesCount: post.likes.length,
      commentsCount: post.comments.length
    }));

    res.json(formattedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.checkBlockStatus = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const user = await User.findById(currentUserId);
    const isBlocked = user.blockedUsers.some(id => id.toString() === userId);
    res.json(isBlocked);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const user = await User.findById(currentUserId);
    if (!user.blockedUsers.some(id => id.toString() === userId)) {
      user.blockedUsers.push(new mongoose.Types.ObjectId(userId));
      await user.save();
    }
    res.json({ msg: 'User blocked' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.unblockUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const user = await User.findById(currentUserId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();
    res.json({ msg: 'User unblocked' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};