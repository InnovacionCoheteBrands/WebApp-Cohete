#!/usr/bin/env node

// Development script to replace npm run dev
const { spawn } = require('child_process');

console.log('🚀 Starting Cohete Workflow Development Server...');

// Start the simple server for now
const server = spawn('node', ['simple-server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill();
  process.exit(0);
});