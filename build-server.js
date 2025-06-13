#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    await build({
      entryPoints: [join(__dirname, 'server/index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outdir: 'dist',
      external: [
        // Only externalize native modules that can't be bundled
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents'
      ],
      // Bundle all other dependencies including cors, express, etc.
      packages: 'bundle',
      target: 'node18',
      minify: true,
      sourcemap: true,
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log('Server built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildServer();