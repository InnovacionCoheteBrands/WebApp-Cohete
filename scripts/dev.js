#!/usr/bin/env node

// Development script for Cohete Workflow
// This script provides a working development environment

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🚀 Cohete Workflow - Development Mode');
console.log('====================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0',
    message: 'Cohete Workflow Development Server'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0'
  });
});

// Basic user endpoint
app.get('/api/user', (req, res) => {
  res.json({
    message: 'Development API funcionando',
    authenticated: false,
    timestamp: new Date().toISOString(),
    note: 'Development mode - full functionality pending'
  });
});

// Serve static files if they exist
const staticPaths = [
  path.join(__dirname, '..', 'dist', 'public'),
  path.join(__dirname, '..', 'client', 'public'),
  path.join(__dirname, '..', 'public')
];

let staticPath = null;
for (const p of staticPaths) {
  if (fs.existsSync(p)) {
    staticPath = p;
    break;
  }
}

if (staticPath) {
  console.log(`📁 Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
}

// Basic HTML response for root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cohete Workflow - Development</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { color: #00a96e; }
        .info { background: #f0f8ff; padding: 20px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Cohete Workflow</h1>
        <p class="status">✅ Development server running</p>
        <div class="info">
          <h3>Server Status</h3>
          <p><strong>Environment:</strong> Development</p>
          <p><strong>Port:</strong> ${port}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Health Check:</strong> <a href="/health">/health</a></p>
          <p><strong>API Health:</strong> <a href="/api/health">/api/health</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Catch-all route for SPA
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl,
      message: 'Development mode - not all endpoints implemented'
    });
  } else {
    res.redirect('/');
  }
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Development server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`🔧 Mode: Development`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});