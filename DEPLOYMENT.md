# Deployment Guide

## Problem Fixed

The deployment was failing with the error:
```
Cannot find package 'cors' imported from /home/runner/workspace/dist/index.js
Application is failing to start causing crash loop due to missing dependencies in production build
```

This occurred because the original build configuration used `--packages=external`, which excluded all dependencies from the bundle but didn't include them in production.

## Solution Applied

1. **Created a proper production build script** (`production-build.js`)
2. **Bundled ALL dependencies** including `cors`, `express`, `drizzle-orm`, and others
3. **Externalized only problematic native modules** that can't be bundled
4. **Generated a minimal production package.json**

## Fixed Build Configuration

The new build configuration:
- Bundles all Node.js dependencies into a single file
- Only externalizes native modules (`pg-native`, `bufferutil`, etc.)
- Creates a self-contained deployment package
- Reduces dependency management complexity in production

## Building for Production

Run the production build:
```bash
node production-build.js
```

This creates:
- `dist/server.js` (20MB) - Complete server bundle with all dependencies
- `dist/package.json` - Minimal production configuration

## Deployment Instructions

1. **Build the production bundle:**
   ```bash
   node production-build.js
   ```

2. **Deploy the `dist` folder contents** to your production environment

3. **In production, install only native dependencies:**
   ```bash
   cd dist
   npm install
   ```

4. **Start the application:**
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   NODE_ENV=production node server.js
   ```

## Environment Variables Required

Ensure these are set in production:
- `DATABASE_URL` - PostgreSQL connection string (use the Supabase "Connection string" > "Node" URI)
- `SUPABASE_USE_SSL` *(optional)* - Set to `false` only when connecting to a local Postgres instance without TLS
- `GEMINI_API_KEY` - For AI functionality
- `NODE_ENV=production`

## What's Bundled

The production build includes:
- ✅ `cors` - CORS middleware
- ✅ `express` - Web framework
- ✅ `drizzle-orm` - Database ORM
- ✅ `pg` / `postgres` - PostgreSQL drivers
- ✅ All other application dependencies

## What's External

Only these native modules remain external:
- `pg-native` - PostgreSQL native bindings (optional)
- `bufferutil` - WebSocket performance
- `utf-8-validate` - WebSocket validation
- `fsevents` - macOS file watching

## Verification

The build is verified to:
1. Include all required dependencies
2. Start without missing package errors
3. Handle CORS requests properly
4. Connect to the database correctly

## Replit Deployment

For Replit deployments:
1. Run `node production-build.js`
2. The application will automatically use the bundled dependencies
3. No additional package installation needed in production