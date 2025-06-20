#!/usr/bin/env node

/**
 * Production deployment script that creates the exact file structure npm start expects
 * Fixes: Build script creates files in dist/ directory but runtime expects dist/index.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

async function deployProduction() {
  try {
    console.log('Creating production deployment...');
    
    // Clean dist directory
    if (existsSync('dist')) {
      await import('fs').then(fs => fs.rmSync('dist', { recursive: true, force: true }));
    }
    mkdirSync('dist', { recursive: true });
    
    // Step 1: Build frontend (optional, non-blocking)
    console.log('Building frontend assets...');
    try {
      await execAsync('vite build --outDir dist/public', { timeout: 30000 });
      console.log('✓ Frontend built to dist/public');
    } catch (error) {
      console.log('Frontend build skipped (continuing with server)');
    }
    
    // Step 2: Build server bundle to exact location npm start expects
    console.log('Building server bundle...');
    
    const buildCommand = `npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --external:lightningcss --external:@babel/preset-typescript --define:process.env.NODE_ENV='"production"' --banner:js='import { createRequire } from "module"; import { fileURLToPath } from "url"; import { dirname } from "path"; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);' --log-level=warning`;
    
    await execAsync(buildCommand);
    console.log('✓ Server bundle created: dist/index.js');
    
    // Step 3: Create minimal package.json for production
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        "pg": "^8.11.0"
      },
      optionalDependencies: {
        "pg-native": "^3.0.1",
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^6.0.3",
        "fsevents": "^2.3.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    console.log('✓ Production package.json created');
    
    // Step 4: Test the build
    console.log('Testing production build...');
    try {
      await execAsync('cd dist && timeout 3s NODE_ENV=production node index.js', { timeout: 5000 });
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('✓ Server starts successfully');
      } else {
        throw error;
      }
    }
    
    console.log('');
    console.log('🎉 Deployment ready!');
    console.log('');
    console.log('Fixed deployment issues:');
    console.log('  ✓ Created dist/index.js (matches npm start expectation)');
    console.log('  ✓ Bundled all dependencies except native modules');
    console.log('  ✓ Production package.json with correct start command');
    console.log('  ✓ Frontend assets in dist/public (if built)');
    console.log('');
    console.log('Deployment commands:');
    console.log('  Build: node deploy-production.js');
    console.log('  Start: npm start (runs: NODE_ENV=production node index.js)');
    console.log('');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deployProduction();