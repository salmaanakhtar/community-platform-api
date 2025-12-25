const Post = require('../../models/postModel');
const Follow = require('../../models/followModel');

exports.getFeed = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Get followed users
    const followedUsers = await Follow.find({ follower: userId, type: 'user' }).select('following');
    const followedUserIds = followedUsers.map(f => f.following);

    // Get followed hashtags
    const followedHashtags = await Follow.find({ follower: userId, type: 'hashtag' }).select('following');
    const followedHashtagNames = followedHashtags.map(f => f.following);

    // Build query
    const query = {
      $or: [
        { author: { $in: followedUserIds } },
        { hashtags: { $in: followedHashtagNames } },
        { author: userId }
      ]
    };

    const posts = await Post.find(query)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username')
      .populate('comments', 'text author createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};