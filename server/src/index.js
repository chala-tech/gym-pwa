require('dotenv').config();
const express = require('express');
const cors = require('cors');
const memberRoutes = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS – whitelist of allowed origins.
// Always includes the production Vercel URL and localhost.
// Add more via CLIENT_URL env var on Render (comma-separated).
const ALLOWED_ORIGINS = new Set([
  'https://gym-pwa-kappa-blond.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
    : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/members', memberRoutes);

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