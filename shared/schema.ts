// ===== IMPORTACIONES DE DRIZZLE ORM =====
// Drizzle ORM: Sistema de ORM tipo-seguro para PostgreSQL
import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, jsonb, numeric } from "drizzle-orm/pg-core";
// Zod: Librería de validación de esquemas
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Relaciones entre tablas
import { relations } from "drizzle-orm";

// ===== DEFINICIÓN DE ENUMS =====
// Los enums definen valores permitidos para ciertos campos de la base de datos

// Roles de usuario en el sistema de gestión de proyectos
export const userRoleEnum = pgEnum("user_role", ["admin", "project_manager", "content_creator", "designer", "developer", "stakeholder"]);

// Estados posibles de un proyecto
export const projectStatusEnum = pgEnum("project_status", ["active", "planning", "completed", "on_hold"]);

// Estados de las tareas individuales
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "cancelled", "blocked", "deferred"]);

// Niveles de prioridad para las tareas
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent", "critical"]);

// Grupos de organización para tareas (tipo Kanban)
export const taskGroupEnum = pgEnum("task_group", ["todo", "in_progress", "completed", "blocked", "upcoming"]);

// Tipos de notificaciones del sistema
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "error", "success", "comment", "mention", "assignment"]);

// Tipos de vista para mostrar proyectos/tareas
export const viewTypeEnum = pgEnum("view_type", ["list", "kanban", "calendar", "gantt", "table"]);

// Tipos de columna para campos dinámicos
export const columnTypeEnum = pgEnum("column_type", ["text", "number", "date", "status", "priority", "people", "checkbox", "dropdown"]);

// Triggers para reglas de automatización
export const automationTriggerEnum = pgEnum("automation_trigger", ["status_change", "assignment", "due_date", "creation", "completion"]);

// Acciones para reglas de automatización
export const automationActionEnum = pgEnum("automation_action", ["notify", "assign", "move", "update_status", "create_task"]);

// Modelos de IA soportados por el sistema
export const aiModelEnum = pgEnum("ai_model", ["gpt-4", "gpt-3.5-turbo", "gemini-1.5-pro"]);

// ===== DEFINICIÓN DE TABLAS =====

// ===== TABLA DE SESIONES =====
// Almacena las sesiones de usuarios autenticados (para express-session)
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(), // ID único de la sesión
  sess: jsonb("sess").notNull(), // Datos de la sesión en formato JSON
  expire: timestamp("expire").notNull() // Fecha de expiración de la sesión
});

// ===== TABLA DE USUARIOS =====
// Información completa de los usuarios del sistema
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // ID único (compatible con OAuth)
  fullName: text("full_name").notNull(), // Nombre completo del usuario
  username: text("username").notNull().unique(), // Nombre de usuario único
  email: text("email").unique(), // Email del usuario (único)
  password: text("password"), // Contraseña encriptada (opcional para OAuth)
  isPrimary: boolean("is_primary").default(false).notNull(), // Usuario administrador principal
  role: userRoleEnum("role").default("content_creator"), // Rol del usuario en el sistema
  bio: text("bio"), // Biografía del usuario
  profileImage: text("profile_image"), // URL de la imagen de perfil
  coverImage: text("cover_image"), // URL de la imagen de portada
  nickname: text("nickname"), // Apodo o nombre corto
  jobTitle: text("job_title"), // Título del trabajo
  department: text("department"), // Departamento al que pertenece
  phoneNumber: text("phone_number"), // Número de teléfono
  preferredLanguage: text("preferred_language").default("es"), // Idioma preferido
  theme: text("theme").default("light"), // Tema visual (claro/oscuro)
  customFields: jsonb("custom_fields").default([]), // Campos personalizados
  lastLogin: timestamp("last_login"), // Último inicio de sesión
  firstName: text("first_name"), // Nombre
  lastName: text("last_name"), // Apellido  
  profileImageUrl: text("profile_image_url"), // URL alternativa de imagen de perfil
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación
  updatedAt: timestamp("updated_at").defaultNow().notNull() // Fecha de última actualización
});

// ===== TABLA DE PROYECTOS =====
// Almacena información de proyectos de marketing y sus configuraciones
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(), // ID único autoincremental
  name: text("name").notNull(), // Nombre del proyecto
  client: text("client").notNull(), // Nombre del cliente
  description: text("description"), // Descripción del proyecto
  startDate: timestamp("start_date"), // Fecha de inicio
  endDate: timestamp("end_date"), // Fecha de finalización
  status: projectStatusEnum("status").default("active"), // Estado actual del proyecto
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }), // Usuario que creó el proyecto
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación
  updatedAt: timestamp("updated_at").defaultNow().notNull() // Fecha de última actualización
});

// ===== TABLA DE TAREAS =====
// Sistema de gestión de tareas con funcionalidades tipo Monday.com
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(), // ID único autoincremental
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(), // Proyecto al que pertenece la tarea
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: "set null" }), // Usuario asignado a la tarea
  createdById: varchar("created_by_id").references(() => users.id, { onDelete: "set null" }), // Usuario que creó la tarea
  title: text("title").notNull(), // Título de la tarea
  description: text("description"), // Descripción detallada
  status: taskStatusEnum("status").default("pending").notNull(), // Estado actual de la tarea
  priority: taskPriorityEnum("priority").default("medium").notNull(), // Prioridad de la tarea
  group: taskGroupEnum("group").default("todo"), // Grupo de organización (para vistas Kanban)
  position: integer("position").default(0), // Posición para ordenamiento manual
  aiGenerated: boolean("ai_generated").default(false), // Indica si fue generada por IA
  aiSuggestion: text("ai_suggestion"), // Sugerencia de IA para la tarea
  tags: text("tags").array(), // Etiquetas para categorización
  dueDate: timestamp("due_date"), // Fecha límite
  completedAt: timestamp("completed_at"), // Fecha de finalización
  estimatedHours: integer("estimated_hours"), // Horas estimadas para completar
  dependencies: text("dependencies").array(), // IDs de tareas de las que depende
  parentTaskId: integer("parent_task_id"), // Tarea padre (para subtareas)
  progress: integer("progress").default(0), // Porcentaje de progreso (0-100)
  attachments: jsonb("attachments"), // Archivos adjuntos en formato JSON
  groupId: integer("group_id"), // ID del grupo para organización adicional
  createdAt: timestamp("created_at").defaultNow().notNull(), // Fecha de creación
  updatedAt: timestamp("updated_at").defaultNow().notNull() // Fecha de última actualización
});

// Analysis Results table - Almacena todos los datos del formulario de proyecto para uso de IA
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),

  // Pestaña MVV (Misión, Visión, Valores)
  mission: text("mission"),
  vision: text("vision"),
  coreValues: text("core_values"),

  // Pestaña Objetivos
  objectives: text("objectives"),
  communicationObjectives: text("communication_objectives"),

  // Pestaña Persona
  buyerPersona: text("buyer_persona"),
  targetAudience: text("target_audience"),

  // Pestaña Estrategias
  marketingStrategies: text("marketing_strategies"),
  archetypes: jsonb("archetypes"),

  // Pestaña Comunicación
  brandCommunicationStyle: text("brand_communication_style"),
  brandTone: text("brand_tone"),
  socialNetworks: jsonb("social_networks"),

  // Pestaña Políticas
  responsePolicyPositive: text("response_policy_positive"),
  responsePolicyNegative: text("response_policy_negative"),

  // Campos adicionales para contenido y análisis
  keywords: text("keywords"),
  contentThemes: jsonb("content_themes"),
  competitorAnalysis: jsonb("competitor_analysis"),

  // Campos para datos generales del proyecto (de la pestaña General)
  projectDescription: text("project_description"),
  additionalNotes: text("additional_notes"),

  // ===== NUEVOS CAMPOS PARA CALIDAD DE CONTENIDO (P0) =====

  // Propuesta de Valor Única (UVP) - Qué hace diferente a la marca
  uniqueValueProposition: text("unique_value_proposition"),

  // Voice of Customer (VoC) - Lenguaje real del cliente
  customerQuotes: jsonb("customer_quotes"), // Array de frases literales del cliente
  customerObjections: text("customer_objections"), // Objeciones frecuentes
  customerVocabulary: text("customer_vocabulary"), // Jerga/vocabulario del público

  // Calendario Estacional - Fechas clave para la marca
  seasonalCalendar: jsonb("seasonal_calendar"), // Array de eventos con fecha y descripción

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  uploadedBy: varchar("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Schedules table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  additionalInstructions: text("additional_instructions"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Schedule Entries table
export const scheduleEntries = pgTable("schedule_entries", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => schedules.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  copyIn: text("copy_in"),
  copyOut: text("copy_out"),
  designInstructions: text("design_instructions"),
  platform: text("platform").notNull(),
  postDate: timestamp("post_date").notNull(),
  postTime: text("post_time").notNull(),
  hashtags: text("hashtags"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Chat Messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isAi: boolean("is_ai").default(false),
  aiModel: aiModelEnum("ai_model"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Content History table
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  scheduleEntryId: integer("schedule_entry_id").references(() => scheduleEntries.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changeDescription: text("change_description"),
  changedBy: varchar("changed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Task Comments table
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sku: text("sku"),
  price: numeric("price", { precision: 10, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Project Views table
export const projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: viewTypeEnum("type").default("list").notNull(),
  config: jsonb("config").default({}),
  isDefault: boolean("is_default").default(false),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Automation Rules table
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  triggerConditions: jsonb("trigger_conditions"),
  action: automationActionEnum("action").notNull(),
  actionConfig: jsonb("action_config"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Time Entries table
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  isRunning: boolean("is_running").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  color: text("color").default("#3498db"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Collaborative Docs table
export const collaborativeDocs = pgTable("collaborative_docs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  contentJson: jsonb("content_json"),
  lastEditedBy: varchar("last_edited_by").references(() => users.id, { onDelete: "set null" }),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title"),
  message: text("message").notNull(),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: text("related_entity_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Task Dependencies table
export const taskDependencies = pgTable("task_dependencies", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  dependsOnTaskId: integer("depends_on_task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Project Members table
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("member"),
  permissions: jsonb("permissions").default([]),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Project Assignments table
export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull()
});

// Task Groups table
export const taskGroups = pgTable("task_groups", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  color: text("color").default("#3498db"),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Project Column Settings table
export const projectColumnSettings = pgTable("project_column_settings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  columnName: text("column_name").notNull(),
  columnType: columnTypeEnum("column_type").notNull(),
  isVisible: boolean("is_visible").default(true),
  position: integer("position").default(0),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Task Column Values table
export const taskColumnValues = pgTable("task_column_values", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  columnId: integer("column_id").references(() => projectColumnSettings.id, { onDelete: "cascade" }).notNull(),
  valueText: text("value_text"),
  valueNumber: numeric("value_number", { precision: 10, scale: 2 }),
  valueDate: timestamp("value_date"),
  valueBool: boolean("value_bool"),
  valueJson: jsonb("value_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Task Assignees table
export const taskAssignees = pgTable("task_assignees", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull()
});

// Task Attachments table
export const taskAttachments = pgTable("task_attachments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: varchar("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Activity Log table
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Password Reset Tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  timezone: text("timezone").default("UTC"),
  dateFormat: text("date_format").default("MM/DD/YYYY"),
  timeFormat: text("time_format").default("12h"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Define all types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = typeof scheduleEntries.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type ProjectView = typeof projectViews.$inferSelect;
export type InsertProjectView = typeof projectViews.$inferInsert;
export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type CollaborativeDoc = typeof collaborativeDocs.$inferSelect;
export type InsertCollaborativeDoc = typeof collaborativeDocs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = typeof taskDependencies.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;
export type ProjectAssignment = typeof projectAssignments.$inferSelect;

// Define schemas for validation
// import { createInsertSchema } from "drizzle-zod";
// ...
export const insertUserSchema = createInsertSchema(users);
export const insertProjectSchema = createInsertSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertAnalysisResultsSchema = createInsertSchema(analysisResults);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertScheduleSchema = createInsertSchema(schedules);
export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertContentHistorySchema = createInsertSchema(contentHistory);
export const insertTaskCommentSchema = createInsertSchema(taskComments);
export const insertProductSchema = createInsertSchema(products);
export const insertProjectViewSchema = createInsertSchema(projectViews);
export const insertAutomationRuleSchema = createInsertSchema(automationRules);
export const insertTimeEntrySchema = createInsertSchema(timeEntries);
export const insertTagSchema = createInsertSchema(tags);
export const insertCollaborativeDocSchema = createInsertSchema(collaborativeDocs);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertTaskDependencySchema = createInsertSchema(taskDependencies);
export const insertProjectMemberSchema = createInsertSchema(projectMembers);
export const insertTaskGroupSchema = createInsertSchema(taskGroups);
export const insertProjectColumnSettingSchema = createInsertSchema(projectColumnSettings);
export const insertTaskColumnValueSchema = createInsertSchema(taskColumnValues);

// Esquemas adicionales para autenticación
export const loginSchema = z.object({
  identifier: z.string().min(1, "Se requiere nombre de usuario o email"),
  password: z.string().min(1, "Se requiere contraseña")
});

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  theme: z.string().optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  nickname: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

// Export enum types
export const AIModel = z.enum(["gpt-4", "gpt-3.5-turbo", "gemini-1.5-pro"]);
export type AIModelType = z.infer<typeof AIModel>;