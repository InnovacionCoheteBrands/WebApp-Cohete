
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Cohete Workflow - Development Server');
console.log('=======================================');

// Start the actual Express server with all routes
console.log('Starting Express server with all routes...');
const serverProcess = spawn('node', ['dev-server.js'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start Vite dev server
console.log('Starting Vite development server...');
const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

let viteReady = false;
let serverReady = false;

// Monitor Express server output
if (serverProcess.stdout) {
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Express]', output);
    if (output.includes('Server running on') || output.includes('🚀 HTTP Server created')) {
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

// Monitor Vite output
if (viteProcess.stdout) {
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[Vite]', output);
    if (output.includes('ready in') || output.includes('Local:')) {
      viteReady = true;
      console.log('🎉 Vite server is ready!');
    }
  });
}

if (viteProcess.stderr) {
  viteProcess.stderr.on('data', (data) => {
    console.log('[Vite ERROR]', data.toString());
  });
}

// Wait for both servers to be ready
const checkReady = () => {
  if (serverReady && viteReady) {
    console.log('🎉 Both servers are ready!');
    console.log('📡 Access the application at: http://0.0.0.0:5000');
    console.log('🔗 Vite dev server at: http://localhost:5173');
  } else {
    setTimeout(checkReady, 1000);
  }
};

checkReady();

// Cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (serverProcess) {
    serverProcess.kill();
  }
  if (viteProcess) {
    viteProcess.kill();
  }
  console.log('✅ Servers closed');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  if (serverProcess) {
    serverProcess.kill();
  }
  if (viteProcess) {
    viteProcess.kill();
  }
  console.log('✅ Servers closed');
  process.exit(0);
});
