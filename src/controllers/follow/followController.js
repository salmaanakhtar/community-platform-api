const Follow = require('../../models/followModel');
const User = require('../../models/userModel');

exports.followUser = async (req, res) => {
  const { userId } = req.params; // the user to follow
  const followerId = req.user.id;

  if (userId === followerId) {
    return res.status(400).json({ msg: 'Cannot follow yourself' });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ follower: followerId, following: userId, type: 'user' });
    if (existingFollow) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    const follow = new Follow({ follower: followerId, following: userId, type: 'user' });
    await follow.save();
    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  try {
    const follow = await Follow.findOneAndDelete({ follower: followerId, following: userId, type: 'user' });
    if (!follow) {
      return res.status(400).json({ msg: 'Not following this user' });
    }
    res.json({ msg: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.followHashtag = async (req, res) => {
  const { hashtag } = req.params; // the hashtag to follow
  const followerId = req.user.id;

  try {
    // Check if already following
    const existingFollow = await Follow.findOne({ follower: followerId, following: hashtag, type: 'hashtag' });
    if (existingFollow) {
      return res.status(400).json({ msg: 'Already following this hashtag' });
    }

    const follow = new Follow({ follower: followerId, following: hashtag, type: 'hashtag' });
    await follow.save();
    res.json({ msg: 'Hashtag followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.unfollowHashtag = async (req, res) => {
  const { hashtag } = req.params;
  const followerId = req.user.id;

  try {
    const follow = await Follow.findOneAndDelete({ follower: followerId, following: hashtag, type: 'hashtag' });
    if (!follow) {
      return res.status(400).json({ msg: 'Not following this hashtag' });
    }
    res.json({ msg: 'Hashtag unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};