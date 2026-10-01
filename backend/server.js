const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const apiRoutes = require('./routes/api');
const mongodbService = require('./database/mongodb_service');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'AgroSense Indore',
    region: 'Malwa Plateau (Zone X), MP',
    timestamp: new Date().toISOString()
  });
});

// Serve Static Frontend (HTML, CSS, JS)
const staticFrontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(staticFrontendPath));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticFrontendPath, 'index.html'));
});

// Start Server
async function startServer() {
  try {
    console.log('='.repeat(55));
    console.log('🌾 AGROSENSE INDORE - AI PRECISION ADVISORY SYSTEM');
    console.log('='.repeat(55));

    // Connect to database (with fallback)
    await mongodbService.connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on: http://localhost:${PORT}`);
      console.log(`🌐 Frontend UI       : http://localhost:${PORT}`);
      console.log(`📊 API Endpoint      : http://localhost:${PORT}/api/recommend`);
      console.log('='.repeat(55));
    });
  } catch (err) {
    console.error('Server startup error:', err);
  }
}

startServer();
