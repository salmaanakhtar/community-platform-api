const Post = require('../../models/postModel');
const Hashtag = require('../../models/hashtagModel');
const Follow = require('../../models/followModel');

exports.createPost = async (req, res) => {
  const { content, text } = req.body; // Support both content and text
  const postText = content || text;
  const author = req.user.id;
  const media = ''; // TODO: Add file upload later

  if (!postText) {
    return res.status(400).json({ msg: 'Text is required' });
  }

  // Extract hashtags
  const hashtags = postText.match(/#\w+/g) || [];

  try {
    const post = new Post({ author, text: postText, media, hashtags });
    await post.save();

    // Auto-create hashtags if not exist
    for (const tag of hashtags) {
      const name = tag.slice(1); // remove #
      await Hashtag.findOneAndUpdate(
        { name },
        { name, description: '' },
        { upsert: true, new: true }
      );
    }

    // Emit new post to followers
    if (global.io) {
      const followers = await Follow.find({ following: author, type: 'user' }).select('follower');
      followers.forEach(f => {
        global.io.to(f.follower.toString()).emit('newPost', post);
      });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.checkPermissions = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // For now, allow engagement if post exists and user is authenticated
    // TODO: Add more complex permission logic if needed
    res.json({ canEngage: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    post.deleted = true;
    await post.save();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};