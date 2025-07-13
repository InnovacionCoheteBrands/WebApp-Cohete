
const { Client } = require('pg');

async function fixUserIdGeneration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar si la tabla users existe y corregir el campo id
    const alterTableQuery = `
      ALTER TABLE users 
      ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    `;

    await client.query(alterTableQuery);
    console.log('✅ Campo ID de usuarios corregido para generación automática');

  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  fixUserIdGeneration().catch(console.error);
}

module.exports = { fixUserIdGeneration };
