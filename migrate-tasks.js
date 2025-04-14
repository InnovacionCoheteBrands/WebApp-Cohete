// Ejecuta este script para actualizar la tabla de tareas
// Node.js script para actualizar la tabla de tareas en la base de datos

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import fs from 'fs';

// Configuración para Neon DB
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function runMigration() {
  console.log('Iniciando migración de las tablas...');
  
  try {
    // Parte 1: Verificar y actualizar columnas en la tabla tasks
    // 1.1 Verificar parent_task_id
    console.log('Verificando columna parent_task_id en la tabla tasks...');
    const checkParentTaskIdSQL = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      AND column_name = 'parent_task_id';
    `;
    
    const { rows: columnsParentTaskId } = await pool.query(checkParentTaskIdSQL);
    
    if (columnsParentTaskId.length === 0) {
      console.log('La columna parent_task_id no existe, agregándola...');
      
      // Agregar la columna parent_task_id
      const addParentTaskIdSQL = `
        ALTER TABLE tasks 
        ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL;
      `;
      
      await pool.query(addParentTaskIdSQL);
      console.log('Columna parent_task_id agregada exitosamente.');
    } else {
      console.log('La columna parent_task_id ya existe.');
    }
    
    // 1.2 Verificar progress
    console.log('Verificando columna progress en la tabla tasks...');
    const checkProgressSQL = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      AND column_name = 'progress';
    `;
    
    const { rows: columnsProgress } = await pool.query(checkProgressSQL);
    
    if (columnsProgress.length === 0) {
      console.log('La columna progress no existe, agregándola...');
      
      // Agregar la columna progress
      const addProgressSQL = `
        ALTER TABLE tasks 
        ADD COLUMN progress INTEGER DEFAULT 0;
      `;
      
      await pool.query(addProgressSQL);
      console.log('Columna progress agregada exitosamente.');
    } else {
      console.log('La columna progress ya existe.');
    }
    
    // Parte 2: Verificar si existe la tabla task_comments
    console.log('Verificando tabla task_comments...');
    const checkTableSQL = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'task_comments';
    `;
    
    const { rows: tables } = await pool.query(checkTableSQL);
    
    if (tables.length === 0) {
      console.log('La tabla task_comments no existe, creándola...');
      
      // Crear la tabla task_comments
      const createTableSQL = `
        CREATE TABLE task_comments (
          id SERIAL PRIMARY KEY,
          task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      await pool.query(createTableSQL);
      console.log('Tabla task_comments creada exitosamente.');
    } else {
      console.log('La tabla task_comments ya existe.');
    }
    
    console.log('Migración completada exitosamente!');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar migración
runMigration();