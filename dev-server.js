#!/usr/bin/env node

// Simple development server to bypass vite.config.ts async issues
const { spawn } = require('child_process');

console.log('Starting development server...');

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});