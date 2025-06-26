#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function finalDeploy() {
  try {
    console.log('Creating final production build...');
    
    // Clean build directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build with ES module polyfills for __dirname and __filename
    console.log('Building server bundle...');
    const result = await execAsync('npx esbuild server/index.ts --bundle --platform=node --format=esm --target=node20 --outfile=dist/index.js --external:pg-native --external:fsevents --external:lightningcss --external:bufferutil --external:utf-8-validate --packages=external --banner:js="import { fileURLToPath } from \'url\'; import { dirname } from \'path\'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"');
    
    console.log('Build output:', result.stdout);
    if (result.stderr) console.log('Build warnings:', result.stderr);
    
    // Create production package.json
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        ...pkg.dependencies
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Verify
    const indexExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    
    console.log(`\nVerification:`);
    console.log(`dist/index.js: ${indexExists}`);
    console.log(`dist/package.json: ${packageExists}`);
    
    if (indexExists && packageExists) {
      console.log('\nBuild successful! Ready for deployment.');
    } else {
      throw new Error('Build verification failed');
    }
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

finalDeploy();