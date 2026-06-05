import pkg from 'pg';

const { Client } = pkg;

async function addColumnIfMissing(client, tableName, columnName, definition) {
  const checkColumnQuery = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1
      AND column_name = $2;
  `;

  const result = await client.query(checkColumnQuery, [tableName, columnName]);

  if (result.rowCount && result.rowCount > 0) {
    console.log(`La columna "${columnName}" ya existe en "${tableName}"`);
    return;
  }

  await client.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  console.log(`Columna "${columnName}" añadida a "${tableName}"`);
}

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    await addColumnIfMissing(client, 'analysis_results', 'uvp', 'TEXT');
    await addColumnIfMissing(client, 'analysis_results', 'voice_of_customer', 'TEXT');
    await addColumnIfMissing(client, 'schedule_entries', 'uvp_alignment_score', 'INTEGER');
    await addColumnIfMissing(client, 'schedule_entries', 'uvp_alignment_reason', 'TEXT');

    console.log('Migración estratégica de IA completada');
  } catch (error) {
    console.error('Error al ejecutar la migración estratégica de IA:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

runMigration();
