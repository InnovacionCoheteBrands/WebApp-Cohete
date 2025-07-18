// Production deployment build script optimized for Replit
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createProductionBuild() {
  console.log('[REPLIT BUILD] Starting production build process...');
  
  // Create dist directory if it doesn't exist
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    console.log('[REPLIT BUILD] Created dist directory');
  }

  // Copy package.json with production modifications
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Optimize package.json for production
  const productionPackageJson = {
    ...packageJson,
    scripts: {
      start: "NODE_ENV=production node index.js",
      health: "curl -f http://localhost:5000/health || exit 1"
    },
    devDependencies: {}, // Remove dev dependencies for smaller bundle
    main: "index.js"
  };

  fs.writeFileSync(
    path.join(distPath, 'package.json'),
    JSON.stringify(productionPackageJson, null, 2)
  );
  console.log('[REPLIT BUILD] Created production package.json');

  // Create production environment file
  const envContent = `
NODE_ENV=production
PORT=5000
# Database and API keys should be set as Replit secrets
`;

  fs.writeFileSync(path.join(distPath, '.env.production'), envContent.trim());
  console.log('[REPLIT BUILD] Created production environment file');

  // Copy necessary static files
  const filesToCopy = ['README.md', 'drizzle.config.ts'];
  filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(distPath, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[REPLIT BUILD] Copied ${file}`);
    }
  });

  console.log('[REPLIT BUILD] Production build process completed');
  return distPath;
}

// Replit-specific deployment validation
export function validateDeployment() {
  console.log('[REPLIT DEPLOY] Validating deployment configuration...');
  
  const validations = {
    port: process.env.PORT === '5000',
    nodeEnv: process.env.NODE_ENV === 'production',
    database: !!process.env.DATABASE_URL,
    serverFile: fs.existsSync(path.join(__dirname, '..', 'dist', 'index.js'))
  };

  const passed = Object.values(validations).filter(Boolean).length;
  const total = Object.keys(validations).length;

  console.log(`[REPLIT DEPLOY] Validation: ${passed}/${total} checks passed`);
  
  if (passed < total) {
    console.warn('[REPLIT DEPLOY] Some validations failed:', 
      Object.entries(validations)
        .filter(([_, passed]) => !passed)
        .map(([key, _]) => key)
    );
  }

  return { validations, passed, total };
}

// Health check implementation for Replit monitoring
export function createHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    },
    replit: {
      slug: process.env.REPL_SLUG || 'unknown',
      owner: process.env.REPL_OWNER || 'unknown',
      id: process.env.REPL_ID || 'unknown'
    },
    database: {
      connected: !!process.env.DATABASE_URL,
      provider: process.env.DATABASE_URL?.includes('neon') ? 'neon' : 'unknown'
    },
    features: {
      ai: !!process.env.XAI_API_KEY,
      oauth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      email: !!process.env.SENDGRID_API_KEY
    }
  };
}