#!/usr/bin/env node

// Cohete Workflow Development Server
// This script provides a working development environment

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🚀 Cohete Workflow - Development Server');
console.log('======================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0',
    message: 'Cohete Workflow Development Server Running'
  });
});

// API endpoints
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
    message: 'Development API active',
    authenticated: false,
    timestamp: new Date().toISOString(),
    note: 'Development mode - full authentication system pending'
  });
});

// Check for and serve static files
const staticPaths = [
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'client', 'public'),
  path.join(__dirname, 'public')
];

let staticPath = null;
for (const p of staticPaths) {
  if (fs.existsSync(p)) {
    staticPath = p;
    console.log(`📁 Serving static files from: ${p}`);
    app.use(express.static(p));
    break;
  }
}

// Root route - development page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cohete Workflow - Development</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .status { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .status-dot { width: 12px; height: 12px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h3 { color: #333; margin-bottom: 15px; }
        .info-list { list-style: none; }
        .info-list li { padding: 5px 0; border-bottom: 1px solid #f0f0f0; }
        .info-list li:last-child { border-bottom: none; }
        .info-list strong { color: #667eea; }
        .links { display: flex; gap: 10px; flex-wrap: wrap; }
        .link { display: inline-block; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; transition: background 0.3s; }
        .link:hover { background: #5a6fd8; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Cohete Workflow</h1>
          <div class="status">
            <div class="status-dot"></div>
            <span>Development server running</span>
          </div>
        </div>
        
        <div class="grid">
          <div class="card">
            <h3>📊 Server Status</h3>
            <ul class="info-list">
              <li><strong>Environment:</strong> Development</li>
              <li><strong>Port:</strong> ${port}</li>
              <li><strong>Started:</strong> ${new Date().toISOString()}</li>
              <li><strong>Node.js:</strong> ${process.version}</li>
              <li><strong>Platform:</strong> ${process.platform}</li>
            </ul>
          </div>
          
          <div class="card">
            <h3>🔗 API Endpoints</h3>
            <div class="links">
              <a href="/health" class="link">Health Check</a>
              <a href="/api/health" class="link">API Health</a>
              <a href="/api/user" class="link">User API</a>
            </div>
          </div>
          
          <div class="card">
            <h3>📝 Development Notes</h3>
            <ul class="info-list">
              <li><strong>Status:</strong> Basic server functional</li>
              <li><strong>Frontend:</strong> ${staticPath ? 'Static files available' : 'No static files found'}</li>
              <li><strong>Database:</strong> Connection pending</li>
              <li><strong>Authentication:</strong> Development mode</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Cohete Workflow Development Environment • Ready for development</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'Endpoint not found',
      path: req.path,
      message: 'Development mode - not all API endpoints implemented',
      timestamp: new Date().toISOString()
    });
  } else {
    res.redirect('/');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Development mode - check server logs',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Development server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`🔧 Mode: Development`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`📁 Static files: ${staticPath || 'None found'}`);
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