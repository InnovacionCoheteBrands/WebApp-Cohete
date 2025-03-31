import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const projectStatusEnum = pgEnum('project_status', ['active', 'planning', 'completed', 'on_hold']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects Table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").default('active'),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project Analysis Results Table
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  mission: text("mission"),
  vision: text("vision"),
  objectives: text("objectives"),
  targetAudience: text("target_audience"),
  brandTone: text("brand_tone"),
  keywords: text("keywords"),
  coreValues: text("core_values"),
  contentThemes: jsonb("content_themes"),
  competitorAnalysis: jsonb("competitor_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project User Assignments Table (many-to-many)
export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Documents Table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: 'set null' }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  extractedText: text("extracted_text"),
  analysisStatus: text("analysis_status").default('pending'),
  analysisResults: jsonb("analysis_results"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schedules (Workflows) Table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  specifications: text("specifications"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schedule Entries Table
export const scheduleEntries = pgTable("schedule_entries", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  platform: text("platform"),
  postDate: timestamp("post_date"),
  postTime: text("post_time"),
  hashtags: text("hashtags"),
  referenceImagePrompt: text("reference_image_prompt"),
  referenceImageUrl: text("reference_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define table relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  projectAssignments: many(projectAssignments),
  documents: many(documents),
  schedules: many(schedules),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
  analysis: one(analysisResults),
  assignments: many(projectAssignments),
  documents: many(documents),
  schedules: many(schedules),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  project: one(projects, { fields: [analysisResults.projectId], references: [projects.id] }),
}));

export const projectAssignmentsRelations = relations(projectAssignments, ({ one }) => ({
  project: one(projects, { fields: [projectAssignments.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectAssignments.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  uploader: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  project: one(projects, { fields: [schedules.projectId], references: [projects.id] }),
  creator: one(users, { fields: [schedules.createdBy], references: [users.id] }),
  entries: many(scheduleEntries),
}));

export const scheduleEntriesRelations = relations(scheduleEntries, ({ one }) => ({
  schedule: one(schedules, { fields: [scheduleEntries.scheduleId], references: [schedules.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  username: true,
  password: true,
  isPrimary: true,
}).refine(data => /^[a-zA-Z0-9_]{3,20}$/.test(data.username), {
  message: "Username must be between 3-20 characters and can only contain letters, numbers, and underscores",
  path: ["username"]
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalysisResultsSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true,
  createdAt: true, 
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  extractedText: true,
  analysisStatus: true,
  analysisResults: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultsSchema>;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
