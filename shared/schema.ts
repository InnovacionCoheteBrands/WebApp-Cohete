// Export all schema types for shared use between client and server
export * from '../server/schema';
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
});