const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

console.log('🚀 Cohete Workflow - Simple Vite Server');
console.log('=======================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// Start Vite dev server
console.log('Starting Vite development server...');
const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// API endpoints
app.use('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/user', (req, res) => {
  res.json({ authenticated: false, message: 'User system ready' });
});

app.use('/api/projects', (req, res) => {
  res.json({ projects: [], message: 'Projects ready' });
});

app.use('/api/tasks', (req, res) => {
  res.json({ tasks: [], message: 'Tasks ready' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Simple proxy function for non-API requests
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  console.log(`Proxying ${req.method} ${req.path} to Vite`);
  
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: req.path,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Vite server not ready');
  });

  if (req.body) {
    proxyReq.write(req.body);
  }
  
  proxyReq.end();
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`🔗 Proxying to Vite at: http://localhost:5173`);
});

// Cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (viteProcess) {
    viteProcess.kill();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  if (viteProcess) {
    viteProcess.kill();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});