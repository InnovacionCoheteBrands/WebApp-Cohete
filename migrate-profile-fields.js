/**
 * Migration script to add profile fields (nickname and coverImage) to users table
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/cohete_workflow";
  
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
    transform: { undefined: null }
  });

  try {
    console.log("Adding profile fields to users table...");
    
    // Add nickname column
    await client`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS nickname text;
    `;
    
    // Add cover_image column  
    await client`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS cover_image text;
    `;

    console.log("Profile fields migration completed successfully!");
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();