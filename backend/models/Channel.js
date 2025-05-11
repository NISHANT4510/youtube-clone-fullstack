const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 500
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  avatar: { 
    type: String, 
    default: 'https://via.placeholder.com/150'
  },
  banner: {
    type: String,
    default: 'https://via.placeholder.com/1200x300'
  },
  subscribers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  subscriberCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Channel', channelSchema);