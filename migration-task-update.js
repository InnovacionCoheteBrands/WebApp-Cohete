import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Configuración desde variables de entorno
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('Starting task table migration for Monday-like features...');

  try {
    // 1. Crear el nuevo enum task_group si no existe
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_group') THEN
          CREATE TYPE task_group AS ENUM ('backlog', 'sprint', 'doing', 'done', 'custom');
        END IF;
      END
      $$;
    `);
    console.log('task_group enum created if not exists');

    // 2. Actualizar el enum task_status para incluir 'review'
    await db.execute(sql`
      ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'review' AFTER 'in_progress';
    `);
    console.log('task_status enum updated to include review');

    // 3. Añadir nuevas columnas a la tabla tasks
    await db.execute(sql`
      ALTER TABLE IF EXISTS tasks
      ADD COLUMN IF NOT EXISTS "group" task_group DEFAULT 'backlog',
      ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tags" text[],
      ADD COLUMN IF NOT EXISTS "estimated_hours" integer,
      ADD COLUMN IF NOT EXISTS "dependencies" integer[];
    `);
    console.log('New columns added to tasks table');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();