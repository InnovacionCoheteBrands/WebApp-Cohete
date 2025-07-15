const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Cohete Workflow - Simple Server');
console.log('==================================');

const port = parseInt(process.env.PORT || "5000");

// Simple MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

// Simple API responses
const apiResponses = {
  '/api/health': { status: 'OK', timestamp: new Date().toISOString() },
  '/api/user': { authenticated: false, message: 'User system ready' },
  '/api/projects': { projects: [], message: 'Projects ready' },
  '/api/tasks': { tasks: [], message: 'Tasks ready' }
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    const response = apiResponses[pathname];
    if (response) {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(response));
    } else {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
    return;
  }
  
  // Try to serve static files
  let filePath;
  
  if (pathname === '/' || pathname === '') {
    filePath = path.join(__dirname, 'client', 'index.html');
  } else {
    filePath = path.join(__dirname, 'client', pathname);
  }
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If not found, try serving index.html for SPA routing
      if (pathname !== '/') {
        filePath = path.join(__dirname, 'client', 'index.html');
        serveFile(filePath, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    } else {
      serveFile(filePath, res);
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'client')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});