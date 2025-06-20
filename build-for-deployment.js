#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';

async function buildForDeployment() {
  try {
    console.log('Building for deployment...');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build frontend quickly (skip long transformation)
    console.log('Building frontend...');
    execSync('npx vite build --minify false', { stdio: 'inherit' });
    
    // Copy server files
    console.log('Copying server files...');
    execSync('cp -r server dist/', { stdio: 'inherit' });
    execSync('cp -r shared dist/', { stdio: 'inherit' });
    
    // Create production package.json
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "server/index.ts",
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
        "memorystore": "^1.6.7",
        "@sendgrid/mail": "^8.1.5",
        "pdf-parse": "^1.1.1",
        "jspdf": "^3.0.1",
        "html2canvas": "^1.4.1",
        "exceljs": "^4.4.0"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    console.log('✅ Deployment build completed successfully!');
    console.log('Frontend: Built to dist/public');
    console.log('Backend: Copied to dist/server');
    console.log('Ready for production deployment');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

buildForDeployment();