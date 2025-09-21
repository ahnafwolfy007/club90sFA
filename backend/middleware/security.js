const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const xss = require('xss');
const hpp = require('hpp');
const { query } = require('../config/database');

// Rate limiting for general API requests
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX), // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    });
  }
});

// Speed limiting for heavy operations
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per window at full speed
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Audit logging middleware
const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log to database for important operations
    if (req.method !== 'GET' && req.user) {
      const logData = {
        user_id: req.user.id,
        action: `${req.method} ${req.originalUrl}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        duration: duration,
        status_code: res.statusCode,
        request_body: req.method !== 'GET' ? JSON.stringify(req.body) : null
      };

      // Don't await this to avoid blocking the response
      query(`
        INSERT INTO audit_logs (user_id, action, table_name, ip_address, user_agent, new_values) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        logData.user_id,
        logData.action,
        'api_request',
        logData.ip_address,
        logData.user_agent,
        JSON.stringify(logData)
      ]).catch(err => console.error('Audit log error:', err));
    }

    originalSend.call(this, data);
  };

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      message: 'Invalid reference to related resource'
    });
  }

  if (err.code === '23514') { // Check constraint violation
    return res.status(400).json({
      success: false,
      message: 'Data validation failed'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`
    );
  });
  
  next();
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all localhost/127.0.0.1 and LAN origins
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      if (!origin) return callback(null, true);
      const devOriginOk = /^(https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1]))(:\d+)?)/.test(origin);
      return callback(devOriginOk ? null : new Error('Not allowed by CORS'), devOriginOk);
    }

    // Production: strict allowlist
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ].filter(Boolean);
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

module.exports = {
  apiLimiter,
  authLimiter,
  speedLimiter,
  securityHeaders,
  xssProtection,
  validateInput,
  auditLogger,
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsOptions,
  hpp: hpp(), // HTTP Parameter Pollution protection
};