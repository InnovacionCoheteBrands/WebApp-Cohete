#!/usr/bin/env node

/**
 * Replit Production Deployment Build Script
 * Optimizado específicamente para Replit Autoscale Deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Cohete Workflow - Replit Production Build');
console.log('============================================');

// Función para ejecutar comandos con manejo de errores
function exec(command, options = {}) {
  try {
    console.log(`📦 Ejecutando: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    console.log('✅ Completado');
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Función para copiar archivos recursivamente
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  const startTime = Date.now();

  try {
    // 1. Limpiar directorio de build anterior
    console.log('\n🧹 Limpiando builds anteriores...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    fs.mkdirSync('dist', { recursive: true });

    // 2. Build del cliente
    console.log('\n🔨 Building client...');
    if (!exec('cd client && npm install && npm run build')) {
      throw new Error('Client build failed');
    }

    // 3. Build del servidor con ESBuild
    console.log('\n🔨 Building server...');
    const buildCommand = `esbuild server/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/server.js --external:pg-native --external:@mapbox/node-pre-gyp --external:aws-crt --external:mock-aws-s3 --external:nock --minify`;
    
    if (!exec(buildCommand)) {
      throw new Error('Server build failed');
    }

    // 4. Copiar archivos del cliente al dist
    console.log('\n📁 Copiando archivos del cliente...');
    copyRecursive('client/dist', 'dist/client/dist');

    // 5. Crear package.json optimizado para producción
    console.log('\n📝 Creando package.json de producción...');
    const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const productionPackage = {
      name: originalPackage.name,
      version: originalPackage.version,
      type: "commonjs", // Cambiado a commonjs para el bundle
      scripts: {
        start: "node server.js"
      },
      dependencies: {
        // Solo las dependencias runtime críticas que no se pueden bundlear
        "pg": originalPackage.dependencies.pg,
        "postgres": originalPackage.dependencies.postgres,
        "bcryptjs": originalPackage.dependencies.bcryptjs
      }
    };

    fs.writeFileSync(
      'dist/package.json', 
      JSON.stringify(productionPackage, null, 2)
    );

    // 6. Copiar archivos necesarios
    console.log('\n📋 Copiando archivos adicionales...');
    const filesToCopy = ['.env.example', 'drizzle.config.ts'];
    
    filesToCopy.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join('dist', file));
      }
    });

    // 7. Crear archivo de entrada para Replit
    console.log('\n🚪 Creando archivo de entrada...');
    const entryFile = `
// Replit Production Entry Point
process.env.NODE_ENV = 'production';

// Configurar puerto para Replit
const PORT = process.env.PORT || 80;
process.env.PORT = PORT;

console.log('🚀 Starting Cohete Workflow on port', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔧 Replit:', process.env.REPL_SLUG || 'local');

// Iniciar servidor
require('./server.js');
`;

    fs.writeFileSync('dist/index.js', entryFile.trim());

    // 8. Verificar el build
    console.log('\n🔍 Verificando build...');
    const requiredFiles = [
      'dist/index.js',
      'dist/server.js', 
      'dist/client/dist/index.html',
      'dist/package.json'
    ];

    const missing = requiredFiles.filter(file => !fs.existsSync(file));
    if (missing.length > 0) {
      throw new Error(`Missing files: ${missing.join(', ')}`);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n================================================');
    console.log('✅ Build completado exitosamente!');
    console.log(`⏱️  Tiempo total: ${duration}s`);
    console.log('\n📦 Archivos de producción creados en ./dist');
    console.log('\n🚀 Para desplegar en Replit:');
    console.log('   1. Build command: node replit-production-deploy.js');
    console.log('   2. Run command: cd dist && npm install --production && npm start');
    console.log('   3. Port: Automático (usa process.env.PORT)');
    console.log('================================================\n');

  } catch (error) {
    console.error('\n💥 Build failed:', error.message);
    process.exit(1);
  }
}

// Ejecutar build
build();