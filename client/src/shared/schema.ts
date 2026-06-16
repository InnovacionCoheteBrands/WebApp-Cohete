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
export const aiModelEnum = pgEnum("ai_model", [
  "gpt-4",
  "gpt-3.5-turbo",
  "grok-beta",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct-0905",
  "qwen/qwen3-32b",
  "openai/gpt-oss-safeguard-20b",
  "gemini-1.5-pro"
]);

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
  uvp: text("uvp"),
  voiceOfCustomer: text("voice_of_customer"),

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
  brandPillars: jsonb("brand_pillars").default([]),
  proofPoints: jsonb("proof_points").default([]),
  targetChannels: jsonb("target_channels").default([]),
  visualStyleGuidelines: text("visual_style_guidelines"),
  brandGuidelines: text("brand_guidelines"),
  forbiddenTerms: jsonb("forbidden_terms").default([]),
  performanceInsights: jsonb("performance_insights").default([]),
  recommendedNextActions: jsonb("recommended_next_actions").default([]),
  lastFeedbackAppliedAt: timestamp("last_feedback_applied_at"),
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

// Documents table (using Pruebas schema for AI document analysis)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  extractedText: text("extracted_text"),
  analysisStatus: text("analysis_status").default("pending"),
  analysisResults: jsonb("analysis_results"),
  analysisError: text("analysis_error"),
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
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  specifications: text("specifications"),
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
  uvpAlignmentScore: integer("uvp_alignment_score"),
  uvpAlignmentReason: text("uvp_alignment_reason"),
  referenceImagePrompt: text("reference_image_prompt"),
  referenceImageUrl: text("reference_image_url"),
  assetBrief: jsonb("asset_brief").default({}),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Chat Messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  role: text("role"),
  legacyMessage: text("message"),
  legacyIsAi: boolean("is_ai").default(false),
  aiModel: aiModelEnum("ai_model"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Content History table
export const contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Agent Runs table
export const agentRuns = pgTable("agent_runs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  entrypoint: text("entrypoint").notNull(),
  status: text("status").notNull(),
  route: text("route"),
  finalAgent: text("final_agent"),
  provider: text("provider"),
  model: text("model"),
  estimatedTokens: integer("estimated_tokens"),
  actualTokens: integer("actual_tokens"),
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at")
});

// Agent Artifacts table
export const agentArtifacts = pgTable("agent_artifacts", {
  id: serial("id").primaryKey(),
  runId: integer("run_id").references(() => agentRuns.id, { onDelete: "cascade" }).notNull(),
  agent: text("agent").notNull(),
  artifactType: text("artifact_type").notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Model Routes table
export const modelRoutes = pgTable("model_routes", {
  id: serial("id").primaryKey(),
  entrypoint: text("entrypoint").notNull(),
  agent: text("agent").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  reasoningMode: text("reasoning_mode"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Team Members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
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
export type User = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  password: string | null;
  isPrimary: boolean;
  role: string | null;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  nickname: string | null;
  jobTitle: string | null;
  department: string | null;
  phoneNumber: string | null;
  preferredLanguage: string | null;
  theme: string | null;
  customFields: any;
  lastLogin: Date | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertUser = Omit<User, "createdAt" | "updatedAt"> & {
  id?: string;
  fullName?: string;
  username?: string;
  email?: string | null;
  password?: string | null;
  isPrimary?: boolean;
  role?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Project = {
  id: number;
  name: string;
  client: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertProject = Omit<Project, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
  name?: string;
  client?: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string | null;
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Task = {
  id: number;
  projectId: number;
  assignedToId: string | null;
  createdById: string | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "blocked" | "deferred";
  priority: "low" | "medium" | "high" | "urgent" | "critical";
  group: "todo" | "in_progress" | "completed" | "blocked" | "upcoming" | null;
  position: number | null;
  aiGenerated: boolean | null;
  aiSuggestion: string | null;
  tags: string[] | null;
  dueDate: Date | null;
  completedAt: Date | null;
  estimatedHours: number | null;
  dependencies: string[] | null;
  parentTaskId: number | null;
  progress: number | null;
  attachments: any;
  groupId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTask = Omit<Task, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
  assignedToId?: string | null;
  createdById?: string | null;
  title?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled" | "blocked" | "deferred";
  priority?: "low" | "medium" | "high" | "urgent" | "critical";
  group?: "todo" | "in_progress" | "completed" | "blocked" | "upcoming" | null;
  position?: number | null;
  aiGenerated?: boolean | null;
  aiSuggestion?: string | null;
  tags?: string[] | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  estimatedHours?: number | null;
  dependencies?: string[] | null;
  parentTaskId?: number | null;
  progress?: number | null;
  attachments?: any;
  groupId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;

export type Document = {
  id: number;
  projectId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  extractedText: string | null;
  analysisStatus: string | null;
  analysisResults: any;
  analysisError: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertDocument = Omit<Document, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  extractedText?: string | null;
  analysisStatus?: string | null;
  analysisResults?: any;
  analysisError?: string | null;
  uploadedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
export type InsertScheduleEntry = typeof scheduleEntries.$inferInsert;

export type ChatMessage = {
  id: number;
  projectId: number;
  userId: string | null;
  content: string | null;
  role: string | null;
  legacyMessage: string | null;
  legacyIsAi: boolean | null;
  aiModel: string | null;
  createdAt: Date;
};

export type InsertChatMessage = Omit<ChatMessage, "id" | "createdAt"> & {
  id?: number;
  projectId?: number;
  userId?: string | null;
  content?: string | null;
  role?: string | null;
  legacyMessage?: string | null;
  legacyIsAi?: boolean | null;
  aiModel?: string | null;
  createdAt?: Date;
};
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

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type AgentRun = typeof agentRuns.$inferSelect;
export type InsertAgentRun = typeof agentRuns.$inferInsert;
export type AgentArtifact = typeof agentArtifacts.$inferSelect;
export type InsertAgentArtifact = typeof agentArtifacts.$inferInsert;
export type ModelRoute = typeof modelRoutes.$inferSelect;
export type InsertModelRoute = typeof modelRoutes.$inferInsert;

// Define schemas for validation
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
export const insertTeamSchema = createInsertSchema(teams);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertAgentRunSchema = createInsertSchema(agentRuns);
export const insertAgentArtifactSchema = createInsertSchema(agentArtifacts);
export const insertModelRouteSchema = createInsertSchema(modelRoutes);

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

// Zod schemas y tipos adicionales para marketing
export const socialMetricSchema = z.object({
  platform: z.string().min(1),
  format: z.string().optional(),
  title: z.string().optional(),
  publishedAt: z.string().optional(),
  impressions: z.number().nonnegative().optional(),
  reach: z.number().nonnegative().optional(),
  engagement: z.number().nonnegative().optional(),
  engagementRate: z.number().nonnegative().optional(),
  clicks: z.number().nonnegative().optional(),
  saves: z.number().nonnegative().optional(),
  shares: z.number().nonnegative().optional(),
  comments: z.number().nonnegative().optional(),
  conversions: z.number().nonnegative().optional(),
});
export type SocialMetric = z.infer<typeof socialMetricSchema>;

export const assetPreviewItemSchema = z.object({
  title: z.string(),
  platform: z.string(),
  creativeAngle: z.string(),
  assetType: z.string(),
  copyHook: z.string(),
  prompt: z.string(),
  previewUrl: z.string(),
});
export type AssetPreviewItem = z.infer<typeof assetPreviewItemSchema>;

export const feedbackLoopInsightSchema = z.object({
  summary: z.string(),
  highPerformingPatterns: z.array(z.string()).default([]),
  lowPerformingPatterns: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  contentOpportunities: z.array(z.string()).default([]),
});
export type FeedbackLoopInsight = z.infer<typeof feedbackLoopInsightSchema>;

// Export enum types
export const AIModel = z.enum([
  "gpt-4",
  "gpt-3.5-turbo",
  "grok-beta",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "moonshotai/kimi-k2-instruct-0905",
  "qwen/qwen3-32b",
  "openai/gpt-oss-safeguard-20b",
  "gemini-1.5-pro"
]);
export type AIModelType = z.infer<typeof AIModel>;
