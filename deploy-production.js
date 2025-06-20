#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

async function deployProduction() {
  try {
    console.log('🚀 Starting production deployment build...');
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // Build frontend first
    console.log('📦 Building frontend...');
    execSync('npx vite build', { stdio: 'inherit' });
    
    // Create production package.json that uses the current start script
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      scripts: {
        start: "NODE_ENV=production tsx server/index.ts"
      },
      dependencies: {
        // Copy all production dependencies from main package.json
        "@neondatabase/serverless": "^0.10.4",
        "express": "^4.21.2",
        "cors": "^2.8.5",
        "drizzle-orm": "^0.39.1",
        "pg": "^8.15.6",
        "bcryptjs": "^3.0.2",
        "express-session": "^1.18.1",
        "connect-pg-simple": "^10.0.0",
        "passport": "^0.7.0",
        "passport-google-oauth20": "^2.0.0",
        "passport-local": "^1.0.0",
        "multer": "^1.4.5-lts.2",
        "axios": "^1.8.4",
        "ws": "^8.18.0",
        "tsx": "^4.19.1",
        "zod": "^3.23.8"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    // Copy server files to dist
    console.log('📁 Copying server files...');
    execSync('cp -r server dist/', { stdio: 'inherit' });
    execSync('cp -r shared dist/', { stdio: 'inherit' });
    
    // Copy other necessary files
    if (existsSync('drizzle.config.ts')) {
      execSync('cp drizzle.config.ts dist/', { stdio: 'inherit' });
    }
    
    console.log('✅ Production deployment build completed!');
    console.log('📦 Frontend built to dist/public');
    console.log('📁 Server files copied to dist/server');
    console.log('🚀 Ready for deployment - use "cd dist && npm install && npm start"');
    
    return true;
  } catch (error) {
    console.error('❌ Production deployment build failed:', error.message);
    return false;
  }
}

deployProduction();