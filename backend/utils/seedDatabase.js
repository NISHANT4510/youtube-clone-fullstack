require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/Video');
const Channel = require('../models/Channel');
const User = require('../models/User');

const sampleVideos = [
  {
    title: "Learn React in 30 Minutes",
    description: "A quick tutorial to get started with React.",
    videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
    thumbnail: "https://i.ytimg.com/vi/Ke90Tje7VS0/maxresdefault.jpg",
    views: 15200,
    categories: ['react', 'tutorial', 'web']
  },
  {
    title: "Building a YouTube Clone",
    description: "Complete guide to building a YouTube clone",
    videoUrl: "https://www.youtube.com/watch?v=FkwfYbYjx9c",
    thumbnail: "https://i.ytimg.com/vi/FkwfYbYjx9c/maxresdefault.jpg",
    views: 25000,
    categories: ['web', 'tutorial']
  },
  {
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into JavaScript concepts",
    videoUrl: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
    thumbnail: "https://i.ytimg.com/vi/8aGhZQkoFbQ/maxresdefault.jpg",
    views: 350000,
    categories: ['javascript', 'tutorial']
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME
    });

    console.log('Connected to MongoDB');

    // First clear all existing data
    await Promise.all([
      User.deleteMany({}),
      Channel.deleteMany({}),
      Video.deleteMany({})
    ]);
    
    console.log('Cleared existing data');

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('Created test user');

    // Create a channel for the user
    const channel = await Channel.create({
      userId: user._id,
      name: 'Test Channel',
      description: 'A test channel for sample videos',
      avatar: 'https://placekitten.com/100/100'
    });

    // Update user with channel reference
    user.channelId = channel._id;
    await user.save();

    console.log('Created channel and updated user');

    // Add sample videos with proper IDs
    const videoPromises = sampleVideos.map(videoData => 
      Video.create({
        ...videoData,
        userId: user._id,
        channelId: channel._id
      })
    );

    await Promise.all(videoPromises);

    console.log('Added sample videos');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();