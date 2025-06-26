/**
 * Fix static file serving path in dist/index.js
 * Updates the path to serve files from dist/public instead of __dirname/public
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');

function fixStaticPath() {
  try {
    console.log('🔧 Fixing static file serving path...\n');
    
    if (!existsSync('dist/index.js')) {
      throw new Error('dist/index.js not found');
    }
    
    // Read the current code
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Fix the distPath to use the correct production path
    // Looking for: const distPath = path.resolve(__dirname, "public");
    const distPathPattern = /const distPath = path\.resolve\(__dirname,\s*["']public["']\);/g;
    
    if (bundledCode.match(distPathPattern)) {
      console.log('Found distPath configuration, updating...');
      bundledCode = bundledCode.replace(
        distPathPattern,
        'const distPath = path.resolve(__dirname, "public");'
      );
    }
    
    // Also look for any client/dist references and fix them
    const clientDistPattern = /["']client["'],\s*["']dist["']/g;
    if (bundledCode.match(clientDistPattern)) {
      console.log('Found client/dist references, updating...');
      bundledCode = bundledCode.replace(clientDistPattern, '"public"');
    }
    
    // Fix any client/index.html references
    const clientIndexPattern = /["']client["'],\s*["']index\.html["']/g;
    if (bundledCode.match(clientIndexPattern)) {
      console.log('Found client/index.html references, updating...');
      bundledCode = bundledCode.replace(clientIndexPattern, '"public", "index.html"');
    }
    
    // More specific pattern for the client template path
    const clientTemplatePattern = /path\.resolve\(\s*__dirname,\s*["']\.\.["'],\s*["']client["'],\s*["']index\.html["']\s*\)/g;
    if (bundledCode.match(clientTemplatePattern)) {
      console.log('Found client template path, updating...');
      bundledCode = bundledCode.replace(
        clientTemplatePattern,
        'path.resolve(__dirname, "public", "index.html")'
      );
    }
    
    // Write the fixed file
    writeFileSync('dist/index.js', bundledCode);
    
    console.log('✅ STATIC PATH FIXES APPLIED:');
    console.log('✓ Updated distPath to use dist/public');
    console.log('✓ Fixed client/dist path references');
    console.log('✓ Updated template path to production location');
    console.log();
    
    // Verify the public directory exists
    if (existsSync('dist/public/index.html')) {
      console.log('✅ Frontend files confirmed at dist/public/');
    } else {
      console.log('⚠️  Warning: dist/public/index.html not found');
    }
    
    console.log('\n🎉 Static path fix completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixStaticPath();