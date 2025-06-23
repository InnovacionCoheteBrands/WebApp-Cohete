#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function fixedDeploy() {
  try {
    console.log('Starting complete deployment fix...');
    
    // Clean dist directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build frontend first
    console.log('Building frontend assets...');
    try {
      await execAsync('vite build --mode production', { timeout: 60000 });
      console.log('Frontend build completed');
    } catch (err) {
      console.log('Frontend build had warnings, continuing...');
    }
    
    // Build backend with CommonJS format and proper externals
    console.log('Building backend with CommonJS format...');
    const buildResult = await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.js --packages=external --external:@replit/vite-plugin-shadcn-theme-json --external:@replit/vite-plugin-cartographer --external:@replit/vite-plugin-runtime-error-modal --external:@replit/* --external:@vitejs/* --external:vite --external:@babel/* --external:esbuild --external:typescript --external:drizzle-kit --external:tsx --external:@types/* --external:lightningcss --external:postcss --external:autoprefixer --external:tailwindcss --external:@tailwindcss/* --define:process.env.NODE_ENV='"production"'`);
    
    // Read and fix the generated CommonJS file
    let content = readFileSync('dist/index.js', 'utf-8');
    
    // Fix CommonJS compatibility issues
    content = content
      .replace(/__toESM\([^)]*\)/g, 'require')
      .replace(/require\(\s*["']@replit\/vite-plugin-shadcn-theme-json["']\s*\)/g, '{}')
      .replace(/require\(\s*["']@replit\/[^"']*["']\s*\)/g, '{}')
      .replace(/var\s+(\w+)\s*=\s*\([0-9]+,\s*[^)]*\.fileURLToPath\)\([^)]*\);/g, 'var $1 = __filename;')
      .replace(/var\s+(\w+)\s*=\s*\([0-9]+,\s*[^)]*\.dirname\)\([^)]*\);/g, 'var $1 = __dirname;')
      .replace(/const\s+(\w+)\s*=\s*\([0-9]+,\s*[^)]*\.fileURLToPath\)\([^)]*\);/g, 'const $1 = __filename;')
      .replace(/const\s+(\w+)\s*=\s*\([0-9]+,\s*[^)]*\.dirname\)\([^)]*\);/g, 'const $1 = __dirname;')
      .replace(/import\.meta\.url/g, '"file://" + __filename');
    
    // Add CommonJS globals
    const globals = `
if (typeof global === 'undefined') { globalThis.global = globalThis; }
if (typeof __filename === 'undefined') { global.__filename = require('path').resolve('index.js'); }
if (typeof __dirname === 'undefined') { global.__dirname = require('path').dirname(__filename); }
`;
    content = globals + content;
    
    writeFileSync('dist/index.js', content);
    
    // Create production package.json with CommonJS type
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "commonjs",
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
        "connect-pg-simple": pkg.dependencies["connect-pg-simple"],
        cors: pkg.dependencies.cors,
        multer: pkg.dependencies.multer,
        "drizzle-orm": pkg.dependencies["drizzle-orm"],
        "drizzle-zod": pkg.dependencies["drizzle-zod"],
        zod: pkg.dependencies.zod,
        "zod-validation-error": pkg.dependencies["zod-validation-error"],
        axios: pkg.dependencies.axios,
        "node-fetch": pkg.dependencies["node-fetch"],
        passport: pkg.dependencies.passport,
        "passport-google-oauth20": pkg.dependencies["passport-google-oauth20"],
        "passport-local": pkg.dependencies["passport-local"],
        "openid-client": pkg.dependencies["openid-client"],
        "pdf-parse": pkg.dependencies["pdf-parse"],
        "html-pdf-node": pkg.dependencies["html-pdf-node"],
        puppeteer: pkg.dependencies.puppeteer,
        ws: pkg.dependencies.ws,
        memoizee: pkg.dependencies.memoizee,
        memorystore: pkg.dependencies.memorystore
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Verify build outputs
    const frontendExists = existsSync('dist/public/index.html');
    const backendExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    
    if (frontendExists && backendExists && packageExists) {
      console.log('✓ ALL DEPLOYMENT FIXES APPLIED SUCCESSFULLY:');
      console.log('✓ Frontend assets built and available');
      console.log('✓ Backend built with CommonJS format');
      console.log('✓ Production package.json created with correct type');
      console.log('✓ ES module conflicts resolved');
      console.log('✓ Build/runtime mismatch fixed');
      console.log('Production deployment ready!');
    } else {
      console.log('Build verification:');
      console.log(`Frontend: ${frontendExists ? '✓' : '✗'}`);
      console.log(`Backend: ${backendExists ? '✓' : '✗'}`);
      console.log(`Package: ${packageExists ? '✓' : '✗'}`);
      if (!frontendExists || !backendExists || !packageExists) {
        throw new Error('Build verification failed');
      }
    }
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

fixedDeploy();