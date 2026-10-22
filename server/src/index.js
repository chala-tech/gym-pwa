require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memberRoutes = require('./routes/members');
const checkInRoutes = require('./routes/checkIns');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS – reads CLIENT_URL from Render environment variables.
// Falls back to localhost for local development.
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());


// Routes
app.use('/api/members', memberRoutes);
app.use('/api/checkins', checkInRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gym Management API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🏋️  Gym API Server running on port ${PORT}`);
});

module.exports = app;