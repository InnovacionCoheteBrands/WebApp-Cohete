// No importamos los archivos db o schema ya que pueden tener problemas de importación
// Hacemos la migración directamente con SQL
const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = drizzle(pool);

async function main() {
  console.log('Iniciando migración para agregar campos SKU y price a la tabla de productos...');
  
  try {
    // Comprobar si la columna sku ya existe
    const skuExists = await client.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'sku'
    `);
    
    if (skuExists.length === 0) {
      console.log('Agregando columna sku...');
      await client.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT`);
    } else {
      console.log('La columna sku ya existe');
    }
    
    // Comprobar si la columna price ya existe
    const priceExists = await client.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'price'
    `);
    
    if (priceExists.length === 0) {
      console.log('Agregando columna price...');
      await client.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10,2)`);
    } else {
      console.log('La columna price ya existe');
    }
    
    // Comprobar si la columna imageUrl es NOT NULL y cambiarla a NULL si es necesario
    const imageNotNullCheck = await client.execute(sql`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'image_url'
    `);
    
    if (imageNotNullCheck.length > 0 && imageNotNullCheck[0].is_nullable === 'NO') {
      console.log('Actualizando columna image_url para permitir valores NULL...');
      await client.execute(sql`ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL`);
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

main();