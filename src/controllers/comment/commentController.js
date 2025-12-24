const Comment = require('../../models/commentModel');
const Post = require('../../models/postModel');

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const author = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const comment = new Comment({ author, post: postId, text });
    await comment.save();

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Remove from post
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });

    await comment.remove();
    res.json({ msg: 'Comment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};