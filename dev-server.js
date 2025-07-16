const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const connectPg = require('connect-pg-simple');
const PgSession = connectPg(session);

// Create Express app
const app = express();
const port = parseInt(process.env.PORT || "5000");

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000', 'http://0.0.0.0:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Simple user handling - in production you'd store in database
      const user = {
        id: profile.id,
        username: profile.displayName,
        email: profile.emails[0]?.value,
        fullName: profile.displayName
      };
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'development',
    uptime: process.uptime()
  });
});

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    // Remove password from response for security
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Add the missing /api/user endpoint
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    // Remove password from response for security
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Import required modules for database operations
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Essential API routes
console.log('🔧 Registering essential API routes...');

// User login route
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    
    // Find user by username in database
    const result = await sql`SELECT * FROM users WHERE username = ${identifier} OR email = ${identifier} LIMIT 1`;
    
    const user = result[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Este usuario debe iniciar sesión con Google' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Create session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al crear sesión' });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    });
    
  } catch (error) {
    console.error('Error in login:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Basic API routes
app.get('/api/projects', isAuthenticated, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM projects WHERE created_by = ${req.user.id} ORDER BY created_at DESC`;
    res.json(result);
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ message: 'Error al listar proyectos' });
  }
});

app.get('/api/schedules/recent', isAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const result = await sql`SELECT s.*, p.name as project_name 
       FROM schedules s 
       JOIN projects p ON s.project_id = p.id 
       WHERE p.created_by = ${req.user.id} 
       ORDER BY s.created_at DESC 
       LIMIT ${limit}`;
    res.json(result);
  } catch (error) {
    console.error('Error listing recent schedules:', error);
    res.status(500).json({ message: 'Error al listar cronogramas' });
  }
});

console.log('✅ Essential API routes registered successfully');

// Serve React app - proxy to Vite dev server
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy to Vite dev server for all non-API routes
app.use(createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  pathFilter: (pathname) => {
    // Only proxy non-API routes
    return !pathname.startsWith('/api/') && !pathname.startsWith('/auth/');
  },
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request:', req.method, req.url);
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server after routes are registered
setTimeout(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Dev Server running on http://0.0.0.0:${port}`);
    console.log(`📱 Environment: development`);
    console.log(`🔗 API endpoints available at /api/*`);
  });
}, 1000); // Wait for routes to be registered