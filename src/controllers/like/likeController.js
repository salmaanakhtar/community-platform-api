const Like = require('../../models/likeModel');
const Post = require('../../models/postModel');
const Notification = require('../../models/notificationModel');

exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(400).json({ msg: 'Already liked' });
    }

    const like = new Like({ user: userId, post: postId });
    await like.save();

    // Add like to post
    post.likes.push(userId);
    await post.save();

    // Create notification
    if (post.author.toString() !== userId) {
      const notification = new Notification({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: postId
      });
      await notification.save();
      if (global.io) {
        global.io.to(post.author.toString()).emit('notification', notification);
        global.io.to(post.author.toString()).emit('likeUpdate', { postId, userId, action: 'like' });
      }
    }

    res.json({ msg: 'Post liked' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const like = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!like) {
      return res.status(400).json({ msg: 'Not liked' });
    }

    // Remove like from post
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });

    // Emit unlike update
    const post = await Post.findById(postId);
    if (global.io && post) {
      global.io.to(post.author.toString()).emit('likeUpdate', { postId, userId, action: 'unlike' });
    }

    res.json({ msg: 'Post unliked' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};