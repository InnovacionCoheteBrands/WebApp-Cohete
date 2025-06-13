#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployBuild() {
  try {
    console.log('Building for deployment...');
    
    // Build frontend with Vite (faster approach)
    console.log('Building frontend...');
    execSync('npx vite build --mode production', { stdio: 'inherit' });
    
    // Build server with all dependencies bundled
    console.log('Building server...');
    await build({
      entryPoints: [join(__dirname, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outdir: 'dist',
      external: [
        // Externalize only problematic native modules
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents',
        'sharp',
        'lightningcss',
        '@babel/preset-typescript',
        'esbuild',
        'vite'
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
    
    console.log('✅ Deployment build completed successfully!');
    console.log('The server bundle includes all dependencies (cors, express, etc.)');
    console.log('Ready for deployment with: NODE_ENV=production node dist/index.js');
    
  } catch (error) {
    console.error('❌ Deployment build failed:', error.message);
    process.exit(1);
  }
}

deployBuild();