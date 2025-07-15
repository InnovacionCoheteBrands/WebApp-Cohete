#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Cohete Workflow - Development Environment');
console.log('=============================================');

// Function to run the simple server
function runSimpleServer() {
  const serverProcess = spawn('node', [path.join(__dirname, 'simple-server.js')], {
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
  });

  return serverProcess;
}

// Function to run Vite dev server for React app
function runViteDevServer() {
  const viteProcess = spawn('npx', ['vite', '--port', '5173', '--host', '0.0.0.0'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  viteProcess.stdout.on('data', (data) => {
    console.log('[Vite] ' + data.toString());
  });

  viteProcess.stderr.on('data', (data) => {
    console.error('[Vite] ' + data.toString());
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start Vite:', error);
  });

  return viteProcess;
}

// Main execution
function main() {
  console.log('Starting development server...');
  
  // Check if we should run Vite dev server or simple server
  const clientDir = path.join(__dirname, 'client');
  const packageJsonPath = path.join(clientDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath) && fs.existsSync(path.join(clientDir, 'vite.config.js'))) {
    console.log('📦 Starting Vite development server...');
    const viteProcess = runViteDevServer();
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      viteProcess.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM...');
      viteProcess.kill();
      process.exit(0);
    });
  } else {
    console.log('📦 Starting simple server...');
    const serverProcess = runSimpleServer();
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      serverProcess.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM...');
      serverProcess.kill();
      process.exit(0);
    });
  }
}

main();