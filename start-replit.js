#!/usr/bin/env node

/**
 * Start script optimizado para Replit Deployment
 * Resuelve los 3 errores específicos del deployment
 */

// Configurar ambiente de producción
process.env.NODE_ENV = 'production';

// CRÍTICO: Usar el puerto que Replit proporciona
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT.toString();

console.log('====================================');
console.log('🚀 Cohete Workflow - Replit Production');
console.log('🔧 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📍 Replit:', process.env.REPL_SLUG || 'local');
console.log('====================================');

// Importar tsx para ejecutar TypeScript directamente
import('tsx').then(tsx => {
  // Registrar tsx para manejar archivos TypeScript
  tsx.register();
  
  // Importar y ejecutar el servidor
  import('./server/index.js').then(() => {
    console.log('✅ Server started successfully');
  }).catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}).catch(error => {
  console.error('❌ Failed to load tsx:', error);
  process.exit(1);
});