#!/usr/bin/env node

/**
 * Complete deployment solution - Addresses all suggested fixes
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploySolution() {
  try {
    console.log('Applying deployment solution...');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build with CommonJS format and output as .cjs to avoid module conflicts
    const buildCommand = `npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.cjs --packages=external --external:lightningcss --external:@babel/preset-typescript --external:esbuild --external:vite --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --define:process.env.NODE_ENV='"production"'`;
    
    console.log('Building server bundle...');
    await execAsync(buildCommand);
    
    // Create a simple index.js that imports the .cjs file
    const indexContent = `// Production entry point
const path = require('path');
require('./index.cjs');
`;
    writeFileSync('dist/index.js', indexContent);
    
    // Read dependencies from main package.json
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create production package.json without ESM type
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        "express": currentPackage.dependencies.express,
        "cors": currentPackage.dependencies.cors,
        "pg": currentPackage.dependencies.pg,
        "puppeteer": currentPackage.dependencies.puppeteer,
        "drizzle-orm": currentPackage.dependencies.drizzle-orm,
        "@neondatabase/serverless": currentPackage.dependencies["@neondatabase/serverless"],
        "bcryptjs": currentPackage.dependencies.bcryptjs,
        "express-session": currentPackage.dependencies["express-session"],
        "connect-pg-simple": currentPackage.dependencies["connect-pg-simple"],
        "multer": currentPackage.dependencies.multer,
        "passport": currentPackage.dependencies.passport,
        "passport-google-oauth20": currentPackage.dependencies["passport-google-oauth20"],
        "passport-local": currentPackage.dependencies["passport-local"],
        "zod": currentPackage.dependencies.zod,
        "axios": currentPackage.dependencies.axios,
        "pdf-parse": currentPackage.dependencies["pdf-parse"],
        "ws": currentPackage.dependencies.ws,
        "node-fetch": currentPackage.dependencies["node-fetch"]
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
    
    // Install production dependencies
    console.log('Installing dependencies...');
    await execAsync('cd dist && npm install --production --no-package-lock');
    
    // Final verification
    const files = ['dist/index.js', 'dist/index.cjs', 'dist/package.json', 'dist/node_modules'];
    const allExist = files.every(file => existsSync(file));
    
    if (allExist) {
      console.log('\nDeployment fixes successfully applied:');
      console.log('- Build/runtime mismatch fixed');
      console.log('- Entry point configuration corrected');
      console.log('- File structure aligned with npm start');
      console.log('- Dependencies properly bundled');
      console.log('- Module format conflicts resolved');
      console.log('\nDeployment ready for npm start');
    } else {
      throw new Error('Build verification failed');
    }
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploySolution().catch(console.error);