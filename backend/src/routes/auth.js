const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db'); // SQLite database connection
const authMiddleware = require('../middleware/auth'); // Authentication middleware
const { handleDbError, sendNotFoundResponse } = require('../utils/responseHandlers');

const router = express.Router();

// Use an environment variable for the JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'default-fallback-secret-key';
if (JWT_SECRET === 'default-fallback-secret-key' && process.env.NODE_ENV !== 'test') {
  console.warn('Security Warning: JWT_SECRET is using a default fallback value. Set a strong secret in your .env file for production.');
}


// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Basic password validation (e.g., minimum length)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if user already exists
    db.get('SELECT email FROM Users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return handleDbError(res, err, 'Server error during registration check.', 'Registration check DB error');
      }
      if (row) {
        return res.status(400).json({ message: 'User with this email already exists.' }); // Specific message, not a generic "not found"
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Store user
      db.run('INSERT INTO Users (email, passwordHash) VALUES (?, ?)', [email, passwordHash], function (err) {
        if (err) {
          return handleDbError(res, err, 'Could not register user.', 'User insertion DB error');
        }
        res.status(201).json({ message: 'User registered successfully.', userId: this.lastID });
      });
    });
  } catch (error) {
    // This catch block is for errors in the async operations before the db callback (e.g. bcrypt.genSalt)
    // or if an error is thrown synchronously within the try block.
    console.error('Server error during registration process:', error.message);
    res.status(500).json({ message: 'Server error during registration process.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return handleDbError(res, err, 'Server error during login.', 'Login DB error');
    }
    if (!user) {
      // Using 400 for "invalid credentials" is common, rather than 404
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // User matched, create JWT payload
    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    };

    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour (adjust as needed)
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          userId: user.id, // Include userId in response
          email: user.email // Include email in response
        });
      }
    );
  });
});

// DELETE /api/auth/account - Delete user account and associated cards
router.delete('/account', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    // This should ideally not happen if authMiddleware is working correctly
    return res.status(400).json({ message: 'User ID not found in token.' });
  }

  try {
    // Begin a transaction-like sequence
    // Step 1: Delete user's cards
    db.run('DELETE FROM Cards WHERE userId = ?', [userId], function (err) {
      if (err) {
        return handleDbError(res, err, 'Could not delete user cards.', 'Card deletion DB error');
      }
      console.log(`Deleted ${this.changes} cards for user ${userId}`); // Keep this log for now

      // Step 2: Delete the user
      db.run('DELETE FROM Users WHERE id = ?', [userId], function (err) {
        if (err) {
          // Potentially, cards were deleted but user was not. This is a partial failure.
          return handleDbError(res, err, 'Could not delete user account after deleting cards.', 'User deletion DB error');
        }
        if (this.changes === 0) {
          // This case might occur if the user was already deleted by some other means but token was still valid
          return sendNotFoundResponse(res, 'User not found for deletion.');
        }
        res.status(200).json({ message: 'Account and associated cards deleted successfully.' });
      });
    });
  } catch (error) {
    // This catch block is for errors in the async operations before the db callback
    console.error('Server error during account deletion process:', error.message);
    res.status(500).json({ message: 'Server error during account deletion process.' });
  }
});

module.exports = router;
