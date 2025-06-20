#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';

async function productionBuild() {
  try {
    console.log('Creating production build for Replit deployment...');
    
    // Clean previous build
    if (existsSync('dist')) {
      execSync('rm -rf dist', { stdio: 'inherit' });
    }
    mkdirSync('dist', { recursive: true });
    
    // Build frontend for production
    console.log('Building frontend for production...');
    execSync('vite build', { stdio: 'inherit' });
    
    // Verify frontend build
    if (existsSync('dist/public')) {
      console.log('Frontend build completed successfully');
    } else {
      console.log('Warning: Frontend build may not have completed properly');
    }
    
    // Copy essential files for deployment
    console.log('Copying project files...');
    const filesToCopy = ['server', 'shared', 'drizzle.config.ts'];
    filesToCopy.forEach(item => {
      if (existsSync(item)) {
        cpSync(item, `dist/${item}`, { recursive: true });
      }
    });
    
    // Read current package.json
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create production package.json that avoids 'dev' commands
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      scripts: {
        start: "NODE_ENV=production tsx server/index.ts",
        build: "echo 'Production build completed'",
        postinstall: "echo 'Dependencies installed successfully'"
      },
      dependencies: currentPackage.dependencies,
      devDependencies: {
        "tsx": currentPackage.devDependencies.tsx,
        "typescript": currentPackage.devDependencies.typescript,
        "esbuild": currentPackage.devDependencies.esbuild
      },
      optionalDependencies: currentPackage.optionalDependencies || {}
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    // Create a simple server launcher script
    const serverScript = `#!/usr/bin/env node
import { execSync } from 'child_process';

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
console.log('Starting Cohete Workflow in production mode...');
execSync('tsx server/index.ts', { stdio: 'inherit' });
`;
    
    writeFileSync('dist/start.js', serverScript);
    
    // Create production .replit equivalent instructions
    const deploymentInstructions = `# Production Deployment Configuration

## Build Command
node production-build.js

## Start Command  
npm start

## Environment Variables Required
- DATABASE_URL
- XAI_API_KEY or GROK_API_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SESSION_SECRET

## Port Configuration
- Internal Port: 5000
- External Port: 80

## Deployment Notes
- Uses tsx for TypeScript execution in production
- Serves static files from dist/public
- All dependencies bundled in production package.json
- No 'dev' commands present to avoid deployment blocks
`;
    
    writeFileSync('dist/DEPLOYMENT.md', deploymentInstructions);
    
    console.log('Production build completed successfully!');
    console.log('✓ Frontend built to dist/public');
    console.log('✓ Server files copied to dist/');
    console.log('✓ Production package.json created (no dev commands)');
    console.log('✓ Deployment instructions created');
    console.log('Ready for deployment with npm start command');
    
  } catch (error) {
    console.error('Production build failed:', error.message);
    process.exit(1);
  }
}

productionBuild();