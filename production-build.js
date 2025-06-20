#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, cpSync } from 'fs';

async function productionBuild() {
  try {
    console.log('Creating production build...');
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // Build frontend with optimized settings
    console.log('Building frontend...');
    execSync('npx vite build --mode production', { stdio: 'inherit' });
    
    // Copy server files to dist
    console.log('Copying server files...');
    if (existsSync('server')) {
      cpSync('server', 'dist/server', { recursive: true });
    }
    if (existsSync('shared')) {
      cpSync('shared', 'dist/shared', { recursive: true });
    }
    
    // Copy other necessary files
    const filesToCopy = ['drizzle.config.ts', 'package.json'];
    filesToCopy.forEach(file => {
      if (existsSync(file)) {
        cpSync(file, `dist/${file}`);
      }
    });

    // Create production package.json with proper start command
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0", 
      type: "module",
      scripts: {
        start: "NODE_ENV=production tsx server/index.ts"
      },
      dependencies: {
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
        "zod": "^3.23.8",
        "drizzle-zod": "^0.7.0",
        "node-fetch": "^3.3.2",
        "memoizee": "^0.4.17",
        "memorystore": "^1.6.7"
      }
    };

    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    console.log('✅ Production build completed successfully!');
    console.log('📦 Frontend built to dist/public');
    console.log('📁 Server files copied to dist/');
    console.log('🚀 Ready for deployment - uses "npm start" (production mode)');
    
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    process.exit(1);
  }
}

productionBuild();