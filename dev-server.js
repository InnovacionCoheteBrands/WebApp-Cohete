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
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Add the missing /api/user endpoint
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Basic API routes placeholders
app.get('/api/projects', (req, res) => {
  res.json([]);
});

app.get('/api/schedules/recent', (req, res) => {
  res.json([]);
});

app.get('/api/users/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

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

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Dev Server running on http://0.0.0.0:${port}`);
  console.log(`📱 Environment: development`);
  console.log(`🔗 API endpoints available at /api/*`);
});