// Usar CommonJS para el script de migración
const { db } = require('./server/db');
const { sql } = require('drizzle-orm');

// Enums
async function createEnums() {
  try {
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
        END IF;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
          CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
        END IF;
      END $$;
    `);

    console.log('Enums created successfully');
  } catch (error) {
    console.error('Error creating enums:', error);
  }
}

// Tasks Table
async function createTasksTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'pending',
        priority task_priority NOT NULL DEFAULT 'medium',
        ai_generated BOOLEAN DEFAULT FALSE,
        ai_suggestion TEXT,
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('Tasks table created successfully');
  } catch (error) {
    console.error('Error creating tasks table:', error);
  }
}

async function main() {
  await createEnums();
  await createTasksTable();
  console.log('Migration completed successfully');
  process.exit(0);
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});