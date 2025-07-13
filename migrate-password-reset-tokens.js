
import { db, withRetry } from './server/db.ts';

async function addPasswordResetTokensTable() {
  
  try {
    console.log('Creando tabla password_reset_tokens...');
    
    await withRetry(() => db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `));
    
    console.log('✅ Tabla password_reset_tokens creada exitosamente');
    
    // Crear índice para mejorar el rendimiento
    await withRetry(() => db.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
      ON password_reset_tokens(token);
    `));
    
    await withRetry(() => db.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
      ON password_reset_tokens(expires_at);
    `));
    
    console.log('✅ Índices creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tabla password_reset_tokens:', error);
    throw error;
  }
}

addPasswordResetTokensTable()
  .then(() => {
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });
