import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, jsonb, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const projectStatusEnum = pgEnum('project_status', ['active', 'planning', 'completed', 'on_hold', 'archived']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'review', 'completed', 'cancelled', 'blocked', 'deferred']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent', 'critical']);
export const taskGroupEnum = pgEnum('task_group', ['backlog', 'sprint', 'doing', 'done', 'custom', 'blocked', 'upcoming']);
export const aiModelEnum = pgEnum('ai_model', ['grok']);
export const viewTypeEnum = pgEnum('view_type', ['list', 'kanban', 'gantt', 'calendar', 'timeline']);
export const automationTriggerEnum = pgEnum('automation_trigger', ['status_change', 'due_date_approaching', 'task_assigned', 'comment_added', 'subtask_completed', 'attachment_added']);
export const automationActionEnum = pgEnum('automation_action', ['change_status', 'assign_task', 'send_notification', 'create_subtask', 'update_priority', 'move_to_group']);

// Enum para roles de usuario
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'designer', 'content_creator', 'analyst', 'developer', 'stakeholder']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  // Nota: el campo email no existe en la base de datos actualmente
  // email: text("email").unique(),
  password: text("password").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  role: userRoleEnum("role").default('content_creator'),
  bio: text("bio"),
  profileImage: text("profile_image"),
  jobTitle: text("job_title"),
  department: text("department"),
  phoneNumber: text("phone_number"),
  preferredLanguage: text("preferred_language").default("es"),
  theme: text("theme").default("light"),
  lastLogin: timestamp("last_login"),
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
  additionalInstructions: text("additional_instructions"),
  // aiModel: aiModelEnum("ai_model").default('grok'), // Removida - ya solo usamos Grok implícitamente
  // periodType: text("period_type").default('quincenal'), // Removida - Ahora se guarda en campo extendido
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
  comments: text("comments"), // Campo para comentarios adicionales de la publicación
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

// Declarar el objeto tasksTable primero para evitar referencia circular
const tasksTable = {
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
  startDate: timestamp("start_date"), // Fecha de inicio para planificación Gantt
  endDate: timestamp("end_date"), // Fecha de fin para planificación Gantt
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"), // Tiempo real dedicado a la tarea
  dependencies: integer("dependencies").array(), // IDs de tareas de las que depende
  parentTaskId: integer("parent_task_id"), // Referencia a la propia tabla de tareas
  progress: integer("progress").default(0), // Progreso de la tarea en porcentaje (0-100)
  attachments: jsonb("attachments").default([]), // Lista de archivos adjuntos {name, url, type}
  reminderDate: timestamp("reminder_date"), // Fecha para enviar recordatorio
  customFields: jsonb("custom_fields").default({}), // Campos personalizados para extender la funcionalidad
  followers: integer("followers").array(), // Usuarios que siguen esta tarea
  timeTracking: jsonb("time_tracking").default([]), // Registro de tiempo {startTime, endTime, duration, userId, notes}
  workflowId: integer("workflow_id"), // ID del flujo de trabajo al que pertenece
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// Tasks Table - Para el gestor de tareas con IA estilo Monday
export const tasks = pgTable("tasks", tasksTable);

// Tabla para comentarios de tareas
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  comment: text("comment").notNull(),
  attachments: jsonb("attachments").default([]), // Lista de archivos adjuntos {name, url, type}
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

// Tabla para vistas de proyecto (list, kanban, gantt, etc.)
export const projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  type: viewTypeEnum("type").default('list').notNull(),
  config: jsonb("config").default({}), // Configuración específica de la vista
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para automatizaciones de flujo de trabajo
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").default({}), // Configuración del disparador
  action: automationActionEnum("action").notNull(),
  actionConfig: jsonb("action_config").default({}), // Configuración de la acción
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para seguimiento de tiempo de trabajo
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // Duración en segundos
  description: text("description"),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para etiquetas personalizadas
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  color: text("color").default('#3498db'),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para documentos colaborativos y wikis
export const collaborativeDocs = pgTable("collaborative_docs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  contentJson: jsonb("content_json"), // Contenido estructurado para edición colaborativa
  lastEditedBy: integer("last_edited_by").references(() => users.id, { onDelete: 'set null' }),
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
  timeEntries: many(timeEntries),
  createdViews: many(projectViews, { relationName: "createdViews" }),
  createdAutomations: many(automationRules, { relationName: "createdAutomations" }),
  createdTags: many(tags, { relationName: "createdTags" }),
  createdDocs: many(collaborativeDocs, { relationName: "createdDocs" }),
  editedDocs: many(collaborativeDocs, { relationName: "editedDocs" }),
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
  views: many(projectViews),
  automationRules: many(automationRules),
  tags: many(tags),
  collaborativeDocs: many(collaborativeDocs),
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

export const projectViewsRelations = relations(projectViews, ({ one }) => ({
  project: one(projects, { fields: [projectViews.projectId], references: [projects.id] }),
  creator: one(users, { fields: [projectViews.createdBy], references: [users.id] }),
}));

export const automationRulesRelations = relations(automationRules, ({ one }) => ({
  project: one(projects, { fields: [automationRules.projectId], references: [projects.id] }),
  creator: one(users, { fields: [automationRules.createdBy], references: [users.id] }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
  user: one(users, { fields: [timeEntries.userId], references: [users.id] }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  project: one(projects, { fields: [tags.projectId], references: [projects.id] }),
  creator: one(users, { fields: [tags.createdBy], references: [users.id] }),
}));

export const collaborativeDocsRelations = relations(collaborativeDocs, ({ one }) => ({
  project: one(projects, { fields: [collaborativeDocs.projectId], references: [projects.id] }),
  creator: one(users, { fields: [collaborativeDocs.createdBy], references: [users.id] }),
  lastEditor: one(users, { fields: [collaborativeDocs.lastEditedBy], references: [users.id] }),
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
  role: z.enum(['admin', 'manager', 'designer', 'content_creator', 'analyst']).optional().default('content_creator'),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional().default("es"),
  theme: z.string().optional().default("light"),
});

// Schema para actualizar perfil (sin contraseña)
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio").optional(),
  role: z.enum(['admin', 'manager', 'designer', 'content_creator', 'analyst']).optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  theme: z.string().optional(),
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
}).extend({
  // Permitir que startDate y endDate sean strings o fechas
  startDate: z.union([z.string(), z.date(), z.null()]).optional(),
  endDate: z.union([z.string(), z.date(), z.null()]).optional(),
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
    distributionPreferences: distributionPreferencesSchema,
    periodType: z.enum(['quincenal', 'mensual']).default('quincenal')
    // aiModel field removed as it no longer exists in the database
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

// Nuevos esquemas de validación para gestión de proyectos tipo Monday/Taskade
export const insertProjectViewSchema = createInsertSchema(projectViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutomationRuleSchema = createInsertSchema(automationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertCollaborativeDocSchema = createInsertSchema(collaborativeDocs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
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

// Tipo para los modelos de IA - Actualmente solo se usa Grok
export enum AIModel {
  GROK = "grok"
}

// Definición de la interfaz para la respuesta de ContentSchedule desde los modelos de IA
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

// Nuevos tipos para gestión de proyectos tipo Monday/Taskade
export type ProjectView = typeof projectViews.$inferSelect;
export type InsertProjectView = z.infer<typeof insertProjectViewSchema>;

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type CollaborativeDoc = typeof collaborativeDocs.$inferSelect;
export type InsertCollaborativeDoc = z.infer<typeof insertCollaborativeDocSchema>;
