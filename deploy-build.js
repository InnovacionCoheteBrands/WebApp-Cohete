
#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';
import { build } from 'esbuild';

async function deployBuild() {
  try {
    console.log('Creating deployment-ready build...');
    
    // Clean previous build
    if (existsSync('dist')) {
      console.log('Cleaning previous build...');
      await import('fs').then(fs => fs.rmSync('dist', { recursive: true, force: true }));
    }
    mkdirSync('dist', { recursive: true });
    
    console.log('Building server with esbuild...');
    
    // Build the server with esbuild
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/index.js',
      external: [
        // Only externalize problematic native modules
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents',
        'sharp',
        'lightningcss'
      ],
      target: 'node18',
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"'
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
      }
    });
    
    console.log('Server build completed, copying additional files...');
    
    // Copy essential directories if they exist
    const directoriesToCopy = ['shared', 'uploads', 'client/dist'];
    directoriesToCopy.forEach(dir => {
      if (existsSync(dir)) {
        cpSync(dir, `dist/${dir}`, { recursive: true });
        console.log(`Copied ${dir} to dist/`);
      }
    });
    
    // Read current package.json
    const currentPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    // Create production package.json
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js",
        build: "echo 'Production build completed'",
        postinstall: "echo 'Dependencies installed'"
      },
      dependencies: {
        // Only include essential runtime dependencies
        "pg": currentPackage.dependencies?.pg || "^8.13.0"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^2.0.0"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    // Create deployment configuration
    const deploymentConfig = {
      build: "node deploy-build.js",
      start: "npm start",
      port: 5000,
      environment: "production",
      notes: [
        "Bundled server with all dependencies",
        "Uses esbuild for TypeScript compilation",
        "Self-contained deployment package",
        "Minimal runtime dependencies"
      ]
    };
    
    writeFileSync('dist/deployment-config.json', JSON.stringify(deploymentConfig, null, 2));
    
    console.log('✓ Deployment build completed successfully!');
    console.log('✓ Server transpiled to dist/index.js');
    console.log('✓ Production package.json created');
    console.log('✓ All dependencies bundled');
    console.log('');
    console.log('Ready for deployment:');
    console.log('  Build command: node deploy-build.js');
    console.log('  Start command: npm start');
    console.log('  Entry point: dist/index.js');
    console.log('');
    
  } catch (error) {
    console.error('Deployment build failed:', error.message);
    process.exit(1);
  }
}

deployBuild();
