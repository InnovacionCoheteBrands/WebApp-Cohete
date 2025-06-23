
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'server/index.ts'),
      name: 'Server',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        'fs',
        'path',
        'url',
        'crypto',
        'os',
        'util',
        'events',
        'stream',
        'buffer',
        'querystring',
        'http',
        'https',
        'net',
        'tls',
        'zlib',
        'child_process',
        // Database and native modules
        'pg',
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents',
        'sharp',
        'lightningcss'
      ],
      output: {
        globals: {
          'fs': 'fs',
          'path': 'path',
          'url': 'url',
          'crypto': 'crypto',
          'os': 'os',
          'util': 'util',
          'events': 'events',
          'stream': 'stream',
          'buffer': 'buffer',
          'querystring': 'querystring',
          'http': 'http',
          'https': 'https',
          'net': 'net',
          'tls': 'tls',
          'zlib': 'zlib',
          'child_process': 'child_process'
        }
      }
    },
    target: 'node18',
    minify: false,
    sourcemap: false,
    outDir: 'dist'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  optimizeDeps: {
    exclude: [
      'fs',
      'path',
      'url',
      'crypto',
      'os',
      'util',
      'events',
      'stream',
      'buffer',
      'querystring',
      'http',
      'https',
      'net',
      'tls',
      'zlib',
      'child_process',
      'pg',
      'pg-native',
      'bufferutil',
      'utf-8-validate',
      'fsevents',
      'sharp',
      'lightningcss'
    ]
  }
});
