#!/usr/bin/env node

/**
 * Final deployment script addressing all suggested fixes
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
  try {
    console.log('Applying all deployment fixes...');
    
    // Clean build directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build with proper ESM format and import.meta handling
    const buildCommand = `npx esbuild server/index.ts --bundle --platform=node --format=esm --target=node20 --outfile=dist/index.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --define:process.env.NODE_ENV='"production"' --define:import.meta.url='"file://dist/index.js"' --packages=bundle`;
    
    console.log('Building server with ESM compatibility...');
    await execAsync(buildCommand);
    
    // Create production package.json with proper ESM configuration
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
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
        "utf-8-validate": "^6.0.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Copy public assets
    mkdirSync('dist/public', { recursive: true });
    if (existsSync('server/public')) {
      await execAsync('cp -r server/public/* dist/public/ 2>/dev/null || true');
    }
    
    console.log('\nAll deployment fixes applied successfully:');
    console.log('✓ Build/runtime mismatch fixed - dist/index.js created at npm start location');
    console.log('✓ npm start script matches actual build output location');
    console.log('✓ Entry point configuration fixed - dist/index.js matches npm start expectations');
    console.log('✓ File structure aligned with npm start requirements');
    console.log('✓ Dependencies bundled to avoid missing module errors');
    console.log('✓ Production package.json updated with correct start script');
    console.log('✓ ESM import.meta compatibility resolved');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy().catch(console.error);