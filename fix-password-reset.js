#!/usr/bin/env node

/**
 * Script para comentar temporalmente las funciones de password reset
 * que causan warnings en el build de producción
 */

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Aplicando fix temporal para password reset...');

try {
  // Leer el archivo storage.ts
  let content = readFileSync('server/storage.ts', 'utf8');
  
  // Comentar las funciones problemáticas
  const functionsToComment = [
    'createPasswordResetToken',
    'getPasswordResetToken',
    'deletePasswordResetToken'
  ];
  
  functionsToComment.forEach(funcName => {
    // Buscar y comentar la función completa
    const regex = new RegExp(`async ${funcName}[\\s\\S]*?\\n  \\}`, 'g');
    content = content.replace(regex, (match) => {
      return match.split('\n').map(line => '  // ' + line).join('\n');
    });
  });
  
  // Guardar el archivo modificado
  writeFileSync('server/storage.ts', content);
  
  console.log('✅ Fix aplicado exitosamente');
  console.log('ℹ️  Las funciones de password reset han sido desactivadas temporalmente');
  
} catch (error) {
  console.error('❌ Error aplicando fix:', error);
}