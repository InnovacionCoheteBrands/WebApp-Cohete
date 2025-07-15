#!/usr/bin/env node

/**
 * DEPLOYMENT PREPARATION SCRIPT
 * Safely creates production package.json for Replit deployment
 * without overwriting the development package.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

function prepareDeployment() {
  try {
    console.log('🚀 PREPARING DEPLOYMENT FILES');
    console.log('============================');
    
    // Read current package.json to preserve it
    if (!existsSync('package.json')) {
      console.error('❌ package.json not found in root directory');
      process.exit(1);
    }
    
    const originalPackage = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Create production package.json
    const productionPackage = {
      name: "cohete-workflow-production",
      version: "1.0.0",
      description: "Sistema de gestión de proyectos y marketing con IA",
      type: "commonjs",
      main: "dist/index.js",
      scripts: {
        start: "NODE_ENV=production node dist/index.js",
        dev: originalPackage.scripts.dev // Keep dev script for development
      },
      dependencies: {
        "pg": "^8.15.6"
      },
      optionalDependencies: {
        "bufferutil": "^4.0.8",
        "utf-8-validate": "^2.0.0"
      },
      engines: {
        "node": ">=18.0.0"
      }
    };
    
    // Create backup of original package.json
    writeFileSync('package.dev.json', JSON.stringify(originalPackage, null, 2));
    console.log('✅ Backup created: package.dev.json');
    
    // Create production package.json for deployment
    writeFileSync('package.production.json', JSON.stringify(productionPackage, null, 2));
    console.log('✅ Production config created: package.production.json');
    
    // Create deployment instructions
    const deploymentInstructions = `# DEPLOYMENT INSTRUCTIONS FOR REPLIT

## FOR DEVELOPMENT (current):
- Use: npm run dev
- File: package.json (current development setup)

## FOR DEPLOYMENT:
1. Run build: node final-deployment.js
2. Copy production config: cp package.production.json package.json
3. Deploy with: npm install && npm start

## IMPORTANT NOTES:
- The main package.json is for development
- package.production.json is for deployment only
- Never edit package.json directly, use packager_tool instead
- dist/index.js is the production server bundle

## REPLIT DEPLOYMENT COMMANDS:
Build: node final-deployment.js
Setup: cp package.production.json package.json
Start: npm install && npm start

## RESTORE DEVELOPMENT:
If package.json gets overwritten:
cp package.dev.json package.json
`;
    
    writeFileSync('DEPLOYMENT-INSTRUCTIONS.md', deploymentInstructions);
    console.log('✅ Instructions created: DEPLOYMENT-INSTRUCTIONS.md');
    
    console.log('\n🎯 DEPLOYMENT PREPARATION COMPLETE');
    console.log('================================');
    console.log('✅ Development package.json preserved');
    console.log('✅ Production package.json ready');
    console.log('✅ Deployment instructions created');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. node final-deployment.js (build)');
    console.log('2. cp package.production.json package.json (setup)');
    console.log('3. Deploy to Replit with: npm install && npm start');
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error);
    process.exit(1);
  }
}

prepareDeployment();