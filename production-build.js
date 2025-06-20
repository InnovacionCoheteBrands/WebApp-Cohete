#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function productionBuild() {
  try {
    console.log('Creating production build...');
    
    // Build server with ALL dependencies bundled (including cors, express)
    await build({
      entryPoints: [join(__dirname, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: 'dist/index.js',
      external: [
        // Only externalize native binary modules that can't be bundled
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents'
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
      logLevel: 'info'
    });

    // Create a simple package.json for production
    const prodPackageJson = {
      name: "rest-express-production",
      version: "1.0.0",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        // Only include dependencies that can't be bundled
        "pg-native": "^3.1.0"
      }
    };

    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
    
    console.log('✅ Production build completed successfully!');
    console.log('📦 All dependencies (cors, express, drizzle-orm, etc.) are bundled');
    console.log('🚀 Ready for deployment - will use npm start in production');
    
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.text));
    }
    process.exit(1);
  }
}

productionBuild();