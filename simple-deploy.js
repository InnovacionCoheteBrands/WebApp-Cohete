#!/usr/bin/env node

/**
 * Simple Replit Deployment Script
 * Configuración mínima para resolver los errores de deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Simple Replit Deploy - Cohete Workflow');
console.log('=========================================');

try {
  // 1. Instalar dependencias
  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // 2. Build del cliente  
  console.log('\n🔨 Building client...');
  if (fs.existsSync('client')) {
    execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
  }

  // 3. Crear configuración simple para producción
  console.log('\n⚙️ Creating production config...');
  
  // Crear un wrapper simple para el servidor
  const productionWrapper = `
// Production wrapper for Replit
const path = require('path');
const { fileURLToPath } = require('url');

// Set production environment
process.env.NODE_ENV = 'production';

// Use Replit's PORT or default to 3000
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT;

console.log('🚀 Starting server on port', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Import and start the server
import('./server/index.js').then(() => {
  console.log('✅ Server module loaded');
}).catch(err => {
  console.error('❌ Failed to load server:', err);
  process.exit(1);
});
`;

  fs.writeFileSync('start-production.cjs', productionWrapper.trim());

  console.log('\n✅ Deployment preparation complete!');
  console.log('\n📋 Replit Configuration:');
  console.log('   Build command: node simple-deploy.js');
  console.log('   Run command: node start-production.cjs');
  console.log('\n');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}