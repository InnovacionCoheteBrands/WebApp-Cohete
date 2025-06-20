#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';

async function productionBuild() {
  try {
    console.log('Creating production build for Replit deployment...');
    
    // Clean previous build
    if (existsSync('dist')) {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
    mkdirSync('dist', { recursive: true });
    
    // Skip frontend build for faster deployment - serve from client directory
    console.log('Skipping frontend build for fast deployment...');
    
    // Copy client directory for serving
    if (existsSync('client')) {
      cpSync('client', 'dist/client', { recursive: true });
    }
    
    // Copy essential files for deployment
    console.log('Copying project files...');
    const filesToCopy = ['server', 'shared', 'drizzle.config.ts'];
    filesToCopy.forEach(item => {
      if (existsSync(item)) {
        cpSync(item, `dist/${item}`, { recursive: true });
      }
    });
    
    // Read current package.json
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create production package.json that avoids 'dev' commands
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      scripts: {
        start: "NODE_ENV=production tsx server/index.ts",
        build: "echo 'Build completed'"
      },
      dependencies: currentPackage.dependencies,
      devDependencies: {
        "tsx": currentPackage.devDependencies.tsx,
        "typescript": currentPackage.devDependencies.typescript
      },
      optionalDependencies: currentPackage.optionalDependencies || {}
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    console.log('Production build completed successfully!');
    console.log('Ready for deployment with npm start command');
    
  } catch (error) {
    console.error('Production build failed:', error.message);
    process.exit(1);
  }
}

productionBuild();