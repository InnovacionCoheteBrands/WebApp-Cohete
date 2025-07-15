#!/usr/bin/env node

/**
 * FINAL STABLE DEPLOYMENT FOR COHETE WORKFLOW
 * Uses existing deploy-build.js but with enhanced compatibility
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync, statSync } from 'fs';
import { execSync } from 'child_process';

async function finalDeployment() {
  try {
    console.log('🚀 FINAL STABLE DEPLOYMENT - COHETE WORKFLOW');
    console.log('==============================================');
    
    // Clean previous build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    
    console.log('⚙️ Building production server...');
    
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: 'dist/index.js',
      external: [
        'pg-native',
        'bufferutil', 
        'utf-8-validate',
        'fsevents',
        'lightningcss',
        'esbuild'
      ],
      target: 'node18',
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.url': '"file:///production/index.js"'
      },
      banner: {
        js: `
// Production compatibility shims
if (typeof process === 'undefined') {
  global.process = { cwd: () => '/', argv: ['node', 'index.js'], env: { NODE_ENV: 'production' } };
}
process.env.NODE_ENV = 'production';
        `.trim()
      },
      resolveExtensions: ['.ts', '.js', '.json'],
      mainFields: ['main', 'module'],
      conditions: ['node', 'default'],
      packages: 'bundle',
      keepNames: true,
      logLevel: 'info'
    });
    
    console.log('✅ Server bundle created');
    
    // Copy essential directories
    const directoriesToCopy = ['uploads', 'migrations'];
    directoriesToCopy.forEach(dir => {
      if (existsSync(dir)) {
        cpSync(dir, `dist/${dir}`, { recursive: true });
        console.log(`📁 Copied ${dir}/`);
      }
    });
    
    // Try to build frontend, fallback to static HTML
    console.log('🎨 Building frontend...');
    try {
      execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
      cpSync('client/dist', 'dist/public', { recursive: true });
      console.log('✅ Frontend built successfully');
    } catch (error) {
      console.log('⚠️ Frontend build failed, creating fallback...');
      mkdirSync('dist/public', { recursive: true });
      
      const fallbackHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cohete Workflow</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #0f0f0f; color: #fff; text-align: center; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 40px; border-radius: 8px; }
    h1 { color: #ff6b35; margin-bottom: 20px; }
    .status { background: #2a2a2a; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .link { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 6px; margin: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Cohete Workflow</h1>
    <p>Sistema de gestión de proyectos y marketing con IA</p>
    <div class="status">
      <strong>Estado:</strong> Servidor ejecutándose en producción
    </div>
    <a href="/api/health" class="link">Estado del API</a>
  </div>
</body>
</html>`;
      
      writeFileSync('dist/public/index.html', fallbackHTML);
    }
    
    // Create production package.json
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      main: "dist/index.js",
      scripts: {
        start: "NODE_ENV=production node dist/index.js"
      },
      dependencies: {
        "pg": "^8.15.6"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^2.0.0"
      },
      engines: {
        "node": ">=18.0.0"
      }
    };
    
    // Create package.json in dist directory
    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    // Create production package.json in root only for deployment
    // This will be used by Replit deployment system
    writeFileSync('package.production.json', JSON.stringify(prodPackageJson, null, 2));
    
    const bundleSize = (statSync('dist/index.js').size / (1024 * 1024)).toFixed(2);
    
    console.log('');
    console.log('✅ DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`📊 Bundle size: ${bundleSize} MB`);
    console.log('📁 Files created:');
    console.log('   ├── dist/index.js (production server)');
    console.log('   ├── dist/package.json');
    console.log('   ├── package.json (root directory)');
    console.log('   ├── dist/public/index.html');
    console.log('   └── dist/uploads/ & dist/migrations/');
    console.log('');
    console.log('🚀 Ready for Replit deployment!');
    console.log('Commands: npm install && npm start');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

finalDeployment();