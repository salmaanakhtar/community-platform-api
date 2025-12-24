const Hashtag = require('../../models/hashtagModel');
const Follow = require('../../models/followModel');

exports.createHashtag = async (req, res) => {
  const { name, description } = req.body;

  try {
    let hashtag = await Hashtag.findOne({ name });
    if (hashtag) {
      return res.status(400).json({ msg: 'Hashtag already exists' });
    }

    hashtag = new Hashtag({ name, description });
    await hashtag.save();
    res.json(hashtag);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getHashtagFeed = async (req, res) => {
  const { name } = req.params;

  try {
    const hashtag = await Hashtag.findOne({ name });
    if (!hashtag) {
      return res.status(404).json({ msg: 'Hashtag not found' });
    }

    // Get followers count
    const followersCount = await Follow.countDocuments({ following: name, type: 'hashtag' });

    res.json({ hashtag, followersCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.followHashtag = async (req, res) => {
  const { name } = req.params;
  const followerId = req.user.id;

  try {
    const existingFollow = await Follow.findOne({ follower: followerId, following: name, type: 'hashtag' });
    if (existingFollow) {
      return res.status(400).json({ msg: 'Already following this hashtag' });
    }

    const follow = new Follow({ follower: followerId, following: name, type: 'hashtag' });
    await follow.save();
    res.json({ msg: 'Hashtag followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};