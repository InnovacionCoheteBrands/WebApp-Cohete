/**
 * Script de migración para corregir tipos de usuario OAuth
 * Actualiza las referencias de user_id de integer a varchar para compatibilidad con OAuth
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const connectionString = process.env.DATABASE_URL!;
const isLocalHost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const disableSSL = process.env.SUPABASE_USE_SSL === 'false' || isLocalHost;

const pool = new Pool({
  connectionString,
  ssl: disableSSL ? undefined : { rejectUnauthorized: false }
});
const db = drizzle({ client: pool });

async function runMigration() {
  console.log('🚀 Iniciando migración OAuth fix...');

  try {
    // 1. Actualizar tabla users - cambiar id de serial a varchar
    console.log('📝 Actualizando tabla users...');
    await db.execute(`
      -- Crear nueva tabla users temporal con varchar id
      CREATE TABLE users_new (
        id varchar PRIMARY KEY NOT NULL,
        full_name text NOT NULL,
        username text NOT NULL UNIQUE,
        email text UNIQUE,
        password text,
        is_primary boolean DEFAULT false NOT NULL,
        role user_role DEFAULT 'content_creator',
        bio text,
        profile_image text,
        job_title text,
        department text,
        phone_number text,
        preferred_language text DEFAULT 'es',
        theme text DEFAULT 'light',
        last_login timestamp,
        first_name text,
        last_name text,
        profile_image_url text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);

    // 2. Copiar datos existentes (convertir id a string)
    console.log('📋 Copiando datos existentes...');
    await db.execute(`
      INSERT INTO users_new 
      SELECT 
        id::varchar,
        full_name,
        username,
        email,
        password,
        is_primary,
        role,
        bio,
        profile_image,
        job_title,
        department,
        phone_number,
        preferred_language,
        theme,
        last_login,
        first_name,
        last_name,
        profile_image_url,
        created_at,
        updated_at
      FROM users;
    `);

    // 3. Actualizar referencias en otras tablas
    console.log('🔗 Actualizando referencias...');
    
    // Actualizar projects.created_by
    await db.execute(`
      ALTER TABLE projects 
      ADD COLUMN created_by_new varchar REFERENCES users_new(id) ON DELETE SET NULL;
      
      UPDATE projects 
      SET created_by_new = created_by::varchar 
      WHERE created_by IS NOT NULL;
      
      ALTER TABLE projects DROP COLUMN created_by;
      ALTER TABLE projects RENAME COLUMN created_by_new TO created_by;
    `);

    // Actualizar project_assignments.user_id
    await db.execute(`
      ALTER TABLE project_assignments 
      ADD COLUMN user_id_new varchar REFERENCES users_new(id) ON DELETE CASCADE;
      
      UPDATE project_assignments 
      SET user_id_new = user_id::varchar 
      WHERE user_id IS NOT NULL;
      
      ALTER TABLE project_assignments DROP COLUMN user_id;
      ALTER TABLE project_assignments RENAME COLUMN user_id_new TO user_id;
      ALTER TABLE project_assignments ALTER COLUMN user_id SET NOT NULL;
    `);

    // Actualizar documents.uploaded_by
    await db.execute(`
      ALTER TABLE documents 
      ADD COLUMN uploaded_by_new varchar REFERENCES users_new(id) ON DELETE SET NULL;
      
      UPDATE documents 
      SET uploaded_by_new = uploaded_by::varchar 
      WHERE uploaded_by IS NOT NULL;
      
      ALTER TABLE documents DROP COLUMN uploaded_by;
      ALTER TABLE documents RENAME COLUMN uploaded_by_new TO uploaded_by;
    `);

    // Actualizar schedules.created_by
    await db.execute(`
      ALTER TABLE schedules 
      ADD COLUMN created_by_new varchar REFERENCES users_new(id) ON DELETE SET NULL;
      
      UPDATE schedules 
      SET created_by_new = created_by::varchar 
      WHERE created_by IS NOT NULL;
      
      ALTER TABLE schedules DROP COLUMN created_by;
      ALTER TABLE schedules RENAME COLUMN created_by_new TO created_by;
    `);

    // 4. Reemplazar tabla users original
    console.log('🔄 Reemplazando tabla users...');
    await db.execute(`
      DROP TABLE users CASCADE;
      ALTER TABLE users_new RENAME TO users;
    `);

    // 5. Crear tabla sessions si no existe
    console.log('📊 Verificando tabla sessions...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);

    console.log('✅ Migración OAuth completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);