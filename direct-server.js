const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Cohete Workflow - Direct Server');
console.log('==================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// Start Vite dev server
console.log('Starting Vite development server...');
const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

let viteReady = false;

if (viteProcess && viteProcess.stdout) {
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Vite]', output);
    if (output.includes('ready') || output.includes('Local:')) {
      viteReady = true;
      console.log('✅ Vite server is ready!');
    }
  });
}

if (viteProcess && viteProcess.stderr) {
  viteProcess.stderr.on('data', (data) => {
    console.error('[Vite Error]', data.toString());
  });
}

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

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Proxy all other requests to Vite
const viteProxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Development server not ready');
  }
});

app.use('*', viteProxy);

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