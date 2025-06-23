import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { grokService } from "./grok-integration";
import cors from 'cors'; // Import the cors middleware
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || "5000");

// Configuración CORS mejorada para despliegue
const allowedOrigins: string[] = [];

if (process.env.NODE_ENV === 'production') {
  // Configuración para Replit deployment
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    allowedOrigins.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
  // Agregar el dominio actual del deployment
  allowedOrigins.push(`https://${process.env.REPL_SLUG || 'localhost'}.replit.dev`);
  allowedOrigins.push(`https://${process.env.REPL_ID || 'localhost'}.replit.app`);
} else {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:5000', 'http://0.0.0.0:5000');
}

// Add localhost variants for development
allowedOrigins.push('http://127.0.0.1:5000', 'http://localhost:5000', 'http://0.0.0.0:5000');

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Always allow in development or if origin matches allowed origins
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

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

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Configuración específica para producción en Replit
    if (process.env.NODE_ENV === 'production') {
      // Servir archivos estáticos del build de producción
      const staticPath = path.join(__dirname, '../client/dist');
      app.use(express.static(staticPath));
      
      // Catch-all handler para React routes en producción
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
          return next(); // Dejar que las rutas API se manejen normalmente
        }
        res.sendFile(path.join(staticPath, 'index.html'));
      });
    } else {
      // Usar Vite solo en desarrollo
      await setupVite(app, server);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.

    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();