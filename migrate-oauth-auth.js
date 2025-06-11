import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando migración OAuth...');
    
    // Create sessions table for Replit Auth
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    
    // Create index for session expiration
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
    `);
    
    // Add OAuth fields to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT,
      ALTER COLUMN password DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS first_name TEXT,
      ADD COLUMN IF NOT EXISTS last_name TEXT,
      ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);
    
    console.log('Migración OAuth completada exitosamente');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigration().catch(console.error);