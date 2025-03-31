import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

// Connection string should come from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure neon client
neonConfig.fetchConnectionCache = true;

// Create a SQL client
const sql = neon(connectionString);

// Create drizzle database instance
export const db = drizzle(sql, { schema });
