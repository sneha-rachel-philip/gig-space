import Message from '../models/message.model.js';
import User from '../models/user.model.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await message.save();

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // the other user

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Optionally: Get all chats (latest message per user)
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          latestMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};
