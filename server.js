const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const artisanRoutes = require('./routes/artisan');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');

const app = express();
const PORT = process.env.PORT || 5000;

// Add global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Security middleware
app.use(helmet());

// Rate limiting - exclude health check endpoint
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/api/health';
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - Updated for production and development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://127.0.0.1:5500', 
      'http://localhost:5500',
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'http://127.0.0.1:5000',
      'http://localhost:5000',
      'http://127.0.0.1:5001',
      'http://localhost:5001',
      'http://127.0.0.1:5002',
      'http://localhost:5002',
      'https://bacend-6rm4.onrender.com', // Your Render domain
      'https://*.onrender.com' // Allow all Render subdomains
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/artisan', artisanRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Crochet ArtY API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      artisan: '/api/artisan',
      orders: '/api/orders',
      reviews: '/api/reviews',
      wishlist: '/api/wishlist'
    },
    documentation: 'All endpoints are prefixed with /api/',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Crochet ArtY API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server on fixed port 5000
const startServer = async () => {
  try {
    console.log('🔄 Starting server initialization...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend should connect to: http://localhost:${PORT}/api`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error('Please stop any other processes using port 5000 or change the PORT in config.env');
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

console.log('🚀 Starting Crochet ArtY Backend...');
startServer(); 