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
// Replit optimizations
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { applyReplitOptimizations, validateReplitEnvironment, addReplitMonitoring } from './replit-optimizations';
import { optimizeStaticFiles, addAssetOptimizations } from './static-optimization';

// ===== CONFIGURACIÓN DE DIRECTORIO =====
// Resolver el directorio actual de forma segura para producción
// En producción usa el directorio dist, en desarrollo usa el directorio actual
const __dirname = process.env.NODE_ENV === 'production' ? '/home/runner/workspace/dist' : dirname(fileURLToPath(import.meta.url));

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

// ===== REPLIT OPTIMIZATIONS =====
// Validate Replit environment and configuration
const { isReplit, missing } = validateReplitEnvironment();

// Trust proxy for Replit deployment
app.set('trust proxy', 1);

// Apply security headers with environment-specific configuration
if (process.env.NODE_ENV === 'production') {
  // Production: Full security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.x.ai"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
} else {
  // Development: Relaxed security for Vite
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development for Vite compatibility
    crossOriginEmbedderPolicy: false,
    hsts: false
  }));
}

// Enable compression with optimized settings
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Don't compress already compressed files
    const contentType = res.getHeader('content-type');
    if (typeof contentType === 'string') {
      return !contentType.includes('image/') && !contentType.includes('video/');
    }
    return compression.filter(req, res);
  }
}));

// Production rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased limit for better UX
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });
  app.use('/api/', limiter);
}

// Apply comprehensive Replit optimizations
applyReplitOptimizations(app);
addReplitMonitoring(app);

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

// ===== MIDDLEWARE DE DEBUGGING =====
// Agregar debugging para identificar rutas problemáticas
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    console.error('Route error:', {
      method: req.method,
      path: req.path,
      url: req.url,
      error: error.message
    });
    throw error;
  }
});

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

    // Trust proxy configuration already set above

    // Enhanced health check endpoints for Replit monitoring
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Cohete Workflow',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        replit: {
          slug: process.env.REPL_SLUG || 'unknown',
          owner: process.env.REPL_OWNER || 'unknown',
          id: process.env.REPL_ID || 'unknown'
        },
        database: {
          connected: !!process.env.DATABASE_URL,
          url_configured: !!process.env.DATABASE_URL,
          provider: process.env.DATABASE_URL?.includes('neon') ? 'neon' : 'unknown'
        },
        features: {
          ai: !!process.env.XAI_API_KEY,
          oauth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
          email: !!process.env.SENDGRID_API_KEY
        }
      }); 
    });

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
      console.log('🏭 Setting up production static file serving with Replit optimizations...');
      optimizeStaticFiles(app, __dirname);
      addAssetOptimizations(app);
    } else {
      // Configuración para desarrollo con Vite
      console.log("🔧 Setting up Vite development server...");
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