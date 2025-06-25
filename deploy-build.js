
import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync, rmSync } from 'fs';
import { build } from 'esbuild';
import { execSync } from 'child_process';

async function debugDeployBuild() {
  try {
    console.log('🔍 DEBUG DEPLOY - COHETE WORKFLOW');
    console.log('=================================');

    // Limpiar build anterior completamente
    if (existsSync('dist')) {
      console.log('🧹 Limpiando build anterior...');
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });

    console.log('📦 Construyendo servidor sin dependencias problemáticas...');

    // Build del servidor con configuración ultra-estable
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
        'lightningcss',
        'esbuild'
      ],
      target: 'node18',
      minify: false, // Sin minificar para debug
      sourcemap: true, // Con sourcemap para debug
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.url': '"file:///production/index.js"'
      },
      banner: {
        js: `
// DEBUG PRODUCTION BUNDLE
const path = require('path');
const url = require('url');
process.env.NODE_ENV = 'production';
global.__dirname = process.cwd();
global.__filename = 'index.js';

// Mock import.meta for compatibility
if (typeof globalThis.importMeta === 'undefined') {
  globalThis.importMeta = {
    url: 'file://' + path.join(process.cwd(), 'index.js')
  };
}
        `.trim()
      },
      resolveExtensions: ['.ts', '.js', '.json'],
      mainFields: ['main', 'module'],
      conditions: ['node', 'default'],
      packages: 'bundle',
      loader: {
        '.ts': 'ts',
        '.js': 'js'
      },
      keepNames: true,
      logLevel: 'info'
    });

    console.log('✅ Servidor construido exitosamente');

    // Crear HTML de producción simple pero funcional
    const productionHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Cohete Workflow - Producción</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { 
            max-width: 800px; text-align: center; background: rgba(255,255,255,0.1);
            padding: 3rem; border-radius: 20px; backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .status { 
            background: linear-gradient(45deg, #4CAF50, #45a049); color: white; 
            padding: 1.5rem; border-radius: 12px; margin: 2rem 0; font-size: 1.2em;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        .api-info { 
            background: rgba(255,255,255,0.15); padding: 2rem; border-radius: 15px; 
            margin: 2rem 0; backdrop-filter: blur(5px);
        }
        .endpoints { text-align: left; margin: 1.5rem 0; }
        .endpoint { 
            padding: 1rem; background: rgba(255,255,255,0.1); margin: 0.5rem 0; 
            border-radius: 8px; font-family: 'Courier New', monospace; font-size: 0.9em;
            border-left: 4px solid #4CAF50;
        }
        .logo { font-size: 4rem; margin-bottom: 1rem; }
        .version { opacity: 0.7; font-size: 0.9em; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>Cohete Workflow</h1>
        <div class="status">
            ✅ Sistema desplegado y funcionando correctamente
        </div>
        <div class="api-info">
            <h2>🔗 Endpoints API Disponibles</h2>
            <div class="endpoints">
                <div class="endpoint">GET /api/health - Verificación de estado</div>
                <div class="endpoint">GET /api/user - Información de usuario</div>
                <div class="endpoint">GET /api/projects - Lista de proyectos</div>
                <div class="endpoint">GET /api/tasks - Gestión de tareas</div>
                <div class="endpoint">POST /api/auth/login - Autenticación</div>
            </div>
        </div>
        <div class="version">
            Versión: 1.0.0 | Build: ${new Date().toISOString()}
        </div>
    </div>
    <script>
        // Verificar estado del API
        fetch('/api/health')
            .then(r => r.json())
            .then(data => {
                console.log('✅ API Status:', data);
                if (data.status === 'OK') {
                    document.querySelector('.status').innerHTML = '✅ API funcionando correctamente - ' + data.timestamp;
                }
            })
            .catch(e => {
                console.error('❌ API Error:', e);
                document.querySelector('.status').innerHTML = '⚠️ API no disponible temporalmente';
                document.querySelector('.status').style.background = 'linear-gradient(45deg, #ff9800, #f57c00)';
            });
    </script>
</body>
</html>`;
    
    writeFileSync('dist/public/index.html', productionHTML);

    // Copiar directorios esenciales
    const directoriesToCopy = ['uploads', 'migrations', 'shared'];
    directoriesToCopy.forEach(dir => {
      if (existsSync(dir)) {
        cpSync(dir, `dist/${dir}`, { recursive: true });
        console.log(`📂 Copiado ${dir}/ a dist/`);
      }
    });

    // Crear package.json optimizado para producción
    const prodPackageJson = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      description: "Sistema de gestión de proyectos y marketing con IA",
      type: "commonjs",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js",
        debug: "NODE_ENV=production node --inspect index.js"
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

    // Crear archivo de configuración de entorno
    const envConfig = `# Cohete Workflow - Production Environment
NODE_ENV=production
PORT=5000
# Add your environment variables here
`;
    writeFileSync('dist/.env.production', envConfig);

    console.log('');
    console.log('🎉 DEBUG DEPLOY COMPLETADO EXITOSAMENTE!');
    console.log('=========================================');
    console.log('✅ Servidor bundleado sin dependencias problemáticas');
    console.log('✅ HTML de producción creado');
    console.log('✅ Configuración estable sin import.meta');
    console.log('✅ Sourcemaps habilitados para debug');
    console.log('✅ Formato CommonJS para máxima compatibilidad');
    console.log('');
    console.log('📊 Archivos creados:');
    console.log('   ├── dist/index.js (servidor de producción)');
    console.log('   ├── dist/index.js.map (sourcemap para debug)');
    console.log('   ├── dist/package.json (dependencias mínimas)');
    console.log('   ├── dist/public/index.html (interfaz web)');
    console.log('   └── dist/.env.production (configuración)');
    console.log('');
    console.log('🚀 LISTO PARA DESPLIEGUE EN REPLIT');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('   1. Usar configuración de deployment actualizada');
    console.log('   2. Build: node deploy-build.js');
    console.log('   3. Run: cd dist && npm install && npm start');
    console.log('');

  } catch (error) {
    console.error('❌ DEBUG DEPLOY FALLÓ:', error.message);
    console.error('');
    console.error('🔍 Detalles del error:');
    console.error(error);
    console.error('');
    console.error('📋 Información de debug:');
    console.error('- Node Version:', process.version);
    console.error('- Working Directory:', process.cwd());
    console.error('- Available Files:', existsSync('server/index.ts') ? '✅ server/index.ts exists' : '❌ server/index.ts missing');
    process.exit(1);
  }
}

debugDeployBuild();
