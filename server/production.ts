/**
 * Production-only entry point for Cohete Workflow
 * Excludes Vite development server and all dev dependencies
 */

import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { setupGoogleAuth } from "./googleAuth";
// Routes will be imported inline to avoid export issues
import { grokService } from "./grok-integration";

// Production-safe dirname
const __dirname = process.cwd();

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || "5000", 10);

// Production middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration for production
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from public directory
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
} else {
  // Fallback: serve a basic HTML page
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cohete Workflow</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      margin: 0; padding: 40px; background: #0f0f0f; color: #fff; text-align: center;
    }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #ff6b35; margin-bottom: 20px; }
    p { color: #ccc; margin-bottom: 30px; }
    .status { background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .api-link { 
      display: inline-block; padding: 12px 24px; background: #ff6b35; 
      color: white; text-decoration: none; border-radius: 6px; margin: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Cohete Workflow</h1>
    <p>Sistema de gestión de proyectos y marketing con IA</p>
    <div class="status">
      <strong>Estado:</strong> Servidor ejecutándose correctamente en producción
    </div>
    <a href="/api/health" class="api-link">Estado del API</a>
    <a href="/api/user" class="api-link">Verificar Usuario</a>
  </div>
</body>
</html>
    `);
  });
}

// Setup authentication 
setupAuth(app);
setupGoogleAuth(app);

// Setup API routes
import routes from "./routes";
app.use('/api', routes);

// Initialize Grok WebSocket server
grokService.initWebSocketServer(server);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: 'production',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Cohete Workflow Production Server`);
  console.log(`📍 Running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 API available at /api/*`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});