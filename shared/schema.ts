import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, json, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const projectStatusEnum = pgEnum('project_status', ['active', 'planning', 'completed', 'on_hold']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'review', 'completed', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const taskGroupEnum = pgEnum('task_group', ['backlog', 'sprint', 'doing', 'done', 'custom']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  // Nota: el campo email no existe en la base de datos actualmente
  // email: text("email").unique(),
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
  copyIn: text("copy_in"),
  copyOut: text("copy_out"),
  designInstructions: text("design_instructions"),
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

// Content History Table - Para evitar repeticiones en cronogramas
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  contentType: text("content_type").notNull(), // 'title', 'description', 'content', 'theme'
  content: text("content").notNull(), 
  title: text("title"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks Table - Para el gestor de tareas con IA estilo Monday
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id, { onDelete: 'set null' }),
  createdById: integer("created_by_id").references(() => users.id, { onDelete: 'set null' }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default('pending').notNull(),
  priority: taskPriorityEnum("priority").default('medium').notNull(),
  group: taskGroupEnum("group").default('backlog'),  // Grupo para organización estilo Monday
  position: integer("position").default(0), // Para ordenar dentro del grupo
  aiGenerated: boolean("ai_generated").default(false),
  aiSuggestion: text("ai_suggestion"),
  tags: text("tags").array(), // Etiquetas para categorizar tareas
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: integer("estimated_hours"),
  dependencies: integer("dependencies").array(), // IDs de tareas de las que depende
  parentTaskId: integer("parent_task_id").references(() => tasks.id, { onDelete: 'set null' }), // Para subtareas
  progress: integer("progress").default(0), // Progreso de la tarea en porcentaje (0-100)
  attachments: json("attachments").default([]), // Lista de archivos adjuntos {name, url, type}
  reminderDate: timestamp("reminder_date"), // Fecha para enviar recordatorio
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla para comentarios de tareas
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  comment: text("comment").notNull(),
  attachments: json("attachments").default([]), // Lista de archivos adjuntos {name, url, type}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para productos de proyectos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"), // URL de la imagen del producto
  sku: text("sku"), // SKU del producto (opcional)
  price: numeric("price", { precision: 10, scale: 2 }), // Precio del producto (opcional)
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define table relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  projectAssignments: many(projectAssignments),
  documents: many(documents),
  schedules: many(schedules),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
  analysis: one(analysisResults),
  assignments: many(projectAssignments),
  documents: many(documents),
  schedules: many(schedules),
  contentHistory: many(contentHistory),
  tasks: many(tasks),
  products: many(products),
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

export const contentHistoryRelations = relations(contentHistory, ({ one }) => ({
  project: one(projects, { fields: [contentHistory.projectId], references: [projects.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignedTo: one(users, { fields: [tasks.assignedToId], references: [users.id] }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id] }),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id] }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  user: one(users, { fields: [taskComments.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  project: one(projects, { fields: [products.projectId], references: [projects.id] }),
  creator: one(users, { fields: [products.createdBy], references: [users.id] }),
}));

// Zod schemas for validation
// Adaptamos el schema para que coincida con la base de datos actual 
// (sin campo email físicamente, pero manteniendo compatibilidad con el código)
export const insertUserSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio"),
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario debe tener como máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
  email: z.string().email("Debe ser un correo electrónico válido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  isPrimary: z.boolean().optional().default(false),
});

// Esquema para login que permite usar username o email
export const loginSchema = z.object({
  identifier: z.string().min(1, "Por favor, introduce tu nombre de usuario o correo electrónico"),
  password: z.string().min(1, "La contraseña es obligatoria"),
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

export const distributionPreferencesSchema = z.object({
  type: z.enum(['uniform', 'weekdays', 'weekend', 'custom']),
  frequency: z.enum(['daily', 'weekly', 'biweekly']).optional(),
  preferredTimes: z.array(z.string()).optional(),
  preferredDays: z.array(z.string()).optional(),
  concentration: z.number().min(0).max(100).optional(),
});

export const insertScheduleSchema = createInsertSchema(schedules)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    distributionPreferences: distributionPreferencesSchema
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

export const insertContentHistorySchema = createInsertSchema(contentHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true, 
  createdAt: true,
  updatedAt: true,
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

// Definición de la interfaz para la respuesta de ContentSchedule desde Mistral
export interface ContentScheduleEntry {
  title: string;
  description: string;
  content: string;
  copyIn: string;      // Texto integrado dentro del diseño
  copyOut: string;     // Texto para la descripción del post
  designInstructions: string; // Indicaciones para el departamento de diseño
  platform: string;
  postDate: string; // ISO string format
  postTime: string; // HH:MM format
  hashtags: string;
  referenceImagePrompt?: string; // Prompt para generar imagen de referencia
}

export interface ContentSchedule {
  name: string;
  entries: ContentScheduleEntry[];
}

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = z.infer<typeof insertContentHistorySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
