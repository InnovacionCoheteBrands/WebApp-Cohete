#!/usr/bin/env node

/**
 * Final production deployment script for Cohete Workflow
 * Creates dist/index.js matching npm start expectations
 * Handles ES module polyfills without conflicts
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deployBuild() {
  try {
    console.log('Creating production deployment...');
    
    // Clean build directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build with CommonJS format to avoid ES module polyfill issues
    console.log('Building server bundle...');
    const result = await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.js --external:pg-native --external:fsevents --external:lightningcss --external:bufferutil --external:utf-8-validate --packages=external --define:process.env.NODE_ENV='"production"' --define:global=globalThis`);
    
    if (result.stderr && result.stderr.includes('ERROR')) {
      throw new Error(`Build failed: ${result.stderr}`);
    }
    
    console.log('Build completed successfully');
    
    // Create production package.json
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        pg: pkg.dependencies.pg,
        "@neondatabase/serverless": pkg.dependencies["@neondatabase/serverless"],
        bcryptjs: pkg.dependencies.bcryptjs,
        express: pkg.dependencies.express,
        "express-session": pkg.dependencies["express-session"],
        cors: pkg.dependencies.cors,
        multer: pkg.dependencies.multer,
        "drizzle-orm": pkg.dependencies["drizzle-orm"]
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Verify build
    const indexExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    
    console.log('Build verification:');
    console.log(`dist/index.js: ${indexExists}`);
    console.log(`dist/package.json: ${packageExists}`);
    
    if (indexExists && packageExists) {
      console.log('Production build completed successfully');
      console.log('Ready for deployment with npm start');
    } else {
      throw new Error('Build verification failed');
    }
    
  } catch (error) {
    console.error('Deployment build failed:', error.message);
    process.exit(1);
  }
}

deployBuild();