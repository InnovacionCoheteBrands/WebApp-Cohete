#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';

async function productionBuild() {
  try {
    console.log('🚀 Creating production build for deployment...');
    
    // Clean previous build
    if (existsSync('dist')) {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build frontend with production optimizations
    console.log('📦 Building frontend...');
    execSync('npx vite build --mode production --base=/', { stdio: 'inherit' });
    
    // Bundle server with esbuild for production
    console.log('⚡ Bundling server...');
    execSync(`npx esbuild server/index.ts --platform=node --bundle --format=esm --outfile=dist/server.js --external:pg-native --external:bufferutil --external:utf-8-validate --external:fsevents --define:process.env.NODE_ENV='"production"'`, { stdio: 'inherit' });
    
    // Copy necessary config files
    console.log('📋 Copying configuration files...');
    const filesToCopy = ['drizzle.config.ts'];
    filesToCopy.forEach(file => {
      if (existsSync(file)) {
        cpSync(file, `dist/${file}`);
      }
    });

    // Read the current package.json to get dependencies
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create minimal production package.json
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0", 
      type: "module",
      scripts: {
        start: "NODE_ENV=production node server.js",
        build: "echo 'Already built'"
      },
      dependencies: {
        // Only external native dependencies needed for production
        "pg": currentPackage.dependencies.pg,
        "bufferutil": currentPackage.optionalDependencies?.bufferutil || "^4.0.8"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^6.0.4"
      }
    };

    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    // Create a simple start script that doesn't require tsx in production
    const startScript = `#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.env.NODE_ENV = 'production';
import('./server.js');
`;
    writeFileSync('dist/start.js', startScript);
    
    console.log('✅ Production build completed successfully!');
    console.log('📦 Frontend: Built and optimized');
    console.log('⚡ Server: Bundled with all dependencies');
    console.log('🎯 Deployment ready with minimal dependencies');
    console.log('🚀 Start command: "node start.js"');
    
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    process.exit(1);
  }
}

productionBuild();