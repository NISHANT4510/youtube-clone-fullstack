const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: errors[0],
      errors 
    });
  }

  next();
};

module.exports = { validateSignup };
