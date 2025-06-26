import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupSimpleGoogleAuth(app: Express) {
  app.set("trust proxy", 1);
  // Configure session middleware with fallback
  try {
    const PgSession = connectPg(session);

    app.use(session({
      store: new PgSession({
        // No need to pass pool, it will use DATABASE_URL from environment
        tableName: 'sessions',
        errorLog: () => {} // Suppress error logs
      }),
      secret: process.env.SESSION_SECRET || 'fallback-secret-please-change',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    }));
  } catch (error) {
    console.warn('PostgreSQL session store failed, using memory store as fallback');
    app.use(session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-please-change',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    }));
  }
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth strategy with dynamic callback URL
  const getCallbackURL = (req: any) => {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    return `${protocol}://${host}/api/auth/google/callback`;
  };

  // Dynamic callback URL based on current host
  const currentHost = process.env.REPLIT_DOMAINS || 'localhost:5000';
  const callbackURL = currentHost.includes('localhost') 
    ? `http://${currentHost}/api/auth/google/callback`
    : `https://${currentHost}/api/auth/google/callback`;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Generate user data from Google profile
      const email = profile.emails?.[0]?.value || '';
      const firstName = profile.name?.givenName || '';
      const lastName = profile.name?.familyName || '';
      const fullName = `${firstName} ${lastName}`.trim() || email;

      // Generate username from email or name
      let username = email.split('@')[0] || firstName.toLowerCase();
      if (!username) {
        username = `user_${profile.id}`;
      }

      // Try to find existing user first
      const [existingUser] = await db.select().from(users).where(eq(users.id, profile.id));

      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db
          .update(users)
          .set({
            email: email,
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: profile.photos?.[0]?.value || '',
            updatedAt: new Date(),
          })
          .where(eq(users.id, profile.id))
          .returning();
        return done(null, updatedUser);
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            id: profile.id,
            fullName: fullName,
            username: username,
            email: email,
            password: null,
            isPrimary: false,
            role: 'content_creator',
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: profile.photos?.[0]?.value || '',
            preferredLanguage: 'es',
            theme: 'light',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        return done(null, newUser);
      }
    } catch (error) {
      console.error('Error in Google Auth strategy:', error);
      return done(error, false);
    }
  }));

  passport.serializeUser((user: any, cb) => cb(null, user.id));

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return cb(null, user || false);
    } catch (error) {
      return cb(error);
    }
  });

  // Auth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      // Successful authentication, redirect home
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.redirect("/auth");
    });
  });

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Legacy user endpoint for compatibility 
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};