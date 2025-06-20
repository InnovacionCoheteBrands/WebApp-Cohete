
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Actualizar este URL con tu string de conexión real
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost/dbname';

const client = postgres(connectionString);
const db = drizzle(client);

async function migrateSettingsSeparation() {
  console.log('Iniciando migración para separar configuraciones de perfil...');

  try {
    // Crear tabla de configuraciones de usuario
    await client`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id),
        preferred_language VARCHAR(10) DEFAULT 'es',
        timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
        theme VARCHAR(20) DEFAULT 'system',
        notification_settings JSONB DEFAULT '{"email":true,"push":true,"marketing":false,"projects":true,"tasks":true}',
        privacy_settings JSONB DEFAULT '{"profileVisible":true,"showEmail":false,"showPhone":false}',
        color_scheme VARCHAR(20) DEFAULT 'blue',
        font_size VARCHAR(20) DEFAULT 'medium',
        reduced_animations BOOLEAN DEFAULT false,
        high_contrast_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migrar datos existentes de users a user_settings
    console.log('Migrando datos existentes...');
    await client`
      INSERT INTO user_settings (
        user_id, 
        preferred_language, 
        timezone, 
        theme, 
        notification_settings, 
        privacy_settings
      )
      SELECT 
        id,
        COALESCE(preferred_language, 'es'),
        COALESCE(timezone, 'America/Mexico_City'),
        COALESCE(theme, 'system'),
        COALESCE(notification_settings, '{"email":true,"push":true,"marketing":false,"projects":true,"tasks":true}'),
        COALESCE(privacy_settings, '{"profileVisible":true,"showEmail":false,"showPhone":false}')
      FROM users
      WHERE id NOT IN (SELECT user_id FROM user_settings)
    `;

    // Eliminar columnas que ya no se necesitan en la tabla users
    console.log('Limpiando columnas obsoletas...');
    await client`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS preferred_language,
      DROP COLUMN IF EXISTS timezone,
      DROP COLUMN IF EXISTS theme,
      DROP COLUMN IF EXISTS notification_settings,
      DROP COLUMN IF EXISTS privacy_settings,
      DROP COLUMN IF EXISTS nickname
    `;

    console.log('✅ Migración de separación de configuraciones completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  migrateSettingsSeparation().catch(console.error);
}

module.exports = { migrateSettingsSeparation };
