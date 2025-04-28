const { Pool } = require('pg');

// Conexión a la base de datos
// Usamos directamente la variable de entorno DATABASE_URL que está configurada en Replit
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log('Comenzando migración de la tabla users para añadir campos de perfil...');
  const client = await pool.connect();

  try {
    // Iniciamos una transacción para asegurar que todos los cambios se apliquen juntos
    await client.query('BEGIN');

    // Primero, creamos el enum para roles de usuario
    const createUserRoleEnum = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('admin', 'manager', 'designer', 'content_creator', 'analyst');
        END IF;
      END
      $$;
    `;
    await client.query(createUserRoleEnum);
    console.log('Enum user_role creado o ya existente');

    // Añadimos campos para el perfil de usuario
    const alterUserTable = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'content_creator',
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS profile_image TEXT,
      ADD COLUMN IF NOT EXISTS job_title TEXT,
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS phone_number TEXT,
      ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'es',
      ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
    `;
    await client.query(alterUserTable);
    console.log('Campos de perfil añadidos a la tabla users');

    // Confirmamos la transacción
    await client.query('COMMIT');
    console.log('Migración completada exitosamente');
  } catch (error) {
    // Si hay algún error, revertimos todos los cambios
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigration()
  .then(() => {
    console.log('Migración ejecutada con éxito');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en la migración:', error);
    process.exit(1);
  });