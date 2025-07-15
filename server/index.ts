// ===== IMPORTACIONES =====
// Express: Framework web para Node.js
import express, { type Request, Response, NextFunction } from "express";
// Módulo para registrar todas las rutas de la API
import { registerRoutes } from "./routes";
// Módulo para configurar Vite en desarrollo y servir archivos estáticos
import { setupVite, serveStatic, log } from "./vite";
// Servicio de integración con Grok AI para generación de contenido
import { grokService } from "./grok-integration";
// CORS: Middleware para manejar políticas de mismo origen
import cors from 'cors';
// Utilitarios para manejo de rutas de archivos
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Sistema de archivos de Node.js
import fs from 'fs';

// ===== CONFIGURACIÓN DE DIRECTORIO =====
// Resolver el directorio actual de forma segura para producción
// En producción usa el directorio dist, en desarrollo usa el directorio actual
const currentDir = process.env.NODE_ENV === 'production' ? '/home/runner/workspace/dist' : dirname(fileURLToPath(import.meta.url));

// ===== VARIABLES GLOBALES =====
// Hacer disponibles fs y path globalmente para compatibilidad con módulos
if (typeof global !== 'undefined') {
  global.fs = fs;
  global.path = path;
}

// ===== CONFIGURACIÓN DE EXPRESS =====
// Crear instancia de la aplicación Express
const app = express();
// Configurar puerto desde variable de entorno o usar 5000 por defecto
const port = parseInt(process.env.PORT || "5000");

// ===== CONFIGURACIÓN CORS =====
// CORS (Cross-Origin Resource Sharing) permite que el frontend acceda al backend
// Lista de orígenes permitidos para hacer peticiones al servidor
const allowedOrigins: string[] = [];

// Configuración específica para producción en Replit
if (process.env.NODE_ENV === 'production') {
  // Agregar dominios de Replit para deployment
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    allowedOrigins.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
  // Agregar dominios alternativos de Replit
  allowedOrigins.push(`https://${process.env.REPL_SLUG || 'localhost'}.replit.dev`);
  allowedOrigins.push(`https://${process.env.REPL_ID || 'localhost'}.replit.app`);
} else {
  // Configuración para desarrollo local
  allowedOrigins.push('http://localhost:5173', 'http://localhost:5000', 'http://0.0.0.0:5000');
}

// Agregar variantes adicionales de localhost para desarrollo
allowedOrigins.push('http://127.0.0.1:5000', 'http://localhost:5000', 'http://0.0.0.0:5000');

// ===== MIDDLEWARE CORS =====
// Configurar CORS con validación de orígenes
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);

    // Permitir siempre en desarrollo o si el origen está en la lista permitida
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'] // Headers permitidos
}));

// ===== MIDDLEWARE DE PARSEO =====
// Parsear JSON en el body de las peticiones
app.use(express.json());
// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: false }));

// ===== MIDDLEWARE DE LOGGING =====
// Interceptar y loggear todas las peticiones a la API
app.use((req, res, next) => {
  // Marcar tiempo de inicio para medir duración
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Interceptar el método res.json para capturar la respuesta
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Cuando la respuesta termina, generar el log
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Solo loggear rutas de la API
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Agregar la respuesta JSON si existe
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncar líneas muy largas para mantener logs legibles
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log detallado del error
      console.error('Server Error:', {
        error: err,
        path: req.path,
        method: req.method,
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString()
      });

      res.status(status).json({ 
        message,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });

    // Configurar trust proxy para Replit
    app.set('trust proxy', 1);

    // Health check endpoint (moved to /api/health)
    app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Cohete Workflow API',
        version: '1.0.0'
      }); 
    });

    app.get('/api/status', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Configuración específica para producción en Replit
    if (process.env.NODE_ENV === 'production') {
      // Servir archivos estáticos del build de producción
      const staticPath = path.join(currentDir, '../client/dist');
      console.log('Serving static files from:', staticPath);

      // Verificar si el directorio existe
      if (require('fs').existsSync(staticPath)) {
        app.use(express.static(staticPath, {
          maxAge: '1d',
          etag: false
        }));

        // Catch-all handler para React routes en producción
        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api/')) {
            return next(); // Dejar que las rutas API se manejen normalmente
          }
          const indexPath = path.join(staticPath, 'index.html');
          if (require('fs').existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(404).send('Build files not found. Please run: cd client && npm run build');
          }
        });
      } else {
        console.error('Static files directory not found:', staticPath);
        app.get('*', (req, res) => {
          res.status(500).send('Build files not found. Please run: cd client && npm run build');
        });
      }
    } else {
      // Configuración para desarrollo con Vite
      await setupVite(app, server);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.

    const serverInstance = server.listen(port, "0.0.0.0", () => {
      log(`🚀 Server is running on http://0.0.0.0:${port}`);
      log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔗 API endpoints available at /api/*`);
    });

    // Handle server errors
    serverInstance.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully');
      serverInstance.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully');
      serverInstance.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();