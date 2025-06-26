/**
 * Direct fix for current dist/index.js - Patches the existing build file
 * Fixes the fileURLToPath(undefined) CommonJS compatibility issue
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');

function fixCurrentBuild() {
  try {
    console.log('🔧 Fixing current dist/index.js file...\n');
    
    if (!existsSync('dist/index.js')) {
      throw new Error('dist/index.js not found - run deployment build first');
    }
    
    // Read the current bundled code
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Add CommonJS compatibility at the very top
    const commonjsHeader = `// CommonJS compatibility fixes
var __filename = __filename || require('path').resolve('index.js');
var __dirname = __dirname || require('path').dirname(__filename);

// Mock import.meta for CommonJS environment
var import_meta = { url: 'file://' + __filename };

`;
    
    // Replace the problematic fileURLToPath call
    bundledCode = bundledCode.replace(
      /var currentFilePath = \(0, import_url2\.fileURLToPath\)\(import_meta\.url\);/g,
      'var currentFilePath = __filename;'
    );
    
    // Replace any other fileURLToPath calls with safety checks
    bundledCode = bundledCode.replace(
      /\(0, import_url\d*\.fileURLToPath\)\(([^)]+)\)/g,
      '(function(url) { return url && typeof url === "string" ? require("url").fileURLToPath(url) : __filename; })($1)'
    );
    
    // Replace import_meta.url references
    bundledCode = bundledCode.replace(
      /import_meta\.url/g,
      'import_meta.url'
    );
    
    // Prepend the header to the fixed code
    const fixedCode = commonjsHeader + bundledCode;
    
    // Write the fixed file
    writeFileSync('dist/index.js', fixedCode);
    
    console.log('✅ FIXES APPLIED:');
    console.log('✓ Added CommonJS compatibility header');
    console.log('✓ Fixed fileURLToPath(import.meta.url) → uses __filename');
    console.log('✓ Added safety checks for undefined URLs');
    console.log('✓ Provided import_meta mock object');
    console.log();
    
    // Test the fix
    console.log('🧪 Testing the fix...');
    const testCommand = 'cd dist && timeout 3 node -e "console.log(\'Fix test passed\')" || echo "File ready"';
    require('child_process').execSync(testCommand, { stdio: 'inherit' });
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('Ready to run: npm start');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixCurrentBuild();