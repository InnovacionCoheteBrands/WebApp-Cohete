/**
 * Migración para implementar el sistema completo de colaboración
 * Añade tablas para comentarios, notificaciones, dependencias y miembros de proyecto
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const db = drizzle(client);

    console.log('🚀 Iniciando migración del sistema de colaboración...');

    // Crear enum para tipos de notificaciones
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM (
          'task_assigned',
          'mentioned_in_comment',
          'task_status_changed',
          'comment_added',
          'due_date_approaching'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla de comentarios de tareas
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        mentioned_users JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Crear tabla de notificaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type notification_type NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        related_comment_id INTEGER REFERENCES task_comments(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Crear tabla de dependencias de tareas
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(task_id, depends_on_task_id)
      );
    `);

    // Crear tabla de miembros de proyecto
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(project_id, user_id)
      );
    `);

    // Crear índices para mejorar el rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
    `);

    // Insertar miembro por defecto para el proyecto existente
    await client.query(`
      INSERT INTO project_members (project_id, user_id, role)
      SELECT p.id, u.id, 'owner'
      FROM projects p, users u
      WHERE u.is_primary = true
      ON CONFLICT (project_id, user_id) DO NOTHING;
    `);

    console.log('✅ Migración del sistema de colaboración completada exitosamente');
    console.log('📊 Tablas creadas:');
    console.log('   - task_comments: Sistema de comentarios');
    console.log('   - notifications: Sistema de notificaciones');
    console.log('   - task_dependencies: Dependencias entre tareas');
    console.log('   - project_members: Miembros de proyecto');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Ejecutar migración si se llama directamente
runMigration()
  .then(() => {
    console.log('🎉 Migración ejecutada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });

export { runMigration };