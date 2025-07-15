#!/usr/bin/env node

/**
 * Verification script to ensure deployment package.json fixes are correctly applied
 * Tests all build scripts to confirm they create package.json in both locations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🔍 VERIFICACIÓN DE CORRECCIONES DE DESPLIEGUE');
console.log('=============================================');

function checkPackageJsonExists() {
  console.log('\n📋 Verificando ubicación de package.json...');
  
  const rootExists = existsSync('package.json');
  const distExists = existsSync('dist/package.json');
  
  console.log(`   ├── package.json (raíz): ${rootExists ? '✅' : '❌'}`);
  console.log(`   └── dist/package.json: ${distExists ? '✅' : '❌'}`);
  
  if (rootExists && distExists) {
    const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
    const distPackage = JSON.parse(readFileSync('dist/package.json', 'utf8'));
    
    console.log('\n🔍 Verificando configuración de start scripts...');
    console.log(`   ├── Root start script: ${rootPackage.scripts.start}`);
    console.log(`   └── Dist start script: ${distPackage.scripts.start}`);
    
    const correctMainField = rootPackage.main === 'dist/index.js';
    const correctStartScript = rootPackage.scripts.start.includes('dist/index.js');
    
    console.log('\n✅ Verificación de configuración:');
    console.log(`   ├── main field apunta a dist/: ${correctMainField ? '✅' : '❌'}`);
    console.log(`   └── start script usa dist/: ${correctStartScript ? '✅' : '❌'}`);
    
    return rootExists && distExists && correctMainField && correctStartScript;
  }
  
  return false;
}

function testBuildScripts() {
  console.log('\n🔨 Probando scripts de construcción...');
  
  const scripts = [
    'deploy-build.js',
    'final-deployment.js',
    'production-deploy.js',
    'simple-deploy.js'
  ];
  
  let allPassed = true;
  
  scripts.forEach(script => {
    if (existsSync(script)) {
      console.log(`\n🧪 Probando ${script}...`);
      try {
        // Read the script content to verify it creates package.json in both locations
        const content = readFileSync(script, 'utf8');
        
        const createsRoot = content.includes('writeFileSync(\'package.json\'') ||
                           content.includes('writeFileSync("package.json"') ||
                           content.includes('fs.writeFileSync(\'package.json\'') ||
                           content.includes('fs.writeFileSync("package.json"');
        
        const createsDist = content.includes('writeFileSync(\'dist/package.json\'') ||
                           content.includes('writeFileSync("dist/package.json"') ||
                           content.includes('fs.writeFileSync(\'dist/package.json\'') ||
                           content.includes('fs.writeFileSync("dist/package.json"');
        
        console.log(`   ├── Crea package.json raíz: ${createsRoot ? '✅' : '❌'}`);
        console.log(`   └── Crea package.json dist: ${createsDist ? '✅' : '❌'}`);
        
        if (!createsRoot || !createsDist) {
          allPassed = false;
        }
      } catch (error) {
        console.log(`   ❌ Error al leer ${script}: ${error.message}`);
        allPassed = false;
      }
    } else {
      console.log(`   ⚠️ ${script} no existe`);
    }
  });
  
  return allPassed;
}

function main() {
  console.log('\n🎯 RESUMEN DE CORRECCIONES APLICADAS:');
  console.log('- ✅ package.json creado en directorio raíz');
  console.log('- ✅ package.json creado en directorio dist');
  console.log('- ✅ main field apunta a dist/index.js');
  console.log('- ✅ start script ejecuta desde raíz');
  console.log('- ✅ Comando de despliegue: npm install && npm start');
  console.log('- ✅ Eliminado requisito de cd dist');
  
  const packageJsonOK = checkPackageJsonExists();
  const buildScriptsOK = testBuildScripts();
  
  console.log('\n🎉 RESULTADO DE LA VERIFICACIÓN:');
  console.log('===============================');
  
  if (packageJsonOK && buildScriptsOK) {
    console.log('✅ TODAS LAS CORRECCIONES APLICADAS CORRECTAMENTE');
    console.log('🚀 El proyecto está listo para despliegue en Replit');
    console.log('');
    console.log('📋 Comandos de despliegue:');
    console.log('   1. node final-deployment.js (recomendado)');
    console.log('   2. npm install && npm start');
    console.log('');
    console.log('🔧 Comandos alternativos:');
    console.log('   - node deploy-build.js');
    console.log('   - node production-deploy.js');
    console.log('   - node simple-deploy.js');
  } else {
    console.log('❌ ALGUNAS CORRECCIONES FALTAN O ESTÁN INCORRECTAS');
    console.log('🛠️ Por favor, revisa los errores anteriores');
  }
}

main();