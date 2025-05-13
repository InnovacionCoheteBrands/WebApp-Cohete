/**
 * Script de migración para añadir la columna "config" a la tabla project_views
 */

import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando migración de la tabla project_views...');
    
    // Iniciar una transacción
    await client.query('BEGIN');
    
    // Verificar si la columna ya existe
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'project_views' AND column_name = 'config'
    `);
    
    if (columnExists.rows.length === 0) {
      console.log('Añadiendo columna "config" a la tabla project_views...');
      
      // Añadir la columna config como JSONB con un valor por defecto de un objeto vacío
      await client.query(`
        ALTER TABLE project_views 
        ADD COLUMN config JSONB DEFAULT '{}'::jsonb NOT NULL
      `);
      
      console.log('Columna "config" añadida correctamente.');
    } else {
      console.log('La columna "config" ya existe en la tabla project_views.');
    }
    
    // Commit de la transacción
    await client.query('COMMIT');
    console.log('Migración completada con éxito.');
    
  } catch (error) {
    // Rollback en caso de error
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
runMigration().catch(err => {
  console.error('Error en la migración:', err);
  process.exit(1);
});