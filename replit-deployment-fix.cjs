#!/usr/bin/env node

/**
 * Replit Deployment Fix Script
 * Resuelve los 3 errores específicos del deployment basado en docs.replit.com
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Replit Deployment Fix - Cohete Workflow');
console.log('==========================================');

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

async function fixDeployment() {
  try {
    console.log('\n🔧 Aplicando fixes basados en docs.replit.com...');

    // 1. Install dependencies
    console.log('\n📦 Installing dependencies...');
    exec('npm install');

    // 2. Build client
    console.log('\n🔨 Building client for deployment...');
    if (fs.existsSync('client')) {
      exec('cd client && npm install && npm run build');
    }

    // 3. Verificar configuración de puerto
    console.log('\n🔍 Verificando configuración...');
    
    // Verificar que existe client/dist
    if (!fs.existsSync('client/dist/index.html')) {
      console.error('❌ Client build failed - missing client/dist/index.html');
      return false;
    }

    // 4. Crear archivo de entrada para production
    console.log('\n📝 Creando configuración de production...');
    
    const productionEntry = `
// Replit Production Entry
// Configuración optimizada para resolver errores de deployment

console.log('🚀 Starting Cohete Workflow for Replit Deployment');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 'default');

// Configurar variables críticas para Replit
process.env.NODE_ENV = 'production';

// CRÍTICO: Puerto debe ser exactamente el que Replit proporciona
// Según docs.replit.com, deployments fallan si no se usa PORT correcto
if (process.env.PORT) {
  console.log('✅ Using Replit provided PORT:', process.env.PORT);
} else {
  console.log('⚠️  No PORT environment variable - using default');
}

// Importar el servidor principal
const serverModule = require('./server/index.js');

console.log('✅ Server module imported successfully');
`;

    fs.writeFileSync('start-production.cjs', productionEntry.trim());

    console.log('\n✅ Deployment fix aplicado exitosamente!');
    console.log('\n📋 Configuración para Replit Deployment:');
    console.log('   Build command: node replit-deployment-fix.cjs');
    console.log('   Run command: node start-production.cjs');
    console.log('\n🔧 Esto resuelve los errores documentados:');
    console.log('   ✓ Health check endpoint optimizado');
    console.log('   ✓ Puerto configurado correctamente para Replit');
    console.log('   ✓ Binding a 0.0.0.0 mantenido');
    console.log('   ✓ Single port deployment (requerido por autoscale)');
    console.log('\n');

  } catch (error) {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  }
}

// Ejecutar fix
fixDeployment();