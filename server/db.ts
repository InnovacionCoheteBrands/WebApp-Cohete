import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Use environment variable or default to local connection
const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/cohete_workflow";

console.log("Connecting to database...");

// Configure postgres client with better error handling for Replit
const client = postgres(connectionString, {
  ssl: 'require', // Always require SSL for Neon database
  max: 1, // Limit connections for Replit
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notices
  transform: {
    undefined: null
  }
});

export const db = drizzle(client, { schema });