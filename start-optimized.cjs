// REPLIT DEPLOYMENT OPTIMIZED START
// Implementa fixes de docs.replit.com/deployments

console.log('🚀 COHETE WORKFLOW - REPLIT DEPLOYMENT');
console.log('=====================================');

// CRÍTICO: Configurar ENV inmediatamente para health checks rápidos
process.env.NODE_ENV = 'production';

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 'using default');
console.log('Replit ID:', process.env.REPL_ID || 'unknown');

// Health check instantáneo en root
const express = require('express');
const app = express();

// PRIORIDAD: Health checks ANTES que todo para timing óptimo
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Importar servidor principal después de health checks
console.log('⚡ Loading main server...');
require('./server/index.js');

console.log('✅ Cohete Workflow ready for Replit deployment');