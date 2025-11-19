import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const isLocalHost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
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
const sql = postgres(connectionString, postgresOptions);

export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

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