#!/usr/bin/env node

/**
 * Simple deployment script - Creates dist/index.js matching npm start expectations
 * Avoids complex dependencies that cause build issues
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function simpleDeploy() {
  try {
    console.log('Creating simple production build...');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Use esbuild directly with minimal externals to avoid dependency issues
    const buildCommand = `npx esbuild server/index.ts --bundle --platform=node --format=esm --target=node20 --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --external:lightningcss --external:@babel/preset-typescript --define:process.env.NODE_ENV='"production"'`;
    
    console.log('Building server bundle...');
    await execAsync(buildCommand);
    
    // Read current package.json
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create minimal production package.json matching npm start expectations
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        "pg": currentPackage.dependencies.pg,
        "puppeteer": currentPackage.dependencies.puppeteer
      },
      optionalDependencies: {
        "bufferutil": currentPackage.optionalDependencies?.bufferutil || "^4.0.8",
        "utf-8-validate": "^6.0.3",
        "fsevents": "^2.3.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Verify the build
    const indexExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    
    console.log('BUILD VERIFICATION:');
    console.log(`✓ dist/index.js exists: ${indexExists}`);
    console.log(`✓ dist/package.json exists: ${packageExists}`);
    
    if (indexExists && packageExists) {
      console.log('');
      console.log('DEPLOYMENT FIXES APPLIED:');
      console.log('✓ Created dist/index.js (matches npm start requirement)');
      console.log('✓ Production package.json with correct start script');
      console.log('✓ Fixed entry point mismatch issue');
      console.log('✓ Bundled dependencies to avoid missing module errors');
      console.log('');
      console.log('Ready for deployment: npm start will run NODE_ENV=production node dist/index.js');
    } else {
      throw new Error('Build verification failed - required files not created');
    }
    
  } catch (error) {
    console.error('Deployment build failed:', error.message);
    process.exit(1);
  }
}

simpleDeploy();