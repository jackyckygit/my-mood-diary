// Import required modules
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // This loads environment variables from a .env file into process.env

// Import API routes
const userRoutes = require('./routes/userRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

// Initialize the Express application
const app = express();

// --- Middleware ---

// 1. CORS (Cross-Origin Resource Sharing)
// This allows your frontend (running on a different port/domain) to communicate with the backend.
app.use(cors({
  origin: ['http://localhost:3000'], // Allow origins
}));

// 2. Body Parser
// This allows the server to accept and parse JSON in the body of requests.
app.use(express.json());

// 3. Simple Request Logger (for debugging)
// This middleware will log every incoming request to the console.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next middleware/handler
});


// --- API Routes ---

// The main router for user-related endpoints (login, register)
app.use('/api/users', userRoutes);

// The main router for diary-related endpoints (create, get, etc.)
app.use('/api/diaries', diaryRoutes);


// --- Health Check Route ---

// A simple root route to confirm that the API is running.
// You can access this by navigating to http://localhost:5000/ in your browser.
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the My Mood Diary API!',
    status: 'ok',
  });
});


// --- Start the Server ---

// Define the port the server will run on.
// It will use the PORT from the .env file, or default to 5000 if it's not defined.
const PORT = process.env.PORT || 5000;

// Start listening for connections on the specified port.
app.listen(PORT, () => {
  console.log(`🚀 Server is running and listening on port ${PORT}`);
});