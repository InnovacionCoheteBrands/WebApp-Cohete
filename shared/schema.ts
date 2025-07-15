// Export all schema types for shared use between client and server
export * from '../server/schema';

// Additional tables are defined in server/schema.ts
// This file only re-exports the schemas to avoid circular imports