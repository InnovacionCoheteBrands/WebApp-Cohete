// Script de migración manual para el gestor de proyectos avanzado
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as schema from './shared/schema';

neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Iniciando migración para gestor de proyectos avanzado...');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL must be set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Crear enums
    console.log('Creando enums necesarios...');
    await db.execute(sql`
      DO $$ BEGIN
        -- Verificar y crear enum view_type
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'view_type') THEN
          CREATE TYPE view_type AS ENUM ('list', 'kanban', 'gantt', 'calendar', 'timeline');
        END IF;
        
        -- Verificar y crear enum automation_trigger
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_trigger') THEN
          CREATE TYPE automation_trigger AS ENUM ('status_change', 'due_date_approaching', 'task_assigned', 'comment_added', 'subtask_completed', 'attachment_added');
        END IF;
        
        -- Verificar y crear enum automation_action 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_action') THEN
          CREATE TYPE automation_action AS ENUM ('change_status', 'assign_task', 'send_notification', 'create_subtask', 'update_priority', 'move_to_group');
        END IF;
      END $$;
    `);

    // Crear tablas
    console.log('Creando tabla project_views...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_views (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type view_type NOT NULL,
        configuration JSONB DEFAULT '{}',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Creando tabla automation_rules...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        trigger automation_trigger NOT NULL,
        trigger_configuration JSONB DEFAULT '{}',
        action automation_action NOT NULL,
        action_configuration JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Creando tabla time_entries...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        duration INTEGER, -- duracion en segundos
        description TEXT,
        billable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Creando tabla tags...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Creando tabla task_tags (asocia tags a tareas)...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_tags (
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      );
    `);

    console.log('Creando tabla collaborative_docs...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS collaborative_docs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Creando índices para optimizar consultas...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
      CREATE INDEX IF NOT EXISTS idx_automation_rules_project_id ON automation_rules(project_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
      CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_tags_project_id ON tags(project_id);
      CREATE INDEX IF NOT EXISTS idx_collaborative_docs_project_id ON collaborative_docs(project_id);
    `);

    console.log('Migración completada exitosamente!');
    
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await pool.end();
  }
}

main();