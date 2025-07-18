// Replit-specific optimizations based on official documentation
import { Express } from 'express';

export function applyReplitOptimizations(app: Express) {
  // Disable x-powered-by header for security in all environments
  app.disable('x-powered-by');
  
  // Set production environment configurations
  if (process.env.NODE_ENV === 'production') {
    // Set view cache for better performance
    app.set('view cache', true);
  }
  
  // Trust proxy settings for Replit's infrastructure (all environments)
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Enhanced error handling for Replit deployments
  app.use((err: any, req: any, res: any, next: any) => {
    // Log error details for Replit's monitoring
    console.error('[REPLIT ERROR]', {
      timestamp: new Date().toISOString(),
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
      error: isDevelopment ? err.message : 'Internal Server Error',
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: err.stack })
    });
  });

  // Graceful shutdown handling for Replit deployments
  const gracefulShutdown = () => {
    console.log('[REPLIT] Received shutdown signal, closing server gracefully...');
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Memory monitoring for Replit resource optimization
  setInterval(() => {
    const usage = process.memoryUsage();
    const formatMB = (bytes: number) => Math.round(bytes / 1024 / 1024);
    
    if (usage.heapUsed > 200 * 1024 * 1024) { // 200MB threshold
      console.warn('[REPLIT MEMORY]', {
        heapUsed: `${formatMB(usage.heapUsed)}MB`,
        heapTotal: `${formatMB(usage.heapTotal)}MB`,
        external: `${formatMB(usage.external)}MB`,
        timestamp: new Date().toISOString()
      });
    }
  }, 60000); // Check every minute

  return app;
}

// Environment validation for Replit deployment
export function validateReplitEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn('[REPLIT ENV] Missing environment variables:', missing);
    console.warn('[REPLIT ENV] Some features may not work correctly');
  }

  // Replit-specific environment detection
  const isReplit = !!(
    process.env.REPL_SLUG || 
    process.env.REPL_OWNER || 
    process.env.REPLIT_DB_URL ||
    process.env.REPL_ID
  );

  if (isReplit) {
    console.log('[REPLIT ENV] Running on Replit infrastructure');
    console.log('[REPLIT ENV] Repl:', process.env.REPL_SLUG || 'unknown');
    console.log('[REPLIT ENV] Owner:', process.env.REPL_OWNER || 'unknown');
  }

  return { isReplit, missing };
}

// Performance monitoring for Replit autoscaling
export function addReplitMonitoring(app: Express) {
  let requestCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Request counter middleware
  app.use((req, res, next) => {
    requestCount++;
    
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 400) {
        errorCount++;
      }
      return originalSend.call(this, data);
    };
    
    next();
  });

  // Enhanced monitoring endpoint for Replit autoscaling
  app.get('/api/metrics', (req, res) => {
    const uptime = Date.now() - startTime;
    const memory = process.memoryUsage();
    
    res.json({
      uptime: Math.floor(uptime / 1000),
      requests: {
        total: requestCount,
        errors: errorCount,
        errorRate: requestCount > 0 ? (errorCount / requestCount * 100).toFixed(2) : 0
      },
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024)
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage(),
        pid: process.pid
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        isReplit: !!(process.env.REPL_SLUG || process.env.REPL_OWNER)
      }
    });
  });

  return app;
}