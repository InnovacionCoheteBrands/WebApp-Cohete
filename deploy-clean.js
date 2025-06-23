#!/usr/bin/env node

/**
 * Clean deployment script - Final fix for all deployment issues
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function cleanDeploy() {
  try {
    console.log('Creating clean production build...');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Simple CommonJS build without conflicting imports
    const buildCommand = `npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --define:process.env.NODE_ENV='"production"' --keep-names --tree-shaking=false`;
    
    console.log('Building server bundle...');
    await execAsync(buildCommand);
    
    // Create minimal production package.json
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        "pg": "^8.15.6",
        "puppeteer": "^24.6.0"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^6.0.3",
        "fsevents": "^2.3.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Copy public assets
    mkdirSync('dist/public', { recursive: true });
    if (existsSync('server/public')) {
      await execAsync('cp -r server/public/* dist/public/ 2>/dev/null || true');
    }
    
    console.log('\nDeployment fixes applied successfully:');
    console.log('✓ Build/runtime mismatch fixed - dist/index.js created');
    console.log('✓ Entry point configuration fixed - package.json matches npm start');
    console.log('✓ File structure aligned with npm start expectations');
    console.log('✓ Dependencies bundled to avoid missing modules');
    console.log('✓ CommonJS format used for compatibility');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

cleanDeploy().catch(console.error);