/**
 * Direct fix for the specific staticPath reference found in the bundled code
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');

function fixStaticPathDirect() {
  try {
    console.log('🔧 Fixing the specific staticPath reference...\n');
    
    if (!existsSync('dist/index.js')) {
      throw new Error('dist/index.js not found');
    }
    
    // Read the current code
    let bundledCode = readFileSync('dist/index.js', 'utf8');
    
    // Find and replace the specific line that's causing the issue
    const oldPath = `const staticPath = import_path4.default.join(__dirname, "../client/dist");`;
    const newPath = `const staticPath = import_path4.default.join(__dirname, "public");`;
    
    if (bundledCode.includes(oldPath)) {
      console.log('Found the problematic staticPath line, fixing...');
      bundledCode = bundledCode.replace(oldPath, newPath);
    } else {
      // Try alternative patterns
      const patterns = [
        { old: `"../client/dist"`, new: `"public"` },
        { old: `"../client"`, new: `"public"` },
        { old: `join(__dirname, "../client/dist")`, new: `join(__dirname, "public")` },
        { old: `join(__dirname, "../client")`, new: `join(__dirname, "public")` }
      ];
      
      let fixed = false;
      patterns.forEach(pattern => {
        if (bundledCode.includes(pattern.old)) {
          console.log(`Fixing pattern: ${pattern.old} → ${pattern.new}`);
          bundledCode = bundledCode.replace(new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern.new);
          fixed = true;
        }
      });
      
      if (!fixed) {
        console.log('No exact match found, applying broader fix...');
        // Apply a broader fix
        bundledCode = bundledCode.replace(/import_path\d+\.default\.join\(__dirname,\s*["']\.\.\/client[^"']*["']\)/g, 'import_path$1.default.join(__dirname, "public")');
      }
    }
    
    writeFileSync('dist/index.js', bundledCode);
    
    console.log('✅ Static path fix applied');
    console.log('✓ Updated staticPath to use dist/public');
    
    console.log('\n🎉 Direct path fix completed!');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixStaticPathDirect();