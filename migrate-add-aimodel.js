// Migración para añadir la columna ai_model a la tabla schedules
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

async function runMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Iniciando migración...');

    // Crear el enum ai_model si no existe
    const createEnumQuery = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_model') THEN
              CREATE TYPE ai_model AS ENUM ('mistral', 'openai', 'grok');
          END IF;
      END$$;
    `;
    await pool.query(createEnumQuery);
    console.log('✅ Enum ai_model verificado/creado');

    // Verificar si la columna ya existe para no intentar crearla de nuevo
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedules' AND column_name = 'ai_model';
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La columna ai_model ya existe en la tabla schedules');
    } else {
      // Añadir la columna ai_model a la tabla schedules si no existe
      const addColumnQuery = `
        ALTER TABLE schedules 
        ADD COLUMN ai_model ai_model DEFAULT 'openai' NOT NULL;
      `;
      
      await pool.query(addColumnQuery);
      console.log('✅ Columna ai_model añadida a la tabla schedules');
    }

    // Verificar si la columna distributionPreferences existe
    const checkDistPrefsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedules' AND column_name = 'distribution_preferences';
    `;
    
    const distPrefsResult = await pool.query(checkDistPrefsQuery);
    
    if (distPrefsResult.rows.length > 0) {
      console.log('✅ La columna distribution_preferences ya existe en la tabla schedules');
    } else {
      // Añadir la columna distribution_preferences a la tabla schedules
      const addDistPrefsQuery = `
        ALTER TABLE schedules 
        ADD COLUMN distribution_preferences JSONB DEFAULT '{"type": "uniform"}';
      `;
      
      await pool.query(addDistPrefsQuery);
      console.log('✅ Columna distribution_preferences añadida a la tabla schedules');
    }

    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    // Cerrar la conexión con la base de datos
    await pool.end();
  }
}

runMigration();