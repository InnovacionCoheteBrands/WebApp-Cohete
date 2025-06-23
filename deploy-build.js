
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
        // Externalize all native and problematic modules
        'pg-native',
        'bufferutil',
        'utf-8-validate',
        'fsevents',
        'sharp',
        'lightningcss',
        '@babel/preset-typescript',
        'esbuild',
        'typescript'
      ],
      target: 'node18',
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        // Define global variables to avoid dynamic requires
        '__dirname': 'process.cwd()',
        '__filename': '"index.js"'
      },
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make fs available globally to avoid dynamic require issues
global.fs = fs;
global.path = path;
global.__dirname = __dirname;
global.__filename = __filename;
        `.trim()
      },
      // Replace dynamic requires with static imports
      plugins: [{
        name: 'replace-dynamic-requires',
        setup(build) {
          build.onLoad({ filter: /\.(ts|js)$/ }, async (args) => {
            const contents = await fs.readFileSync(args.path, 'utf8');
            
            // Replace dynamic fs requires
            const modified = contents
              .replace(/require\(['"]fs['"]\)/g, 'fs')
              .replace(/require\(['"]path['"]\)/g, 'path')
              .replace(/require\(['"]url['"]\)/g, 'url')
              .replace(/require\.resolve\(/g, 'import.meta.resolve(')
              .replace(/__dirname/g, 'process.cwd()')
              .replace(/require\(['"]node:fs['"]\)/g, 'fs')
              .replace(/require\(['"]node:path['"]\)/g, 'path')
              .replace(/require\(['"]node:url['"]\)/g, 'url');
            
            return { contents: modified };
          });
        }
      }],
      // Resolve extensions for better compatibility
      resolveExtensions: ['.ts', '.js', '.json'],
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'default']
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
        // Include essential dependencies that can't be bundled
        "pg": currentPackage.dependencies?.pg || "^8.13.0"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^2.0.0"
      },
      engines: {
        "node": ">=18.0.0"
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
        "Bundled server with ESM compatibility",
        "Fixed dynamic require issues",
        "Self-contained deployment package",
        "Minimal runtime dependencies"
      ]
    };
    
    writeFileSync('dist/deployment-config.json', JSON.stringify(deploymentConfig, null, 2));
    
    console.log('✓ Deployment build completed successfully!');
    console.log('✓ Server transpiled to dist/index.js');
    console.log('✓ ESM/CommonJS compatibility fixed');
    console.log('✓ Dynamic require issues resolved');
    console.log('✓ Production package.json created');
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
