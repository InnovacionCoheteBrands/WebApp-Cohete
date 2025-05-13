// Script de migración para agregar las nuevas tablas y campos para el gestor de proyectos
// al estilo Monday.com y Taskade
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Iniciando migración para gestor de proyectos avanzado...');

  try {
    // Creación de nuevos enums
    console.log('Creando enums adicionales...');
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
        
        -- Agregar nuevos valores a enums existentes
        -- project_status
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
          ALTER TYPE project_status ADD VALUE 'archived';
        END IF;
        
        -- task_status
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'blocked' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
          ALTER TYPE task_status ADD VALUE 'blocked';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deferred' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
          ALTER TYPE task_status ADD VALUE 'deferred';
        END IF;
        
        -- task_priority
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'critical' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_priority')) THEN
          ALTER TYPE task_priority ADD VALUE 'critical';
        END IF;
        
        -- task_group
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'blocked' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_group')) THEN
          ALTER TYPE task_group ADD VALUE 'blocked';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'upcoming' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_group')) THEN
          ALTER TYPE task_group ADD VALUE 'upcoming';
        END IF;
        
        -- user_role
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'developer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
          ALTER TYPE user_role ADD VALUE 'developer';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'stakeholder' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
          ALTER TYPE user_role ADD VALUE 'stakeholder';
        END IF;
      END $$;
    `);
    
    // Agregar columnas a tasks para proyectos avanzados
    console.log('Agregando nuevas columnas a la tabla de tareas...');
    await db.execute(sql`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS actual_hours INTEGER,
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS followers INTEGER[],
      ADD COLUMN IF NOT EXISTS time_tracking JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS workflow_id INTEGER;
    `);
    
    // Crear tablas para vistas de proyecto
    console.log('Creando tabla project_views...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_views (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type view_type NOT NULL DEFAULT 'list',
        config JSONB DEFAULT '{}'::jsonb,
        is_default BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Crear tabla para automatizaciones
    console.log('Creando tabla automation_rules...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        trigger automation_trigger NOT NULL,
        trigger_config JSONB DEFAULT '{}'::jsonb,
        action automation_action NOT NULL,
        action_config JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Crear tabla para seguimiento de tiempo
    console.log('Creando tabla time_entries...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        description TEXT,
        billable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Crear tabla para etiquetas
    console.log('Creando tabla tags...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3498db',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Crear tabla para documentos colaborativos
    console.log('Creando tabla collaborative_docs...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS collaborative_docs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        content_json JSONB,
        last_edited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log('✅ Script de migración completado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en script de migración:', error);
    process.exit(1);
  });