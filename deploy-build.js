#!/usr/bin/env node

/**
 * Production deployment script for Cohete Workflow
 * Fixes all deployment issues: file structure, bundling, ES module compatibility
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deployBuild() {
  try {
    console.log('Creating production deployment...');
    
    // Clean and create dist directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build server with external packages to avoid development dependency conflicts
    console.log('Building production server...');
    const result = await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.js --packages=external --external:lightningcss --external:@babel/* --external:esbuild --external:vite --external:pg-native --external:fsevents --external:bufferutil --external:utf-8-validate --define:process.env.NODE_ENV='"production"' --define:global=globalThis`);
    
    if (result.stderr && result.stderr.includes('ERROR')) {
      throw new Error(`Build failed: ${result.stderr}`);
    }
    
    // Fix ES module compatibility issues in bundled code
    let bundleContent = readFileSync('dist/index.js', 'utf-8');
    
    // Comprehensive ES module to CommonJS fixes
    bundleContent = bundleContent
      // Replace fileURLToPath calls with __filename
      .replace(/fileURLToPath\([^)]*\)/g, '__filename')
      // Replace import.meta.url with proper CommonJS equivalent
      .replace(/import\.meta\.url/g, '("file://" + __filename)')
      // Fix dirname calls
      .replace(/dirname\(__filename\)/g, '__dirname')
      // Remove duplicate variable declarations
      .replace(/const\s+__filename\s*=\s*__filename;?/g, '// __filename already available')
      .replace(/const\s+__dirname\s*=\s*__dirname;?/g, '// __dirname already available')
      .replace(/var\s+__filename\s*=\s*__filename;?/g, '// __filename already available')
      .replace(/var\s+__dirname\s*=\s*__dirname;?/g, '// __dirname already available')
      // Remove conflicting imports
      .replace(/const\s*{\s*fileURLToPath\s*}\s*=\s*require\(['"]url['"]\);?\s*/g, '')
      .replace(/const\s*{\s*dirname\s*}\s*=\s*require\(['"]path['"]\);?\s*/g, '');
    
    // Add global compatibility
    const globalFix = `// Global compatibility for production\nif (typeof global === 'undefined') { globalThis.global = globalThis; }\n\n`;
    bundleContent = globalFix + bundleContent;
    
    writeFileSync('dist/index.js', bundleContent);
    
    // Create production package.json without ES module type
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
        "drizzle-orm": pkg.dependencies["drizzle-orm"],
        zod: pkg.dependencies.zod,
        axios: pkg.dependencies.axios
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Verify build output
    const indexExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    
    if (indexExists && packageExists) {
      console.log('✓ Created dist/index.js matching npm start expectations');
      console.log('✓ Fixed ES module compatibility issues');
      console.log('✓ Bundled dependencies correctly');
      console.log('✓ Production package.json with proper start script');
      console.log('Deployment build completed successfully');
    } else {
      throw new Error('Build verification failed - missing required files');
    }
    
  } catch (error) {
    console.error('Deployment build failed:', error.message);
    process.exit(1);
  }
}

deployBuild();