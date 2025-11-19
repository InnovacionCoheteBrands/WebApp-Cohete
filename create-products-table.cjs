const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set before running migrations');
}

const isLocalHost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const disableSSL = process.env.SUPABASE_USE_SSL === 'false' || isLocalHost;

const pool = new Pool({
  connectionString,
  ssl: disableSSL ? undefined : { rejectUnauthorized: false }
});
const client = drizzle(pool);

async function main() {
  console.log('Iniciando creación de la tabla products...');
  
  try {
    // Verificar si la tabla ya existe
    const tableExistsResult = await client.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      ) as "exists";
    `);
    
    const tableExists = tableExistsResult[0] && tableExistsResult[0].exists === true;
    
    if (!tableExists) {
      console.log('Creando tabla products...');
      
      await client.execute(sql`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          sku TEXT,
          price NUMERIC(10, 2),
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Tabla products creada exitosamente');
    } else {
      console.log('La tabla products ya existe');
      
      // Verificamos si existen las columnas sku y price
      const skuExistsResult = await client.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'sku'
        ) as "exists";
      `);
      
      const skuExists = skuExistsResult[0] && skuExistsResult[0].exists === true;
      
      if (!skuExists) {
        console.log('Agregando columna sku...');
        await client.execute(sql`ALTER TABLE products ADD COLUMN sku TEXT;`);
      }
      
      const priceExistsResult = await client.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'price'
        ) as "exists";
      `);
      
      const priceExists = priceExistsResult[0] && priceExistsResult[0].exists === true;
      
      if (!priceExists) {
        console.log('Agregando columna price...');
        await client.execute(sql`ALTER TABLE products ADD COLUMN price NUMERIC(10, 2);`);
      }
      
      console.log('Tabla products actualizada exitosamente');
    }
    
  } catch (error) {
    console.error('Error durante la creación/actualización de la tabla products:', error);
  } finally {
    await pool.end();
  }
}

main();