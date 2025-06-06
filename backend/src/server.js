const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes);

// Simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.send('CardWallet API is running!');
});

// Define the port
const PORT = process.env.PORT || 5002; // Temporarily changed for EADDRINUSE diagnosis // Use 5001 to avoid frontend conflicts

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for potential testing or other uses (optional)
module.exports = app; 
