const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Channel = require('../models/Channel');
const mongoose = require('mongoose');

// Validation middleware
const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required'
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long'
    });
  }
  next();
};

router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for existing user with detailed error
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        message: `This ${field} is already registered`,
        field
      });
    }

    // Create user and channel in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.create([{ 
        username, 
        email, 
        password 
      }], { session });

      const channel = await Channel.create([{
        name: username,
        description: `${username}'s channel`,
        userId: user[0]._id
      }], { session });

      user[0].channelId = channel[0]._id;
      await user[0].save({ session });

      await session.commitTransaction();
      session.endSession();

      const token = jwt.sign(
        { userId: user[0]._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user[0]._id,
          username,
          email,
          channelId: channel[0]._id
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
