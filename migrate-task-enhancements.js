/**
 * Migration script to enhance task management functionality
 * Adds new tables for comments, attachments, and activity log
 * Fixes type mismatches for OAuth user support
 */

import { neon } from '@neondatabase/serverless';

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Starting task enhancements migration...');

    // Fix assignedToId and createdById columns to be varchar instead of integer
    console.log('Updating tasks table columns to support varchar user IDs...');
    
    // Check if columns need updating
    const columnInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      AND column_name IN ('assigned_to_id', 'created_by_id')
    `;
    
    for (const column of columnInfo) {
      if (column.data_type === 'integer') {
        console.log(`Updating ${column.column_name} from integer to varchar...`);
        const columnName = column.column_name;
        await sql`ALTER TABLE tasks ALTER COLUMN ${sql.unsafe(columnName)} TYPE varchar USING ${sql.unsafe(columnName)}::varchar`;
      }
    }

    // Update task_comments table to match new schema
    console.log('Updating task_comments table...');
    
    // Check if task_comments needs updating
    const commentsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'task_comments'
      )
    `;
    
    if (commentsExists[0].exists) {
      // Drop old comment column if it exists and add new content column
      const commentColumn = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'task_comments' AND column_name = 'comment'
        )
      `;
      
      if (commentColumn[0].exists) {
        await sql`ALTER TABLE task_comments RENAME COLUMN comment TO content`;
      }
      
      // Update user_id column type
      const userIdColumn = await sql`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'task_comments' AND column_name = 'user_id'
      `;
      
      if (userIdColumn[0] && userIdColumn[0].data_type === 'integer') {
        await sql`ALTER TABLE task_comments ALTER COLUMN user_id TYPE varchar USING user_id::varchar`;
      }
      
      // Remove unnecessary columns
      const columnsToRemove = ['attachments', 'updated_at'];
      for (const col of columnsToRemove) {
        const colExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'task_comments' AND column_name = ${col}
          )
        `;
        if (colExists[0].exists) {
          await sql`ALTER TABLE task_comments DROP COLUMN ${sql(col)}`;
        }
      }
    }

    // Create task_attachments table
    console.log('Creating task_attachments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS task_attachments (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create activity_log table
    console.log('Creating activity_log table...');
    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

runMigration().catch(console.error);