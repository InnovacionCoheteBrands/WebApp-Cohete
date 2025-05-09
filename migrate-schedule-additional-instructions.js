import { Pool } from 'pg';

// Ya tenemos variables de entorno cargadas en el proyecto
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  console.log('Iniciando migración para añadir additional_instructions a schedules');
  
  try {
    // Verificar si la columna ya existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedules' 
      AND column_name = 'additional_instructions'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('La columna additional_instructions ya existe en la tabla schedules');
      return;
    }
    
    // Añadir la columna additional_instructions si no existe
    await pool.query(`
      ALTER TABLE schedules 
      ADD COLUMN additional_instructions TEXT
    `);
    
    console.log('✅ Columna additional_instructions añadida exitosamente a la tabla schedules');
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error);
  } finally {
    await pool.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

runMigration();