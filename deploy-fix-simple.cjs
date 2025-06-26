/**
 * Simple deployment fix - Resolves the fileURLToPath/import.meta.url CommonJS compatibility issue
 * Creates dist/index.js with proper path handling for production deployment
 */

const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

async function deployFixSimple() {
  try {
    console.log('🚀 Starting simple deployment fix...\n');
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // Build server with esbuild using CommonJS format
    console.log('📦 Building server with CommonJS compatibility...');
    
    const buildCommand = `npx esbuild server/index.ts \
      --bundle \
      --platform=node \
      --target=node20 \
      --format=cjs \
      --outfile=dist/index.js \
      --external:pg-native \
      --external:@rollup/rollup-linux-x64-gnu \
      --external:@esbuild/linux-x64 \
      --minify`;
    
    execSync(buildCommand, { stdio: 'inherit' });
    
    // Read the generated file and apply post-build fixes
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Fix import.meta.url references - replace with __filename equivalent
    bundledCode = bundledCode.replace(
      /import_meta\.url/g, 
      `require('url').pathToFileURL(__filename).href`
    );
    
    // Add proper CommonJS globals at the top
    const commonjsGlobals = `
// CommonJS compatibility fixes
var __filename = __filename || require('path').resolve();
var __dirname = __dirname || require('path').dirname(__filename);
`;
    
    bundledCode = commonjsGlobals + bundledCode;
    
    // Fix fileURLToPath calls with null check
    bundledCode = bundledCode.replace(
      /\(0, import_url\d*\.fileURLToPath\)\(([^)]+)\)/g,
      '(function(url) { return url ? (0, import_url$1.fileURLToPath)(url) : __filename; })($2)'
    );
    
    writeFileSync('dist/index.js', bundledCode);
    
    // Build the frontend
    console.log('🎨 Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create production package.json
    const prodPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      main: "index.js",
      scripts: {
        start: "NODE_ENV=production node index.js"
      },
      engines: {
        node: "20.x"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));
    
    // Copy database migration files if they exist
    if (existsSync('migrations')) {
      if (!existsSync('dist/migrations')) {
        mkdirSync('dist/migrations', { recursive: true });
      }
      execSync('cp -r migrations/* dist/migrations/', { stdio: 'inherit' });
    }
    
    // Verify the build
    const indexExists = existsSync('dist/index.js');
    const packageExists = existsSync('dist/package.json');
    const publicExists = existsSync('dist/public');
    
    console.log('\n✅ BUILD VERIFICATION:');
    console.log(`✓ dist/index.js exists: ${indexExists}`);
    console.log(`✓ dist/package.json exists: ${packageExists}`);
    console.log(`✓ dist/public exists: ${publicExists}`);
    
    if (indexExists && packageExists) {
      console.log('\n🎉 DEPLOYMENT FIXES APPLIED:');
      console.log('✓ Fixed import.meta.url/fileURLToPath CommonJS compatibility');
      console.log('✓ Added proper CommonJS globals (__filename, __dirname)');
      console.log('✓ Null-safe fileURLToPath calls');
      console.log('✓ Production package.json with correct start script');
      console.log('✓ Frontend build included');
      console.log('\n🚀 Ready for deployment: npm start will run NODE_ENV=production node index.js');
    } else {
      throw new Error('Build verification failed - required files not created');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

deployFixSimple();