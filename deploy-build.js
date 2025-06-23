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
    
    // Build with no banner to avoid conflicts
    console.log('Building server bundle...');
    const result = await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=esm --target=node20 --outfile=dist/index.js --external:pg-native --external:fsevents --external:lightningcss --external:bufferutil --external:utf-8-validate --packages=external --define:process.env.NODE_ENV='"production"' --define:global=globalThis`);
    
    if (result.stderr && result.stderr.includes('ERROR')) {
      throw new Error(`Build failed: ${result.stderr}`);
    }
    
    // Read and fix the bundle content - replace problematic variable declarations
    let bundleContent = readFileSync('dist/index.js', 'utf-8');
    
    // Replace all __filename and __dirname variable declarations with unique names
    bundleContent = bundleContent.replace(/var __filename = fileURLToPath[0-9]*\(import\.meta\.url\);/g, '/* replaced __filename declaration */');
    bundleContent = bundleContent.replace(/var __dirname = dirname[0-9]*\(__filename\);/g, '/* replaced __dirname declaration */');
    bundleContent = bundleContent.replace(/const __filename = fileURLToPath[0-9]*\(import\.meta\.url\);/g, '/* replaced __filename declaration */');
    bundleContent = bundleContent.replace(/const __dirname = dirname[0-9]*\(__filename\);/g, '/* replaced __dirname declaration */');
    
    // Create polyfill block at the beginning
    const polyfillBlock = `// ES Module Compatibility Layer
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Global polyfill
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

`;
    
    // Prepend polyfills to cleaned bundle
    bundleContent = polyfillBlock + bundleContent;
    writeFileSync('dist/index.js', bundleContent);
    console.log('Fixed ES module variable conflicts and applied polyfills');
    
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
        pg: pkg.dependencies.pg,
        "@neondatabase/serverless": pkg.dependencies["@neondatabase/serverless"]
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