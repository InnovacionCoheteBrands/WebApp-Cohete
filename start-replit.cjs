// REPLIT PRODUCTION START SCRIPT
// Optimizado para resolver errores de deployment

console.log('🚀 Starting Cohete Workflow for Replit');
console.log('======================================');
console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Port:', process.env.PORT || 'not set');
console.log('Repl ID:', process.env.REPL_ID || 'unknown');

// CRÍTICO: Configurar variables de entorno para Replit
process.env.NODE_ENV = 'production';

// Importar el módulo del servidor
try {
  require('./server/index.js');
  console.log('✅ Server started successfully');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}