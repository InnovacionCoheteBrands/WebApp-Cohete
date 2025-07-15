const { spawn } = require('child_process');
const path = require('path');

console.log('🔌 Starting TypeScript server bridge...');

// Create a temporary mjs file to properly handle ES modules
const tempServerPath = path.join(__dirname, 'temp-server.mjs');
const fs = require('fs');

// Create a temporary ES module file
const tempServerContent = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function startServer() {
  try {
    console.log('🚀 Loading server modules...');
    
    // Dynamic import for the TypeScript files
    const { registerRoutes } = await import('./server/routes.js');
    const express = (await import('express')).default;
    
    const app = express();
    const port = parseInt(process.env.PORT || "5000");
    
    console.log('📡 Registering routes...');
    const server = await registerRoutes(app);
    
    server.listen(port, '0.0.0.0', () => {
      console.log('🎉 Server successfully started on port', port);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
`;

fs.writeFileSync(tempServerPath, tempServerContent);

// Start the server with the temporary file
const serverProcess = spawn('node', [tempServerPath], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.stdout.on('data', (data) => {
  console.log('[Server]', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error('[Server ERROR]', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  // Clean up temp file
  if (fs.existsSync(tempServerPath)) {
    fs.unlinkSync(tempServerPath);
  }
});

// Cleanup on exit
process.on('exit', () => {
  if (fs.existsSync(tempServerPath)) {
    fs.unlinkSync(tempServerPath);
  }
});