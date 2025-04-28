const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No auth token provided' });
    }
    
    const token = authHeader.startsWith('Bearer ') ? 
      authHeader.substring(7) : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.userData = {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};
