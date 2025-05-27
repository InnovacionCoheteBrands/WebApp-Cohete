/**
 * Migración para implementar el sistema Monday.com
 * Añade las nuevas tablas y enums necesarios para la gestión de proyectos avanzada
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function runMigration() {
  console.log('🚀 Iniciando migración del sistema Monday.com...');

  try {
    // 1. Crear nuevos enums
    console.log('📋 Creando nuevos enums...');
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE column_type AS ENUM (
          'text', 'status', 'person', 'date', 'progress', 
          'tags', 'number', 'timeline', 'files', 'dropdown', 'checkbox'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE task_group_type AS ENUM (
          'default', 'sprint', 'epic', 'milestone', 'custom'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // 2. Crear tabla task_groups
    console.log('📁 Creando tabla task_groups...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS task_groups (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#4285f4',
        type task_group_type DEFAULT 'default',
        position INTEGER DEFAULT 0,
        is_collapsed BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // 3. Crear tabla project_column_settings
    console.log('⚙️ Creando tabla project_column_settings...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS project_column_settings (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        column_type column_type NOT NULL,
        name TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        width INTEGER DEFAULT 150,
        is_visible BOOLEAN DEFAULT true,
        is_required BOOLEAN DEFAULT false,
        settings JSONB DEFAULT '{}',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // 4. Crear tabla task_column_values
    console.log('💾 Creando tabla task_column_values...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS task_column_values (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        column_id INTEGER NOT NULL REFERENCES project_column_settings(id) ON DELETE CASCADE,
        value_text TEXT,
        value_number NUMERIC(10,2),
        value_date TIMESTAMP,
        value_bool BOOLEAN,
        value_json JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // 5. Crear tabla task_assignees
    console.log('👥 Creando tabla task_assignees...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(task_id, user_id)
      );
    `;

    // 6. Agregar nueva columna group_id a tasks
    console.log('🔗 Agregando columna group_id a tabla tasks...');
    
    await sql`
      DO $$ BEGIN
        ALTER TABLE tasks ADD COLUMN group_id INTEGER REFERENCES task_groups(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `;

    // 7. Crear índices para mejor rendimiento
    console.log('🚀 Creando índices de rendimiento...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_task_groups_project_id ON task_groups(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_groups_position ON task_groups(position)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_column_settings_project_id ON project_column_settings(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_column_settings_position ON project_column_settings(position)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_column_values_task_id ON task_column_values(task_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_column_values_column_id ON task_column_values(column_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id)`;

    // 8. Crear grupo por defecto para proyectos existentes
    console.log('📋 Creando grupos por defecto para proyectos existentes...');
    
    await sql`
      INSERT INTO task_groups (project_id, name, description, color, type, position, created_by)
      SELECT 
        p.id,
        'Tareas Generales',
        'Grupo por defecto para organizar tareas',
        '#4285f4',
        'default',
        0,
        p.created_by
      FROM projects p
      WHERE NOT EXISTS (
        SELECT 1 FROM task_groups tg WHERE tg.project_id = p.id
      );
    `;

    // 9. Crear columnas por defecto para proyectos existentes
    console.log('📊 Creando columnas por defecto para proyectos existentes...');
    
    const defaultColumns = [
      { name: 'Título', type: 'text', position: 0, width: 200, isRequired: true },
      { name: 'Asignado', type: 'person', position: 1, width: 150, isRequired: false },
      { name: 'Estado', type: 'status', position: 2, width: 120, isRequired: false },
      { name: 'Prioridad', type: 'dropdown', position: 3, width: 100, isRequired: false },
      { name: 'Fecha de Vencimiento', type: 'date', position: 4, width: 130, isRequired: false },
      { name: 'Progreso', type: 'progress', position: 5, width: 100, isRequired: false }
    ];

    for (const column of defaultColumns) {
      await sql`
        INSERT INTO project_column_settings (project_id, column_type, name, position, width, is_visible, is_required, created_by)
        SELECT 
          p.id,
          ${column.type}::column_type,
          ${column.name},
          ${column.position},
          ${column.width},
          true,
          ${column.isRequired},
          p.created_by
        FROM projects p
        WHERE NOT EXISTS (
          SELECT 1 FROM project_column_settings pcs 
          WHERE pcs.project_id = p.id AND pcs.name = ${column.name}
        );
      `;
    }

    // 10. Migrar tareas existentes al primer grupo disponible
    console.log('📋 Migrando tareas existentes a grupos...');
    
    await sql`
      UPDATE tasks 
      SET group_id = (
        SELECT tg.id 
        FROM task_groups tg 
        WHERE tg.project_id = tasks.project_id 
        ORDER BY tg.position 
        LIMIT 1
      )
      WHERE group_id IS NULL;
    `;

    console.log('✅ Migración del sistema Monday.com completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Ejecutar migración si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log('🎉 Migración completada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

export { runMigration };