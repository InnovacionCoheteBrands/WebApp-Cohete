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
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    const operations = [
      ['analysis_results', 'brand_pillars', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'proof_points', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'target_channels', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'visual_style_guidelines', 'TEXT'],
      ['analysis_results', 'brand_guidelines', 'TEXT'],
      ['analysis_results', 'forbidden_terms', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'performance_insights', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'recommended_next_actions', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['analysis_results', 'last_feedback_applied_at', 'TIMESTAMP'],
      ['schedules', 'start_date', 'TIMESTAMP'],
      ['schedules', 'end_date', 'TIMESTAMP'],
      ['schedules', 'specifications', 'TEXT'],
      ['schedule_entries', 'reference_image_prompt', 'TEXT'],
      ['schedule_entries', 'reference_image_url', 'TEXT'],
      ['schedule_entries', 'asset_brief', 'JSONB DEFAULT \'{}\'::jsonb'],
    ];

    for (const [tableName, columnName, definition] of operations) {
      await addColumnIfMissing(client, tableName, columnName, definition);
    }

    console.log('Migración phase 2 completada');
  } catch (error) {
    console.error('Error al ejecutar la migración phase 2:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

runMigration();
