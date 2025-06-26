
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Actualizar este URL con tu string de conexión real
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost/dbname';

const client = postgres(connectionString);
const db = drizzle(client);

async function migrateAdvancedProfile() {
  console.log('Iniciando migración para perfil avanzado...');

  try {
    // Agregar nuevas columnas para personalización avanzada
    await client`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'es',
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email":true,"push":true,"marketing":false,"projects":true,"tasks":true}',
      ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profileVisible":true,"showEmail":false,"showPhone":false}'
    `;

    console.log('✅ Migración de perfil avanzado completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  migrateAdvancedProfile().catch(console.error);
}

module.exports = { migrateAdvancedProfile };
