const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Channel = require('../models/Channel');

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 
          'Email already in use' : 
          'Username already taken' 
      });
    }

    // Create user
    const user = await User.create({ username, email, password });
    
    // Create default channel for user
    const channel = await Channel.create({
      name: username,
      description: `${username}'s channel`,
      userId: user._id
    });

    // Update user with channel reference
    user.channelId = channel._id;
    await user.save();

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        username,
        email,
        avatar: user.avatar,
        channelId: channel._id
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, timestamp: new Date().toISOString() });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password').populate('channelId');
    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { email, userId: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || 'https://via.placeholder.com/150',
        channelId: user.channelId?._id || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error); // Pass to error handler
  }
});

module.exports = router;
