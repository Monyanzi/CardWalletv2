const jwt = require('jsonwebtoken');

// In a real application, use an environment variable for the JWT secret!
// This MUST be the same secret as used in auth.js
const JWT_SECRET = 'your-super-secret-and-long-jwt-secret-key';

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
    return res.status(401).json({ message: 'Token is not valid, authorization denied.' });
  }

  const token = parts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user from payload to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid, authorization denied.' });
  }
};
