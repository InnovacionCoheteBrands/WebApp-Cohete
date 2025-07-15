const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Cohete Workflow - Vite Development Server');
console.log('=============================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// API endpoints
const apiResponses = {
  '/api/health': { status: 'OK', timestamp: new Date().toISOString() },
  '/api/user': { authenticated: false, message: 'User system ready' },
  '/api/projects': { projects: [], message: 'Projects ready' },
  '/api/tasks': { tasks: [], message: 'Tasks ready' }
};

// API route handler
app.use('/api', (req, res) => {
  const response = apiResponses[req.path];
  if (response) {
    res.json(response);
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Start Vite dev server
const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

let viteReady = false;

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('[Vite]', output);
  if (output.includes('Local:') || output.includes('ready')) {
    viteReady = true;
  }
});

viteProcess.stderr.on('data', (data) => {
  console.error('[Vite Error]', data.toString());
});

// Proxy non-API requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Vite server not ready');
  }
}));

// Start the proxy server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Proxy server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`🔗 Proxying to Vite at: http://localhost:5173`);
});

// Cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  viteProcess.kill();
  server.close(() => {
    console.log('✅ Servers closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  viteProcess.kill();
  server.close(() => {
    console.log('✅ Servers closed');
    process.exit(0);
  });
});