const Conversation = require('../../models/conversationModel');
const Message = require('../../models/messageModel');
const Notification = require('../../models/notificationModel');
const User = require('../../models/userModel');

exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(conv => ({
      _id: conv._id,
      participants: conv.participants,
      lastMessage: conv.lastMessage,
      unreadCount: 0, // TODO: Calculate unread count
      updatedAt: conv.updatedAt
    }));

    res.json(formattedConversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createConversation = async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user.id;

  console.log('Creating conversation:', { senderId, recipientId, content });

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found' });
    }

    if (sender.blockedUsers.some(id => id.toString() === recipientId)) {
      return res.status(403).json({ msg: 'Cannot message this user' });
    }

    if (recipient.blockedUsers.some(id => id.toString() === senderId)) {
      return res.status(403).json({ msg: 'Cannot message this user' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [senderId, recipientId].sort() });
      await conversation.save();
    }

    // Create the first message
    const message = new Message({ conversation: conversation._id, sender: senderId, text: content });
    await message.save();

    // Update conversation lastMessage
    conversation.lastMessage = message._id;
    await conversation.save();

    const formattedMessage = {
      _id: message._id,
      conversationId: message.conversation,
      sender: { _id: senderId, username: sender.username },
      content: message.text,
      createdAt: message.createdAt,
      readBy: [],
      isDeleted: false
    };

    // Create notification for recipient
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: 'message',
      message: message._id
    });
    await notification.save();

    // Emit to both participants
    if (global.io) {
      global.io.to(recipientId).emit('notification', notification);
      global.io.to(recipientId).emit('newMessage', formattedMessage);
      global.io.to(senderId).emit('newMessage', formattedMessage);
    }

    res.json({ conversation, message: formattedMessage });
  } catch (err) {
    console.error('Error in createConversation:', err);
    res.status(500).send('Server error');
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  const senderId = req.user.id;

  console.log('Sending message:', { senderId, conversationId, content });

  try {
    const message = new Message({ conversation: conversationId, sender: senderId, text: content });
    await message.save();

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: Date.now() });

    // Get conversation to find recipient
    const conversation = await Conversation.findById(conversationId).populate('participants');
    const recipient = conversation.participants.find(p => p._id.toString() !== senderId);

    // Populate sender for response
    await message.populate('sender', 'username profilePicture');

    const formattedMessage = {
      _id: message._id,
      conversationId: message.conversation,
      sender: message.sender,
      content: message.text,
      createdAt: message.createdAt,
      readBy: [],
      isDeleted: false
    };

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
      global.io.to(recipient._id.toString()).emit('newMessage', formattedMessage);
      global.io.to(senderId).emit('newMessage', formattedMessage); // Also send to sender
    }

    res.json(formattedMessage);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).send('Server error');
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      conversationId: msg.conversation,
      sender: msg.sender,
      content: msg.text,
      createdAt: msg.createdAt,
      readBy: [], // TODO: Implement read tracking
      isDeleted: false // TODO: Implement soft delete
    }));

    res.json(formattedMessages);
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

exports.checkMessagingPermissions = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ canMessage: false, reason: 'User not found' });
    }

    if (currentUser.blockedUsers.some(id => id.toString() === userId)) {
      return res.json({ canMessage: false, reason: 'You have blocked this user' });
    }

    if (targetUser.blockedUsers.some(id => id.toString() === currentUserId)) {
      return res.json({ canMessage: false, reason: 'This user has blocked you' });
    }

    res.json({ canMessage: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};