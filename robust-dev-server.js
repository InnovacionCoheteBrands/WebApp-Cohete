
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Cohete Workflow - Robust Development Server');
console.log('===============================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

let serverProcess = null;
let viteProcess = null;
let viteReady = false;
let serverReady = false;

// Start Express server
console.log('Starting Express server...');
serverProcess = spawn('node', ['dev-server.js'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start Vite with additional flags
console.log('Starting Vite development server...');
viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0', '--force', '--clearScreen', 'false'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    FORCE_COLOR: '1'
  }
});

// Monitor Express server
if (serverProcess.stdout) {
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Express]', output);
    if (output.includes('running on') || output.includes('Server running')) {
      serverReady = true;
      console.log('🎉 Express server is ready!');
    }
  });
}

if (serverProcess.stderr) {
  serverProcess.stderr.on('data', (data) => {
    console.log('[Express ERROR]', data.toString());
  });
}

// Monitor Vite server
if (viteProcess.stdout) {
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Vite]', output);
    if (output.includes('ready') || output.includes('Local:') || output.includes('Network:')) {
      viteReady = true;
      console.log('🎉 Vite server is ready!');
    }
  });
}

if (viteProcess.stderr) {
  viteProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    if (!errorOutput.includes('CJS build of Vite')) {
      console.log('[Vite ERROR]', errorOutput);
    }
  });
}

// Enhanced proxy configuration
const viteProxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
  timeout: 10000,
  proxyTimeout: 10000,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('🔴 Proxy error:', err.message);
    
    if (!res.headersSent) {
      res.status(503).send(`
        <html>
          <head><title>Development Server Starting</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>🚀 Cohete Workflow</h1>
            <h2>Development server is starting...</h2>
            <p>The Vite development server is not ready yet. Please wait a moment and refresh the page.</p>
            <p><strong>Error:</strong> ${err.message}</p>
            <script>
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add headers to help with proxy
    proxyReq.setHeader('Host', 'localhost:5173');
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    servers: {
      express: serverReady,
      vite: viteReady
    }
  });
});

// Proxy to Vite for all other requests
app.use('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (!viteReady) {
    return res.status(503).send(`
      <html>
        <head><title>Development Server Starting</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🚀 Cohete Workflow</h1>
          <h2>Development server is starting...</h2>
          <p>Please wait while the Vite development server starts up...</p>
          <script>
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  }
  
  viteProxy(req, res, next);
});

// Start proxy server
const proxyServer = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Proxy server running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
});

// Wait for both servers
const checkReady = () => {
  if (serverReady && viteReady) {
    console.log('🎉 Both servers are ready!');
    console.log('📡 Access the application at: http://0.0.0.0:5000');
  } else {
    setTimeout(checkReady, 1000);
  }
};

checkReady();

// Cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (serverProcess) serverProcess.kill();
  if (viteProcess) viteProcess.kill();
  proxyServer.close(() => {
    console.log('✅ Servers closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  if (serverProcess) serverProcess.kill();
  if (viteProcess) viteProcess.kill();
  proxyServer.close(() => {
    console.log('✅ Servers closed');
    process.exit(0);
  });
});
