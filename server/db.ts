import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const isLocalHost = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1") || false;
const disableSSL = process.env.SUPABASE_USE_SSL === "false" || isLocalHost;

const postgresOptions: Parameters<typeof postgres>[1] = {
  max: parseInt(process.env.DB_POOL_SIZE ?? "10", 10),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT ?? "20", 10),
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT ?? "10", 10),
};

if (!disableSSL) {
  postgresOptions.ssl = {
    rejectUnauthorized: false,
  };
}

// Configurar conexión con pooling y soporte SSL para Supabase
// Configurar conexión con pooling y soporte SSL para Supabase
// Flag indicating if we are running in offline mode
export let isOffline = false;

let sql: any;
let db: any;

try {
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not set. Starting in offline mode.");
    isOffline = true;
  } else {
    sql = postgres(connectionString, postgresOptions);
    db = drizzle(sql, {
      schema,
      logger: process.env.NODE_ENV === 'development'
    });
    // Verify connection immediately to trigger fallback if auth fails
    await sql`SELECT 1`;
    console.log("✅ Database connection initialized and verified");
  }
} catch (error) {
  console.error("❌ Failed to initialize database connection:", error);
  console.warn("⚠️ Starting server with mock database to allow UI verification.");
  isOffline = true;
}

// Export mock DB if initialization failed
if (!db || isOffline) {
  const params = {
    // Mock chainable query builder
    get: function (target: any, prop: string): any {
      if (prop === 'then') {
        return (resolve: any) => resolve([]);
      }
      return () => new Proxy({}, params);
    }
  };

  const mockHandler = {
    get: function (target: any, prop: string) {
      if (prop === 'then') return undefined; // Handle promises correctly
      return (...args: any[]) => {
        console.warn(`⚠️ Database operation '${prop}' called in offline mode.`);
        return new Proxy({}, params);
      };
    }
  };
  db = new Proxy({}, mockHandler);
}

export { db };

// Función helper para manejar reintentos de conexión
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      if (error.message?.includes('Too many database connection attempts') ||
        error.message?.includes('Control plane request failed')) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}