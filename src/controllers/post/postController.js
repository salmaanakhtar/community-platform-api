const Post = require('../../models/postModel');
const Hashtag = require('../../models/hashtagModel');

exports.createPost = async (req, res) => {
  const { text } = req.body;
  const author = req.user.id;
  const media = req.file ? req.file.path : '';

  // Extract hashtags
  const hashtags = text.match(/#\w+/g) || [];

  try {
    const post = new Post({ author, text, media, hashtags });
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

    res.json(post);
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

    await post.remove();
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};