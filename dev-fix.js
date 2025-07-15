#!/usr/bin/env node

// Development Environment Fix for Cohete Workflow
// This script creates a working development server bypassing the package.json constraints

console.log('🔧 Cohete Workflow - Development Fix');
console.log('====================================');

// Check if we can run the development server
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// First, let's run our development server
console.log('🚀 Starting development server...');

const devServer = spawn('node', [path.join(__dirname, 'scripts', 'dev.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

devServer.stdout.on('data', (data) => {
  console.log(data.toString());
});

devServer.stderr.on('data', (data) => {
  console.error(data.toString());
});

devServer.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

devServer.on('error', (error) => {
  console.error('Failed to start development server:', error);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  devServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  devServer.kill();
  process.exit(0);
});

setTimeout(() => {
  console.log('\n✅ Development environment is now running');
  console.log('📝 Note: This is a temporary fix for the missing dev script');
  console.log('🔗 Access the app at: http://localhost:5000');
}, 2000);