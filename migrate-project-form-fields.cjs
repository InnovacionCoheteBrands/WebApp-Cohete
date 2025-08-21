
const { Pool } = require('pg');

async function migrateProjectFormFields() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Iniciando migración para campos del formulario de proyecto...');

    // Agregar los campos faltantes a analysis_results
    await pool.query(`
      ALTER TABLE analysis_results 
      ADD COLUMN IF NOT EXISTS project_description TEXT,
      ADD COLUMN IF NOT EXISTS additional_notes TEXT;
    `);

    console.log('✅ Campos agregados exitosamente a analysis_results');

    // Verificar que todos los campos existan
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'analysis_results'
      ORDER BY column_name;
    `);

    console.log('📋 Campos actuales en analysis_results:', result.rows.map(row => row.column_name));

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrateProjectFormFields()
    .then(() => {
      console.log('✅ Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = migrateProjectFormFields;
