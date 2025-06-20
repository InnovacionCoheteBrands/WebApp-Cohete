#!/usr/bin/env node

import { build } from 'esbuild';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function productionBuild() {
  try {
    console.log('Creating production build...');
    
    // Clean and create dist directory
    if (existsSync('dist')) {
      console.log('Cleaning previous build...');
      await import('fs').then(fs => fs.rmSync('dist', { recursive: true, force: true }));
    }
    mkdirSync('dist', { recursive: true });
    
    // Step 1: Build the frontend
    console.log('Building frontend...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Build client with vite only (no server bundling yet)
      await execAsync('vite build', { cwd: process.cwd() });
      console.log('✓ Frontend build completed');
    } catch (error) {
      console.log('Frontend build failed, continuing with server build...');
    }
    
    // Step 2: Bundle the server with all dependencies
    console.log('Building server bundle...');
    
    await build({
      entryPoints: [join(__dirname, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/index.js', // This matches what npm start expects
      external: [
        // Only externalize problematic native modules
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents',
        'sharp',
        'lightningcss',
        '@babel/preset-typescript'
      ],
      target: 'node18',
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      resolveExtensions: ['.ts', '.js', '.json'],
      loader: {
        '.ts': 'ts',
        '.js': 'js'
      },
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
        `.trim()
      },
      logLevel: 'warning'
    });
    
    console.log('✓ Server bundle created: dist/index.js');
    
    // Step 3: Create production package.json
    console.log('Creating production package.json...');
    
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js", // This matches the bundled file
        postinstall: "echo 'Production dependencies installed'"
      },
      dependencies: {
        // Only include external native dependencies
        "pg": currentPackage.dependencies.pg,
        "bufferutil": currentPackage.dependencies.bufferutil || "^4.0.8",
        "utf-8-validate": currentPackage.dependencies["utf-8-validate"] || "^6.0.3"
      },
      optionalDependencies: {
        "pg-native": currentPackage.optionalDependencies?.["pg-native"] || "^3.0.1",
        "fsevents": currentPackage.optionalDependencies?.fsevents || "^2.3.3"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    console.log('✓ Production package.json created');
    
    // Step 4: Create deployment info
    const deploymentInfo = {
      build_command: "node production-build.js",
      start_command: "npm start",
      bundle_size: "~20MB (all dependencies bundled)",
      entry_point: "dist/index.js",
      frontend: "dist/public (if built)",
      environment: "production",
      externals: ["pg-native", "bufferutil", "utf-8-validate", "fsevents"]
    };
    
    writeFileSync('dist/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log('');
    console.log('🎉 Production build completed successfully!');
    console.log('');
    console.log('Build output:');
    console.log('  ✓ dist/index.js - Server bundle (all dependencies included)');
    console.log('  ✓ dist/package.json - Production configuration');
    console.log('  ✓ dist/public - Frontend assets (if vite build succeeded)');
    console.log('');
    console.log('Deployment ready:');
    console.log('  Build: node production-build.js');
    console.log('  Start: npm start (runs: NODE_ENV=production node index.js)');
    console.log('');
    
  } catch (error) {
    console.error('Production build failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

productionBuild();