// Export all schema types for shared use between client and server
export * from '../server/schema';

// Import necessary Drizzle functions
import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { projects, users } from '../server/schema';

export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'schedule', 'chat', etc.
  title: varchar("title", { length: 255 }),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});