const Conversation = require('../../models/conversationModel');
const Message = require('../../models/messageModel');

exports.createConversation = async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user.id;

  try {
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