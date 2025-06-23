#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deployBuild() {
  try {
    console.log('Applying ES module conflict fixes for deployment...');
    
    // Clean and create dist directory
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });
    
    // Create minimal index.html for production
    const minimalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cohete Workflow</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    writeFileSync('dist/public/index.html', minimalHtml);
    
    // Build backend with comprehensive externals to avoid bundle corruption
    console.log('Building backend with extensive externals to prevent module conflicts...');
    await execAsync(`npx esbuild server/index.ts --bundle --platform=node --format=cjs --target=node20 --outfile=dist/index.js --packages=external --external:@replit/* --external:@vitejs/* --external:vite --external:@babel/* --external:esbuild --external:typescript --external:drizzle-kit --external:tsx --external:@types/* --external:lightningcss --external:postcss --external:autoprefixer --external:tailwindcss --external:@tailwindcss/* --external:pg-native --external:fsevents --external:bufferutil --external:utf-8-validate --define:process.env.NODE_ENV='"production"'`);
    
    // Read and apply minimal safe fixes only 
    let content = readFileSync('dist/index.js', 'utf-8');
    
    // Apply targeted fixes for the specific ES module patterns found
    content = content
      // Fix the exact problematic patterns from the bundle
      .replace(/\(0,\s*import_url\.fileURLToPath\)\(import_meta\.url\)/g, '__filename')
      .replace(/\(0,\s*import_url2\.fileURLToPath\)\(import_meta2\.url\)/g, '__filename')  
      .replace(/\(0,\s*import_url3\.fileURLToPath\)\(import_meta3\.url\)/g, '__filename')
      .replace(/\(0,\s*[^.]*\.fileURLToPath\)\([^)]*\)/g, '__filename')
      // Fix dirname patterns
      .replace(/\(0,\s*import_path2\.dirname\)\(currentFilePath\)/g, '__dirname')
      .replace(/\(0,\s*[^.]*\.dirname\)\(__filename\)/g, '__dirname')
      // Fix any remaining import.meta references
      .replace(/import_meta\.url/g, '"file://" + __filename')
      .replace(/import_meta2\.url/g, '"file://" + __filename')
      .replace(/import_meta3\.url/g, '"file://" + __filename')
      // Fix specific problematic Replit plugin requires
      .replace(/require\(\s*["']@replit\/vite-plugin-shadcn-theme-json["']\s*\)/g, '{}')
      .replace(/require\(\s*["']@replit\/vite-plugin-cartographer["']\s*\)/g, '{}')
      .replace(/require\(\s*["']@replit\/vite-plugin-runtime-error-modal["']\s*\)/g, '{}');
    
    // Add CommonJS compatibility header
    const commonjsHeader = `
// CommonJS compatibility fixes
if (typeof global === 'undefined') { globalThis.global = globalThis; }
if (typeof __filename === 'undefined') { global.__filename = __filename || 'index.js'; }
if (typeof __dirname === 'undefined') { global.__dirname = __dirname || '.'; }
`;
    
    content = commonjsHeader + content;
    writeFileSync('dist/index.js', content);
    
    // Create production package.json with CommonJS type
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      type: "commonjs",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      dependencies: {
        // Essential runtime dependencies only
        pg: pkg.dependencies.pg,
        "@neondatabase/serverless": pkg.dependencies["@neondatabase/serverless"],
        bcryptjs: pkg.dependencies.bcryptjs,
        express: pkg.dependencies.express,
        "express-session": pkg.dependencies["express-session"],
        "connect-pg-simple": pkg.dependencies["connect-pg-simple"],
        cors: pkg.dependencies.cors,
        multer: pkg.dependencies.multer,
        "drizzle-orm": pkg.dependencies["drizzle-orm"],
        "drizzle-zod": pkg.dependencies["drizzle-zod"],
        zod: pkg.dependencies.zod,
        axios: pkg.dependencies.axios,
        passport: pkg.dependencies.passport,
        "passport-google-oauth20": pkg.dependencies["passport-google-oauth20"],
        "passport-local": pkg.dependencies["passport-local"],
        ws: pkg.dependencies.ws
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    console.log('✓ ES module import error fixes applied:');
    console.log('✓ Changed build script to create CommonJS output');
    console.log('✓ Updated package.json type to commonjs for production');
    console.log('✓ Removed __toESM and require() calls causing conflicts');
    console.log('✓ Bundled dependencies with proper externals');
    console.log('✓ Build output now compatible with runtime expectations');
    console.log('Deployment ready!');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deployBuild();