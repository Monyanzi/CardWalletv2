const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT authentication middleware
const db = require('../models/db'); // SQLite database connection
const { handleDbError, sendNotFoundResponse } = require('../utils/responseHandlers');

// --- Helper function to build SET clause for UPDATE --- 
const buildUpdateSetClause = (fields) => {
  const setClauses = [];
  const values = [];
  Object.keys(fields).forEach(key => {
    // Ensure we don't try to update id or userId directly via this generic method
    if (key !== 'id' && key !== 'userId') {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  });
  return { clause: setClauses.join(', '), values };
};

// POST /api/cards - Create a new card
router.post('/', auth, (req, res) => {
  const userId = req.user.id;
  const {
    name, isMyCard = false, cardType, companyName = null, identifier = null, 
    position = null, email = null, phone = null, mobile = null, website = null, 
    address = null, linkedinUrl = null, cardColor = '#0070d1', logo = null, 
    notes = null, verified = false, barcode = null, barcodeType = null, 
    balance = null, expiryDate = null, eventDate = null, eventTime = null, 
    seat = null, venue = null, photoUrl = null
  } = req.body;

  if (!name || !cardType) {
    return res.status(400).json({ message: 'Card name and type are required.' });
  }

  const sql = `INSERT INTO Cards (
    userId, name, isMyCard, cardType, companyName, identifier, position, email, phone, mobile, 
    website, address, linkedinUrl, cardColor, logo, notes, verified, barcode, barcodeType, 
    balance, expiryDate, eventDate, eventTime, seat, venue, photoUrl
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    userId, name, isMyCard, cardType, companyName, identifier, position, email, phone, mobile, 
    website, address, linkedinUrl, cardColor, logo, notes, verified, barcode, barcodeType, 
    balance, expiryDate, eventDate, eventTime, seat, venue, photoUrl
  ];

  db.run(sql, params, function (err) {
    if (err) {
      return handleDbError(res, err, 'Failed to create card.', 'Card creation DB error');
    }
    res.status(201).json({ id: this.lastID, userId, ...req.body });
  });
});

// GET /api/cards - Get all cards for the logged-in user
router.get('/', auth, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT * FROM Cards WHERE userId = ?', [userId], (err, rows) => {
    if (err) {
      return handleDbError(res, err, 'Failed to retrieve cards.', 'Fetch all cards DB error');
    }
    res.json(rows);
  });
});

// GET /api/cards/:id - Get a specific card by ID
router.get('/:id', auth, (req, res) => {
  const userId = req.user.id;
  const cardId = req.params.id;

  db.get('SELECT * FROM Cards WHERE id = ? AND userId = ?', [cardId, userId], (err, row) => {
    if (err) {
      return handleDbError(res, err, 'Failed to retrieve card.', 'Fetch card by ID DB error');
    }
    if (!row) {
      return sendNotFoundResponse(res, 'Card not found or access denied.');
    }
    res.json(row);
  });
});

// PUT /api/cards/:id - Update a specific card by ID
router.put('/:id', auth, (req, res) => {
  const userId = req.user.id;
  const cardId = req.params.id;
  const cardData = req.body;

  // Remove id and userId from cardData if they exist to prevent direct modification
  delete cardData.id;
  delete cardData.userId;

  if (Object.keys(cardData).length === 0) {
    return res.status(400).json({ message: 'No fields to update provided.' });
  }
  
  // Ensure name and cardType are not being set to empty if they are part of the update
  if (cardData.name === '' || cardData.cardType === '') {
      return res.status(400).json({ message: 'Card name and type cannot be empty.' });
  }

  const { clause, values } = buildUpdateSetClause(cardData);
  if (!clause) {
      return res.status(400).json({ message: 'No valid fields to update.'});
  }

  const sql = `UPDATE Cards SET ${clause} WHERE id = ? AND userId = ?`;
  const params = [...values, cardId, userId];

  db.run(sql, params, function (err) {
    if (err) {
      return handleDbError(res, err, 'Failed to update card.', 'Update card DB error');
    }
    if (this.changes === 0) {
      return sendNotFoundResponse(res, 'Card not found, access denied, or no changes made.');
    }
    // Fetch and return the updated card
    db.get('SELECT * FROM Cards WHERE id = ? AND userId = ?', [cardId, userId], (fetchErr, row) => {
      if (fetchErr) {
        // If the update succeeded but fetching the result failed, we still need to indicate a server error for the fetch part.
        return handleDbError(res, fetchErr, 'Card updated, but failed to retrieve the updated card.', 'Fetch updated card DB error');
      }
      res.json(row);
    });
  });
});

// DELETE /api/cards/:id - Delete a specific card by ID
router.delete('/:id', auth, (req, res) => {
  const userId = req.user.id;
  const cardId = req.params.id;

  db.run('DELETE FROM Cards WHERE id = ? AND userId = ?', [cardId, userId], function (err) {
    if (err) {
      return handleDbError(res, err, 'Failed to delete card.', 'Delete card DB error');
    }
    if (this.changes === 0) {
      return sendNotFoundResponse(res, 'Card not found or access denied.');
    }
    res.json({ message: 'Card deleted successfully.' });
  });
});

module.exports = router;
