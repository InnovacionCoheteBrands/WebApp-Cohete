const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🚀 Cohete Workflow - Servidor de Aplicación');
console.log('==========================================');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API endpoints básicos
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get('/api/user', (req, res) => {
  res.json({
    authenticated: false,
    message: 'User system ready',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [],
    message: 'Projects system ready',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: [],
    message: 'Tasks system ready',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos del React app
const staticPath = path.join(__dirname, 'client', 'dist');
const clientIndexPath = path.join(__dirname, 'client', 'index.html');

// Verificar si existe el build de React
if (fs.existsSync(staticPath)) {
  console.log(`📁 Serving React app from: ${staticPath}`);
  app.use(express.static(staticPath));
} else {
  console.log('⚠️  React app not built, serving client directly');
  app.use(express.static(path.join(__dirname, 'client')));
}

// Ruta para servir el archivo HTML del React app
app.get('*', (req, res) => {
  // Para rutas de API, devolver 404 en JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  // Para otras rutas, servir el React app
  let htmlPath = clientIndexPath;
  
  // Verificar si existe el archivo HTML del build
  if (fs.existsSync(staticPath)) {
    const builtIndexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(builtIndexPath)) {
      htmlPath = builtIndexPath;
    }
  }

  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('React app not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Cohete Workflow running on port ${port}`);
  console.log(`📡 Access at: http://0.0.0.0:${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});