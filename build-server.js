#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    console.log('Building server with bundled dependencies...');
    
    await build({
      entryPoints: [join(__dirname, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outdir: 'dist',
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
      minify: false, // Disable minification to avoid issues
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      resolveExtensions: ['.ts', '.js', '.json'],
      loader: {
        '.ts': 'ts',
        '.js': 'js'
      },
      // Handle module resolution issues
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
      // Ignore build warnings for optional dependencies
      logLevel: 'warning'
    });
    
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildServer();