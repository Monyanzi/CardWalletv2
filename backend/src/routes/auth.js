const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db'); // SQLite database connection
const authMiddleware = require('../middleware/auth'); // Authentication middleware

const router = express.Router();

// In a real application, use an environment variable for the JWT secret!
const JWT_SECRET = 'your-super-secret-and-long-jwt-secret-key'; 

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
        console.error('Database error during registration check:', err.message);
        return res.status(500).json({ message: 'Server error during registration.' });
      }
      if (row) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Store user
      db.run('INSERT INTO Users (email, passwordHash) VALUES (?, ?)', [email, passwordHash], function (err) {
        if (err) {
          console.error('Database error during user insertion:', err.message);
          return res.status(500).json({ message: 'Could not register user.' });
        }
        res.status(201).json({ message: 'User registered successfully.', userId: this.lastID });
      });
    });
  } catch (error) {
    console.error('Server error during registration:', error.message);
    res.status(500).json({ message: 'Server error.' });
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
      console.error('Database error during login:', err.message);
      return res.status(500).json({ message: 'Server error during login.' });
    }
    if (!user) {
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
        console.error('Database error during card deletion:', err.message);
        return res.status(500).json({ message: 'Could not delete user cards.' });
      }
      console.log(`Deleted ${this.changes} cards for user ${userId}`);

      // Step 2: Delete the user
      db.run('DELETE FROM Users WHERE id = ?', [userId], function (err) {
        if (err) {
          console.error('Database error during user deletion:', err.message);
          // Potentially, cards were deleted but user was not. This is a partial failure.
          return res.status(500).json({ message: 'Could not delete user account after deleting cards.' });
        }
        if (this.changes === 0) {
          // This case might occur if the user was already deleted by some other means but token was still valid
          return res.status(404).json({ message: 'User not found for deletion.' });
        }
        res.status(200).json({ message: 'Account and associated cards deleted successfully.' });
      });
    });
  } catch (error) {
    console.error('Server error during account deletion:', error.message);
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
});

module.exports = router;
