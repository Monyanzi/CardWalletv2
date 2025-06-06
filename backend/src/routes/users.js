const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT authentication middleware
const db = require('../models/db'); // SQLite database connection
const { handleDbError, sendNotFoundResponse } = require('../utils/responseHandlers');

// DELETE /api/users/me - Delete the authenticated user's account
router.delete('/me', auth, (req, res) => {
  const userId = req.user.id;

  db.run('DELETE FROM Users WHERE id = ?', [userId], function (err) {
    if (err) {
      return handleDbError(res, err, 'Failed to delete user account.', 'User account deletion DB error');
    }
    if (this.changes === 0) {
      // This case should ideally not happen if auth middleware worked and user exists
      return sendNotFoundResponse(res, 'User not found.');
    }
    // Cascading delete should have removed associated cards.
    res.json({ message: 'User account deleted successfully. All associated data has been removed.' });
  });
});

module.exports = router;
