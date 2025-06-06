require('dotenv').config(); // Load environment variables from .env file

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
const PORT = process.env.PORT || '5002'; // Default to string '5002' if not set

// Start the server
app.listen(parseInt(PORT, 10), () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for potential testing or other uses (optional)
module.exports = app; 
