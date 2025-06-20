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
export const viewTypeEnum = pgEnum('view_type', ['list', 'kanban', 'gantt', 'calendar', 'timeline', 'board']);
export const automationTriggerEnum = pgEnum('automation_trigger', ['status_change', 'due_date_approaching', 'task_assigned', 'comment_added', 'subtask_completed', 'attachment_added']);
export const automationActionEnum = pgEnum('automation_action', ['change_status', 'assign_task', 'send_notification', 'create_subtask', 'update_priority', 'move_to_group']);

// Nuevos enums para el sistema Monday.com
export const columnTypeEnum = pgEnum('column_type', ['text', 'status', 'person', 'date', 'progress', 'tags', 'number', 'timeline', 'files', 'dropdown', 'checkbox']);
export const taskGroupTypeEnum = pgEnum('task_group_type', ['default', 'sprint', 'epic', 'milestone', 'custom']);

// Enum para roles de usuario
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'designer', 'content_creator', 'analyst', 'developer', 'stakeholder']);

// Enum para tipos de notificaciones
export const notificationTypeEnum = pgEnum('notification_type', ['task_assigned', 'mentioned_in_comment', 'task_status_changed', 'comment_added', 'due_date_approaching']);

// Sessions table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Users Table - Updated for OAuth support
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  isPrimary: boolean('is_primary').default(false),
  role: varchar('role', { length: 50 }).default('user'),
  bio: text('bio'),
  profileImage: text('profile_image'),
  coverImage: text('cover_image'),
  jobTitle: varchar('job_title', { length: 255 }),
  department: varchar('department', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 50 }),
  customFields: jsonb('custom_fields').default([]),
  lastLogin: timestamp('last_login'),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
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
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Documents Table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id, { onDelete: 'set null' }),
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
  groupId: integer("group_id").references(() => taskGroups.id, { onDelete: 'set null' }), // Nuevo: Referencia al grupo
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: 'set null' }),
  createdById: varchar("created_by_id").references(() => users.id, { onDelete: 'set null' }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default('pending').notNull(),
  priority: taskPriorityEnum("priority").default('medium').notNull(),
  group: taskGroupEnum("group").default('backlog'),  // Mantenemos por compatibilidad
  position: integer("position").default(0), // Para ordenar dentro del grupo
  aiGenerated: boolean("ai_generated").default(false),
  aiSuggestion: text("ai_suggestion"),
  tags: text("tags").array(), // Etiquetas para categorizar tareas
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: integer("estimated_hours"),
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
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para archivos adjuntos de tareas
export const taskAttachments = pgTable("task_attachments", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Tabla para registro de actividad
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// ============ NUEVAS TABLAS PARA SISTEMA MONDAY.COM ============

// Tabla para grupos de tareas (Task Groups) - Estilo Monday.com
export const taskGroups = pgTable("task_groups", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default('#4285f4'), // Color del grupo
  type: taskGroupTypeEnum("type").default('default'),
  position: integer("position").default(0), // Para ordenar grupos
  isCollapsed: boolean("is_collapsed").default(false), // Si está contraído
  settings: jsonb("settings").default({}), // Configuraciones adicionales
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para configuración de columnas de proyecto (Project Column Settings)
export const projectColumnSettings = pgTable("project_column_settings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  columnType: columnTypeEnum("column_type").notNull(),
  name: text("name").notNull(), // Nombre de la columna (ej. "Estado", "Asignado")
  position: integer("position").default(0), // Orden de la columna
  width: integer("width").default(150), // Ancho en píxeles
  isVisible: boolean("is_visible").default(true), // Si está visible
  isRequired: boolean("is_required").default(false), // Si es obligatoria
  settings: jsonb("settings").default({}), // Configuraciones específicas del tipo
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para valores de columnas personalizadas (Task Column Values)
export const taskColumnValues = pgTable("task_column_values", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  columnId: integer("column_id").references(() => projectColumnSettings.id, { onDelete: 'cascade' }).notNull(),
  valueText: text("value_text"), // Para valores de texto
  valueNumber: numeric("value_number", { precision: 10, scale: 2 }), // Para valores numéricos
  valueDate: timestamp("value_date"), // Para valores de fecha
  valueBool: boolean("value_bool"), // Para valores booleanos
  valueJson: jsonb("value_json"), // Para valores complejos (arrays, objetos)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla para asignaciones múltiples de tareas (Task Assignees)
export const taskAssignees = pgTable("task_assignees", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id, { onDelete: 'set null' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const scheduleEntryComments = pgTable('schedule_entry_comments', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id').references(() => scheduleEntries.id),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id).notNull().unique(),
  // Configuraciones de usuario/preferencias
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('es'),
  timezone: varchar('timezone', { length: 50 }).default('America/Mexico_City'),
  theme: varchar('theme', { length: 20 }).default('system'),
  // Configuraciones de notificaciones
  notificationSettings: jsonb('notification_settings').default({
    email: true,
    push: true,
    marketing: false,
    projects: true,
    tasks: true
  }),
  // Configuraciones de privacidad
  privacySettings: jsonb('privacy_settings').default({
    profileVisible: true,
    showEmail: false,
    showPhone: false
  }),
  // Configuraciones de apariencia (almacenadas por usuario)
  colorScheme: varchar('color_scheme', { length: 20 }).default('blue'),
  fontSize: varchar('font_size', { length: 20 }).default('medium'),
  reducedAnimations: boolean('reduced_animations').default(false),
  highContrastMode: boolean('high_contrast_mode').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  // Nuevas relaciones Monday.com
  createdTaskGroups: many(taskGroups, { relationName: "createdTaskGroups" }),
  createdColumns: many(projectColumnSettings, { relationName: "createdColumns" }),
  taskAssignments: many(taskAssignees, { relationName: "taskAssignments" }),
  assignedByTasks: many(taskAssignees, { relationName: "assignedByTasks" }),
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
  // Nuevas relaciones Monday.com
  taskGroups: many(taskGroups),
  columnSettings: many(projectColumnSettings),
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
  group: one(taskGroups, { fields: [tasks.groupId], references: [taskGroups.id] }),
  assignedTo: one(users, { fields: [tasks.assignedToId], references: [users.id] }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id] }),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id] }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  // Nuevas relaciones Monday.com
  assignees: many(taskAssignees),
  columnValues: many(taskColumnValues),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  user: one(users, { fields: [taskComments.userId], references: [users.id] }),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, { fields: [taskAttachments.taskId], references: [tasks.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, { fields: [activityLog.projectId], references: [projects.id] }),
  task: one(tasks, { fields: [activityLog.taskId], references: [tasks.id] }),
  user: one(users, { fields: [activityLog.userId], references: [users.id] }),
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

// ============ NUEVAS RELACIONES PARA SISTEMA MONDAY.COM ============

export const taskGroupsRelations = relations(taskGroups, ({ one, many }) => ({
  project: one(projects, { fields: [taskGroups.projectId], references: [projects.id] }),
  creator: one(users, { fields: [taskGroups.createdBy], references: [users.id] }),
  tasks: many(tasks),
}));

export const projectColumnSettingsRelations = relations(projectColumnSettings, ({ one, many }) => ({
  project: one(projects, { fields: [projectColumnSettings.projectId], references: [projects.id] }),
  creator: one(users, { fields: [projectColumnSettings.createdBy], references: [users.id] }),
  columnValues: many(taskColumnValues),
}));

export const taskColumnValuesRelations = relations(taskColumnValues, ({ one }) => ({
  task: one(tasks, { fields: [taskColumnValues.taskId], references: [tasks.id] }),
  column: one(projectColumnSettings, { fields: [taskColumnValues.columnId], references: [projectColumnSettings.id] }),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, { fields: [taskAssignees.taskId], references: [tasks.id] }),
  user: one(users, { fields: [taskAssignees.userId], references: [users.id] }),
  assignedBy: one(users, { fields: [taskAssignees.assignedBy], references: [users.id] }),
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
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  isPrimary: z.boolean().optional().default(false),
  role: z.enum(['admin', 'manager', 'designer', 'content_creator', 'analyst']).optional().default('content_creator'),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional().default("es"),
  theme: z.string().optional().default("light"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// Schema for OAuth user upsert
export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

// Schema para actualizar perfil (sin contraseña)
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").optional(),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  customFields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
    type: z.enum(['text', 'email', 'url', 'tel'])
  })).optional(),
  notificationSettings: z.object({
    email: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    projects: z.boolean(),
    tasks: z.boolean(),
  }).optional(),
  privacySettings: z.object({
    profileVisible: z.boolean(),
    showEmail: z.boolean(),
    showPhone: z.boolean(),
  }).optional(),
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

// ============ NUEVOS ESQUEMAS ZOD PARA SISTEMA MONDAY.COM ============

export const insertTaskGroupSchema = createInsertSchema(taskGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectColumnSettingSchema = createInsertSchema(projectColumnSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskColumnValueSchema = createInsertSchema(taskColumnValues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskAssigneeSchema = createInsertSchema(taskAssignees).omit({
  id: true,
  assignedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
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

// ============ NUEVOS TIPOS PARA SISTEMA MONDAY.COM ============

export type TaskGroup = typeof taskGroups.$inferSelect;
export type InsertTaskGroup = z.infer<typeof insertTaskGroupSchema>;

export type ProjectColumnSetting = typeof projectColumnSettings.$inferSelect;
export type InsertProjectColumnSetting = z.infer<typeof insertProjectColumnSettingSchema>;

export type TaskColumnValue = typeof taskColumnValues.$inferSelect;
export type InsertTaskColumnValue = z.infer<typeof insertTaskColumnValueSchema>;

export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type InsertTaskAssignee = z.infer<typeof insertTaskAssigneeSchema>;

// ============ NUEVAS TABLAS PARA SISTEMA DE COLABORACIÓN ============

// Actualizar tabla de comentarios existente para el sistema de colaboración
// La tabla taskComments ya existe, solo actualizamos las relaciones

// Notifications Table - Sistema de notificaciones
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedTaskId: integer("related_task_id").references(() => tasks.id, { onDelete: 'cascade' }),
  relatedCommentId: integer("related_comment_id").references(() => taskComments.id, { onDelete: 'cascade' }),
  isRead: boolean("is_read").default(false).notNull(),
  data: jsonb("data").default({}), // Datos adicionales específicos por tipo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task Dependencies Table - Dependencias entre tareas
export const taskDependencies = pgTable("task_dependencies", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  dependsOnTaskId: integer("depends_on_task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project Members Table - Miembros de proyecto (para asignaciones)
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").default("member"), // owner, admin, member, viewer
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ============ RELACIONES PARA NUEVAS TABLAS ============

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedTask: one(tasks, {
    fields: [notifications.relatedTaskId],
    references: [tasks.id],
  }),
  relatedComment: one(taskComments, {
    fields: [notifications.relatedCommentId],
    references: [taskComments.id],
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

// ============ ESQUEMAS ZOD PARA NUEVAS TABLAS ============

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTaskDependencySchema = createInsertSchema(taskDependencies).omit({
  id: true,
  createdAt: true,
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  joinedAt: true,
});

// ============ TIPOS PARA NUEVAS TABLAS ============

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = z.infer<typeof insertTaskDependencySchema>;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;