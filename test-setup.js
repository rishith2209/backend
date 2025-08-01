const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend setup is working!',
    timestamp: new Date().toISOString(),
    dependencies: {
      express: require('express/package.json').version,
      cors: require('cors/package.json').version,
      helmet: require('helmet/package.json').version
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Crochet ArtY API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app; 