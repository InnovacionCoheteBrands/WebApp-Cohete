// REPLIT DEPLOYMENT - CORRECTED STARTUP
// Fixes specific deployment errors reported by user

console.log('🚀 COHETE WORKFLOW - REPLIT DEPLOYMENT CORRECTED');
console.log('===============================================');

// CRITICAL FIX: Set NODE_ENV immediately for deployment detection
process.env.NODE_ENV = 'production';

console.log('✅ Environment variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT || 'not set by Replit');
console.log('   REPL_ID:', process.env.REPL_ID || 'unknown');

// CRITICAL: Import server AFTER setting environment
console.log('⚡ Loading corrected server...');
try {
  require('./server/index.js');
  console.log('✅ Server loaded successfully with fixes applied');
} catch (error) {
  console.error('❌ Server failed to start:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}