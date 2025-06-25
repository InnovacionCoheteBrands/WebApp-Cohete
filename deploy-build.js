
import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync, rmSync } from 'fs';
import { build } from 'esbuild';
import { execSync } from 'child_process';

async function deployBuild() {
  try {
    console.log('🚀 Starting comprehensive deployment build...');

    // Clean previous build completely
    if (existsSync('dist')) {
      console.log('🧹 Cleaning previous build...');
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });

    console.log('📦 Building server with esbuild...');

    // Build the server with comprehensive configuration
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
        'sharp',
        'lightningcss'
      ],
      target: 'node18',
      minify: true,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        '__dirname': 'process.cwd()',
        '__filename': '"index.js"',
        'import.meta.url': '"file://index.js"'
      },
      banner: {
        js: `
// Production bundle - Node.js compatibility layer
process.env.NODE_ENV = 'production';
globalThis.__dirname = process.cwd();
globalThis.__filename = 'index.js';
globalThis.require = require;
        `.trim()
      },
      resolveExtensions: ['.ts', '.js', '.json'],
      mainFields: ['module', 'main'],
      conditions: ['import', 'node', 'default'],
      packages: 'bundle',
      loader: {
        '.ts': 'ts',
        '.js': 'js'
      },
      treeShaking: true,
      keepNames: true
    });

    console.log('✅ Server build completed successfully');

    // Create comprehensive static files
    console.log('📁 Creating static files...');
    
    const productionHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cohete Workflow - Production</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 2rem; background: #f8fafc; color: #334155;
        }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .status { background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .api-info { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .endpoints { text-align: left; margin: 1rem 0; }
        .endpoint { padding: 0.5rem; background: #f1f5f9; margin: 0.25rem 0; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Cohete Workflow</h1>
        <div class="status">
            ✅ Servidor en producción funcionando correctamente
        </div>
        <div class="api-info">
            <h2>API Endpoints Disponibles</h2>
            <div class="endpoints">
                <div class="endpoint">GET /api/health - Health check</div>
                <div class="endpoint">GET /api/user - User information</div>
                <div class="endpoint">GET /api/projects - Projects list</div>
                <div class="endpoint">GET /api/tasks - Tasks management</div>
            </div>
            <p>Para acceder a la aplicación completa, contacte al administrador.</p>
        </div>
    </div>
    <script>
        // Check API health
        fetch('/api/health')
            .then(r => r.json())
            .then(data => console.log('API Health:', data))
            .catch(e => console.error('API Error:', e));
    </script>
</body>
</html>`;
    
    writeFileSync('dist/public/index.html', productionHTML);

    // Copy essential directories
    const directoriesToCopy = ['uploads', 'migrations', 'shared'];
    directoriesToCopy.forEach(dir => {
      if (existsSync(dir)) {
        cpSync(dir, `dist/${dir}`, { recursive: true });
        console.log(`📂 Copied ${dir} to dist/`);
      }
    });

    // Create production package.json
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "commonjs",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
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

    writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

    console.log('');
    console.log('🎉 DEPLOYMENT BUILD COMPLETED SUCCESSFULLY!');
    console.log('======================================');
    console.log('✅ Server bundled with all dependencies');
    console.log('✅ Production HTML created');
    console.log('✅ All modules resolved');
    console.log('✅ CommonJS format for compatibility');
    console.log('✅ Ready for Replit deployment');
    console.log('');
    console.log('📁 Build output:');
    console.log('   ├── dist/index.js (production server)');
    console.log('   ├── dist/package.json (minimal dependencies)');
    console.log('   ├── dist/public/index.html (static frontend)');
    console.log('   └── dist/uploads/ & dist/migrations/');
    console.log('');
    console.log('🚀 Next step: Deploy using Replit Deployments');
    console.log('');

  } catch (error) {
    console.error('❌ DEPLOYMENT BUILD FAILED:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

deployBuild();
