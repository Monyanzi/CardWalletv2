/**
 * Handles database operation errors.
 * Logs the error to the console and sends a 500 server error response.
 * @param {object} res - The Express response object.
 * @param {Error} error - The error object from the database operation.
 * @param {string} [customMessage="Server error during database operation."] - A custom message for the response.
 * @param {string} [logMessagePrefix="Database error"] - Prefix for the console error log.
 */
function handleDbError(res, error, customMessage = "Server error during database operation.", logMessagePrefix = "Database error") {
  console.error(`${logMessagePrefix}:`, error.message);
  res.status(500).json({ message: customMessage });
}

/**
 * Sends a 404 Not Found response.
 * @param {object} res - The Express response object.
 * @param {string} [message="Resource not found or access denied."] - The message for the response.
 */
function sendNotFoundResponse(res, message = "Resource not found or access denied.") {
  res.status(404).json({ message });
}

module.exports = {
  handleDbError,
  sendNotFoundResponse,
};
