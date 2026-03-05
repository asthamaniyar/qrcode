const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Import DB connection
const connectDB = require('./config/db');

// Import routes
const qrRoutes = require('./routes/qrRoutes');

// Import redirect controller
const qrController = require('./controllers/qrController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// Routes
app.use('/api/qr', qrRoutes);

// Redirect endpoint (MUST be after API routes)
app.get('/r/:code', qrController.redirect);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 QR Generator Server is running!          ║
║                                               ║
║   Backend: http://localhost:${PORT}               ║
║   API:     http://localhost:${PORT}/api/qr         ║
║   Frontend: http://localhost:5173 (dev mode)      ║
║                                               ║
║   Press Ctrl+C to stop                        ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
