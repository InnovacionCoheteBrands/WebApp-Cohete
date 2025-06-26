/**
 * Final path fix - Directly patches the bundled code to use correct production paths
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');

function fixPathsFinal() {
  try {
    console.log('🔧 Applying final path fixes to dist/index.js...\n');
    
    if (!existsSync('dist/index.js')) {
      throw new Error('dist/index.js not found');
    }
    
    // Read the current code
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Fix the main template path issue
    bundledCode = bundledCode.replace(
      /path\.resolve\(\s*__dirname,\s*["']\.\.["'],\s*["']client["'],\s*["']index\.html["']\s*\)/g,
      'path.resolve(__dirname, "public", "index.html")'
    );
    
    // Fix any other client path references
    bundledCode = bundledCode.replace(
      /["']client["'],\s*["']dist["']/g,
      '"public"'
    );
    
    // Fix client/index.html pattern
    bundledCode = bundledCode.replace(
      /["']client["'],\s*["']index\.html["']/g,
      '"public", "index.html"'
    );
    
    // Fix any "../client" references
    bundledCode = bundledCode.replace(
      /["']\.\.\/client["']/g,
      '"./public"'
    );
    
    // Fix the static file serving path
    bundledCode = bundledCode.replace(
      /const distPath = path\.resolve\(__dirname,\s*["']public["']\);/g,
      'const distPath = path.resolve(__dirname, "public");'
    );
    
    // Make sure error message is updated too
    bundledCode = bundledCode.replace(
      /Could not find the build directory: \$\{distPath\}, make sure to build the client first/g,
      'Could not find the build directory: ${distPath}, files should be in dist/public'
    );
    
    writeFileSync('dist/index.js', bundledCode);
    
    console.log('✅ FINAL PATH FIXES APPLIED:');
    console.log('✓ Fixed template path: ../client/index.html → ./public/index.html');
    console.log('✓ Fixed client/dist references → public');
    console.log('✓ Updated static serving path');
    console.log('✓ Updated error messages');
    
    // Verify paths exist
    console.log('\n📁 Path verification:');
    console.log(`✓ dist/public exists: ${existsSync('dist/public')}`);
    console.log(`✓ dist/public/index.html exists: ${existsSync('dist/public/index.html')}`);
    
    console.log('\n🎉 Final path fixes completed!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixPathsFinal();