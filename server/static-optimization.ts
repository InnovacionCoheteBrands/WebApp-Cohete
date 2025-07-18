// Static file serving optimizations for Replit deployment
import express, { Express } from 'express';
import path from 'path';

export function optimizeStaticFiles(app: Express, currentDirPath: string) {
  // Enhanced static file serving with caching headers
  const staticOptions = {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res: any, filePath: string) => {
      // Set cache headers based on file type
      const ext = path.extname(filePath).toLowerCase();
      
      if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'].includes(ext)) {
        // Cache static assets for 1 year in production
        res.setHeader('Cache-Control', process.env.NODE_ENV === 'production' 
          ? 'public, max-age=31536000, immutable'
          : 'no-cache'
        );
      } else if (['.html', '.json'].includes(ext)) {
        // Cache HTML and JSON for shorter periods
        res.setHeader('Cache-Control', process.env.NODE_ENV === 'production'
          ? 'public, max-age=3600' // 1 hour
          : 'no-cache'
        );
      }

      // Security headers for static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
  };

  // Serve client build files with optimization
  const clientPath = path.join(currentDirPath, '..', 'client', 'dist');
  app.use(express.static(clientPath, staticOptions));

  // Serve uploads with proper headers
  const uploadsPath = path.join(currentDirPath, '..', 'uploads');
  app.use('/uploads', express.static(uploadsPath, {
    ...staticOptions,
    setHeaders: (res: any, filePath: string) => {
      // More restrictive caching for uploads
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

  // Serve public files (privacy policy, etc.)
  const publicPath = path.join(currentDirPath, 'public');
  app.use('/static', express.static(publicPath, staticOptions));

  // Gzip compression for text-based assets
  app.get('*.js', (req, res, next) => {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
  });

  app.get('*.css', (req, res, next) => {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/css');
    next();
  });

  // Fallback for SPA routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/static')) {
      return next();
    }

    // Serve index.html for client-side routing
    res.sendFile(path.join(clientPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  return app;
}

// CDN and asset optimization helpers
export function addAssetOptimizations(app: Express) {
  // Preload critical resources
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') {
      // Preload critical CSS and JS
      res.set('Link', [
        '</assets/main.css>; rel=preload; as=style',
        '</assets/main.js>; rel=preload; as=script'
      ].join(', '));
    }
    next();
  });

  // Service Worker support for PWA features
  app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
      // Replit-optimized Service Worker
      self.addEventListener('install', () => {
        console.log('Service Worker installed');
      });
      
      self.addEventListener('fetch', (event) => {
        // Cache strategy for Replit deployment
        if (event.request.destination === 'image') {
          event.respondWith(
            caches.open('images').then(cache => {
              return cache.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
              });
            })
          );
        }
      });
    `);
  });

  return app;
}