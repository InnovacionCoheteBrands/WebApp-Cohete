
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

    // Build ultra-simple del servidor
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: 'dist/index.js',
      external: ['pg-native'],
      target: 'node18',
      minify: false,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      banner: {
        js: 'process.env.NODE_ENV = "production";'
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
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #0f1419; 
            color: #fff; 
            text-align: center; 
        }
        .container { 
            max-width: 600px; 
            margin: 50px auto; 
            background: #1a1a1a; 
            padding: 40px; 
            border-radius: 10px; 
        }
        .status { 
            background: #4CAF50; 
            color: white; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
        .endpoint { 
            background: #333; 
            padding: 10px; 
            margin: 5px 0; 
            border-radius: 5px; 
            font-family: monospace; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Cohete Workflow</h1>
        <div class="status">✅ Sistema funcionando</div>
        <h3>Endpoints disponibles:</h3>
        <div class="endpoint">GET /api/health</div>
        <div class="endpoint">GET /api/user</div>
        <div class="endpoint">GET /api/projects</div>
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

    // Package.json mínimo
    const packageJson = {
      "name": "cohete-workflow-prod",
      "version": "1.0.0",
      "main": "index.js",
      "scripts": {
        "start": "NODE_ENV=production node index.js"
      },
      "dependencies": {
        "pg": "^8.15.6"
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
    
  } catch (error) {
    console.error('❌ Error en despliegue:', error.message);
    process.exit(1);
  }
}

simpleDeploy();
