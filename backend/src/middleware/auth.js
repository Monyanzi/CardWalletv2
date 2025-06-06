const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'default-fallback-secret-key';

if (JWT_SECRET === 'default-fallback-secret-key' && process.env.NODE_ENV !== 'test') {
  console.warn('Security Warning: JWT_SECRET is using a default fallback value. Set a strong secret in your .env file for production.');
}

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  // Check if token is in the correct format 'Bearer <token>'
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid, authorization denied.' });
  }

  const token = parts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user from payload to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    // Provide more specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired, please log in again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is invalid, authorization denied.' });
    } else {
      return res.status(401).json({ message: 'Token verification failed, authorization denied.' });
    }
  }
};