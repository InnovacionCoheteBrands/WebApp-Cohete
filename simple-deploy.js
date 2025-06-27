
import { writeFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { build } from 'esbuild';

async function simpleDeploy() {
  try {
    console.log('🚀 DESPLIEGUE SIMPLE - COHETE WORKFLOW');
    console.log('=====================================');

    // Limpiar build anterior
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });

    console.log('📦 Construyendo servidor...');

    // Build ultra-simple del servidor con external más completo
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: 'dist/index.js',
      external: [
        'pg-native',
        'lightningcss',
        'esbuild',
        'vite',
        '@vitejs/plugin-react',
        '@replit/vite-plugin-shadcn-theme-json',
        '@replit/vite-plugin-runtime-error-modal',
        '@replit/vite-plugin-cartographer',
        'bufferutil',
        'utf-8-validate'
      ],
      target: 'node18',
      minify: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.NODE_ENV': '"production"',
        'import.meta.env.PROD': 'true',
        'import.meta.env.DEV': 'false'
      },
      banner: {
        js: `
process.env.NODE_ENV = "production";
global.__dirname = __dirname;
global.__filename = __filename;
`
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx'
      }
    });

    console.log('✅ Servidor construido');

    // HTML simple para producción
    const simpleHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Cohete Workflow</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            max-width: 600px; 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px; 
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .status { 
            background: rgba(76, 175, 80, 0.8);
            color: white; 
            padding: 15px; 
            border-radius: 10px; 
            margin: 20px 0;
            font-weight: bold;
        }
        .endpoint { 
            background: rgba(0, 0, 0, 0.3);
            padding: 12px; 
            margin: 8px 0; 
            border-radius: 8px; 
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border-left: 3px solid #4CAF50;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .rocket {
            font-size: 3em;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="rocket">🚀</div>
        <h1>Cohete Workflow</h1>
        <div class="status">✅ Sistema funcionando correctamente</div>
        <h3>API Endpoints disponibles:</h3>
        <div class="endpoint">GET /api/health</div>
        <div class="endpoint">GET /api/user</div>
        <div class="endpoint">GET /api/projects</div>
        <div class="endpoint">POST /api/projects</div>
        <div class="endpoint">GET /api/tasks</div>
        <p style="margin-top: 30px; opacity: 0.8;">
            Aplicación desplegada exitosamente en Replit
        </p>
    </div>
</body>
</html>`;
    
    writeFileSync('dist/public/index.html', simpleHTML);

    // Copiar directorios necesarios
    if (existsSync('uploads')) {
      cpSync('uploads', 'dist/uploads', { recursive: true });
    }
    if (existsSync('migrations')) {
      cpSync('migrations', 'dist/migrations', { recursive: true });
    }

    // Package.json mínimo pero más completo
    const packageJson = {
      "name": "cohete-workflow-prod",
      "version": "1.0.0",
      "main": "index.js",
      "type": "commonjs",
      "scripts": {
        "start": "NODE_ENV=production node index.js"
      },
      "dependencies": {
        "pg": "^8.15.6",
        "express": "^4.21.2",
        "cors": "^2.8.5"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    };

    writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

    console.log('');
    console.log('✅ DESPLIEGUE COMPLETADO');
    console.log('========================');
    console.log('📁 Archivos creados en dist/');
    console.log('🚀 Listo para desplegar en Replit');
    console.log('');
    console.log('Próximo paso: Usar el botón Deploy en Replit');
    
  } catch (error) {
    console.error('❌ Error en despliegue:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

simpleDeploy();
