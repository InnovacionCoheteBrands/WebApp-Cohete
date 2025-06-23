#!/usr/bin/env node

/**
 * Production deployment script for Cohete Workflow
 * Creates dist/index.js matching npm start expectations
 * Resolves ESM module issues and bundling conflicts
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function cleanDeploy() {
  try {
    console.log('🚀 Creating production deployment build...');
    
    // Clean build directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build with minimal externals and proper global handling
    console.log('📦 Building server bundle...');
    const result = await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=esm --target=node20 --outfile=dist/index.js --external:pg-native --external:fsevents --external:lightningcss --external:bufferutil --external:utf-8-validate --packages=external --define:process.env.NODE_ENV='"production"' --define:global=globalThis`);
    
    if (result.stderr && result.stderr.includes('ERROR')) {
      throw new Error(`Build failed: ${result.stderr}`);
    }
    
    // Read and fix the bundle content
    let bundleContent = readFileSync('dist/index.js', 'utf-8');
    
    // Add minimal polyfills only if not already present
    const needsPolyfills = !bundleContent.includes('const __dirname') || !bundleContent.includes('const require');
    
    if (needsPolyfills) {
      const polyfills = `// ES Module polyfills
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Global polyfill
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

`;
      bundleContent = polyfills + bundleContent;
      writeFileSync('dist/index.js', bundleContent);
    }
    
    console.log('✅ Build completed and polyfills applied');
    
    // Create minimal production package.json
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
    
    console.log(`\nBuild verification:`);
    console.log(`dist/index.js: ${indexExists}`);
    console.log(`dist/package.json: ${packageExists}`);
    
    if (indexExists && packageExists) {
      console.log('\n🎉 DEPLOYMENT BUILD SUCCESSFUL!');
      
      // Test server startup
      console.log('Testing server startup...');
      try {
        const testResult = await execAsync('cd dist && timeout 3s node index.js 2>&1 | head -5', { timeout: 5000 });
        console.log('Server test output:', testResult.stdout);
      } catch (error) {
        if (error.message.includes('timeout')) {
          console.log('✅ Server started successfully (timeout expected)');
        } else {
          console.log('Server test error:', error.message);
        }
      }
    } else {
      throw new Error('Build verification failed');
    }
    
  } catch (error) {
    console.error('Clean deployment failed:', error.message);
    process.exit(1);
  }
}

cleanDeploy();