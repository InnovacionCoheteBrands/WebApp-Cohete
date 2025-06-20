#!/usr/bin/env node

/**
 * Production deployment script - Creates dist/index.js exactly as npm start expects
 * Fixes deployment mismatch between build output and runtime expectations
 */

import { build } from 'esbuild';
import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';

async function productionDeploy() {
  try {
    console.log('Creating production build matching npm start expectations...');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Bundle server to exact location npm start expects: dist/index.js
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      outfile: 'dist/index.js', // EXACT file npm start command expects
      external: [
        'pg-native',
        'bufferutil', 
        'utf-8-validate',
        'fsevents'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      packages: 'bundle' // Bundle all dependencies except externalized
    });
    
    // Read current dependencies
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create production package.json with correct start script
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0", 
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js" // Matches bundled file location
      },
      dependencies: {
        "pg": currentPackage.dependencies.pg
      },
      optionalDependencies: {
        "bufferutil": currentPackage.optionalDependencies?.bufferutil
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    console.log('✓ Production build complete');
    console.log('✓ dist/index.js created (matches npm start requirement)');
    console.log('✓ Production package.json with correct start script');
    console.log('Ready for deployment with: npm start');
    
  } catch (error) {
    console.error('Production build failed:', error.message);
    process.exit(1);
  }
}

productionDeploy();