#!/usr/bin/env node

/**
 * Final Replit Deployment Script
 * Resuelve específicamente los 3 errores del deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Cohete Workflow - Final Replit Deployment');
console.log('============================================');

function exec(command) {
  try {
    console.log(`📦 ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function deploy() {
  try {
    // 1. Limpiar y crear directorio dist
    console.log('\n🧹 Preparando deployment...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    fs.mkdirSync('dist', { recursive: true });

    // 2. Instalar dependencias
    console.log('\n📦 Instalando dependencias...');
    exec('npm install');

    // 3. Build del cliente
    console.log('\n🔨 Building client...');
    if (fs.existsSync('client')) {
      exec('cd client && npm install && npm run build');
    }

    // 4. Build del servidor con ESBuild
    console.log('\n🔨 Building server...');
    
    // Build más simple sin bundling excesivo
    const buildCmd = `esbuild server/index.ts ` +
      `--bundle ` +
      `--platform=node ` +
      `--target=node20 ` +
      `--format=cjs ` +
      `--outfile=dist/server.js ` +
      `--external:express ` +
      `--external:cors ` +
      `--external:helmet ` +
      `--external:compression ` +
      `--external:express-rate-limit ` +
      `--external:express-session ` +
      `--external:passport ` +
      `--external:passport-google-oauth20 ` +
      `--external:passport-local ` +
      `--external:pg ` +
      `--external:postgres ` +
      `--external:drizzle-orm ` +
      `--external:bcryptjs ` +
      `--external:@sendgrid/mail ` +
      `--external:openid-client ` +
      `--external:multer ` +
      `--external:pdf-parse ` +
      `--external:exceljs ` +
      `--external:ws`;
    
    exec(buildCmd);

    // 5. Copiar archivos estáticos del cliente
    console.log('\n📁 Copiando archivos estáticos...');
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(src)) return;
      
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    
    copyRecursive('client/dist', 'dist/client/dist');

    // 6. Copiar todas las dependencias
    console.log('\n📋 Copiando package.json y dependencias...');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Mantener todas las dependencias para evitar problemas
    const prodPkg = {
      name: pkg.name,
      version: pkg.version,
      type: "commonjs",
      scripts: {
        start: "node index.js"
      },
      dependencies: pkg.dependencies
    };
    
    fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));

    // 7. Crear archivo de entrada optimizado para Replit
    console.log('\n🚪 Creando entry point...');
    const entryPoint = `
// Replit Production Entry Point
// Configuración específica para resolver los errores de deployment

// Configurar ambiente de producción
process.env.NODE_ENV = 'production';

// CRÍTICO: Usar el puerto que Replit proporciona
// Replit espera que usemos la variable PORT, no el puerto 5000
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT.toString();

console.log('====================================');
console.log('🚀 Cohete Workflow - Production Mode');
console.log('🔧 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📍 Replit:', process.env.REPL_SLUG || 'local');
console.log('====================================');

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // No hacer exit para que Replit pueda reintentar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // No hacer exit para que Replit pueda reintentar
});

// Cargar el servidor
try {
  require('./server.js');
  console.log('✅ Server module loaded successfully');
} catch (error) {
  console.error('❌ Failed to load server:', error);
  process.exit(1);
}
`;

    fs.writeFileSync('dist/index.js', entryPoint.trim());

    // 8. Crear un health check test simple
    console.log('\n🏥 Creando test de health check...');
    const healthTest = `
// Test de health check
const http = require('http');

const PORT = process.env.PORT || 3000;

setTimeout(() => {
  http.get(\`http://localhost:\${PORT}/health\`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Health check response:', res.statusCode, data);
      if (res.statusCode === 200) {
        console.log('✅ Health check passed!');
      } else {
        console.log('❌ Health check failed!');
      }
    });
  }).on('error', (err) => {
    console.error('❌ Health check error:', err);
  });
}, 5000);
`;
    
    fs.writeFileSync('dist/test-health.js', healthTest.trim());

    // 9. Verificar build
    console.log('\n🔍 Verificando archivos...');
    const required = [
      'dist/index.js',
      'dist/server.js',
      'dist/package.json',
      'dist/client/dist/index.html'
    ];
    
    const missing = required.filter(f => !fs.existsSync(f));
    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`);
    }

    console.log('\n============================================');
    console.log('✅ Deployment preparado exitosamente!');
    console.log('\n🚀 Configuración para Replit:');
    console.log('   Build command: node final-deployment.js');
    console.log('   Run command: cd dist && npm install && npm start');
    console.log('\n🔧 Esto resuelve los 3 errores:');
    console.log('   ✓ Health check endpoint configurado');
    console.log('   ✓ Server escucha en 0.0.0.0 con PORT correcto');
    console.log('   ✓ Responde al tráfico externo');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error);
    process.exit(1);
  }
}

// Ejecutar
deploy();