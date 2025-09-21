const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import middleware
const {
  apiLimiter,
  securityHeaders,
  xssProtection,
  hpp,
  auditLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsOptions
} = require('./middleware/security');

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const matchesRoutes = require('./routes/matches');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection on startup
testConnection();

// Security middleware
app.use(securityHeaders);
app.use(hpp);

// CORS
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// XSS Protection
app.use(xssProtection);

// Rate limiting
app.use('/api/', apiLimiter);

// Audit logging
app.use(auditLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Club 90s Football Academy API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static uploads (for profile images)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Club 90s Football Academy Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      matches: '/api/matches',
      tournaments: '/api/tournaments',
      notices: '/api/notices',
      subscriptions: '/api/subscriptions'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Club 90s Football Academy API Server Started
    
    📍 URL: http://${process.env.HOST || 'localhost'}:${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}
    
    📋 Available Endpoints:
    - GET  /                 - Welcome message
    - GET  /health           - Health check
    - POST /api/auth/signup  - User registration
    - POST /api/auth/login   - User login
    - POST /api/auth/refresh - Refresh token
    - GET  /api/auth/me      - Get user profile
    
    ⚽ Club 90s Football Academy - Management System
  `);
});

module.exports = app;