/**
 * Script de migración para añadir el campo "comments" a la tabla schedule_entries
 * Este campo permitirá almacenar comentarios adicionales para cada entrada del cronograma
 */
import pkg from 'pg';
const { Client } = pkg;

async function runMigration() {
  // Crear una nueva conexión a la base de datos
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conectado a la base de datos');

    // Comprobar si la columna ya existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedule_entries' 
      AND column_name = 'comments';
    `;
    
    const checkResult = await client.query(checkColumnQuery);
    
    if (checkResult.rowCount > 0) {
      console.log('La columna "comments" ya existe en la tabla schedule_entries');
    } else {
      // Añadir la columna "comments" a la tabla schedule_entries
      const alterTableQuery = `
        ALTER TABLE schedule_entries
        ADD COLUMN comments TEXT;
      `;
      
      await client.query(alterTableQuery);
      console.log('Columna "comments" añadida correctamente a la tabla schedule_entries');
    }

    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error al realizar la migración:', error);
  } finally {
    // Cerrar la conexión
    await client.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

// Ejecutar la migración
runMigration();