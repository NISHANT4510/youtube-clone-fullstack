require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'DB_NAME'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Update allowed origins to include Vercel deployment URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://youtube-clone-fullstack.vercel.app',
  'https://youtube-clone-fullstack-558idwwo6-nishants-projects-a4179263.vercel.app',
  'https://youtube-clone-fullstack-1.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.options('*', cors());

// Connect to MongoDB with options
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB -', process.env.DB_NAME))
.catch(err => console.error('MongoDB connection error:', err));

// Register models
require('./models/User');
require('./models/Channel');
require('./models/Video');

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/channels', require('./routes/channels')); // Add this line

// Error handling middleware
app.use((err, req, res, next) => {
  const error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined
  };

  console.error('Error details:', error);

  res.status(error.status).json({
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { debug: error })
  });
});

// Add 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
