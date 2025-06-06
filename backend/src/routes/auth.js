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
  const { email, password, name } = req.body;

  // Server-side validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  // Password complexity validation
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one letter.' });
  }

  if (!/(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number.' });
  }

  // Name validation (optional but if provided, must be valid)
  if (name && (name.trim().length < 2 || name.trim().length > 50)) {
    return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
  }

  try {
    // Check if user already exists
    db.get('SELECT email FROM Users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return handleDbError(res, err, 'Server error during registration check.', 'Registration check DB error');
      }
      
      if (row) {
        return res.status(409).json({ message: 'An account with this email address already exists.' });
      }

      try {
        // Hash password with salt
        const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
        const passwordHash = await bcrypt.hash(password, salt);

        // Store user in database
        db.run('INSERT INTO Users (email, passwordHash) VALUES (?, ?)', [email, passwordHash], function (err) {
          if (err) {
            return handleDbError(res, err, 'Could not register user.', 'User insertion DB error');
          }

          const userId = this.lastID;

          // Generate JWT token for immediate login
          const payload = {
            user: {
              id: userId,
              email: email
            }
          };

          jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '24h' }, // Longer expiration for better UX
            (jwtErr, token) => {
              if (jwtErr) {
                console.error('JWT generation error:', jwtErr);
                // Registration succeeded but token generation failed
                return res.status(201).json({ 
                  message: 'User registered successfully. Please log in to continue.',
                  userId: userId
                });
              }

              // Return success response with token for seamless onboarding
              res.status(201).json({ 
                message: 'User registered successfully.',
                token,
                userId: userId,
                email: email
              });
            }
          );
        });
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(500).json({ message: 'Server error during password processing.' });
      }
    });
  } catch (error) {
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
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    try {
      // Check password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
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
        { expiresIn: '24h' }, // Extended expiration for better UX
        (jwtErr, token) => {
          if (jwtErr) {
            console.error('JWT generation error:', jwtErr);
            return res.status(500).json({ message: 'Server error during login.' });
          }
          
          res.json({ 
            token, 
            userId: user.id,
            email: user.email
          });
        }
      );
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ message: 'Server error during login.' });
    }
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