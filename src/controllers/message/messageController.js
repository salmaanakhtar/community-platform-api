const Conversation = require('../../models/conversationModel');
const Message = require('../../models/messageModel');
const Notification = require('../../models/notificationModel');

exports.createConversation = async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user.id;

  try {
    const sender = await User.findById(senderId);
    if (sender.blockedUsers.includes(recipientId)) {
      return res.status(403).json({ msg: 'Cannot message this user' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (conversation) {
      return res.json(conversation);
    }

    conversation = new Conversation({ participants: [senderId, recipientId] });
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user.id;

  try {
    const message = new Message({ conversation: conversationId, sender: senderId, text });
    await message.save();

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: Date.now() });

    // Get conversation to find recipient
    const conversation = await Conversation.findById(conversationId).populate('participants');
    const recipient = conversation.participants.find(p => p._id.toString() !== senderId);

    // Create notification
    const notification = new Notification({
      recipient: recipient._id,
      sender: senderId,
      type: 'message',
      message: message._id
    });
    await notification.save();
    if (global.io) {
      global.io.to(recipient._id.toString()).emit('notification', notification);
      global.io.to(recipient._id.toString()).emit('newMessage', message);
    }

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.markRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  try {
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, read: false },
      { read: true }
    );

    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};