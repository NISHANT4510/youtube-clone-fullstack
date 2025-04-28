const router = require('express').Router();
const Channel = require('../models/Channel');
const User = require('../models/User');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Create a new channel
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, avatar } = req.body;

    // First check if user exists and get their current data
    const user = await User.findById(req.userData.userId).populate('channelId');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user already has a channel
    if (user.channelId) {
      return res.status(400).json({ 
        success: false,
        message: 'User already has a channel',
        channel: user.channelId
      });
    }

    // Create the new channel
    const channel = await Channel.create({
      userId: user._id,
      name: name || `${user.username}'s Channel`,
      description: description || '',
      avatar: avatar || user.avatar || 'https://placekitten.com/100/100'
    });

    // Update user with channel reference
    user.channelId = channel._id;
    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'Channel created successfully',
      channel
    });
  } catch (error) {
    console.error('Channel creation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create channel'
    });
  }
});

// Get channel by ID with its videos
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('userId', 'username avatar');
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Get channel's videos
    const videos = await Video.find({ userId: channel.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ 
      channel,
      videos: videos.map(video => ({
        ...video,
        channelName: channel.name,
        channelAvatar: channel.avatar
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update channel
router.patch('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
      userId: req.userData.userId
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const { name, description, avatar } = req.body;
    if (name) channel.name = name;
    if (description) channel.description = description;
    if (avatar) channel.avatar = avatar;

    await channel.save();
    res.json({ channel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
