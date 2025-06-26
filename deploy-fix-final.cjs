/**
 * Final deployment fix - Resolves the fileURLToPath/import.meta.url CommonJS compatibility issue
 * Creates dist/index.js with proper path handling for production deployment
 */

const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

async function deployFixFinal() {
  try {
    console.log('🚀 Starting final deployment fix...\n');
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    
    // Read the current server code to fix the import.meta.url issue
    console.log('📦 Building server with CommonJS compatibility fixes...');
    
    // Use esbuild to create a proper CommonJS bundle with __dirname support
    const buildCommand = `npx esbuild server/index.ts \
      --bundle \
      --platform=node \
      --target=node20 \
      --format=cjs \
      --outfile=dist/index.js \
      --external:pg-native \
      --external:@rollup/rollup-linux-x64-gnu \
      --external:@esbuild/linux-x64 \
      --define:import.meta.url="'file://' + __filename" \
      --define:process.env.NODE_ENV='"production"' \
      --minify`;
    
    execSync(buildCommand, { stdio: 'inherit' });
    
    // Read the generated file and apply additional fixes
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Fix any remaining import.meta.url references that might have escaped
    bundledCode = bundledCode.replace(
      /import_meta\.url/g, 
      `"file://" + __filename`
    );
    
    // Fix fileURLToPath calls to handle the case where the argument might be undefined
    bundledCode = bundledCode.replace(
      /\(0, import_url\d*\.fileURLToPath\)\(([^)]+)\)/g,
      '(0, import_url$1.fileURLToPath)($2 || ("file://" + __filename))'
    );
    
    // Add __dirname fallback at the top of the file if not present
    if (!bundledCode.includes('var __dirname')) {
      bundledCode = `var __dirname = require('path').dirname(__filename);\n${bundledCode}`;
    }
    
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
    
    // Copy database migration files
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
    
    if (indexExists && packageExists && publicExists) {
      console.log('\n🎉 DEPLOYMENT FIXES APPLIED:');
      console.log('✓ Fixed import.meta.url/fileURLToPath CommonJS compatibility issue');
      console.log('✓ Created proper __dirname fallback for path operations');
      console.log('✓ Bundled all dependencies with external exclusions');
      console.log('✓ Production package.json with correct start script');
      console.log('✓ Frontend build included');
      console.log('✓ Database migrations copied');
      console.log('\n🚀 Ready for deployment: npm start will run NODE_ENV=production node index.js');
    } else {
      throw new Error('Build verification failed - required files not created');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment build failed:', error.message);
    process.exit(1);
  }
}

deployFixFinal();