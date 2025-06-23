var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/simple-oauth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  AIModel: () => AIModel,
  activityLog: () => activityLog,
  activityLogRelations: () => activityLogRelations,
  aiModelEnum: () => aiModelEnum,
  analysisResults: () => analysisResults,
  analysisResultsRelations: () => analysisResultsRelations,
  automationActionEnum: () => automationActionEnum,
  automationRules: () => automationRules,
  automationRulesRelations: () => automationRulesRelations,
  automationTriggerEnum: () => automationTriggerEnum,
  chatMessages: () => chatMessages,
  collaborativeDocs: () => collaborativeDocs,
  collaborativeDocsRelations: () => collaborativeDocsRelations,
  columnTypeEnum: () => columnTypeEnum,
  contentHistory: () => contentHistory,
  contentHistoryRelations: () => contentHistoryRelations,
  distributionPreferencesSchema: () => distributionPreferencesSchema,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  insertAnalysisResultsSchema: () => insertAnalysisResultsSchema,
  insertAutomationRuleSchema: () => insertAutomationRuleSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertCollaborativeDocSchema: () => insertCollaborativeDocSchema,
  insertContentHistorySchema: () => insertContentHistorySchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertProductSchema: () => insertProductSchema,
  insertProjectColumnSettingSchema: () => insertProjectColumnSettingSchema,
  insertProjectMemberSchema: () => insertProjectMemberSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertProjectViewSchema: () => insertProjectViewSchema,
  insertScheduleEntrySchema: () => insertScheduleEntrySchema,
  insertScheduleSchema: () => insertScheduleSchema,
  insertTagSchema: () => insertTagSchema,
  insertTaskAssigneeSchema: () => insertTaskAssigneeSchema,
  insertTaskColumnValueSchema: () => insertTaskColumnValueSchema,
  insertTaskCommentSchema: () => insertTaskCommentSchema,
  insertTaskDependencySchema: () => insertTaskDependencySchema,
  insertTaskGroupSchema: () => insertTaskGroupSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertTimeEntrySchema: () => insertTimeEntrySchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  projectAssignments: () => projectAssignments,
  projectAssignmentsRelations: () => projectAssignmentsRelations,
  projectColumnSettings: () => projectColumnSettings,
  projectColumnSettingsRelations: () => projectColumnSettingsRelations,
  projectMembers: () => projectMembers,
  projectMembersRelations: () => projectMembersRelations,
  projectStatusEnum: () => projectStatusEnum,
  projectViews: () => projectViews,
  projectViewsRelations: () => projectViewsRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  scheduleEntries: () => scheduleEntries,
  scheduleEntriesRelations: () => scheduleEntriesRelations,
  scheduleEntryComments: () => scheduleEntryComments,
  schedules: () => schedules,
  schedulesRelations: () => schedulesRelations,
  sessions: () => sessions,
  tags: () => tags,
  tagsRelations: () => tagsRelations,
  taskAssignees: () => taskAssignees,
  taskAssigneesRelations: () => taskAssigneesRelations,
  taskAttachments: () => taskAttachments,
  taskAttachmentsRelations: () => taskAttachmentsRelations,
  taskColumnValues: () => taskColumnValues,
  taskColumnValuesRelations: () => taskColumnValuesRelations,
  taskComments: () => taskComments,
  taskCommentsRelations: () => taskCommentsRelations,
  taskDependencies: () => taskDependencies,
  taskDependenciesRelations: () => taskDependenciesRelations,
  taskGroupEnum: () => taskGroupEnum,
  taskGroupTypeEnum: () => taskGroupTypeEnum,
  taskGroups: () => taskGroups,
  taskGroupsRelations: () => taskGroupsRelations,
  taskPriorityEnum: () => taskPriorityEnum,
  taskStatusEnum: () => taskStatusEnum,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  teamMembers: () => teamMembers2,
  teamMembersRelations: () => teamMembersRelations,
  teams: () => teams2,
  teamsRelations: () => teamsRelations,
  timeEntries: () => timeEntries,
  timeEntriesRelations: () => timeEntriesRelations,
  updateProfileSchema: () => updateProfileSchema,
  upsertUserSchema: () => upsertUserSchema,
  userRoleEnum: () => userRoleEnum,
  userSettings: () => userSettings,
  users: () => users2,
  usersRelations: () => usersRelations,
  viewTypeEnum: () => viewTypeEnum
});
import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var projectStatusEnum = pgEnum("project_status", ["active", "planning", "completed", "on_hold", "archived"]);
var taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "review", "completed", "cancelled", "blocked", "deferred"]);
var taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent", "critical"]);
var taskGroupEnum = pgEnum("task_group", ["backlog", "sprint", "doing", "done", "custom", "blocked", "upcoming"]);
var aiModelEnum = pgEnum("ai_model", ["grok"]);
var viewTypeEnum = pgEnum("view_type", ["list", "kanban", "gantt", "calendar", "timeline", "board"]);
var automationTriggerEnum = pgEnum("automation_trigger", ["status_change", "due_date_approaching", "task_assigned", "comment_added", "subtask_completed", "attachment_added"]);
var automationActionEnum = pgEnum("automation_action", ["change_status", "assign_task", "send_notification", "create_subtask", "update_priority", "move_to_group"]);
var columnTypeEnum = pgEnum("column_type", ["text", "status", "person", "date", "progress", "tags", "number", "timeline", "files", "dropdown", "checkbox"]);
var taskGroupTypeEnum = pgEnum("task_group_type", ["default", "sprint", "epic", "milestone", "custom"]);
var userRoleEnum = pgEnum("user_role", ["admin", "manager", "designer", "content_creator", "analyst", "developer", "stakeholder"]);
var notificationTypeEnum = pgEnum("notification_type", ["task_assigned", "mentioned_in_comment", "task_status_changed", "comment_added", "due_date_approaching"]);
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  }
);
var users2 = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  // Changed to varchar for OAuth IDs
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  // Added email field for OAuth
  password: text("password"),
  // Made optional for OAuth users
  isPrimary: boolean("is_primary").default(false).notNull(),
  role: userRoleEnum("role").default("content_creator"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  nickname: text("nickname"),
  jobTitle: text("job_title"),
  department: text("department"),
  phoneNumber: text("phone_number"),
  preferredLanguage: text("preferred_language").default("es"),
  theme: text("theme").default("light"),
  customFields: jsonb("custom_fields").default([]),
  lastLogin: timestamp("last_login"),
  // OAuth fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").default("active"),
  createdBy: varchar("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users2.id, { onDelete: "cascade" }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users2.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  extractedText: text("extracted_text"),
  analysisStatus: text("analysis_status").default("pending"),
  analysisResults: jsonb("analysis_results"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  specifications: text("specifications"),
  additionalInstructions: text("additional_instructions"),
  // aiModel: aiModelEnum("ai_model").default('grok'), // Removida - ya solo usamos Grok implícitamente
  // periodType: text("period_type").default('quincenal'), // Removida - Ahora se guarda en campo extendido
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var scheduleEntries = pgTable("schedule_entries", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => schedules.id, { onDelete: "cascade" }).notNull(),
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
  comments: text("comments"),
  // Campo para comentarios adicionales de la publicación
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users2.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  role: text("role").notNull(),
  // 'user' or 'assistant'
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var contentHistory = pgTable("content_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  contentType: text("content_type").notNull(),
  // 'title', 'description', 'content', 'theme'
  content: text("content").notNull(),
  title: text("title"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var tasksTable = {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  groupId: integer("group_id").references(() => taskGroups.id, { onDelete: "set null" }),
  // Nuevo: Referencia al grupo
  assignedToId: varchar("assigned_to_id").references(() => users2.id, { onDelete: "set null" }),
  createdById: varchar("created_by_id").references(() => users2.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  group: taskGroupEnum("group").default("backlog"),
  // Mantenemos por compatibilidad
  position: integer("position").default(0),
  // Para ordenar dentro del grupo
  aiGenerated: boolean("ai_generated").default(false),
  aiSuggestion: text("ai_suggestion"),
  tags: text("tags").array(),
  // Etiquetas para categorizar tareas
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: integer("estimated_hours"),
  dependencies: integer("dependencies").array(),
  // IDs de tareas de las que depende
  parentTaskId: integer("parent_task_id"),
  // Referencia a la propia tabla de tareas
  progress: integer("progress").default(0),
  // Progreso de la tarea en porcentaje (0-100)
  attachments: jsonb("attachments").default([]),
  // Lista de archivos adjuntos {name, url, type}
  reminderDate: timestamp("reminder_date"),
  // Fecha para enviar recordatorio
  customFields: jsonb("custom_fields").default({}),
  // Campos personalizados para extender la funcionalidad
  followers: integer("followers").array(),
  // Usuarios que siguen esta tarea
  timeTracking: jsonb("time_tracking").default([]),
  // Registro de tiempo {startTime, endTime, duration, userId, notes}
  workflowId: integer("workflow_id"),
  // ID del flujo de trabajo al que pertenece
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
};
var tasks = pgTable("tasks", tasksTable);
var taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users2.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var taskAttachments = pgTable("task_attachments", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  // URL de la imagen del producto
  sku: text("sku"),
  // SKU del producto (opcional)
  price: numeric("price", { precision: 10, scale: 2 }),
  // Precio del producto (opcional)
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var projectViews = pgTable("project_views", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: viewTypeEnum("type").default("list").notNull(),
  config: jsonb("config").default({}),
  // Configuración específica de la vista
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").default({}),
  // Configuración del disparador
  action: automationActionEnum("action").notNull(),
  actionConfig: jsonb("action_config").default({}),
  // Configuración de la acción
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users2.id, { onDelete: "cascade" }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  // Duración en segundos
  description: text("description"),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  color: text("color").default("#3498db"),
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var collaborativeDocs = pgTable("collaborative_docs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  contentJson: jsonb("content_json"),
  // Contenido estructurado para edición colaborativa
  lastEditedBy: integer("last_edited_by").references(() => users2.id, { onDelete: "set null" }),
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var taskGroups = pgTable("task_groups", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#4285f4"),
  // Color del grupo
  type: taskGroupTypeEnum("type").default("default"),
  position: integer("position").default(0),
  // Para ordenar grupos
  isCollapsed: boolean("is_collapsed").default(false),
  // Si está contraído
  settings: jsonb("settings").default({}),
  // Configuraciones adicionales
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var projectColumnSettings = pgTable("project_column_settings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  columnType: columnTypeEnum("column_type").notNull(),
  name: text("name").notNull(),
  // Nombre de la columna (ej. "Estado", "Asignado")
  position: integer("position").default(0),
  // Orden de la columna
  width: integer("width").default(150),
  // Ancho en píxeles
  isVisible: boolean("is_visible").default(true),
  // Si está visible
  isRequired: boolean("is_required").default(false),
  // Si es obligatoria
  settings: jsonb("settings").default({}),
  // Configuraciones específicas del tipo
  createdBy: integer("created_by").references(() => users2.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var taskColumnValues = pgTable("task_column_values", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  columnId: integer("column_id").references(() => projectColumnSettings.id, { onDelete: "cascade" }).notNull(),
  valueText: text("value_text"),
  // Para valores de texto
  valueNumber: numeric("value_number", { precision: 10, scale: 2 }),
  // Para valores numéricos
  valueDate: timestamp("value_date"),
  // Para valores de fecha
  valueBool: boolean("value_bool"),
  // Para valores booleanos
  valueJson: jsonb("value_json"),
  // Para valores complejos (arrays, objetos)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var taskAssignees = pgTable("task_assignees", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users2.id, { onDelete: "cascade" }).notNull(),
  assignedBy: integer("assigned_by").references(() => users2.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull()
});
var scheduleEntryComments = pgTable("schedule_entry_comments", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => scheduleEntries.id),
  userId: varchar("user_id", { length: 255 }).references(() => users2.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users2.id).notNull().unique(),
  // Configuraciones de usuario/preferencias
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("es"),
  timezone: varchar("timezone", { length: 50 }).default("America/Mexico_City"),
  theme: varchar("theme", { length: 20 }).default("system"),
  // Configuraciones de notificaciones
  notificationSettings: jsonb("notification_settings").default({
    email: true,
    push: true,
    marketing: false,
    projects: true,
    tasks: true
  }),
  // Configuraciones de privacidad
  privacySettings: jsonb("privacy_settings").default({
    profileVisible: true,
    showEmail: false,
    showPhone: false
  }),
  // Configuraciones de apariencia (almacenadas por usuario)
  colorScheme: varchar("color_scheme", { length: 20 }).default("blue"),
  fontSize: varchar("font_size", { length: 20 }).default("medium"),
  reducedAnimations: boolean("reduced_animations").default(false),
  highContrastMode: boolean("high_contrast_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users2, ({ many }) => ({
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
  assignedByTasks: many(taskAssignees, { relationName: "assignedByTasks" })
}));
var projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users2, { fields: [projects.createdBy], references: [users2.id] }),
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
  columnSettings: many(projectColumnSettings)
}));
var analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  project: one(projects, { fields: [analysisResults.projectId], references: [projects.id] })
}));
var projectAssignmentsRelations = relations(projectAssignments, ({ one }) => ({
  project: one(projects, { fields: [projectAssignments.projectId], references: [projects.id] }),
  user: one(users2, { fields: [projectAssignments.userId], references: [users2.id] })
}));
var documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  uploader: one(users2, { fields: [documents.uploadedBy], references: [users2.id] })
}));
var schedulesRelations = relations(schedules, ({ one, many }) => ({
  project: one(projects, { fields: [schedules.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [schedules.createdBy], references: [users2.id] }),
  entries: many(scheduleEntries)
}));
var scheduleEntriesRelations = relations(scheduleEntries, ({ one }) => ({
  schedule: one(schedules, { fields: [scheduleEntries.scheduleId], references: [schedules.id] })
}));
var contentHistoryRelations = relations(contentHistory, ({ one }) => ({
  project: one(projects, { fields: [contentHistory.projectId], references: [projects.id] })
}));
var tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  group: one(taskGroups, { fields: [tasks.groupId], references: [taskGroups.id] }),
  assignedTo: one(users2, { fields: [tasks.assignedToId], references: [users2.id] }),
  createdBy: one(users2, { fields: [tasks.createdById], references: [users2.id] }),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id] }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  // Nuevas relaciones Monday.com
  assignees: many(taskAssignees),
  columnValues: many(taskColumnValues)
}));
var taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.taskId], references: [tasks.id] }),
  user: one(users2, { fields: [taskComments.userId], references: [users2.id] })
}));
var taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, { fields: [taskAttachments.taskId], references: [tasks.id] })
}));
var activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, { fields: [activityLog.projectId], references: [projects.id] }),
  task: one(tasks, { fields: [activityLog.taskId], references: [tasks.id] }),
  user: one(users2, { fields: [activityLog.userId], references: [users2.id] })
}));
var productsRelations = relations(products, ({ one }) => ({
  project: one(projects, { fields: [products.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [products.createdBy], references: [users2.id] })
}));
var projectViewsRelations = relations(projectViews, ({ one }) => ({
  project: one(projects, { fields: [projectViews.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [projectViews.createdBy], references: [users2.id] })
}));
var automationRulesRelations = relations(automationRules, ({ one }) => ({
  project: one(projects, { fields: [automationRules.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [automationRules.createdBy], references: [users2.id] })
}));
var timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
  user: one(users2, { fields: [timeEntries.userId], references: [users2.id] })
}));
var tagsRelations = relations(tags, ({ one }) => ({
  project: one(projects, { fields: [tags.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [tags.createdBy], references: [users2.id] })
}));
var collaborativeDocsRelations = relations(collaborativeDocs, ({ one }) => ({
  project: one(projects, { fields: [collaborativeDocs.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [collaborativeDocs.createdBy], references: [users2.id] }),
  lastEditor: one(users2, { fields: [collaborativeDocs.lastEditedBy], references: [users2.id] })
}));
var taskGroupsRelations = relations(taskGroups, ({ one, many }) => ({
  project: one(projects, { fields: [taskGroups.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [taskGroups.createdBy], references: [users2.id] }),
  tasks: many(tasks)
}));
var projectColumnSettingsRelations = relations(projectColumnSettings, ({ one, many }) => ({
  project: one(projects, { fields: [projectColumnSettings.projectId], references: [projects.id] }),
  creator: one(users2, { fields: [projectColumnSettings.createdBy], references: [users2.id] }),
  columnValues: many(taskColumnValues)
}));
var taskColumnValuesRelations = relations(taskColumnValues, ({ one }) => ({
  task: one(tasks, { fields: [taskColumnValues.taskId], references: [tasks.id] }),
  column: one(projectColumnSettings, { fields: [taskColumnValues.columnId], references: [projectColumnSettings.id] })
}));
var taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, { fields: [taskAssignees.taskId], references: [tasks.id] }),
  user: one(users2, { fields: [taskAssignees.userId], references: [users2.id] }),
  assignedBy: one(users2, { fields: [taskAssignees.assignedBy], references: [users2.id] })
}));
var insertUserSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(20, "El nombre de usuario debe tener como m\xE1ximo 20 caracteres").regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, n\xFAmeros y guiones bajos"),
  email: z.string().email("Debe ser un correo electr\xF3nico v\xE1lido").optional(),
  password: z.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres").optional(),
  isPrimary: z.boolean().optional().default(false),
  role: z.enum(["admin", "manager", "designer", "content_creator", "analyst"]).optional().default("content_creator"),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional().default("es"),
  theme: z.string().optional().default("light"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional()
});
var upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional()
});
var updateProfileSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").optional(),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
  email: z.string().email("Email inv\xE1lido").optional(),
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
    type: z.enum(["text", "email", "url", "tel"])
  })).optional(),
  notificationSettings: z.object({
    email: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    projects: z.boolean(),
    tasks: z.boolean()
  }).optional(),
  privacySettings: z.object({
    profileVisible: z.boolean(),
    showEmail: z.boolean(),
    showPhone: z.boolean()
  }).optional()
});
var loginSchema = z.object({
  identifier: z.string().min(1, "Por favor, introduce tu nombre de usuario o correo electr\xF3nico"),
  password: z.string().min(1, "La contrase\xF1a es obligatoria")
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Permitir que startDate y endDate sean strings o fechas
  startDate: z.union([z.string(), z.date(), z.null()]).optional(),
  endDate: z.union([z.string(), z.date(), z.null()]).optional()
});
var insertAnalysisResultsSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var distributionPreferencesSchema = z.object({
  type: z.enum(["uniform", "weekdays", "weekend", "custom"]),
  frequency: z.enum(["daily", "weekly", "biweekly"]).optional(),
  preferredTimes: z.array(z.string()).optional(),
  preferredDays: z.array(z.string()).optional(),
  concentration: z.number().min(0).max(100).optional()
});
var insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true
}).extend({
  distributionPreferences: distributionPreferencesSchema,
  periodType: z.enum(["quincenal", "mensual"]).default("quincenal")
  // aiModel field removed as it no longer exists in the database
});
var insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true,
  createdAt: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  extractedText: true,
  analysisStatus: true,
  analysisResults: true,
  createdAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});
var insertContentHistorySchema = createInsertSchema(contentHistory).omit({
  id: true,
  createdAt: true
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true
});
var insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProjectViewSchema = createInsertSchema(projectViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAutomationRuleSchema = createInsertSchema(automationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true
});
var insertCollaborativeDocSchema = createInsertSchema(collaborativeDocs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTaskGroupSchema = createInsertSchema(taskGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProjectColumnSettingSchema = createInsertSchema(projectColumnSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTaskColumnValueSchema = createInsertSchema(taskColumnValues).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTaskAssigneeSchema = createInsertSchema(taskAssignees).omit({
  id: true,
  assignedAt: true
});
var AIModel = /* @__PURE__ */ ((AIModel2) => {
  AIModel2["GROK"] = "grok";
  return AIModel2;
})(AIModel || {});
var teams2 = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  // Dominio de correo (ej: cohetebrands.com)
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  settings: jsonb("settings").default({}),
  // Configuraciones del equipo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var teamMembers2 = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams2.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  role: text("role").default("member"),
  // owner, admin, member, viewer
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedTaskId: integer("related_task_id").references(() => tasks.id, { onDelete: "cascade" }),
  relatedCommentId: integer("related_comment_id").references(() => taskComments.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").default(false).notNull(),
  data: jsonb("data").default({}),
  // Datos adicionales específicos por tipo
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var taskDependencies = pgTable("task_dependencies", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  dependsOnTaskId: integer("depends_on_task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
  role: text("role").default("member"),
  // owner, admin, member, viewer
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});
var teamsRelations = relations(teams2, ({ many }) => ({
  members: many(teamMembers2)
}));
var teamMembersRelations = relations(teamMembers2, ({ one }) => ({
  team: one(teams2, {
    fields: [teamMembers2.teamId],
    references: [teams2.id]
  }),
  user: one(users2, {
    fields: [teamMembers2.userId],
    references: [users2.id]
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users2, {
    fields: [notifications.userId],
    references: [users2.id]
  }),
  relatedTask: one(tasks, {
    fields: [notifications.relatedTaskId],
    references: [tasks.id]
  }),
  relatedComment: one(taskComments, {
    fields: [notifications.relatedCommentId],
    references: [taskComments.id]
  })
}));
var taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id]
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id]
  })
}));
var projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id]
  }),
  user: one(users2, {
    fields: [projectMembers.userId],
    references: [users2.id]
  })
}));
var insertTeamSchema = createInsertSchema(teams2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTeamMemberSchema = createInsertSchema(teamMembers2).omit({
  id: true,
  joinedAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertTaskDependencySchema = createInsertSchema(taskDependencies).omit({
  id: true,
  createdAt: true
});
var insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  joinedAt: true
});

// server/db.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var sql = neon(process.env.DATABASE_URL, {
  fetchConnectionCache: true,
  fetchEndpoint: (host) => `https://${host}/sql`
});
var db = drizzle(sql, {
  schema: schema_exports,
  logger: process.env.NODE_ENV === "development"
});

// server/simple-oauth.ts
import { eq } from "drizzle-orm";
async function setupSimpleGoogleAuth(app2) {
  app2.set("trust proxy", 1);
  try {
    const PgSession = connectPg(session);
    app2.use(session({
      store: new PgSession({
        // No need to pass pool, it will use DATABASE_URL from environment
        tableName: "sessions",
        errorLog: () => {
        }
        // Suppress error logs
      }),
      secret: process.env.SESSION_SECRET || "fallback-secret-please-change",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      }
    }));
  } catch (error) {
    console.warn("PostgreSQL session store failed, using memory store as fallback");
    app2.use(session({
      secret: process.env.SESSION_SECRET || "fallback-secret-please-change",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      }
    }));
  }
  app2.use(passport.initialize());
  app2.use(passport.session());
  const getCallbackURL = (req) => {
    const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
    const host = req.get("host");
    return `${protocol}://${host}/api/auth/google/callback`;
  };
  const currentHost = process.env.REPLIT_DOMAINS || "localhost:5000";
  const callbackURL = currentHost.includes("localhost") ? `http://${currentHost}/api/auth/google/callback` : `https://${currentHost}/api/auth/google/callback`;
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const fullName = `${firstName} ${lastName}`.trim() || email;
        let username = email.split("@")[0] || firstName.toLowerCase();
        if (!username) {
          username = `user_${profile.id}`;
        }
        const [existingUser] = await db.select().from(users2).where(eq(users2.id, profile.id));
        if (existingUser) {
          const [updatedUser] = await db.update(users2).set({
            email,
            firstName,
            lastName,
            fullName,
            profileImageUrl: profile.photos?.[0]?.value || "",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users2.id, profile.id)).returning();
          await ensureUserInTeam(updatedUser.id, email);
          return done(null, updatedUser);
        } else {
          const [newUser] = await db.insert(users2).values({
            id: profile.id,
            email,
            firstName,
            lastName,
            fullName,
            username,
            profileImageUrl: profile.photos?.[0]?.value || "",
            isPrimary: false,
            role: "content_creator",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          await ensureUserInTeam(newUser.id, email);
          return done(null, newUser);
        }
      } catch (error) {
        console.error("Error in Google Auth strategy:", error);
        return done(error, false);
      }
    }
  ));
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser(async (id, cb) => {
    try {
      const [user] = await db.select().from(users2).where(eq(users2.id, id));
      return cb(null, user || false);
    } catch (error) {
      return cb(error);
    }
  });
  app2.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  app2.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/");
    }
  );
  app2.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.redirect("/auth");
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
async function ensureUserInTeam(userId, email) {
  if (email.endsWith("@cohetebrands.com")) {
    try {
      const [user] = await db.select().from(users2).where(eq(users2.id, userId)).limit(1);
      if (!user) {
        console.error(`Usuario ${userId} no encontrado en la base de datos`);
        return;
      }
      await db.update(users2).set({
        department: "Cohete Brands",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users2.id, userId));
      console.log(`\u2705 Usuario ${userId} (${email}) marcado como miembro del equipo de Cohete Brands`);
      console.log(`\u{1F4CA} Departamento actualizado a: Cohete Brands`);
    } catch (error) {
      console.error("Error al procesar usuario de Cohete Brands:", error);
    }
  } else {
    console.log(`Usuario ${userId} (${email}) no pertenece al dominio de Cohete Brands`);
  }
}

// server/storage.ts
import { eq as eq2, and, inArray, desc, asc, or, sql as sql2 } from "drizzle-orm";
import MemoryStore from "memorystore";
import session2 from "express-session";
var DatabaseStorage = class {
  sessionStore;
  constructor(store) {
    this.sessionStore = store;
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users2).where(eq2(users2.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users2).where(eq2(users2.username, username));
    return user;
  }
  async getUserByEmail(email) {
    return void 0;
  }
  async getUserByIdentifier(identifier) {
    console.log(`Buscando usuario con identifier: ${identifier}`);
    const [user] = await db.select().from(users2).where(eq2(users2.username, identifier));
    if (user) {
      console.log(`Usuario encontrado con username: ${user.username}`);
    } else {
      console.log("No se encontr\xF3 ning\xFAn usuario con ese identifier");
    }
    return user;
  }
  async createUser(user) {
    const [newUser] = await db.insert(users2).values(user).returning();
    return newUser;
  }
  async upsertUser(user) {
    const [newUser] = await db.insert(users2).values({
      ...user,
      fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || "Usuario OAuth",
      username: user.email || user.id,
      isPrimary: false,
      role: "content_creator",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: users2.id,
      set: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return newUser;
  }
  async listUsers() {
    return await db.select().from(users2);
  }
  async updateUser(id, userData) {
    const { email, ...filteredUserData } = userData;
    const [updatedUser] = await db.update(users2).set(filteredUserData).where(eq2(users2.id, id)).returning();
    return updatedUser;
  }
  async deleteUser(id) {
    const result = await db.delete(users2).where(eq2(users2.id, id));
    return true;
  }
  // Project methods
  async createProject(project) {
    const processedProject = {
      ...project,
      startDate: project.startDate ? typeof project.startDate === "string" ? new Date(project.startDate) : project.startDate : null,
      endDate: project.endDate ? typeof project.endDate === "string" ? new Date(project.endDate) : project.endDate : null
    };
    const [newProject] = await db.insert(projects).values(processedProject).returning();
    return newProject;
  }
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq2(projects.id, id));
    return project;
  }
  async getProjectWithAnalysis(id) {
    const result = await db.query.projects.findFirst({
      where: eq2(projects.id, id),
      with: {
        analysis: true
      }
    });
    return result;
  }
  async updateProject(id, projectData) {
    const [updatedProject] = await db.update(projects).set({ ...projectData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(projects.id, id)).returning();
    return updatedProject;
  }
  async deleteProject(id) {
    await db.delete(projects).where(eq2(projects.id, id));
    return true;
  }
  async listProjects() {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }
  async listProjectsByUser(userId, isPrimary) {
    if (isPrimary) {
      return await this.listProjects();
    } else {
      const assignments = await db.select().from(projectAssignments).where(eq2(projectAssignments.userId, userId));
      const assignedProjectIds = assignments.map((a) => a.projectId);
      return await db.select().from(projects).where(
        or(
          eq2(projects.createdBy, userId),
          assignedProjectIds.length > 0 ? inArray(projects.id, assignedProjectIds) : sql2`false`
        )
      ).orderBy(desc(projects.createdAt));
    }
  }
  // Project Analysis methods
  async createAnalysisResult(analysis) {
    const [newAnalysis] = await db.insert(analysisResults).values(analysis).returning();
    return newAnalysis;
  }
  async getAnalysisResult(projectId) {
    const [analysis] = await db.select().from(analysisResults).where(eq2(analysisResults.projectId, projectId));
    return analysis;
  }
  async updateAnalysisResult(projectId, analysisData) {
    const [updatedAnalysis] = await db.update(analysisResults).set({ ...analysisData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(analysisResults.projectId, projectId)).returning();
    return updatedAnalysis;
  }
  // Project Assignment methods
  async assignUserToProject(projectId, userId) {
    const [assignment] = await db.insert(projectAssignments).values({ projectId, userId }).returning();
    return assignment;
  }
  async removeUserFromProject(projectId, userId) {
    await db.delete(projectAssignments).where(
      and(
        eq2(projectAssignments.projectId, projectId),
        eq2(projectAssignments.userId, userId)
      )
    );
    return true;
  }
  async getProjectAssignments(projectId) {
    const assignments = await db.select().from(projectAssignments).where(eq2(projectAssignments.projectId, projectId));
    if (assignments.length === 0) return [];
    const userIds = assignments.map((a) => a.userId);
    return await db.select().from(users2).where(inArray(users2.id, userIds));
  }
  async checkUserProjectAccess(userId, projectId, isPrimary) {
    if (isPrimary) return true;
    const [project] = await db.select().from(projects).where(
      and(
        eq2(projects.id, projectId),
        eq2(projects.createdBy, userId)
      )
    );
    if (project) return true;
    const [assignment] = await db.select().from(projectAssignments).where(
      and(
        eq2(projectAssignments.projectId, projectId),
        eq2(projectAssignments.userId, userId)
      )
    );
    return !!assignment;
  }
  // Document methods
  async createDocument(document) {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
  async getDocument(id) {
    const [document] = await db.select().from(documents).where(eq2(documents.id, id));
    return document;
  }
  async updateDocument(id, documentData) {
    const [updatedDocument] = await db.update(documents).set(documentData).where(eq2(documents.id, id)).returning();
    return updatedDocument;
  }
  async deleteDocument(id) {
    await db.delete(documents).where(eq2(documents.id, id));
    return true;
  }
  async listDocumentsByProject(projectId) {
    return await db.select().from(documents).where(eq2(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
  }
  // Schedule methods
  async createSchedule(schedule) {
    const [newSchedule] = await db.insert(schedules).values(schedule).returning();
    return newSchedule;
  }
  async getSchedule(id) {
    const [schedule] = await db.select().from(schedules).where(eq2(schedules.id, id));
    return schedule;
  }
  async getScheduleWithEntries(id) {
    try {
      const [schedule] = await db.select().from(schedules).where(eq2(schedules.id, id));
      if (!schedule) {
        return void 0;
      }
      console.log(`Buscando entradas para el cronograma ID ${id}`);
      const entriesList = await db.select().from(scheduleEntries).where(eq2(scheduleEntries.scheduleId, id)).orderBy(asc(scheduleEntries.postDate));
      console.log(`Se encontraron ${entriesList.length} entradas para el cronograma ID ${id}`);
      return {
        ...schedule,
        entries: entriesList || []
        // Asegurarnos que siempre devolvemos un array, incluso si es vacío
      };
    } catch (error) {
      console.error(`Error in getScheduleWithEntries for schedule ID ${id}:`, error);
      return {
        ...await this.getSchedule(id),
        entries: []
      };
    }
  }
  async updateSchedule(id, scheduleData) {
    const [updatedSchedule] = await db.update(schedules).set(scheduleData).where(eq2(schedules.id, id)).returning();
    return updatedSchedule;
  }
  async deleteSchedule(id) {
    await db.delete(schedules).where(eq2(schedules.id, id));
    return true;
  }
  async listSchedulesByProject(projectId) {
    try {
      const schedulesList = await db.select().from(schedules).where(eq2(schedules.projectId, projectId)).orderBy(desc(schedules.createdAt));
      if (!schedulesList || schedulesList.length === 0) {
        return [];
      }
      const results = [];
      for (const schedule of schedulesList) {
        try {
          const entries = await this.listEntriesBySchedule(schedule.id);
          results.push({
            ...schedule,
            entries: entries || []
            // Asegurarnos que nunca es null
          });
        } catch (err) {
          console.error(`Error obteniendo entradas para el cronograma ${schedule.id}:`, err);
          results.push({
            ...schedule,
            entries: []
          });
        }
      }
      return results;
    } catch (error) {
      console.error("Error in listSchedulesByProject:", error);
      return [];
    }
  }
  async listRecentSchedules(limit = 5) {
    try {
      const schedulesResult = await db.select({
        schedule: schedules,
        project: projects
      }).from(schedules).innerJoin(projects, eq2(schedules.projectId, projects.id)).orderBy(desc(schedules.createdAt)).limit(limit);
      if (!schedulesResult || schedulesResult.length === 0) {
        return [];
      }
      const results = [];
      for (const { schedule, project } of schedulesResult) {
        try {
          if (!schedule || !schedule.id) {
            console.warn("Schedule inv\xE1lido encontrado");
            continue;
          }
          const entries = await this.listEntriesBySchedule(schedule.id);
          results.push({
            ...schedule,
            project,
            entries: entries || []
            // Incluir las entradas en el resultado, asegurando que nunca es null
          });
        } catch (err) {
          console.error(`Error getting project for schedule ${schedule?.id}:`, err);
        }
      }
      return results;
    } catch (error) {
      console.error("Error in listRecentSchedules:", error);
      return [];
    }
  }
  // Schedule Entry methods
  async createScheduleEntry(entry) {
    const [newEntry] = await db.insert(scheduleEntries).values(entry).returning();
    return newEntry;
  }
  async getScheduleEntry(id) {
    const [entry] = await db.select().from(scheduleEntries).where(eq2(scheduleEntries.id, id));
    return entry;
  }
  async updateScheduleEntry(id, entryData) {
    const [updatedEntry] = await db.update(scheduleEntries).set(entryData).where(eq2(scheduleEntries.id, id)).returning();
    return updatedEntry;
  }
  async deleteScheduleEntry(id) {
    await db.delete(scheduleEntries).where(eq2(scheduleEntries.id, id));
    return true;
  }
  async deleteScheduleEntries(scheduleId) {
    await db.delete(scheduleEntries).where(eq2(scheduleEntries.scheduleId, scheduleId));
    return true;
  }
  async listEntriesBySchedule(scheduleId) {
    return await db.select().from(scheduleEntries).where(eq2(scheduleEntries.scheduleId, scheduleId)).orderBy(asc(scheduleEntries.postDate));
  }
  // Chat methods
  async createChatMessage(message) {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }
  async listChatMessagesByProject(projectId) {
    return await db.select().from(chatMessages).where(eq2(chatMessages.projectId, projectId)).orderBy(asc(chatMessages.createdAt));
  }
  // Content History methods
  async createContentHistory(entry) {
    const [newEntry] = await db.insert(contentHistory).values(entry).returning();
    return newEntry;
  }
  async getContentHistoryByProjectAndContent(projectId, content) {
    const [entry] = await db.select().from(contentHistory).where(
      and(
        eq2(contentHistory.projectId, projectId),
        eq2(contentHistory.content, content)
      )
    );
    return entry;
  }
  async listContentHistoryByProject(projectId) {
    return await db.select().from(contentHistory).where(eq2(contentHistory.projectId, projectId)).orderBy(desc(contentHistory.createdAt));
  }
  // Task methods
  async createTask(task) {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }
  async getTask(id) {
    const [task] = await db.select().from(tasks).where(eq2(tasks.id, id));
    return task;
  }
  async updateTask(id, taskData) {
    const [updatedTask] = await db.update(tasks).set({ ...taskData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(tasks.id, id)).returning();
    return updatedTask;
  }
  async deleteTask(id) {
    await db.delete(tasks).where(eq2(tasks.id, id));
    return true;
  }
  async listTasksByProject(projectId) {
    return await db.execute(sql2`
      SELECT 
        id, project_id, assigned_to_id, created_by_id, title, 
        description, status, priority, "group", position, 
        ai_generated, ai_suggestion, tags, due_date, completed_at, 
        estimated_hours, dependencies, parent_task_id, progress, 
        attachments, created_at, updated_at
      FROM tasks 
      WHERE project_id = ${projectId}
      ORDER BY due_date ASC, 
               CASE 
                 WHEN priority = 'urgent' THEN 1
                 WHEN priority = 'high' THEN 2
                 WHEN priority = 'medium' THEN 3
                 WHEN priority = 'low' THEN 4
                 ELSE 5
               END
    `);
  }
  async listTasksByAssignee(userId) {
    return await db.execute(sql2`
      SELECT 
        id, project_id, assigned_to_id, created_by_id, title, 
        description, status, priority, "group", position, 
        ai_generated, ai_suggestion, tags, due_date, completed_at, 
        estimated_hours, dependencies, parent_task_id, progress, 
        attachments, created_at, updated_at
      FROM tasks 
      WHERE assigned_to_id = ${userId}
      ORDER BY due_date ASC, 
               CASE 
                 WHEN priority = 'urgent' THEN 1
                 WHEN priority = 'high' THEN 2
                 WHEN priority = 'medium' THEN 3
                 WHEN priority = 'low' THEN 4
                 ELSE 5
               END
    `);
  }
  async listSubtasks(parentTaskId) {
    return await db.execute(sql2`
      SELECT 
        id, project_id, assigned_to_id, created_by_id, title, 
        description, status, priority, "group", position, 
        ai_generated, ai_suggestion, tags, due_date, completed_at, 
        estimated_hours, dependencies, parent_task_id, progress, 
        attachments, created_at, updated_at
      FROM tasks 
      WHERE parent_task_id = ${parentTaskId}
      ORDER BY position ASC
    `);
  }
  // Task Comments methods
  async createTaskComment(comment) {
    const [newComment] = await db.insert(taskComments).values(comment).returning();
    return newComment;
  }
  async getTaskComment(id) {
    const [comment] = await db.select().from(taskComments).where(eq2(taskComments.id, id));
    return comment;
  }
  async deleteTaskComment(id) {
    await db.delete(taskComments).where(eq2(taskComments.id, id));
    return true;
  }
  async listTaskComments(taskId) {
    return await db.select().from(taskComments).where(eq2(taskComments.taskId, taskId)).orderBy(asc(taskComments.createdAt));
  }
  // Product methods
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq2(products.id, id));
    return product;
  }
  async updateProduct(id, productData) {
    const [updatedProduct] = await db.update(products).set({ ...productData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq2(products.id, id));
    return true;
  }
  async listProductsByProject(projectId) {
    return await db.select().from(products).where(eq2(products.projectId, projectId)).orderBy(desc(products.createdAt));
  }
  // Password reset methods usando memoria ya que no tenemos una tabla específica
  passwordResetTokens = /* @__PURE__ */ new Map();
  async createPasswordResetToken(userId) {
    const tokenStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = /* @__PURE__ */ new Date();
    expires.setHours(expires.getHours() + 1);
    const tokenData = {
      userId,
      token: tokenStr,
      expires
    };
    this.passwordResetTokens.set(tokenStr, tokenData);
    return tokenData;
  }
  async getPasswordResetToken(token) {
    const tokenData = this.passwordResetTokens.get(token);
    if (!tokenData) {
      return void 0;
    }
    if (/* @__PURE__ */ new Date() > tokenData.expires) {
      this.passwordResetTokens.delete(token);
      return void 0;
    }
    return tokenData;
  }
  async deletePasswordResetToken(token) {
    return this.passwordResetTokens.delete(token);
  }
  // Project Views methods
  async getProjectView(id) {
    const [view] = await db.select().from(projectViews).where(eq2(projectViews.id, id));
    return view;
  }
  async listProjectViews(projectId) {
    const views = await db.select().from(projectViews).where(eq2(projectViews.projectId, projectId)).orderBy(asc(projectViews.name));
    return views;
  }
  async createProjectView(view) {
    const [newView] = await db.insert(projectViews).values(view).returning();
    return newView;
  }
  async updateProjectView(id, viewData) {
    const [updatedView] = await db.update(projectViews).set(viewData).where(eq2(projectViews.id, id)).returning();
    return updatedView;
  }
  async deleteProjectView(id) {
    const result = await db.delete(projectViews).where(eq2(projectViews.id, id));
    return !!result;
  }
  async updateOtherViewsDefaultStatus(projectId, currentViewId) {
    await db.update(projectViews).set({ isDefault: false }).where(and(
      eq2(projectViews.projectId, projectId),
      sql2`${projectViews.id} != ${currentViewId}`
    ));
  }
  // Automation Rules methods
  async getAutomationRule(id) {
    const [rule] = await db.select().from(automationRules).where(eq2(automationRules.id, id));
    return rule;
  }
  async listAutomationRules(projectId) {
    const rules = await db.select().from(automationRules).where(eq2(automationRules.projectId, projectId)).orderBy(asc(automationRules.name));
    return rules;
  }
  async createAutomationRule(rule) {
    const [newRule] = await db.insert(automationRules).values(rule).returning();
    return newRule;
  }
  async updateAutomationRule(id, ruleData) {
    const [updatedRule] = await db.update(automationRules).set(ruleData).where(eq2(automationRules.id, id)).returning();
    return updatedRule;
  }
  async deleteAutomationRule(id) {
    const result = await db.delete(automationRules).where(eq2(automationRules.id, id));
    return !!result;
  }
  // Time Entries methods
  async getTimeEntry(id) {
    const [entry] = await db.select().from(timeEntries).where(eq2(timeEntries.id, id));
    return entry;
  }
  async listTimeEntriesByTask(taskId) {
    const entries = await db.select().from(timeEntries).where(eq2(timeEntries.taskId, taskId)).orderBy(desc(timeEntries.startTime));
    return entries;
  }
  async listTimeEntriesByUser(userId) {
    const entries = await db.select({
      ...timeEntries,
      task: tasks
    }).from(timeEntries).innerJoin(tasks, eq2(timeEntries.taskId, tasks.id)).where(eq2(timeEntries.userId, userId)).orderBy(desc(timeEntries.startTime));
    return entries;
  }
  async createTimeEntry(entry) {
    let entryData = { ...entry };
    if (!entryData.duration && entryData.startTime && entryData.endTime) {
      const startTime = new Date(entryData.startTime).getTime();
      const endTime = new Date(entryData.endTime).getTime();
      entryData.duration = Math.floor((endTime - startTime) / 1e3);
    }
    const [newEntry] = await db.insert(timeEntries).values(entryData).returning();
    return newEntry;
  }
  async updateTimeEntry(id, entryData) {
    let dataToUpdate = { ...entryData };
    if ((entryData.startTime || entryData.endTime) && !entryData.duration) {
      const currentEntry = await this.getTimeEntry(id);
      if (currentEntry) {
        const startTime = entryData.startTime ? new Date(entryData.startTime).getTime() : new Date(currentEntry.startTime).getTime();
        const endTime = entryData.endTime ? new Date(entryData.endTime).getTime() : currentEntry.endTime ? new Date(currentEntry.endTime).getTime() : null;
        if (endTime && startTime) {
          dataToUpdate.duration = Math.floor((endTime - startTime) / 1e3);
        }
      }
    }
    const [updatedEntry] = await db.update(timeEntries).set(dataToUpdate).where(eq2(timeEntries.id, id)).returning();
    return updatedEntry;
  }
  async deleteTimeEntry(id) {
    const result = await db.delete(timeEntries).where(eq2(timeEntries.id, id));
    return !!result;
  }
  // Collaboration methods implementation
  async getTaskComments(taskId) {
    const comments = await db.select({
      id: notifications.id,
      content: notifications.message,
      userId: notifications.userId,
      createdAt: notifications.createdAt,
      user: {
        id: users2.id,
        fullName: users2.fullName,
        username: users2.username,
        profileImage: users2.profileImage
      }
    }).from(notifications).leftJoin(users2, eq2(notifications.userId, users2.id)).where(and(
      eq2(notifications.type, "comment"),
      eq2(notifications.relatedEntityId, taskId),
      eq2(notifications.relatedEntityType, "task")
    )).orderBy(notifications.createdAt);
    return comments;
  }
  async createTaskComment(comment) {
    const [newComment] = await db.insert(notifications).values({
      type: "comment",
      message: comment.content,
      userId: comment.userId,
      relatedEntityType: "task",
      relatedEntityId: comment.taskId,
      isRead: false
    }).returning();
    return newComment;
  }
  async createNotification(notification) {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }
  async getUserNotifications(userId) {
    const userNotifications = await db.select().from(notifications).where(eq2(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    return userNotifications;
  }
  async markNotificationAsRead(notificationId) {
    const result = await db.update(notifications).set({ isRead: true }).where(eq2(notifications.id, notificationId));
    return !!result;
  }
  async getProjectMembers(projectId) {
    const members = await db.select({
      id: projectMembers.id,
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      role: projectMembers.role,
      joinedAt: projectMembers.joinedAt,
      user: {
        id: users2.id,
        fullName: users2.fullName,
        username: users2.username,
        profileImage: users2.profileImage
      }
    }).from(projectMembers).leftJoin(users2, eq2(projectMembers.userId, users2.id)).where(eq2(projectMembers.projectId, projectId));
    return members;
  }
  async addProjectMember(member) {
    const [newMember] = await db.insert(projectMembers).values(member).returning();
    return newMember;
  }
  async getTaskDependencies(taskId) {
    const dependencies = await db.select().from(taskDependencies).where(eq2(taskDependencies.taskId, taskId));
    return dependencies;
  }
  async createTaskDependency(dependency) {
    const [newDependency] = await db.insert(taskDependencies).values(dependency).returning();
    return newDependency;
  }
  // Tags methods
  async getTag(id) {
    const [tag] = await db.select().from(tags).where(eq2(tags.id, id));
    return tag;
  }
  async listTags(projectId) {
    const tagsList = await db.select().from(tags).where(eq2(tags.projectId, projectId)).orderBy(asc(tags.name));
    return tagsList;
  }
  async createTag(tag) {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }
  async updateTag(id, tagData) {
    const [updatedTag] = await db.update(tags).set(tagData).where(eq2(tags.id, id)).returning();
    return updatedTag;
  }
  async deleteTag(id) {
    const result = await db.delete(tags).where(eq2(tags.id, id));
    return !!result;
  }
  // Collaborative Docs methods
  async getCollaborativeDoc(id) {
    const [doc] = await db.select().from(collaborativeDocs).where(eq2(collaborativeDocs.id, id));
    return doc;
  }
  async listCollaborativeDocs(projectId) {
    const docs = await db.select().from(collaborativeDocs).where(eq2(collaborativeDocs.projectId, projectId)).orderBy(asc(collaborativeDocs.title));
    return docs;
  }
  async createCollaborativeDoc(doc) {
    const [newDoc] = await db.insert(collaborativeDocs).values(doc).returning();
    return newDoc;
  }
  async updateCollaborativeDoc(id, docData) {
    const [updatedDoc] = await db.update(collaborativeDocs).set({
      ...docData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(collaborativeDocs.id, id)).returning();
    return updatedDoc;
  }
  async deleteCollaborativeDoc(id) {
    const result = await db.delete(collaborativeDocs).where(eq2(collaborativeDocs.id, id));
    return !!result;
  }
  async updateUser(userId, updateData) {
    const { email, ...filteredUserData } = updateData;
    const [updatedUser] = await db.update(users2).set({
      ...filteredUserData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(users2.id, userId)).returning();
    return updatedUser;
  }
  async deleteUser(id) {
    const result = await db.delete(users2).where(eq2(users2.id, id));
    return !!result;
  }
};
var SessionStore = MemoryStore(session2);
var mockStore = new SessionStore({ checkPeriod: 864e5 });
var storage = new DatabaseStorage(mockStore);

// server/routes.ts
import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs2 from "fs";
import path from "path";
import pdfParse from "pdf-parse";

// server/grok-integration.ts
import axios from "axios";
import { WebSocket as WebSocket2 } from "ws";
var GrokService = class {
  apiKey;
  baseURL = "https://api.x.ai/v1";
  wss = null;
  constructor(apiKey) {
    this.apiKey = process.env.XAI_API_KEY || apiKey;
  }
  /**
   * Inicializa el servidor WebSocket para streaming
   * @param server Servidor HTTP de Express
   */
  initWebSocketServer(server) {
    try {
      console.log("[GROK-WS] Inicializando servidor WebSocket para streaming de IA...");
      this.wss = new WebSocket2.WebSocketServer({ server });
      this.wss.on("connection", (ws) => {
        console.log("[GROK-WS] Nueva conexi\xF3n WebSocket establecida");
        ws.on("message", async (message) => {
          try {
            const data = JSON.parse(message.toString());
            console.log("[GROK-WS] Mensaje recibido:", JSON.stringify(data).substring(0, 200) + "...");
            if (data.type === "stream-request") {
              console.log("[GROK-WS] Iniciando streaming de respuesta IA...");
              const callbacks = {
                onMessage: (chunk) => {
                  ws.send(JSON.stringify({ type: "chunk", content: chunk }));
                },
                onComplete: (fullResponse) => {
                  ws.send(JSON.stringify({ type: "complete", content: fullResponse }));
                },
                onError: (error) => {
                  console.error("[GROK-WS] Error en streaming:", error);
                  ws.send(JSON.stringify({
                    type: "error",
                    error: error.message || "Error desconocido en streaming"
                  }));
                }
              };
              try {
                await this.generateTextStream(
                  data.prompt,
                  callbacks,
                  {
                    model: data.model,
                    temperature: data.temperature,
                    maxTokens: data.maxTokens
                    // responseFormat removido - Grok no lo soporta
                  }
                );
              } catch (error) {
                callbacks.onError(error);
              }
            }
          } catch (error) {
            console.error("[GROK-WS] Error procesando mensaje WebSocket:", error);
            ws.send(JSON.stringify({
              type: "error",
              error: "Error procesando solicitud"
            }));
          }
        });
        ws.on("close", () => {
          console.log("[GROK-WS] Conexi\xF3n WebSocket cerrada");
        });
        ws.on("error", (error) => {
          console.error("[GROK-WS] Error en conexi\xF3n WebSocket:", error);
        });
      });
      console.log("[GROK-WS] Servidor WebSocket inicializado correctamente");
    } catch (error) {
      console.error("[GROK-WS] Error inicializando servidor WebSocket:", error);
    }
  }
  /**
   * Genera texto en streaming usando el modelo de Grok
   * @param prompt Prompt a enviar al modelo
   * @param callbacks Funciones de callback para manejar chunks, finalización y errores
   * @param options Opciones de configuración (modelo, temperatura, tokens, etc.)
   */
  async generateTextStream(prompt, callbacks, options = {}) {
    console.log(`[GROK-STREAM] Iniciando generaci\xF3n de texto en streaming con Grok AI`);
    console.log(`[GROK-STREAM] Modelo: ${options.model || "grok-3-mini-beta"}, Temperatura: ${options.temperature || 0.7}`);
    try {
      const requestPayload = {
        model: options.model || "grok-3-mini-beta",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2e3,
        stream: true
        // Activar streaming
      };
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          responseType: "stream"
        }
      );
      console.log("[GROK-STREAM] Conexi\xF3n establecida, comenzando a recibir datos...");
      let fullResponse = "";
      const stream = response.data;
      stream.on("data", (chunk) => {
        try {
          const chunkStr = chunk.toString();
          const lines = chunkStr.split("\n\n");
          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line.trim() === "data: [DONE]") continue;
            const jsonStr = line.replace(/^data: /, "").trim();
            if (!jsonStr) continue;
            try {
              const jsonData = JSON.parse(jsonStr);
              if (jsonData.choices && jsonData.choices.length > 0) {
                const delta = jsonData.choices[0]?.delta?.content || "";
                if (delta) {
                  fullResponse += delta;
                  callbacks.onMessage(delta);
                }
                if (jsonData.choices[0]?.finish_reason === "stop") {
                  console.log("[GROK-STREAM] Streaming completado por se\xF1al de finalizaci\xF3n");
                }
              }
            } catch (err) {
              console.warn("[GROK-STREAM] Error parseando chunk JSON:", jsonStr);
            }
          }
        } catch (err) {
          console.error("[GROK-STREAM] Error procesando chunk:", err);
        }
      });
      stream.on("end", () => {
        console.log("[GROK-STREAM] Streaming finalizado. Longitud total:", fullResponse.length);
        callbacks.onComplete(fullResponse);
      });
      stream.on("error", (err) => {
        console.error("[GROK-STREAM] Error en streaming:", err);
        callbacks.onError(err);
      });
    } catch (error) {
      console.error("[GROK-STREAM] Error iniciando streaming:", error);
      callbacks.onError(error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode >= 502 && statusCode <= 504) {
            const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible (Error ${statusCode}).`);
            callbacks.onError(serviceError);
            return;
          }
          if (statusCode === 429) {
            const rateLimitError = new Error(`Se ha excedido el l\xEDmite de peticiones a Grok AI.`);
            callbacks.onError(rateLimitError);
            return;
          }
          if (statusCode === 401 || statusCode === 403) {
            const authError = new Error(`Error de autenticaci\xF3n con la API de Grok.`);
            callbacks.onError(authError);
            return;
          }
        }
      }
    }
  }
  /**
   * Genera texto usando el modelo de Grok
   */
  async generateText(prompt, options = {}) {
    const maxRetries = options.retryCount || 1;
    let lastError = null;
    console.log(`Iniciando solicitud a Grok AI. Modelo: ${options.model || "grok-3-mini-beta"}, Temperatura: ${options.temperature || 0.7}, Max tokens: ${options.maxTokens || 2e3}${options.responseFormat ? ", Formato: " + options.responseFormat : ""}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (maxRetries > 1) {
          console.log(`Intento ${attempt}/${maxRetries} de generar texto con Grok AI...`);
        }
        const promptLength = prompt.length;
        console.log(`[GROK] Longitud del prompt: ${promptLength} caracteres`);
        let requestPayload;
        const finalPrompt = promptLength > 2e4 ? `${prompt.substring(0, 1e4)}

[CONTENIDO TRUNCADO PARA OPTIMIZAR RENDIMIENTO]

${prompt.substring(prompt.length - 5e3)}` : prompt;
        if (promptLength > 2e4) {
          console.warn(`[GROK] El prompt fue truncado de ${promptLength} a ${finalPrompt.length} caracteres`);
        }
        requestPayload = {
          model: options.model || "grok-3-mini-beta",
          messages: [
            {
              role: "user",
              content: finalPrompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2e3
        };
        const requestSize = JSON.stringify(requestPayload).length;
        console.log(`Tama\xF1o de la solicitud: ${requestSize} bytes`);
        console.log(`[GROK DEBUG] Payload completo enviado a API:`, JSON.stringify(requestPayload, null, 2));
        if (requestSize > 1e5) {
          console.warn("Advertencia: Solicitud muy grande (>100KB), podr\xEDa causar problemas de rendimiento");
        }
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          requestPayload,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`
            },
            timeout: 12e4
            // 120 segundos de timeout para solicitudes grandes
          }
        );
        if (!response.data || !response.data.choices || !response.data.choices.length) {
          console.error("Respuesta de Grok AI sin el formato esperado:", JSON.stringify(response.data).substring(0, 200) + "...");
          throw new Error("La respuesta de Grok AI no tiene el formato esperado");
        }
        const content = response.data.choices[0].message.content;
        console.log(`Respuesta de Grok AI recibida: ${content.length} caracteres`);
        return content;
      } catch (error2) {
        console.error(`Error en intento ${attempt}/${maxRetries} generando texto con Grok:`, error2);
        lastError = error2;
        let shouldRetry = false;
        let errorCategory = "desconocido";
        if (axios.isAxiosError(error2)) {
          if (error2.response) {
            const statusCode = error2.response.status;
            if (statusCode >= 500) {
              shouldRetry = true;
              errorCategory = `servidor ${statusCode}`;
              console.log(`[GROK] Error de servidor ${statusCode}, reintentando...`);
            } else if (statusCode === 429) {
              shouldRetry = true;
              errorCategory = "l\xEDmite de peticiones";
              console.log(`[GROK] Error de l\xEDmite de peticiones, reintentando con espera m\xE1s larga...`);
            } else if (statusCode === 401 || statusCode === 403) {
              shouldRetry = false;
              errorCategory = "autenticaci\xF3n";
              console.error(`[GROK] Error de autenticaci\xF3n con la API de Grok (${statusCode})`);
            }
          } else if (error2.request) {
            shouldRetry = true;
            errorCategory = "red/conexi\xF3n";
            console.log("[GROK] Error de red, reintentando...");
          }
        }
        console.log(`[GROK] Error (categor\xEDa: ${errorCategory}) en intento ${attempt}/${maxRetries}. Reintento: ${shouldRetry ? "S\xED" : "No"}`);
        if (attempt === maxRetries || !shouldRetry) {
          console.error(`[GROK] Se agotaron los reintentos o error no recuperable. Categor\xEDa: ${errorCategory}`);
          break;
        }
        const baseDelay = errorCategory === "l\xEDmite de peticiones" ? 5e3 : 1e3;
        const waitTime = Math.min(baseDelay * Math.pow(2, attempt - 1), 3e4);
        console.log(`[GROK] Esperando ${waitTime}ms antes del siguiente intento...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    const error = lastError;
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;
        console.error(`Respuesta de error completa de Grok API:`, responseData);
        if (statusCode >= 502 && statusCode <= 504) {
          const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente m\xE1s tarde (Error ${statusCode}).`);
          serviceError.errorType = "NETWORK";
          throw serviceError;
        }
        if (statusCode === 429) {
          const rateLimitError = new Error(`Se ha excedido el l\xEDmite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
          rateLimitError.errorType = "RATE_LIMIT";
          throw rateLimitError;
        }
        if (statusCode === 401 || statusCode === 403) {
          const authError = new Error(`Error de autenticaci\xF3n con la API de Grok. Verifica que la clave API sea v\xE1lida.`);
          authError.errorType = "AUTH";
          throw authError;
        }
        let detailedMessage = "Detalles no disponibles";
        if (responseData) {
          if (responseData.error && responseData.error.message) {
            detailedMessage = responseData.error.message;
          } else if (typeof responseData === "string") {
            detailedMessage = responseData;
          } else {
            try {
              detailedMessage = JSON.stringify(responseData);
            } catch (e) {
              detailedMessage = "No se pudo extraer un mensaje de error detallado";
            }
          }
        }
        const otherResponseError = new Error(`Error del servicio Grok AI (${statusCode}): ${detailedMessage}`);
        otherResponseError.errorType = "API_ERROR";
        throw otherResponseError;
      } else if (error.request) {
        const networkError = new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexi\xF3n a internet.`);
        networkError.errorType = "NETWORK";
        throw networkError;
      }
    }
    const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
    const genericError = new Error(`Error inesperado al utilizar el servicio de Grok AI: ${errorMessage}`);
    genericError.errorType = "UNKNOWN";
    throw genericError;
  }
  /**
   * Genera texto con análisis de imágenes usando el modelo de Grok con capacidades visuales
   */
  async generateTextWithImage(prompt, imageBase64, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || "grok-3-mini-beta",
          // Cambiado a grok-3-mini-beta según solicitud
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2e3
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error generando texto con imagen en Grok:", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode >= 502 && statusCode <= 504) {
            const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente m\xE1s tarde (Error ${statusCode}).`);
            serviceError.errorType = "NETWORK";
            throw serviceError;
          }
          if (statusCode === 429) {
            const rateLimitError = new Error(`Se ha excedido el l\xEDmite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
            rateLimitError.errorType = "RATE_LIMIT";
            throw rateLimitError;
          }
          if (statusCode === 401 || statusCode === 403) {
            const authError = new Error(`Error de autenticaci\xF3n con la API de Grok. Verifica que la clave API sea v\xE1lida.`);
            authError.errorType = "AUTH";
            throw authError;
          }
          const otherResponseError = new Error(`Error del servicio Grok AI (${statusCode}): ${error.response.data.error?.message || "Detalles no disponibles"}`);
          otherResponseError.errorType = "API_ERROR";
          throw otherResponseError;
        } else if (error.request) {
          const networkError = new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexi\xF3n a internet.`);
          networkError.errorType = "NETWORK";
          throw networkError;
        }
      }
      const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
      const genericError = new Error(`Error inesperado al utilizar el servicio de Grok AI para an\xE1lisis de imagen: ${errorMessage}`);
      genericError.errorType = "UNKNOWN";
      throw genericError;
    }
  }
};
var grokService = new GrokService(process.env.GROK_API_KEY || process.env.XAI_API_KEY || "");

// server/ai-analyzer.ts
import * as fs from "fs/promises";
async function analyzeDocument(documentText) {
  try {
    const prompt = `
      As a marketing expert, analyze the following document and extract key marketing insights in JSON format.
      Focus on identifying:
      
      1. Brand mission and vision
      2. Marketing objectives
      3. Target audience description
      4. Brand tone/voice
      5. Key keywords and phrases
      6. Core brand values
      7. Content themes with associated keywords
      8. Competitor analysis if present
      
      Return the results in the following JSON format:
      {
        "mission": "string",
        "vision": "string",
        "objectives": "string",
        "targetAudience": "string",
        "brandTone": "string",
        "keywords": "string",
        "coreValues": "string",
        "contentThemes": [
          {
            "theme": "string",
            "keywords": ["string1", "string2"]
          }
        ],
        "competitorAnalysis": [
          {
            "name": "string",
            "strengths": "string",
            "weaknesses": "string",
            "contentStrategy": "string"
          }
        ],
        "summary": "string"
      }
      
      Keep all text fields concise but detailed. If information for a field is not present in the document, omit that field from the JSON.
      
      Document to analyze:
      ${documentText}
    `;
    const analysisText = await grokService.generateText(prompt, {
      model: "grok-3-mini-beta",
      // Usando modelo disponible de Grok
      temperature: 0.7,
      maxTokens: 2e3
    });
    if (!analysisText) {
      throw new Error("Empty response from Grok AI");
    }
    try {
      const parsedResult = JSON.parse(analysisText);
      console.log("Document analysis completed successfully");
      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", analysisText);
      return {
        summary: analysisText.substring(0, 1e3) + (analysisText.length > 1e3 ? "..." : "")
      };
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to analyze document: ${errorMessage}`);
  }
}
async function analyzeMarketingImage(imagePath, analysisType = "content") {
  try {
    await fs.access(imagePath);
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");
    let prompt;
    switch (analysisType) {
      case "brand":
        prompt = `Analiza esta imagen desde una perspectiva de branding y marketing.
        Identifica los siguientes elementos:
        1. Elementos visuales de la marca (logo, colores, tipograf\xEDa)
        2. Mensaje visual principal
        3. Posicionamiento de marca que transmite
        4. Coherencia con est\xE1ndares actuales de dise\xF1o
        5. Sugerencias para mejorar la alineaci\xF3n de marca`;
        break;
      case "audience":
        prompt = `Analiza esta imagen para identificar el p\xFAblico objetivo:
        1. Perfil demogr\xE1fico aproximado del p\xFAblico objetivo
        2. Necesidades y deseos que la imagen intenta abordar
        3. Nivel de conexi\xF3n emocional que podr\xEDa generar
        4. Posible respuesta del p\xFAblico objetivo
        5. Recomendaciones para mejorar la conexi\xF3n con la audiencia`;
        break;
      case "content":
      default:
        prompt = `Analiza esta imagen como contenido de marketing:
        1. Tipo de contenido (promocional, educativo, inspiracional, etc.)
        2. Calidad visual y composici\xF3n
        3. Mensaje principal que transmite
        4. Efectividad para captar atenci\xF3n
        5. Plataformas de redes sociales donde ser\xEDa m\xE1s efectiva
        6. Recomendaciones para optimizar su impacto`;
        break;
    }
    const analysisResult = await grokService.generateTextWithImage(
      prompt,
      base64Image,
      {
        model: "grok-vision-beta",
        temperature: 0.5,
        maxTokens: 1500
      }
    );
    try {
      const parsedResult = {
        analysisType,
        rawAnalysis: analysisResult,
        structuredData: extractStructuredData(analysisResult)
      };
      return parsedResult;
    } catch (parseError) {
      return {
        analysisType,
        rawAnalysis: analysisResult,
        error: "No se pudo estructurar el an\xE1lisis"
      };
    }
  } catch (error) {
    console.error("Error analizando imagen de marketing:", error);
    throw new Error(`Error en an\xE1lisis visual: ${error.message}`);
  }
}
function extractStructuredData(text2) {
  try {
    if (text2.trim().startsWith("{") && text2.trim().endsWith("}")) {
      return JSON.parse(text2);
    }
  } catch (e) {
  }
  const result = {};
  const sectionRegex = /(\d+)[\.\)]\s*([^:]+):\s*([^\n]+)/g;
  let match;
  while ((match = sectionRegex.exec(text2)) !== null) {
    const [_, number, title, content] = match;
    result[title.trim()] = content.trim();
  }
  if (Object.keys(result).length === 0) {
    const lineRegex = /(\d+)[\.\)]\s*([^\n]+)/g;
    while ((match = lineRegex.exec(text2)) !== null) {
      const [_, number, content] = match;
      result[`Punto ${number}`] = content.trim();
    }
  }
  return Object.keys(result).length > 0 ? result : { summary: text2 };
}
async function processChatMessage(message, projectContext, chatHistory) {
  try {
    const systemPrompt = projectContext ? `Eres un asistente de marketing para un proyecto llamado "${projectContext.name}" para el cliente "${projectContext.client}". 
         Utiliza el siguiente contexto del proyecto en tus respuestas cuando sea relevante:
         ${JSON.stringify(projectContext, null, 2)}` : "Eres un asistente de marketing para Cohete Workflow, una plataforma de gesti\xF3n de proyectos de marketing.";
    let promptText = systemPrompt + "\n\n";
    if (chatHistory && chatHistory.length > 0) {
      promptText += "Historial de conversaci\xF3n:\n";
      for (const msg of chatHistory) {
        promptText += `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}
`;
      }
      promptText += "\n";
    }
    promptText += `Usuario: ${message}

Asistente:`;
    const response = await grokService.generateText(promptText, {
      model: "grok-3-mini-beta",
      // Usando modelo de la familia Grok 3
      temperature: 0.7,
      maxTokens: 1e3
    });
    return response || "Lo siento, no pude procesar esa solicitud.";
  } catch (error) {
    console.error("Error procesando mensaje de chat:", error);
    throw new Error(`Error al procesar mensaje de chat: ${error.message}`);
  }
}

// server/ai-scheduler.ts
import { format, parseISO, addDays } from "date-fns";
async function generateSchedule(projectName, projectDetails, startDate, specifications, durationDays = 15, previousContent = [], additionalInstructions) {
  console.log(`[CALENDAR] !! Iniciando generaci\xF3n de calendario para proyecto "${projectName}"`);
  console.log(`[CALENDAR] Par\xE1metros: startDate=${startDate}, durationDays=${durationDays}, prevContent.length=${previousContent.length}`);
  try {
    const formattedDate = format(parseISO(startDate), "yyyy-MM-dd");
    const endDate = format(addDays(parseISO(startDate), durationDays), "yyyy-MM-dd");
    console.log(`[CALENDAR] Periodo del calendario: ${formattedDate} hasta ${endDate}`);
    let socialNetworksSection = "";
    try {
      console.log(`[CALENDAR] Procesando datos de redes sociales del proyecto`);
      const socialNetworks = projectDetails?.analysisResults?.socialNetworks || [];
      const selectedNetworks = socialNetworks.filter((network) => network.selected && typeof network.postsPerMonth === "number").map((network) => {
        const postsPerPeriod = Math.ceil(network.postsPerMonth * (durationDays / 30));
        return {
          name: network.name,
          postsPerMonth: network.postsPerMonth,
          postsForPeriod: postsPerPeriod,
          contentTypes: network.contentTypes || []
        };
      });
      console.log(`[CALENDAR] Redes sociales seleccionadas: ${selectedNetworks.length}`);
      if (selectedNetworks.length > 0) {
        console.log(`[CALENDAR] Redes: ${selectedNetworks.map((n) => n.name).join(", ")}`);
        socialNetworksSection = `
        DISTRIBUCI\xD3N DE PUBLICACIONES:
        ${JSON.stringify(selectedNetworks, null, 2)}
        
        IMPORTANTE: Respeta la cantidad de publicaciones por red social indicada en "postsForPeriod".
        `;
      } else {
        console.warn(`[CALENDAR] \xA1Advertencia! No se encontraron redes sociales seleccionadas en el proyecto`);
      }
    } catch (error) {
      console.error("[CALENDAR] Error procesando datos de redes sociales:", error);
      socialNetworksSection = "No hay informaci\xF3n espec\xEDfica sobre la frecuencia de publicaciones.";
    }
    const previousContentSection = previousContent.length > 0 ? `Previously used content (AVOID REPEATING THESE TOPICS AND IDEAS):
        ${previousContent.join("\n")}` : "No previous content history available.";
    console.log(`[CALENDAR] Historial de contenido: ${previousContent.length} elementos`);
    if (previousContent.length > 0) {
      console.log(`[CALENDAR] Muestra del primer elemento: "${previousContent[0].substring(0, 50)}..."`);
    }
    const prompt = `
      Crea un cronograma avanzado de contenido para redes sociales para el proyecto "${projectName}". Act\xFAa como un experto profesional en marketing digital con especializaci\xF3n en contenidos de alto impacto, branding y narrativa de marca. Tu objetivo es crear contenido estrat\xE9gico, persuasivo y memorable que genere engagement.

      **PROYECTO:**
      Nombre: ${projectName}
      
      **DETALLES DEL PROYECTO:**
      ${typeof projectDetails === "string" ? projectDetails : JSON.stringify(projectDetails, null, 2)}

      **PERIODO DE PLANIFICACI\xD3N:** 
      De ${formattedDate} a ${endDate} (${durationDays} d\xEDas)
      
      **ESPECIFICACIONES DEL CLIENTE:** 
      ${specifications || "Ninguna especificaci\xF3n adicional proporcionada."}
      
      **ESTRATEGIA DE REDES SOCIALES:**
      ${socialNetworksSection || "Sugiere 2-3 redes sociales estrat\xE9gicamente seleccionadas para el p\xFAblico objetivo de este proyecto."}
      
      **HISTORIAL DE CONTENIDO (EVITAR DUPLICACI\xD3N):**
      ${previousContentSection || "Sin historial de contenido previo disponible."}

      **DIRECTRICES PARA CREACI\xD3N DE CONTENIDO DE ALTA CALIDAD:**
      1. STORYTELLING - Utiliza narrativas emocionales y personales que conecten con la audiencia.
      2. VALOR PR\xC1CTICO - Cada publicaci\xF3n debe ofrecer insights, consejos, o soluciones reales.
      3. LLAMADAS A LA ACCI\xD3N - Incluye CTAs claros y persuasivos que inciten al compromiso.
      4. ADAPTACI\xD3N POR PLATAFORMA - Personaliza el tono y formato seg\xFAn cada red social.
      5. ORIGINALIDAD - Evita clich\xE9s y lugares comunes del sector, busca \xE1ngulos \xFAnicos.
      6. ESTILO DISTINTIVO - Mant\xE9n coherencia con la voz de marca pero con variedad creativa.
      7. INSTRUCCIONES VISUALES - S\xE9 espec\xEDfico sobre las im\xE1genes/videos sugiriendo paletas de color, composici\xF3n y elementos visuales distintivos.

      **ESTRUCTURA DE LAS PUBLICACIONES:**
      - T\xCDTULOS: Concisos, impactantes, con palabras potentes y gatillos emocionales.
      - CONTENIDO PRINCIPAL: Desarrolla ideas completas con narrativa estructurada (problema-soluci\xF3n-beneficio).
      - COPY IN: Texto que aparecer\xE1 sobre la imagen/dise\xF1o, corto y memorable.
      - COPY OUT: Descripci\xF3n completa que acompa\xF1a a la publicaci\xF3n, escrito en formato conversacional, personal y persuasivo.
      - HASHTAGS: Mezcla hashtags populares y espec\xEDficos del nicho (entre 3-7 por publicaci\xF3n).

      **REQUISITOS CR\xCDTICOS DE CANTIDAD:**
      - Genera EXACTAMENTE ${durationDays / 2} publicaciones (aproximadamente 7-8 entradas para el periodo)
      - Distribuye las publicaciones uniformemente a lo largo del periodo
      - NO generes menos de 6 entradas bajo ninguna circunstancia

      **FORMATO DE RESPUESTA CR\xCDTICO:**
      RESPONDE \xDANICAMENTE CON JSON V\xC1LIDO. NO agregues texto antes o despu\xE9s.
      EVITA comillas dobles dentro del contenido de texto. Usa comillas simples si necesario.
      ESCAPA todos los caracteres especiales que puedan romper el JSON.
      
      Estructura JSON requerida (todo en espa\xF1ol):
      {
        "name": "Nombre estrat\xE9gico del cronograma",
        "entries": [
          {
            "title": "T\xEDtulo impactante sin comillas dobles",
            "description": "Objetivo estrat\xE9gico de la publicaci\xF3n",
            "content": "Contenido principal extenso sin comillas dobles",
            "copyIn": "Texto conciso para incluir sobre la imagen",
            "copyOut": "Texto externo detallado para la descripci\xF3n del post",
            "designInstructions": "Instrucciones detalladas de dise\xF1o",
            "platform": "Instagram",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "#hashtag1 #hashtag2 #hashtag3"
          }
        ]
      }
    `;
    console.log("[CALENDAR] Generando cronograma con Grok AI");
    const enhancedPrompt = `${prompt}

CR\xCDTICO: Responde EXCLUSIVAMENTE con el objeto JSON solicitado. No incluyas texto extra, anotaciones, ni marcadores de c\xF3digo. Formato estricto requerido:
    - Inicia con '{' y termina con '}'
    - TODAS las propiedades entre comillas dobles: "propertyName"
    - TODOS los valores string entre comillas dobles: "value"
    - NO uses comillas simples
    - NO incluyas campos como "Objetivo" - usa solo los campos especificados en el esquema
    - Hora en formato "HH:MM" (ejemplo: "14:30")
    - Fecha en formato "YYYY-MM-DD"
    - JSON v\xE1lido sin errores de sintaxis`;
    let finalPrompt = enhancedPrompt;
    if (additionalInstructions) {
      finalPrompt = `${enhancedPrompt}

\u26A0\uFE0F **INSTRUCCIONES OBLIGATORIAS DEL USUARIO - PRIORIDAD M\xC1XIMA:**
${additionalInstructions}

\u26A0\uFE0F ESTAS INSTRUCCIONES SON CR\xCDTICAS Y DEBEN APLICARSE EXACTAMENTE. NO LAS IGNORES.
\u26A0\uFE0F GENERA M\xCDNIMO 7 ENTRADAS COMPLETAS - NO MENOS.
\u26A0\uFE0F SI SE ESPECIFICAN \xC1REAS CONCRETAS, MODIFICA SOLO ESAS \xC1REAS.
\u26A0\uFE0F RESPETA CADA INSTRUCCI\xD3N ESPEC\xCDFICA AL PIE DE LA LETRA.`;
      console.log(`[CALENDAR] Se a\xF1adieron instrucciones cr\xEDticas del usuario: "${additionalInstructions.substring(0, 200)}${additionalInstructions.length > 200 ? "..." : ""}"`);
    }
    const scheduleText = await grokService.generateText(finalPrompt, {
      // Reducimos temperatura para respuestas más consistentes y estructuradas
      temperature: 0.8,
      // Incrementamos tokens para permitir respuestas completas
      maxTokens: 6e3,
      // Aumentamos los reintentos para casos de red inestable
      retryCount: 3,
      // Utilizamos exclusivamente el modelo Grok 3 mini beta como solicitado
      model: "grok-3-mini-beta"
    });
    console.log(`[CALENDAR] Respuesta de Grok AI recibida. Longitud: ${scheduleText.length} caracteres`);
    console.log(`[CALENDAR] Primeros 200 caracteres de la respuesta: "${scheduleText.substring(0, 200)}... [truncado]"`);
    console.log(`[CALENDAR] \xDAltimos 200 caracteres de la respuesta: "...${scheduleText.substring(Math.max(0, scheduleText.length - 200))}"`);
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GROK AI (inicio):`);
    const chunkSize = 1e3;
    for (let i = 0; i < scheduleText.length; i += chunkSize) {
      console.log(scheduleText.substring(i, i + chunkSize));
    }
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GROK AI (fin)`);
    try {
      console.log(`[CALENDAR] Iniciando procesamiento de la respuesta (Estrategia 1: JSON directo)`);
      const jsonStart = scheduleText.indexOf("{");
      const jsonEnd = scheduleText.lastIndexOf("}") + 1;
      console.log(`[CALENDAR] Posiciones JSON detectadas: inicio=${jsonStart}, fin=${jsonEnd}`);
      if (jsonStart < 0) {
        console.error(`[CALENDAR] ERROR: No se encontr\xF3 car\xE1cter de inicio JSON '{' en la respuesta`);
      }
      if (jsonEnd <= jsonStart) {
        console.error(`[CALENDAR] ERROR: Posici\xF3n de fin inv\xE1lida o no se encontr\xF3 car\xE1cter de cierre JSON '}'`);
      }
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          console.log(`[CALENDAR] Ejecutando estrategia 1: Extracci\xF3n directa de JSON`);
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          console.log(`[CALENDAR] Aplicando correcciones de formato antes del parsing`);
          jsonContent = jsonContent.replace(/"(\d{2})":\s*(\d{2})"/g, '"$1:$2"');
          jsonContent = jsonContent.replace(/:\s*"(\d{2})":\s*(\d{2})"/g, ': "$1:$2"');
          jsonContent = jsonContent.replace(/"ime":\s*"([^"]+)"/g, '"postTime": "$1"');
          jsonContent = jsonContent.replace(/"time":\s*"([^"]+)"/g, '"postTime": "$1"');
          jsonContent = jsonContent.replace(/,\s*}/g, "}");
          jsonContent = jsonContent.replace(/,\s*]/g, "]");
          jsonContent = jsonContent.replace(/"Objetivo":\s*"([^"]+)"/g, '"objective": "$1"');
          jsonContent = jsonContent.replace(/""Objetivo""/g, '"objective"');
          jsonContent = jsonContent.replace(/""+/g, '"');
          jsonContent = jsonContent.replace(/"\s*:\s*"/g, '": "');
          jsonContent = jsonContent.replace(/"\s*,\s*"/g, '", "');
          console.log(`[CALENDAR] Longitud del contenido JSON procesado: ${jsonContent.length} caracteres`);
          console.log(`[CALENDAR] Primeros 100 caracteres del JSON procesado: ${jsonContent.substring(0, 100)}...`);
          console.log(`[CALENDAR] Intentando parsear JSON con JSON.parse()`);
          const parsedContent = JSON.parse(jsonContent);
          console.log(`[CALENDAR] JSON parseado exitosamente, verificando estructura`);
          if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries)) {
            console.log(`[CALENDAR] Estructura b\xE1sica correcta. Entradas encontradas: ${parsedContent.entries.length}`);
            if (parsedContent.entries.length === 0) {
              console.error(`[CALENDAR] ERROR: Array de entradas vac\xEDo en el JSON`);
              console.log(`[CALENDAR] Detalles del objeto parseado:`, JSON.stringify(parsedContent, null, 2).substring(0, 500) + "...");
            } else {
              console.log(`[CALENDAR] Verificando campos requeridos en las entradas`);
              const validEntries = parsedContent.entries.filter(
                (entry) => entry.title && entry.platform && entry.postDate && typeof entry.title === "string" && typeof entry.platform === "string" && typeof entry.postDate === "string"
              );
              console.log(`[CALENDAR] Entradas con todos los campos requeridos: ${validEntries.length}/${parsedContent.entries.length}`);
              if (validEntries.length === parsedContent.entries.length) {
                console.log(`[CALENDAR] \xC9XITO: Estrategia 1 exitosa. Devolviendo cronograma con ${validEntries.length} entradas`);
                return parsedContent;
              } else {
                if (validEntries.length > 0) {
                  console.log(`[CALENDAR] Se filtraron ${parsedContent.entries.length - validEntries.length} entradas inv\xE1lidas`);
                  if (parsedContent.entries.length > validEntries.length) {
                    const invalidEntry = parsedContent.entries.find(
                      (entry) => !entry.title || !entry.platform || !entry.postDate || typeof entry.title !== "string" || typeof entry.platform !== "string" || typeof entry.postDate !== "string"
                    );
                    console.log(`[CALENDAR] Ejemplo de entrada inv\xE1lida:`, JSON.stringify(invalidEntry));
                  }
                  console.log(`[CALENDAR] \xC9XITO PARCIAL: Estrategia 1 parcialmente exitosa. Devolviendo cronograma con ${validEntries.length} entradas v\xE1lidas`);
                  return {
                    name: parsedContent.name || `Cronograma para ${projectName}`,
                    entries: validEntries
                  };
                } else {
                  console.error(`[CALENDAR] ERROR: No hay entradas v\xE1lidas entre las ${parsedContent.entries.length} detectadas`);
                }
              }
            }
          } else {
            console.error(`[CALENDAR] ERROR: Estructura de JSON inv\xE1lida. entries=${!!parsedContent?.entries}, isArray=${Array.isArray(parsedContent?.entries)}`);
            console.log(`[CALENDAR] Detalles del objeto parseado:`, JSON.stringify(parsedContent, null, 2).substring(0, 500) + "...");
          }
        } catch (error) {
          console.error(`[CALENDAR] ERROR Estrategia 1: Error al parsear JSON completo:`, error);
          if (error instanceof SyntaxError && "message" in error) {
            const errorMsg = error.message;
            const positionMatch = errorMsg.match(/position (\d+)/);
            if (positionMatch && positionMatch[1]) {
              const pos = parseInt(positionMatch[1]);
              const contextStart = Math.max(0, pos - 20);
              const contextEnd = Math.min(scheduleText.length, pos + 20);
              console.error(`[CALENDAR] Error de sintaxis cerca de la posici\xF3n ${pos}. Contexto: '${scheduleText.substring(contextStart, pos)}>>AQU\xCD<<${scheduleText.substring(pos, contextEnd)}'`);
            }
          }
        }
      } else {
        console.error(`[CALENDAR] ERROR: No se puede ejecutar Estrategia 1, posiciones JSON inv\xE1lidas`);
      }
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          console.log("Aplicando limpieza al JSON...");
          jsonContent = jsonContent.replace(/\r?\n/g, " ").replace(/\s+/g, " ");
          jsonContent = jsonContent.replace(/Lujo$/g, 'Lujo"');
          jsonContent = jsonContent.replace(/Lujo\s*}\s*,/g, 'Lujo"},');
          jsonContent = jsonContent.replace(/"name"\s*:\s*"([^"]*)"/g, (match, p1) => {
            return `"name":"${p1.replace(/"/g, '\\"')}"`;
          });
          jsonContent = jsonContent.replace(/}(\s*)\n?$/g, "}]}");
          if (!jsonContent.endsWith("]}")) {
            if (jsonContent.endsWith("}")) {
              jsonContent = jsonContent + "]}";
            } else if (!jsonContent.endsWith("]")) {
              jsonContent = jsonContent + "]}";
            } else if (!jsonContent.endsWith("}}")) {
              jsonContent = jsonContent + "}";
            }
          }
          jsonContent = jsonContent.replace(/}\s*{/g, "},{");
          jsonContent = jsonContent.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
          jsonContent = jsonContent.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
          jsonContent = jsonContent.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
          jsonContent = jsonContent.replace(/«/g, '"').replace(/»/g, '"');
          jsonContent = jsonContent.replace(/:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g, ':"$2"$3');
          jsonContent = jsonContent.replace(/",\s*"/g, '","');
          jsonContent = jsonContent.replace(/",\s*}/g, '"}');
          jsonContent = jsonContent.replace(/"\s*}/g, '"}');
          jsonContent = jsonContent.replace(/"\s*]/g, '"]');
          jsonContent = jsonContent.replace(/\\"/g, '"').replace(/\\'/g, "'");
          jsonContent = jsonContent.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, "\\\\");
          jsonContent = jsonContent.replace(/\}\s*"/g, '},"');
          jsonContent = jsonContent.replace(/\}\s*\{/g, "},{");
          jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
          jsonContent = jsonContent.replace(/,(\s*[\]}])/g, "$1");
          jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          console.log(
            "JSON limpiado (primeros 100 caracteres):",
            jsonContent.substring(0, 100) + "... [truncado]"
          );
          try {
            const parsedContent = JSON.parse(jsonContent);
            if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
              console.log(`Cronograma limpiado y parseado con ${parsedContent.entries.length} entradas`);
              const validEntries = parsedContent.entries.filter(
                (entry) => entry.title && entry.platform && entry.postDate
              );
              if (validEntries.length > 0) {
                return {
                  name: parsedContent.name || `Cronograma para ${projectName}`,
                  entries: validEntries
                };
              }
            }
          } catch (parseError) {
            console.error("Error al parsear JSON limpiado:", parseError);
            try {
              console.log("Intentando reparaci\xF3n profunda del JSON...");
              const nameMatch = jsonContent.match(/"name"\s*:\s*"([^"]+)"/);
              const name = nameMatch ? nameMatch[1] : `Cronograma para ${projectName}`;
              let entriesMatch = jsonContent.match(/"entries"\s*:\s*\[([\s\S]+?)\](?=\s*\})/);
              if (entriesMatch && entriesMatch[1]) {
                const entriesStr = entriesMatch[1].trim();
                const rawEntries = entriesStr.split(/}\s*,\s*{/);
                const validEntries = [];
                for (let i = 0; i < rawEntries.length; i++) {
                  try {
                    let entryStr = rawEntries[i];
                    if (!entryStr.startsWith("{")) entryStr = "{" + entryStr;
                    if (!entryStr.endsWith("}")) entryStr = entryStr + "}";
                    entryStr = entryStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
                    entryStr = entryStr.replace(/:\s*'([^']*)'/g, ':"$1"');
                    entryStr = entryStr.replace(/"([^"]+)":\s*([^",\{\}\[\]]+)([,\}])/g, (match, p1, p2, p3) => {
                      if (/^(\-?\d+\.?\d*|true|false|null)$/.test(p2.trim())) {
                        return `"${p1}": ${p2.trim()}${p3}`;
                      } else {
                        return `"${p1}": "${p2.trim()}"${p3}`;
                      }
                    });
                    entryStr = entryStr.replace(/,\s*}/g, "}");
                    entryStr = entryStr.replace(/}\s*{/g, "},{");
                    entryStr = entryStr.replace(/}\s*"/g, '},"');
                    entryStr = entryStr.replace(/"\s*{/g, '":{');
                    entryStr = entryStr.replace(/""+/g, '"');
                    let entry;
                    try {
                      entry = JSON.parse(entryStr);
                    } catch (parseError2) {
                      const errorMsg = parseError2.message || "";
                      const positionMatch = errorMsg.match(/position\s+(\d+)/i);
                      let errorPosition = -1;
                      if (positionMatch && positionMatch[1]) {
                        errorPosition = parseInt(positionMatch[1]);
                        if (errorPosition > 0 && errorPosition < entryStr.length) {
                          const start = Math.max(0, errorPosition - 10);
                          const end = Math.min(entryStr.length, errorPosition + 10);
                          const context = entryStr.substring(start, end);
                          console.log(`Contexto de error JSON en pos ${errorPosition}: "${context}"`);
                          if (errorMsg.includes("Expected ',' or '}'")) {
                            entryStr = entryStr.replace(/"(\d{2})":\s*(\d{2})"/g, '"$1:$2"');
                            entryStr = entryStr.replace(/:\s*"(\d{2})":\s*(\d{2})"/g, ': "$1:$2"');
                            entryStr = entryStr.replace(/"ime":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$1:$2"');
                            entryStr = entryStr.replace(/"time":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$1:$2"');
                            entryStr = entryStr.replace(/"postTime":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$1:$2"');
                            entryStr = entryStr.replace(/""Objetivo""\s*:\s*"([^"]+)"/g, '"objective": "$1"');
                            entryStr = entryStr.replace(/"Objetivo"\s*:\s*"([^"]+)"/g, '"objective": "$1"');
                            entryStr = entryStr.replace(/""Objetivo""/g, '"objective"');
                            entryStr = entryStr.replace(/""+/g, '"');
                            let fixedStr = entryStr.substring(0, errorPosition) + "}" + entryStr.substring(errorPosition);
                            try {
                              entry = JSON.parse(fixedStr);
                              console.log(`Reparaci\xF3n exitosa insertando '}' en posici\xF3n ${errorPosition}`);
                            } catch (e) {
                              fixedStr = entryStr.substring(0, errorPosition) + "," + entryStr.substring(errorPosition);
                              try {
                                entry = JSON.parse(fixedStr);
                                console.log(`Reparaci\xF3n exitosa insertando ',' en posici\xF3n ${errorPosition}`);
                              } catch (e2) {
                                fixedStr = entryStr.substring(0, errorPosition) + entryStr.substring(errorPosition + 1);
                                try {
                                  entry = JSON.parse(fixedStr);
                                  console.log(`Reparaci\xF3n exitosa eliminando caracter en posici\xF3n ${errorPosition}`);
                                } catch (e3) {
                                  throw parseError2;
                                }
                              }
                            }
                          } else {
                            throw parseError2;
                          }
                        } else {
                          throw parseError2;
                        }
                      } else {
                        throw parseError2;
                      }
                    }
                    if (entry.title && entry.platform && entry.postDate) {
                      const completeEntry = {
                        title: entry.title,
                        description: entry.description || "",
                        content: entry.content || "",
                        copyIn: entry.copyIn || "",
                        copyOut: entry.copyOut || "",
                        designInstructions: entry.designInstructions || "",
                        platform: entry.platform,
                        postDate: entry.postDate,
                        postTime: entry.postTime || "12:00",
                        hashtags: entry.hashtags || ""
                      };
                      validEntries.push(completeEntry);
                    }
                  } catch (innerError) {
                    console.warn(`Error procesando entrada ${i}:`, innerError);
                  }
                }
                if (validEntries.length > 0) {
                  console.log(`Recuperadas ${validEntries.length} entradas mediante reparaci\xF3n profunda`);
                  return {
                    name,
                    entries: validEntries
                  };
                }
              }
            } catch (repairError) {
              console.error("La reparaci\xF3n profunda del JSON fall\xF3:", repairError);
            }
          }
        } catch (error) {
          console.error("Error al limpiar y procesar JSON:", error);
        }
      }
      try {
        console.log("Aplicando extracci\xF3n por expresiones regulares...");
        const entriesRegex = /{(?:[^{}]|"[^"]*")*?"title"(?:[^{}]|"[^"]*")*?"platform"(?:[^{}]|"[^"]*")*?"postDate"(?:[^{}]|"[^"]*")*?}/g;
        const validEntries = [];
        let match;
        try {
          console.log("Aplicando reparaci\xF3n general del JSON antes de procesamiento por piezas");
          const repairedFullText = repairMalformedJson(scheduleText);
          const jsonStart2 = repairedFullText.indexOf("{");
          const jsonEnd2 = repairedFullText.lastIndexOf("}") + 1;
          if (jsonStart2 >= 0 && jsonEnd2 > jsonStart2) {
            try {
              const jsonContent = repairedFullText.substring(jsonStart2, jsonEnd2);
              const parsedContent = JSON.parse(jsonContent);
              if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
                console.log(`JSON reparado correctamente con ${parsedContent.entries.length} entradas`);
                const validEntries2 = parsedContent.entries.filter(
                  (entry) => entry.title && entry.platform && entry.postDate
                );
                if (validEntries2.length > 0) {
                  return {
                    name: parsedContent.name || `Cronograma para ${projectName}`,
                    entries: validEntries2
                  };
                }
              }
            } catch (error) {
              console.log("La reparaci\xF3n general del JSON no fue suficiente, continuando con procesamiento por piezas");
            }
          }
        } catch (repairError) {
          console.warn("Error en reparaci\xF3n general:", repairError);
        }
        while ((match = entriesRegex.exec(scheduleText)) !== null) {
          try {
            let entryText = match[0];
            console.log("Encontrada posible entrada:", entryText.substring(0, 50) + "... [truncado]");
            entryText = entryText.replace(/\r?\n/g, " ").replace(/\s+/g, " ");
            entryText = entryText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
            entryText = entryText.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
            entryText = entryText.replace(/«/g, '"').replace(/»/g, '"');
            entryText = entryText.replace(/:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g, ':"$2"$3');
            try {
              const entry = JSON.parse(entryText);
              if (entry.title && entry.platform && entry.postDate) {
                const completeEntry = {
                  title: entry.title,
                  description: entry.description || "",
                  content: entry.content || "",
                  copyIn: entry.copyIn || "",
                  copyOut: entry.copyOut || "",
                  designInstructions: entry.designInstructions || "",
                  platform: entry.platform,
                  postDate: entry.postDate,
                  postTime: entry.postTime || "12:00",
                  hashtags: entry.hashtags || ""
                };
                validEntries.push(completeEntry);
                console.log(`Entrada v\xE1lida para ${entry.platform} en fecha ${entry.postDate}`);
              }
            } catch (parseError) {
              console.log("Intentando reparaci\xF3n avanzada para entrada individual");
              try {
                const repairedEntryText = repairMalformedJson(entryText);
                const entry = JSON.parse(repairedEntryText);
                if (entry.title && entry.platform && entry.postDate) {
                  const completeEntry = {
                    title: entry.title,
                    description: entry.description || "",
                    content: entry.content || "",
                    copyIn: entry.copyIn || "",
                    copyOut: entry.copyOut || "",
                    designInstructions: entry.designInstructions || "",
                    platform: entry.platform,
                    postDate: entry.postDate,
                    postTime: entry.postTime || "12:00",
                    hashtags: entry.hashtags || ""
                  };
                  validEntries.push(completeEntry);
                  console.log(`Entrada reparada v\xE1lida para ${entry.platform} en fecha ${entry.postDate}`);
                }
              } catch (repairError) {
                console.warn("Error en reparaci\xF3n individual:", repairError);
              }
            }
          } catch (e) {
            console.warn("Error procesando entrada individual:", e);
          }
        }
        if (validEntries.length > 0) {
          console.log(`Recuperadas ${validEntries.length} entradas de forma individual mediante regex`);
          const nameMatch = scheduleText.match(/"name"\s*:\s*"([^"]+)"/);
          const name = nameMatch ? nameMatch[1] : `Cronograma para ${projectName}`;
          return {
            name,
            entries: validEntries
          };
        }
      } catch (error) {
        console.error("Error al extraer entradas individuales:", error);
      }
      console.log("Intentando extracci\xF3n l\xEDnea por l\xEDnea para buscar publicaciones...");
      try {
        const lines = scheduleText.split("\n");
        const entries = [];
        let currentEntry = null;
        let potentialPlatforms = ["Instagram", "Facebook", "Twitter", "LinkedIn", "TikTok", "YouTube", "Pinterest", "WhatsApp"];
        const datePattern = /\d{4}-\d{2}-\d{2}/;
        const timePattern = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const platformFound = potentialPlatforms.find(
            (platform) => line.includes(platform) || line.toLowerCase().includes(platform.toLowerCase())
          );
          const dateMatch = line.match(datePattern);
          const timeMatch = line.match(timePattern);
          if (platformFound || dateMatch) {
            if (currentEntry && currentEntry.title && currentEntry.platform && currentEntry.postDate) {
              entries.push({
                title: currentEntry.title,
                description: currentEntry.description || "",
                content: currentEntry.content || "",
                copyIn: currentEntry.copyIn || "",
                copyOut: currentEntry.copyOut || "",
                designInstructions: currentEntry.designInstructions || "",
                platform: currentEntry.platform,
                postDate: currentEntry.postDate,
                postTime: currentEntry.postTime || "12:00",
                hashtags: currentEntry.hashtags || ""
              });
            }
            currentEntry = {};
            if (platformFound) {
              currentEntry.platform = platformFound;
            }
            if (dateMatch) {
              currentEntry.postDate = dateMatch[0];
            }
            if (line.length > 5 && !line.startsWith("{") && !line.startsWith('"')) {
              if (line.length < 100) {
                currentEntry.title = line;
              } else if (i + 1 < lines.length && lines[i + 1].length < 100) {
                currentEntry.title = lines[i + 1].trim();
              }
            }
          }
          if (currentEntry) {
            if (!currentEntry.postTime && timeMatch) {
              currentEntry.postTime = timeMatch[0];
            }
            if (line.toLowerCase().includes("descripci\xF3n") || line.toLowerCase().includes("description")) {
              currentEntry.description = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("contenido") || line.toLowerCase().includes("content")) {
              currentEntry.content = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("copy in") || line.toLowerCase().includes("copyin")) {
              currentEntry.copyIn = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("copy out") || line.toLowerCase().includes("copyout")) {
              currentEntry.copyOut = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("instrucciones") || line.toLowerCase().includes("dise\xF1o")) {
              currentEntry.designInstructions = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("hashtag")) {
              currentEntry.hashtags = extractContentAfterLabel(line);
            }
            if (!currentEntry.title && line.length > 5 && line.length < 100 && !line.includes(":") && !line.includes("{") && !line.includes("}")) {
              currentEntry.title = line;
            }
            if (!currentEntry.postDate && dateMatch) {
              currentEntry.postDate = dateMatch[0];
            }
          }
        }
        if (currentEntry && currentEntry.title && currentEntry.platform) {
          if (!currentEntry.postDate) {
            currentEntry.postDate = formattedDate;
          }
          entries.push({
            title: currentEntry.title,
            description: currentEntry.description || "",
            content: currentEntry.content || "",
            copyIn: currentEntry.copyIn || "",
            copyOut: currentEntry.copyOut || "",
            designInstructions: currentEntry.designInstructions || "",
            platform: currentEntry.platform,
            postDate: currentEntry.postDate,
            postTime: currentEntry.postTime || "12:00",
            hashtags: currentEntry.hashtags || ""
          });
        }
        if (entries.length > 0) {
          console.log(`Extra\xEDdas ${entries.length} entradas mediante an\xE1lisis l\xEDnea por l\xEDnea`);
          return {
            name: `Cronograma para ${projectName}`,
            entries
          };
        }
      } catch (error) {
        console.error("Error en la extracci\xF3n l\xEDnea por l\xEDnea:", error);
      }
      console.log("Usando cronograma fallback b\xE1sico (\xFAltimo recurso)");
      return {
        name: `Cronograma para ${projectName}`,
        entries: [
          {
            title: "Publicaci\xF3n principal para redes sociales",
            description: "Este es un cronograma b\xE1sico para comenzar. Por favor regenera para obtener m\xE1s opciones.",
            content: "Contenido detallado para la red social principal del proyecto.",
            copyIn: "Texto integrado para dise\xF1o",
            copyOut: "Texto para descripci\xF3n en redes sociales \u2728",
            designInstructions: "Dise\xF1o basado en la identidad visual del proyecto",
            platform: "Instagram",
            postDate: formattedDate,
            postTime: "12:00",
            hashtags: "#marketing #contenido #socialmedia"
          }
        ]
      };
    } catch (generalError) {
      console.error("Error general procesando respuesta:", generalError);
      return {
        name: `Cronograma para ${projectName}`,
        entries: [
          {
            title: "Publicaci\xF3n principal para redes sociales",
            description: "Este es un cronograma b\xE1sico para comenzar. Por favor regenera para obtener m\xE1s opciones.",
            content: "Contenido detallado para la red social principal del proyecto.",
            copyIn: "Texto integrado para dise\xF1o",
            copyOut: "Texto para descripci\xF3n en redes sociales \u2728",
            designInstructions: "Dise\xF1o basado en la identidad visual del proyecto",
            platform: "Instagram",
            postDate: formattedDate,
            postTime: "12:00",
            hashtags: "#marketing #contenido #socialmedia"
          }
        ]
      };
    }
  } catch (error) {
    console.error("[CALENDAR] Error cr\xEDtico en generateSchedule:", error);
    let errorType = error.errorType || "UNKNOWN";
    let errorMessage = "";
    console.log("[CALENDAR ERROR] Detalles completos:", {
      message: error.message,
      type: error.errorType,
      stack: error.stack,
      originalError: error
    });
    if (error.message && typeof error.message === "string") {
      if (errorType === "NETWORK" || error.message.includes("connect")) {
        errorType = "NETWORK";
        errorMessage = `Error de conexi\xF3n con la API de Grok: ${error.message}`;
      } else if (errorType === "JSON_PARSING" || error.message.includes("JSON") || error.message.includes("parse")) {
        errorType = "JSON_PARSING";
        errorMessage = `Error de procesamiento de respuesta JSON: ${error.message}`;
      } else if (errorType === "RATE_LIMIT" || error.message.includes("limit")) {
        errorType = "RATE_LIMIT";
        errorMessage = `Se ha excedido el l\xEDmite de peticiones a Grok AI: ${error.message}`;
      } else if (errorType === "AUTH" || error.message.includes("autenticaci\xF3n") || error.message.includes("authentication")) {
        errorType = "AUTH";
        errorMessage = `Error de autenticaci\xF3n con Grok AI: ${error.message}`;
      } else if (error.message.startsWith("ERROR_JSON_PROCESSING:")) {
        errorType = "JSON_PROCESSING";
        errorMessage = error.message;
      } else {
        errorMessage = `Error desconocido: ${error.message}`;
      }
    } else {
      errorMessage = "Error desconocido sin mensaje";
    }
    const enhancedError = new Error(`${errorType}: ${errorMessage}`);
    enhancedError.errorType = errorType;
    throw enhancedError;
  }
}
function extractContentAfterLabel(line) {
  const colonIndex = line.indexOf(":");
  if (colonIndex > 0 && colonIndex < line.length - 1) {
    return line.substring(colonIndex + 1).trim();
  }
  const separators = ["-", "\u2013", "\u2014", ">", "=", "|", "\u2022"];
  for (const sep of separators) {
    const sepIndex = line.indexOf(sep);
    if (sepIndex > 0 && sepIndex < line.length - 1) {
      return line.substring(sepIndex + 1).trim();
    }
  }
  const words = line.trim().split(/\s+/);
  if (words.length >= 2) {
    return words.slice(1).join(" ").trim();
  }
  return line.trim();
}
function repairMalformedJson(jsonString) {
  let result = jsonString;
  result = result.replace(/([a-zA-Z0-9_]+)(?=:)/g, '"$1"');
  result = result.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, "\\\\");
  const singleQuoteRegex = /'([^']*?)'/g;
  result = result.replace(singleQuoteRegex, '"$1"');
  const spanishWordRegex = /:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g;
  result = result.replace(spanishWordRegex, ':"$2"$3');
  result = result.replace(/,(\s*[\]}])/g, "$1");
  const countOccurrences = (str, char) => {
    return (str.match(new RegExp(`\\${char}`, "g")) || []).length;
  };
  const openBraces = countOccurrences(result, "{");
  const closeBraces = countOccurrences(result, "}");
  if (openBraces > closeBraces) {
    result += "}".repeat(openBraces - closeBraces);
  } else if (closeBraces > openBraces) {
    result = "{".repeat(closeBraces - openBraces) + result;
  }
  const openBrackets = countOccurrences(result, "[");
  const closeBrackets = countOccurrences(result, "]");
  if (openBrackets > closeBrackets) {
    result += "]".repeat(openBrackets - closeBrackets);
  } else if (closeBrackets > openBrackets) {
    result = "[".repeat(closeBrackets - openBrackets) + result;
  }
  result = result.replace(/:\s*([^"{}\[\],\d][^,}\]]*[^"{}\[\],\d])\s*([,}\]])/g, ':"$1"$2');
  result = result.replace(/"\s+:/g, '":');
  result = result.replace(/,(\s*})/g, "$1");
  result = result.replace(/,(\s*\])/g, "$1");
  result = result.replace(/"(true|false)"(?=[\s,}\]])/g, "$1");
  result = result.replace(/"(\d+)"(?=[\s,}\]])/g, "$1");
  return result;
}

// server/routes.ts
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
import ExcelJS from "exceljs";
import { eq as eq3, asc as asc2, desc as desc2, and as and2 } from "drizzle-orm";
import { jsPDF } from "jspdf";
import { format as format2 } from "date-fns";
import { WebSocketServer as WebSocketServer2 } from "ws";
import { fileURLToPath } from "url";
import { dirname } from "path";
var hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};
var comparePasswords = async (supplied, stored) => {
  return await bcrypt.compare(supplied, stored);
};
var isPrimaryUser = (req, res, next) => {
  if (!req.user || !req.user.isPrimary) {
    return res.status(403).json({ message: "Acceso denegado. Solo usuarios primarios." });
  }
  next();
};
global.storage = storage;
var currentFilePath = fileURLToPath(import.meta.url);
var currentDirPath = dirname(currentFilePath);
var baseUploadDir = path.join(currentDirPath, "..", "uploads");
var multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs2.existsSync(baseUploadDir)) {
      fs2.mkdirSync(baseUploadDir, { recursive: true });
    }
    cb(null, baseUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
var documentUpload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, and TXT files are allowed."));
    }
  }
});
var upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit para imágenes
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no v\xE1lido. Solo se permiten im\xE1genes JPG, PNG, GIF o WEBP."));
    }
  }
});
var marketingImageUpload = multer({
  storage: multerStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  // 8MB limit para imágenes de marketing (algunas pueden ser de mayor calidad)
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no v\xE1lido para an\xE1lisis de IA. Solo se permiten im\xE1genes JPG, PNG o WEBP."));
    }
  }
});
async function registerRoutes(app2) {
  await setupSimpleGoogleAuth(app2);
  app2.use("/static", express.static(path.join(currentDirPath, "public")));
  app2.use("/uploads", express.static(path.join(currentDirPath, "..", "uploads")));
  app2.get("/privacy-policy", (req, res) => {
    res.sendFile(path.join(currentDirPath, "public", "privacy-policy.html"));
  });
  app2.get("/terms-of-service", (req, res) => {
    res.sendFile(path.join(currentDirPath, "public", "terms-of-service.html"));
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      console.log("Login attempt for:", identifier);
      if (!identifier || !password) {
        return res.status(400).json({ message: "Usuario y contrase\xF1a son requeridos" });
      }
      let user = await storage.getUserByUsername(identifier);
      console.log("User found by username:", !!user);
      if (!user && identifier.includes("@")) {
        user = await storage.getUserByEmail(identifier);
        console.log("User found by email:", !!user);
      }
      if (!user) {
        console.log("No user found for identifier:", identifier);
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      console.log("User found:", user.username, "has password:", !!user.password);
      if (!user.password) {
        return res.status(401).json({ message: "Este usuario debe iniciar sesi\xF3n con Google" });
      }
      console.log("Comparing passwords...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValidPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Error creating session:", err);
          return res.status(500).json({ message: "Error al crear sesi\xF3n" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await global.storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }
      if (userData.email) {
        const existingEmail = await global.storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "El email ya est\xE1 registrado" });
        }
      }
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await global.storage.createUser({
        ...userData,
        password: hashedPassword,
        isPrimary: false,
        // Los usuarios registrados normalmente no son primarios
        role: userData.role || "content_creator"
      });
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error creating session after registration:", err);
          return res.status(500).json({ message: "Usuario creado pero error al iniciar sesi\xF3n" });
        }
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error in registration:", error);
      res.status(500).json({ message: "Error al crear cuenta" });
    }
  });
  const PRIMARY_ACCOUNT_SECRET = process.env.PRIMARY_ACCOUNT_SECRET || "cohete-workflow-secret";
  app2.post("/api/create-primary-account", async (req, res) => {
    try {
      const { fullName, username, password, secretKey } = req.body;
      if (!fullName || !username || !password || !secretKey) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
      if (secretKey !== PRIMARY_ACCOUNT_SECRET) {
        return res.status(403).json({ message: "Clave secreta incorrecta" });
      }
      const existingUser = await global.storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await global.storage.createUser({
        fullName,
        username,
        password: hashedPassword,
        isPrimary: true,
        role: "admin",
        preferredLanguage: "es",
        theme: "light"
      });
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating primary account:", error);
      res.status(500).json({ message: "Error al crear cuenta primaria" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const users3 = await global.storage.listUsers();
      const sanitizedUsers = users3.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ message: "Error al listar usuarios" });
    }
  });
  app2.post("/api/admin/users", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await global.storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await global.storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  });
  app2.patch("/api/admin/users/:id", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario requerido" });
      }
      const user = await global.storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const updateData = req.body;
      if (userId === req.user.id && updateData.hasOwnProperty("isPrimary")) {
        return res.status(400).json({ message: "No puedes modificar tus propios permisos de administrador" });
      }
      if (updateData.isPrimary === false && user.isPrimary) {
        const allUsers = await global.storage.listUsers();
        const primaryUsers = allUsers.filter((u) => u.isPrimary && u.id !== userId);
        if (primaryUsers.length === 0) {
          return res.status(400).json({ message: "No se puede remover permisos al \xFAltimo usuario administrador" });
        }
      }
      const updatedUser = await global.storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Error al actualizar usuario" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });
  app2.delete("/api/admin/users/:id", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario requerido" });
      }
      if (userId === req.user.id) {
        return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
      }
      const user = await global.storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (user.isPrimary) {
        const allUsers = await global.storage.listUsers();
        const primaryUsers = allUsers.filter((u) => u.isPrimary);
        if (primaryUsers.length <= 1) {
          return res.status(400).json({ message: "No se puede eliminar el \xFAltimo usuario administrador" });
        }
      }
      await global.storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });
  app2.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const [updatedUser] = await db.update(users2).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users2.id, userId)).returning();
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  });
  app2.post("/api/user/cover-image", isAuthenticated, upload.single("coverImage"), async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No se proporcion\xF3 ning\xFAn archivo" });
      }
      const imagePath = `/uploads/${file.filename}`;
      const [updatedUser] = await db.update(users2).set({
        coverImage: imagePath,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users2.id, userId)).returning();
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ coverImage: imagePath });
    } catch (error) {
      console.error("Error uploading cover image:", error);
      res.status(500).json({ message: "Error al subir la imagen de portada" });
    }
  });
  app2.post("/api/user/profile-image", isAuthenticated, upload.single("profileImage"), async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No se proporcion\xF3 ning\xFAn archivo" });
      }
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Solo se permiten archivos de imagen" });
      }
      const imagePath = `/uploads/${file.filename}`;
      const [updatedUser] = await db.update(users2).set({
        profileImage: imagePath,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(users2.id, userId)).returning();
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ profileImage: imagePath });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Error al subir la imagen de perfil" });
    }
  });
  app2.post("/api/profile/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Se requiere la contrase\xF1a actual y la nueva contrase\xF1a" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "La nueva contrase\xF1a debe tener al menos 6 caracteres" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (!user.password) {
        return res.status(400).json({ message: "Este usuario no tiene contrase\xF1a configurada" });
      }
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "La contrase\xF1a actual es incorrecta" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(req.user.id, { password: hashedPassword });
      res.json({ message: "Contrase\xF1a actualizada correctamente" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Error al cambiar la contrase\xF1a" });
    }
  });
  app2.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users3 = await global.storage.listUsers();
      const safeUsers = users3.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        isPrimary: user.isPrimary,
        role: user.role,
        jobTitle: user.jobTitle,
        department: user.department,
        profileImage: user.profileImage
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ message: "Error al listar usuarios" });
    }
  });
  app2.post("/api/projects", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      projectData.createdBy = req.user.id;
      const newProject = await global.storage.createProject(projectData);
      if (req.body.analysisResults) {
        const analysisData = {
          projectId: newProject.id,
          ...req.body.analysisResults
        };
        await global.storage.createAnalysisResult(analysisData);
      }
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  app2.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projects2 = await global.storage.listProjectsByUser(req.user.id, req.user.isPrimary);
      res.json(projects2);
    } catch (error) {
      console.error("Error listing projects:", error);
      res.status(500).json({ message: "Failed to list projects" });
    }
  });
  app2.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      console.log(`Fetching project details for ID: ${projectId}`);
      if (isNaN(projectId)) {
        console.error("Invalid project ID:", req.params.id);
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      console.log(`User ${req.user.id} access to project ${projectId}: ${hasAccess}`);
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const project = await global.storage.getProjectWithAnalysis(projectId);
      console.log(`Project ${projectId} found:`, !!project);
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      if (!project.name || !project.client) {
        console.error("Project data is incomplete:", project);
        return res.status(500).json({ message: "Datos del proyecto incompletos" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error detallado al obtener proyecto:", error);
      res.status(500).json({ message: "Error al cargar el proyecto" });
    }
  });
  app2.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      if (!req.user.isPrimary) {
        return res.status(403).json({ message: "Only primary users can update project details" });
      }
      const project = await global.storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const updatedProject = await global.storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const project = await global.storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      await global.storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.patch("/api/projects/:id/analysis", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const analysisData = insertAnalysisResultsSchema.parse({
        projectId,
        ...req.body
      });
      const existingAnalysis = await global.storage.getAnalysisResult(projectId);
      let result;
      if (existingAnalysis) {
        result = await global.storage.updateAnalysisResult(projectId, analysisData);
      } else {
        result = await global.storage.createAnalysisResult(analysisData);
      }
      res.json(result);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating project analysis:", error);
      res.status(500).json({ message: "Failed to update project analysis" });
    }
  });
  app2.post("/api/projects/:projectId/analyze-image", isAuthenticated, marketingImageUpload.single("image"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ninguna imagen" });
      }
      const analysisType = req.body.analysisType || "content";
      if (!["brand", "content", "audience"].includes(analysisType)) {
        return res.status(400).json({ message: "Tipo de an\xE1lisis inv\xE1lido. Debe ser 'brand', 'content' o 'audience'" });
      }
      const analysisResult = await analyzeMarketingImage(req.file.path, analysisType);
      res.json({
        success: true,
        analysisType,
        result: analysisResult,
        imageInfo: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error("Error analizando imagen de marketing:", error);
      res.status(500).json({
        message: "Error al analizar la imagen",
        error: error.message
      });
    }
  });
  app2.post("/api/projects/:projectId/documents", isAuthenticated, documentUpload.single("file"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const documentData = {
        projectId,
        uploadedBy: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      };
      const document = await global.storage.createDocument(documentData);
      let extractedText = "";
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs2.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else if (req.file.mimetype === "text/plain") {
        extractedText = fs2.readFileSync(req.file.path, "utf8");
      } else {
        extractedText = "Text extraction not supported for this file type yet.";
      }
      let updatedDocument = await global.storage.updateDocument(document.id, {
        extractedText,
        analysisStatus: "processing"
      });
      console.log(`Starting AI analysis for document ${document.id}`);
      analyzeDocument(extractedText).then(async (analysis) => {
        console.log(`AI analysis completed successfully for document ${document.id}`);
        await global.storage.updateDocument(document.id, {
          analysisResults: analysis,
          analysisStatus: "completed"
        });
      }).catch(async (error) => {
        console.error(`AI analysis failed for document ${document.id}:`, error);
        await global.storage.updateDocument(document.id, {
          analysisStatus: "failed",
          analysisError: error.message
        });
      });
      res.status(201).json(updatedDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });
  app2.get("/api/projects/:projectId/documents", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const documents2 = await global.storage.listDocumentsByProject(projectId);
      res.json(documents2);
    } catch (error) {
      console.error("Error listing documents:", error);
      res.status(500).json({ message: "Failed to list documents" });
    }
  });
  app2.post("/api/projects/:projectId/documents/:documentId/use-analysis", isAuthenticated, isPrimaryUser, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const documentId = parseInt(req.params.documentId);
      if (isNaN(projectId) || isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const document = await global.storage.getDocument(documentId);
      if (!document || document.projectId !== projectId) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.analysisStatus !== "completed" || !document.analysisResults) {
        return res.status(400).json({ message: "Document analysis not available" });
      }
      const analysis = document.analysisResults;
      const existingAnalysis = await global.storage.getAnalysisResult(projectId);
      if (existingAnalysis) {
        await global.storage.updateAnalysisResult(projectId, analysis);
      } else {
        await global.storage.createAnalysisResult({
          projectId,
          ...analysis
        });
      }
      res.json({ message: "Analysis applied to project" });
    } catch (error) {
      console.error("Error applying document analysis:", error);
      res.status(500).json({ message: "Failed to apply document analysis" });
    }
  });
  app2.post("/api/projects/:projectId/schedule", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId) || !projectId) {
        return res.status(400).json({ error: "El ID del proyecto es obligatorio." });
      }
      const { distributionPreferences, ...otherData } = req.body;
      if (distributionPreferences?.type === "custom" && (!distributionPreferences.frequency || !distributionPreferences.preferredTimes || !distributionPreferences.preferredDays)) {
        return res.status(400).json({ message: "Custom distribution requires frequency, preferred times and days" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const { startDate, specifications, periodType, additionalInstructions } = req.body;
      if (!startDate) {
        return res.status(400).json({ message: "Start date is required" });
      }
      const selectedAIModel = "grok" /* GROK */;
      let periodDays = 15;
      if (periodType === "mensual") {
        periodDays = 31;
      }
      const project = await global.storage.getProjectWithAnalysis(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const contentHistory2 = await global.storage.listContentHistoryByProject(projectId);
      const previousContent = contentHistory2.map((entry) => entry.content);
      console.log("[CALENDAR] Iniciando generaci\xF3n de cronograma");
      console.log("[CALENDAR] Instrucciones adicionales: ", additionalInstructions || "Ninguna");
      const generatedSchedule = await generateSchedule(
        project.name,
        {
          client: project.client,
          description: project.description,
          ...project.analysis
        },
        startDate,
        specifications,
        periodDays,
        // Usar el número de días según el tipo de periodo seleccionado
        previousContent,
        additionalInstructions
        // Pasamos las instrucciones adicionales a la función
      );
      const scheduleData = {
        projectId,
        name: generatedSchedule.name,
        startDate: new Date(startDate),
        specifications,
        additionalInstructions,
        // Guardar instrucciones adicionales en la base de datos
        createdBy: req.user.id
        // Omitimos los campos aiModel y periodType que ya no existen en la base de datos
      };
      const schedule = await global.storage.createSchedule(scheduleData);
      const entryPromises = generatedSchedule.entries.map(async (entry) => {
        const savedEntry = await global.storage.createScheduleEntry({
          scheduleId: schedule.id,
          title: entry.title,
          description: entry.description,
          content: entry.content,
          copyIn: entry.copyIn,
          copyOut: entry.copyOut,
          designInstructions: entry.designInstructions,
          platform: entry.platform,
          postDate: new Date(entry.postDate),
          postTime: entry.postTime,
          hashtags: entry.hashtags
        });
        try {
          await global.storage.createContentHistory({
            projectId,
            content: entry.content,
            contentType: "schedule",
            title: entry.title,
            platform: entry.platform
          });
        } catch (historyError) {
          console.error(`Error saving content history for entry ${savedEntry.id}:`, historyError);
        }
        return savedEntry;
      });
      await Promise.all(entryPromises);
      const scheduleWithEntries = await global.storage.getScheduleWithEntries(schedule.id);
      res.status(201).json(scheduleWithEntries);
    } catch (error) {
      console.error("Error creating schedule:", error);
      const errorType = error.errorType || "UNKNOWN";
      const errorMessage = error.message || "Error desconocido";
      console.log(`[CALENDAR ROUTE] Error tipo: ${errorType}, Mensaje: ${errorMessage}`);
      if (errorType === "NETWORK" || errorMessage.includes("connect") || errorMessage.includes("Servicio de Grok AI temporalmente no disponible")) {
        return res.status(503).json({
          message: "Servicio de IA temporalmente no disponible. Por favor intenta nuevamente en unos minutos.",
          error: errorMessage,
          errorType: "SERVICIO_NO_DISPONIBLE"
        });
      } else if (errorType === "RATE_LIMIT" || errorMessage.includes("l\xEDmite de peticiones")) {
        return res.status(429).json({
          message: "Hemos alcanzado el l\xEDmite de generaciones. Por favor espera unos minutos antes de intentar crear otro calendario.",
          error: errorMessage,
          errorType: "LIMITE_EXCEDIDO"
        });
      } else if (errorType === "AUTH" || errorMessage.includes("autenticaci\xF3n") || errorMessage.includes("authentication")) {
        return res.status(401).json({
          message: "Error en la configuraci\xF3n del servicio de IA. Por favor contacta al administrador.",
          error: errorMessage,
          errorType: "ERROR_AUTENTICACION"
        });
      } else if (errorType === "JSON_PARSING" || errorMessage.includes("JSON") || errorMessage.includes("parse")) {
        return res.status(422).json({
          message: "Error al procesar la respuesta del servicio de IA. Intenta con menos contenido o diferentes configuraciones.",
          error: errorMessage,
          errorType: "ERROR_FORMATO_RESPUESTA"
        });
      } else if (errorType === "JSON_PROCESSING" || errorMessage.includes("ERROR_JSON_PROCESSING")) {
        return res.status(422).json({
          message: "No pudimos procesar correctamente el calendario generado. Intenta con diferentes ajustes o menos plataformas.",
          error: errorMessage,
          errorType: "ERROR_DATOS"
        });
      }
      res.status(500).json({
        message: "Ocurri\xF3 un error al crear el calendario. Por favor intenta con menos plataformas o en otro momento.",
        error: errorMessage,
        errorType: "ERROR_GENERAL"
      });
    }
  });
  app2.get("/api/projects/:projectId/schedules", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const schedules2 = await global.storage.listSchedulesByProject(projectId);
      res.json(schedules2);
    } catch (error) {
      console.error("Error listing schedules:", error);
      res.status(500).json({ message: "Failed to list schedules" });
    }
  });
  app2.get("/api/schedules/recent", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.json([]);
      }
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const recentSchedules = await global.storage.listRecentSchedules(limit);
      if (!recentSchedules || recentSchedules.length === 0) {
        return res.json([]);
      }
      const accessibleSchedules = [];
      for (const schedule of recentSchedules) {
        try {
          if (!schedule || !schedule.projectId) {
            console.warn("Schedule incompleto encontrado en el endpoint:", schedule);
            continue;
          }
          const hasAccess = await global.storage.checkUserProjectAccess(
            req.user.id,
            schedule.projectId,
            req.user.isPrimary
          );
          if (hasAccess) {
            accessibleSchedules.push(schedule);
          }
        } catch (err) {
          console.error(`Error procesando schedule ID ${schedule?.id}:`, err);
        }
      }
      res.json(accessibleSchedules);
    } catch (error) {
      console.error("Error getting recent schedules:", error);
      return res.json([]);
    }
  });
  app2.get("/api/schedules/:id", isAuthenticated, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      const schedule = await global.storage.getScheduleWithEntries(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this schedule" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });
  app2.patch("/api/schedules/:id/additional-instructions", isAuthenticated, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "ID de cronograma inv\xE1lido" });
      }
      const { additionalInstructions } = req.body;
      const schedule = await global.storage.getSchedule(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este cronograma" });
      }
      const updatedSchedule = await global.storage.updateSchedule(scheduleId, {
        additionalInstructions: additionalInstructions || null
      });
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating schedule additional instructions:", error);
      res.status(500).json({ message: "Error al actualizar las instrucciones adicionales del cronograma" });
    }
  });
  app2.post("/api/schedules/:id/regenerate", isAuthenticated, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { additionalInstructions: newInstructions, selectedAreas, specificInstructions } = req.body;
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "ID de cronograma inv\xE1lido" });
      }
      console.log("[REGENERATE] Iniciando regeneraci\xF3n con \xE1reas espec\xEDficas:", scheduleId);
      console.log("[REGENERATE] Instrucciones generales:", newInstructions || "Ninguna");
      console.log("[REGENERATE] \xC1reas seleccionadas:", selectedAreas || "Todas");
      console.log("[REGENERATE] Instrucciones espec\xEDficas:", specificInstructions || "Ninguna");
      const schedule = await global.storage.getScheduleWithEntries(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Cronograma no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este cronograma" });
      }
      const project = await global.storage.getProjectWithAnalysis(schedule.projectId);
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      const contentHistory2 = await global.storage.listContentHistoryByProject(schedule.projectId);
      const previousContent = contentHistory2.map((entry) => entry.content);
      const startDate = schedule.startDate ? format2(new Date(schedule.startDate), "yyyy-MM-dd") : format2(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
      let enhancedInstructions = newInstructions || schedule.additionalInstructions || "";
      if (selectedAreas && Object.values(selectedAreas).some(Boolean)) {
        const selectedAreasList = Object.entries(selectedAreas).filter(([_, selected]) => selected).map(([area, _]) => {
          const areaNames = {
            titles: "t\xEDtulos",
            descriptions: "descripciones",
            content: "contenido",
            copyIn: "texto integrado (copyIn)",
            copyOut: "texto descripci\xF3n (copyOut)",
            designInstructions: "instrucciones de dise\xF1o",
            platforms: "plataformas",
            hashtags: "hashtags"
          };
          return areaNames[area] || area;
        });
        enhancedInstructions += `

=== MODIFICACIONES ESPEC\xCDFICAS REQUERIDAS ===
`;
        enhancedInstructions += `Modifica \xDANICAMENTE estos elementos: ${selectedAreasList.join(", ")}
`;
        enhancedInstructions += `MANT\xC9N sin cambios todos los dem\xE1s elementos del cronograma.
`;
        if (specificInstructions) {
          enhancedInstructions += `
=== INSTRUCCIONES DETALLADAS POR \xC1REA ===
`;
          Object.entries(selectedAreas).forEach(([area, selected]) => {
            if (selected && specificInstructions[area] && specificInstructions[area].trim()) {
              const areaNames = {
                titles: "T\xCDTULOS",
                descriptions: "DESCRIPCIONES",
                content: "CONTENIDO",
                copyIn: "TEXTO INTEGRADO (copyIn)",
                copyOut: "TEXTO DESCRIPCI\xD3N (copyOut)",
                designInstructions: "INSTRUCCIONES DE DISE\xD1O",
                platforms: "PLATAFORMAS",
                hashtags: "HASHTAGS"
              };
              const areaName = areaNames[area] || area.toUpperCase();
              enhancedInstructions += `
${areaName}: ${specificInstructions[area]}
`;
            }
          });
        }
        enhancedInstructions += `
=== FORMATO DE RESPUESTA CR\xCDTICO ===
`;
        enhancedInstructions += `Responde \xDANICAMENTE con JSON v\xE1lido. NO agregues texto explicativo antes o despu\xE9s del JSON.
`;
        enhancedInstructions += `Aseg\xFArate de que todas las comillas est\xE9n correctamente escapadas.
`;
        enhancedInstructions += `Verifica que no haya caracteres especiales que rompan el formato JSON.
`;
        console.log("[REGENERATE] Instrucciones estructuradas con \xE1reas espec\xEDficas:", enhancedInstructions);
      }
      console.log("[REGENERATE] Iniciando edici\xF3n selectiva de entradas espec\xEDficas");
      const existingEntries = schedule.entries || [];
      console.log(`[REGENERATE] Encontradas ${existingEntries.length} entradas existentes para editar`);
      if (existingEntries.length === 0) {
        return res.status(400).json({ message: "No hay entradas para editar en este cronograma" });
      }
      for (let i = 0; i < existingEntries.length; i++) {
        const entry = existingEntries[i];
        console.log(`[REGENERATE] Procesando entrada ${i + 1}/${existingEntries.length}: "${entry.title}"`);
        const editPrompt = `
Eres un experto en marketing de contenidos. Tu tarea es EDITAR \xDANICAMENTE las \xE1reas espec\xEDficas de esta publicaci\xF3n seg\xFAn las instrucciones del usuario.

PUBLICACI\xD3N ACTUAL:
- T\xEDtulo: "${entry.title}"
- Descripci\xF3n: "${entry.description}"
- Contenido: "${entry.content}"
- Texto Integrado (copyIn): "${entry.copyIn}"
- Texto Descripci\xF3n (copyOut): "${entry.copyOut}"
- Instrucciones de Dise\xF1o: "${entry.designInstructions}"
- Plataforma: "${entry.platform}"
- Hashtags: "${entry.hashtags}"

${enhancedInstructions}

RESPONDE \xDANICAMENTE CON UN JSON V\xC1LIDO con esta estructura exacta:
{
  "title": "t\xEDtulo editado o el mismo si no se modifica",
  "description": "descripci\xF3n editada o la misma si no se modifica",
  "content": "contenido editado o el mismo si no se modifica",
  "copyIn": "copyIn editado o el mismo si no se modifica",
  "copyOut": "copyOut editado o el mismo si no se modifica",
  "designInstructions": "instrucciones editadas o las mismas si no se modifican",
  "platform": "plataforma editada o la misma si no se modifica",
  "hashtags": "hashtags editados o los mismos si no se modifican"
}

IMPORTANTE: Si un \xE1rea NO est\xE1 seleccionada para modificaci\xF3n, mant\xE9n el valor original EXACTAMENTE como est\xE1.`;
        try {
          const editedContentText = await grokService.generateText(editPrompt, {
            temperature: 0.7,
            maxTokens: 2e3,
            model: "grok-3-mini-beta"
          });
          console.log(`[REGENERATE] Respuesta de edici\xF3n para entrada ${i + 1}:`, editedContentText.substring(0, 200));
          let editedContent;
          try {
            const jsonMatch = editedContentText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              editedContent = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("No se encontr\xF3 JSON v\xE1lido en la respuesta");
            }
          } catch (parseError) {
            console.error(`[REGENERATE] Error parseando JSON para entrada ${i + 1}:`, parseError);
            editedContent = {
              title: entry.title,
              description: entry.description,
              content: entry.content,
              copyIn: entry.copyIn,
              copyOut: entry.copyOut,
              designInstructions: entry.designInstructions,
              platform: entry.platform,
              hashtags: entry.hashtags
            };
          }
          await global.storage.updateScheduleEntry(entry.id, {
            title: editedContent.title || entry.title,
            description: editedContent.description || entry.description,
            content: editedContent.content || entry.content,
            copyIn: editedContent.copyIn || entry.copyIn,
            copyOut: editedContent.copyOut || entry.copyOut,
            designInstructions: editedContent.designInstructions || entry.designInstructions,
            platform: editedContent.platform || entry.platform,
            hashtags: editedContent.hashtags || entry.hashtags
          });
          console.log(`[REGENERATE] Entrada ${i + 1} actualizada exitosamente`);
        } catch (error) {
          console.error(`[REGENERATE] Error editando entrada ${i + 1}:`, error);
        }
      }
      if (newInstructions && newInstructions.trim()) {
        await global.storage.updateSchedule(scheduleId, {
          additionalInstructions: newInstructions
        });
      }
      const updatedSchedule = await global.storage.getScheduleWithEntries(scheduleId);
      console.log("[REGENERATE] Edici\xF3n selectiva completada exitosamente");
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error al regenerar cronograma:", error);
      res.status(500).json({
        message: "Error al regenerar cronograma",
        error: error.message
      });
    }
  });
  app2.get("/api/schedules/:id/download", isAuthenticated, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const format3 = req.query.format || "excel";
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      const schedule = await global.storage.getScheduleWithEntries(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this schedule" });
      }
      const project = await global.storage.getProject(schedule.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const sortedEntries = [...schedule.entries].sort((a, b) => {
        const dateA = a.postDate ? new Date(a.postDate) : /* @__PURE__ */ new Date(0);
        const dateB = b.postDate ? new Date(b.postDate) : /* @__PURE__ */ new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      if (format3 === "excel") {
        const getFormatByPlatform = (platform) => {
          const formats = {
            "Instagram": "Carrusel/Reels \u2022 9:16 o 1:1",
            "Facebook": "Imagen/Video \u2022 16:9 o 1:1",
            "Twitter": "Imagen/GIF \u2022 16:9",
            "LinkedIn": "Imagen/Art\xEDculo \u2022 16:9 o 1:1",
            "TikTok": "Video \u2022 9:16 vertical",
            "YouTube": "Video \u2022 16:9 horizontal",
            "Pinterest": "Pin \u2022 2:3 vertical",
            "WhatsApp": "Imagen/Video \u2022 1:1 o 9:16"
          };
          return formats[platform] || "Formato est\xE1ndar";
        };
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Cohete Workflow";
        workbook.created = /* @__PURE__ */ new Date();
        const safeWorksheetName = schedule.name.replace(/[\*\?\:\\/\[\]]/g, "-");
        const worksheet = workbook.addWorksheet(safeWorksheetName, {
          properties: {
            tabColor: { argb: "4F46E5" },
            // Color primario (indigo)
            defaultRowHeight: 22
          }
        });
        worksheet.mergeCells("A1:J1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = schedule.name;
        titleCell.font = { size: 16, bold: true, color: { argb: "4F46E5" } };
        titleCell.alignment = { horizontal: "center" };
        worksheet.mergeCells("A2:J2");
        const subtitleCell = worksheet.getCell("A2");
        subtitleCell.value = "Cohete Workflow - Cronograma de Contenido";
        subtitleCell.font = { size: 12, color: { argb: "6B7280" } };
        subtitleCell.alignment = { horizontal: "center" };
        worksheet.mergeCells("A3:B3");
        worksheet.getCell("A3").value = "Proyecto:";
        worksheet.getCell("A3").font = { bold: true };
        worksheet.getCell("A3").alignment = { horizontal: "right" };
        worksheet.mergeCells("C3:D3");
        worksheet.getCell("C3").value = project.name;
        worksheet.getCell("C3").font = { bold: true, color: { argb: "4F46E5" } };
        worksheet.mergeCells("E3:F3");
        worksheet.getCell("E3").value = "Cliente:";
        worksheet.getCell("E3").font = { bold: true };
        worksheet.getCell("E3").alignment = { horizontal: "right" };
        worksheet.mergeCells("G3:H3");
        worksheet.getCell("G3").value = project.client;
        worksheet.mergeCells("I3:J3");
        worksheet.getCell("I3").value = `Total de publicaciones: ${sortedEntries.length}`;
        worksheet.getCell("I3").font = { bold: true };
        worksheet.getCell("I3").alignment = { horizontal: "right" };
        worksheet.mergeCells("A4:B4");
        worksheet.getCell("A4").value = "Fecha de inicio:";
        worksheet.getCell("A4").font = { bold: true };
        worksheet.getCell("A4").alignment = { horizontal: "right" };
        worksheet.mergeCells("C4:D4");
        worksheet.getCell("C4").value = new Date(schedule.startDate || /* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        worksheet.mergeCells("E4:F4");
        worksheet.getCell("E4").value = "Generado el:";
        worksheet.getCell("E4").font = { bold: true };
        worksheet.getCell("E4").alignment = { horizontal: "right" };
        worksheet.mergeCells("G4:J4");
        worksheet.getCell("G4").value = (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        worksheet.mergeCells("A5:J5");
        const headerRowIndex = 6;
        worksheet.columns = [
          { key: "postDate", width: 15 },
          { key: "postTime", width: 12 },
          { key: "platform", width: 20 },
          { key: "format", width: 30 },
          { key: "title", width: 35 },
          { key: "copyIn", width: 60 },
          { key: "copyOut", width: 60 },
          { key: "hashtags", width: 40 },
          { key: "designInstructions", width: 60 },
          { key: "referenceImageUrl", width: 20 }
        ];
        const headerRow = worksheet.getRow(headerRowIndex);
        headerRow.values = [
          "Fecha",
          "Hora",
          "Plataforma",
          "Formato",
          "T\xEDtulo",
          "Copy In (texto en dise\xF1o)",
          "Copy Out (descripci\xF3n)",
          "Hashtags",
          "Instrucciones de Dise\xF1o",
          "URL de Imagen"
        ];
        headerRow.height = 24;
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4F46E5" }
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };
        });
        sortedEntries.forEach((entry, index) => {
          const rowIndex = headerRowIndex + index + 1;
          const row = worksheet.addRow({
            postDate: entry.postDate ? new Date(entry.postDate).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "Sin fecha",
            postTime: entry.postTime || "Sin hora",
            platform: entry.platform,
            format: getFormatByPlatform(entry.platform),
            title: entry.title,
            copyIn: entry.copyIn,
            copyOut: entry.copyOut,
            hashtags: entry.hashtags,
            designInstructions: entry.designInstructions,
            referenceImageUrl: entry.referenceImageUrl ? "Ver en plataforma" : "Sin imagen"
          });
          const fillColor = index % 2 === 0 ? "F9FAFB" : "F3F4F6";
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: fillColor }
            };
            cell.border = {
              top: { style: "thin", color: { argb: "E5E7EB" } },
              left: { style: "thin", color: { argb: "E5E7EB" } },
              bottom: { style: "thin", color: { argb: "E5E7EB" } },
              right: { style: "thin", color: { argb: "E5E7EB" } }
            };
            cell.alignment = {
              vertical: "top",
              wrapText: true,
              shrinkToFit: false
              // Deshabilitar la reducción del tamaño de texto
            };
          });
          const platformCell = row.getCell(3);
          let platformColor = "4F46E5";
          switch (entry.platform) {
            case "Instagram":
              platformColor = "E1306C";
              break;
            case "Facebook":
              platformColor = "1877F2";
              break;
            case "Twitter":
              platformColor = "1DA1F2";
              break;
            case "LinkedIn":
              platformColor = "0A66C2";
              break;
            case "TikTok":
              platformColor = "000000";
              break;
            case "YouTube":
              platformColor = "FF0000";
              break;
            case "Pinterest":
              platformColor = "BD081C";
              break;
            case "WhatsApp":
              platformColor = "25D366";
              break;
          }
          platformCell.font = { color: { argb: "FFFFFF" }, bold: true };
          platformCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: platformColor }
          };
          platformCell.alignment = { horizontal: "center", vertical: "middle" };
          const maxContentLength = Math.max(
            entry.copyIn?.length || 0,
            entry.copyOut?.length || 0,
            entry.designInstructions?.length || 0
          );
          const contentWidth = 60;
          const charsPerLine = contentWidth * 1.5;
          const estimatedLines = Math.max(1, Math.ceil(maxContentLength / charsPerLine));
          const lineHeight = 15;
          const minHeight = 40;
          const padding = 20;
          const calculatedHeight = Math.min(300, estimatedLines * lineHeight + padding);
          row.height = Math.max(minHeight, calculatedHeight);
          if (maxContentLength > 1e3) {
            row.height = Math.max(row.height, 200);
          }
        });
        worksheet.autoFilter = {
          from: { row: headerRowIndex, column: 1 },
          to: { row: headerRowIndex + sortedEntries.length, column: 10 }
        };
        worksheet.views = [
          { state: "frozen", xSplit: 4, ySplit: headerRowIndex }
        ];
        const buffer = await workbook.xlsx.writeBuffer();
        const safeFileName = schedule.name.replace(/[^a-z0-9]/gi, "_");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}.xlsx"`);
        res.send(buffer);
      } else if (format3 === "pdf") {
        const getFormatByPlatform = (platform) => {
          const formats = {
            "Instagram": "Carrusel/Reels \u2022 9:16 o 1:1",
            "Facebook": "Imagen/Video \u2022 16:9 o 1:1",
            "Twitter": "Imagen/GIF \u2022 16:9",
            "LinkedIn": "Imagen/Art\xEDculo \u2022 16:9 o 1:1",
            "TikTok": "Video \u2022 9:16 vertical",
            "YouTube": "Video \u2022 16:9 horizontal",
            "Pinterest": "Pin \u2022 2:3 vertical",
            "WhatsApp": "Imagen/Video \u2022 1:1 o 9:16"
          };
          return formats[platform] || "Formato est\xE1ndar";
        };
        const getPlatformColor = (platform) => {
          const colors = {
            "Instagram": "#E1306C",
            "Facebook": "#1877F2",
            "Twitter": "#1DA1F2",
            "LinkedIn": "#0A66C2",
            "TikTok": "#000000",
            "YouTube": "#FF0000",
            "Pinterest": "#BD081C",
            "WhatsApp": "#25D366"
          };
          return colors[platform] || "#4F46E5";
        };
        try {
          const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
          });
          const primaryColor = [79 / 255, 70 / 255, 229 / 255];
          const primaryLightColor = [224 / 255, 231 / 255, 255 / 255];
          const grayColor = [107 / 255, 114 / 255, 128 / 255];
          const accentColor = [245 / 255, 158 / 255, 11 / 255];
          doc.setFillColor(primaryLightColor[0], primaryLightColor[1], primaryLightColor[2]);
          doc.rect(10, 10, 277, 35, "F");
          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setLineWidth(1.5);
          doc.line(10, 10, 287, 10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFontSize(22);
          doc.text(schedule.name, 20, 25);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFontSize(12);
          doc.text("Cohete Workflow - Cronograma de Contenido", 20, 33);
          const infoCards = [
            { title: "PROYECTO", value: project.name },
            { title: "CLIENTE", value: project.client },
            { title: "TOTAL PUBLICACIONES", value: sortedEntries.length.toString() },
            {
              title: "FECHA DE INICIO",
              value: schedule.startDate ? new Date(schedule.startDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }) : "No definida"
            }
          ];
          const cardWidth = 65;
          const cardGap = 4;
          const cardsStartX = 20;
          let cardX = cardsStartX;
          infoCards.forEach((card) => {
            doc.setFillColor(0.98, 0.98, 0.98);
            doc.rect(cardX, 50, cardWidth, 20, "F");
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(cardX, 50, cardWidth, 1, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            doc.text(card.title, cardX + 5, 55);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0.1, 0.1, 0.1);
            doc.text(card.value, cardX + 5, 62);
            cardX += cardWidth + cardGap;
          });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          doc.text(`Generado el: ${currentDate}`, 260, 55, { align: "right" });
          const tableStartY = 78;
          let currentY = tableStartY;
          doc.setDrawColor(0.9, 0.9, 0.9);
          doc.setLineWidth(0.5);
          doc.rect(10, currentY - 3, 277, 112);
          const headers = [
            { name: "FECHA", width: 20 },
            { name: "HORA", width: 15 },
            { name: "PLATAFORMA", width: 25 },
            { name: "T\xCDTULO", width: 35 },
            { name: "COPY IN", width: 50 },
            { name: "COPY OUT", width: 50 },
            { name: "INSTRUCCIONES", width: 50 },
            { name: "HASHTAGS", width: 30 }
          ];
          let colX = 15;
          headers.forEach((header) => {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(7);
            doc.text(header.name, colX, currentY);
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(0.5);
            doc.line(colX, currentY + 1, colX + header.width - 5, currentY + 1);
            colX += header.width;
          });
          currentY += 8;
          const truncateText = (text2, maxLength = 45) => {
            if (!text2) return "";
            return text2.length > maxLength ? text2.substring(0, maxLength) + "..." : text2;
          };
          sortedEntries.forEach((entry, index) => {
            if (currentY > 178) {
              doc.addPage();
              doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setLineWidth(1);
              doc.line(10, 10, 287, 10);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setFontSize(14);
              doc.text(schedule.name + " (continuaci\xF3n)", 20, 22);
              currentY = 40;
              doc.setDrawColor(0.9, 0.9, 0.9);
              doc.setLineWidth(0.5);
              doc.rect(10, currentY - 3, 277, 150);
              colX = 15;
              headers.forEach((header) => {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFontSize(7);
                doc.text(header.name, colX, currentY);
                doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setLineWidth(0.5);
                doc.line(colX, currentY + 1, colX + header.width - 5, currentY + 1);
                colX += header.width;
              });
              currentY += 8;
            }
            if (index > 0) {
              doc.setDrawColor(0.9, 0.9, 0.9);
              doc.setLineWidth(0.2);
              doc.line(15, currentY - 4, 280, currentY - 4);
            }
            const dateFormatted = entry.postDate ? new Date(entry.postDate).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }) : "Sin fecha";
            const platformColor = getPlatformColor(entry.platform || "");
            const r = parseInt(platformColor.slice(1, 3), 16) / 255;
            const g = parseInt(platformColor.slice(3, 5), 16) / 255;
            const b = parseInt(platformColor.slice(5, 7), 16) / 255;
            colX = 15;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(0.2, 0.2, 0.2);
            doc.text(dateFormatted, colX, currentY);
            colX += headers[0].width;
            doc.text(entry.postTime || "-", colX, currentY);
            colX += headers[1].width;
            if (entry.platform) {
              doc.setFillColor(r, g, b);
              doc.rect(colX, currentY - 3.5, 20, 5, "F");
              doc.setTextColor(1, 1, 1);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.5);
              doc.text(entry.platform, colX + 10, currentY, { align: "center" });
            }
            colX += headers[2].width;
            doc.setTextColor(0.1, 0.1, 0.1);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text(truncateText(entry.title, 30), colX, currentY);
            colX += headers[3].width;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(0.2, 0.2, 0.2);
            const copyInLines = doc.splitTextToSize(truncateText(entry.copyIn, 80), headers[4].width - 5);
            doc.text(copyInLines, colX, currentY);
            colX += headers[4].width;
            const copyOutLines = doc.splitTextToSize(truncateText(entry.copyOut, 80), headers[5].width - 5);
            doc.text(copyOutLines, colX, currentY);
            colX += headers[5].width;
            const instructionsLines = doc.splitTextToSize(truncateText(entry.designInstructions, 80), headers[6].width - 5);
            doc.text(instructionsLines, colX, currentY);
            colX += headers[6].width;
            if (entry.hashtags) {
              const hashtagsArr = entry.hashtags.split(" ");
              const formattedHashtags = hashtagsArr.map((tag) => {
                return tag.startsWith("#") ? tag : "#" + tag;
              }).join(" ");
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setFont("helvetica", "bold");
              const hashtagLines = doc.splitTextToSize(truncateText(formattedHashtags, 50), headers[7].width - 5);
              doc.text(hashtagLines, colX, currentY);
            }
            currentY += 10;
          });
          const footerY = 192;
          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setLineWidth(0.5);
          doc.line(10, footerY - 2, 287, footerY - 2);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFontSize(7);
          doc.text("Generado por Cohete Workflow \xA9 2024-2025", 15, footerY);
          doc.text("P\xE1gina 1 de 1", 280, footerY, { align: "right" });
          const pdfBuffer = doc.output("arraybuffer");
          const safeFileName = schedule.name.replace(/[^a-z0-9]/gi, "_");
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}.pdf"`);
          res.send(Buffer.from(pdfBuffer));
        } catch (error) {
          console.error("Error generando PDF:", error);
          res.status(500).json({ message: "Error al generar el PDF", details: error.message });
        }
      } else {
        return res.status(400).json({ message: "Format not supported. Use 'excel' or 'pdf'." });
      }
    } catch (error) {
      console.error("Error downloading schedule:", error);
      res.status(500).json({ message: "Failed to download schedule" });
    }
  });
  app2.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, projectId } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      if (projectId) {
        const hasAccess = await global.storage.checkUserProjectAccess(
          req.user.id,
          projectId,
          req.user.isPrimary
        );
        if (!hasAccess) {
          return res.status(403).json({ message: "You don't have access to this project" });
        }
        const project = await global.storage.getProjectWithAnalysis(projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        const previousMessages = await global.storage.listChatMessagesByProject(projectId);
        const formattedMessages = previousMessages.map((msg) => {
          return {
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          };
        });
        const response = await processChatMessage(
          message,
          {
            name: project.name,
            client: project.client,
            description: project.description,
            ...project.analysis || {}
          },
          formattedMessages
        );
        await global.storage.createChatMessage({
          projectId,
          userId: req.user.id,
          content: message,
          role: "user"
        });
        const savedResponse = await global.storage.createChatMessage({
          projectId,
          content: response,
          role: "assistant"
        });
        res.json(savedResponse);
      } else {
        const response = await processChatMessage(message, {}, []);
        res.json({
          content: response,
          role: "assistant",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });
  app2.get("/api/projects/:projectId/chat", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const messages = await global.storage.listChatMessagesByProject(projectId);
      res.json(messages);
    } catch (error) {
      console.error("Error listing chat messages:", error);
      res.status(500).json({ message: "Failed to list chat messages" });
    }
  });
  app2.get("/api/projects/:projectId/tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const tasks2 = await global.storage.listTasksByProject(projectId);
      res.json(tasks2);
    } catch (error) {
      console.error("Error listing tasks:", error);
      res.status(500).json({ message: "Failed to list tasks" });
    }
  });
  app2.post("/api/projects/:projectId/tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const taskData = insertTaskSchema.parse({
        projectId,
        ...req.body,
        createdById: req.user.id
      });
      const task = await global.storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  app2.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const updatedTask = await global.storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app2.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      await global.storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/tasks/:taskId/subtasks", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const subtasks = await global.storage.listSubtasks(taskId);
      res.json(subtasks);
    } catch (error) {
      console.error("Error listing subtasks:", error);
      res.status(500).json({ message: "Failed to list subtasks" });
    }
  });
  app2.post("/api/tasks/:taskId/subtasks", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const parentTask = await global.storage.getTask(taskId);
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        parentTask.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const subtaskData = {
        ...req.body,
        projectId: parentTask.projectId,
        parentTaskId: taskId,
        createdById: req.user.id
      };
      const newSubtask = await global.storage.createTask(subtaskData);
      res.status(201).json(newSubtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(500).json({ message: "Failed to create subtask" });
    }
  });
  app2.get("/api/tasks/:taskId/comments", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const comments = await global.storage.listTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error listing task comments:", error);
      res.status(500).json({ message: "Failed to list task comments" });
    }
  });
  app2.post("/api/tasks/:taskId/comments", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const commentData = {
        ...req.body,
        taskId,
        userId: req.user.id
      };
      const newComment = await global.storage.createTaskComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating task comment:", error);
      res.status(500).json({ message: "Failed to create task comment" });
    }
  });
  app2.delete("/api/tasks/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      const comment = await global.storage.getTaskComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      const task = await global.storage.getTask(comment.taskId);
      if (!task) {
        return res.status(404).json({ message: "Associated task not found" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      const isAuthor = comment.userId === req.user.id;
      if (!hasAccess && !isAuthor) {
        return res.status(403).json({ message: "You don't have permission to delete this comment" });
      }
      await global.storage.deleteTaskComment(commentId);
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting task comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  app2.post("/api/projects/:projectId/generate-tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      const project = await global.storage.getProjectWithAnalysis(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const users3 = await global.storage.listUsers();
      const sampleTasks = [
        {
          title: "Crear contenido para Instagram",
          description: "Desarrollar contenido visual y textual para la pr\xF3xima campa\xF1a en Instagram",
          priority: "high",
          status: "pending",
          tags: ["contenido", "instagram", "marketing"],
          taskGroup: "content",
          aiGenerated: true
        },
        {
          title: "Dise\xF1ar publicaciones para Facebook",
          description: "Crear dise\xF1os para las pr\xF3ximas publicaciones en Facebook siguiendo la gu\xEDa de estilo",
          priority: "medium",
          status: "pending",
          tags: ["dise\xF1o", "facebook", "marketing"],
          taskGroup: "design",
          aiGenerated: true
        },
        {
          title: "Revisar m\xE9tricas de campa\xF1a anterior",
          description: "Analizar el rendimiento de la campa\xF1a anterior y preparar informe",
          priority: "low",
          status: "pending",
          tags: ["an\xE1lisis", "m\xE9tricas", "informe"],
          taskGroup: "analysis",
          aiGenerated: true
        }
      ];
      const createdTasks = await Promise.all(
        sampleTasks.map(async (taskData) => {
          return await global.storage.createTask({
            ...taskData,
            projectId,
            createdById: req.user.id
          });
        })
      );
      res.status(201).json(createdTasks);
    } catch (error) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ message: "Failed to generate tasks" });
    }
  });
  app2.get("/api/users/me/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks2 = await global.storage.listTasksByAssignee(req.user.id);
      res.json(tasks2);
    } catch (error) {
      console.error("Error listing user tasks:", error);
      res.status(500).json({ message: "Failed to list user tasks" });
    }
  });
  app2.post("/api/projects/:projectId/products", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const project = await global.storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "El nombre del producto es requerido" });
      }
      const productData = {
        projectId,
        createdBy: req.user?.id,
        name,
        description: description || null,
        sku: null,
        price: null,
        imageUrl: req.file ? req.file.filename : null
      };
      const validatedData = insertProductSchema.parse(productData);
      const newProduct = await global.storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error al crear el producto" });
    }
  });
  app2.get("/api/projects/:projectId/products", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const products2 = await global.storage.listProductsByProject(projectId);
      res.json(products2);
    } catch (error) {
      console.error("Error listing products:", error);
      res.status(500).json({ message: "Error al listar productos" });
    }
  });
  app2.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inv\xE1lido" });
      }
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        product.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este producto" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error al obtener el producto" });
    }
  });
  app2.patch("/api/products/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inv\xE1lido" });
      }
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        product.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este producto" });
      }
      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description !== void 0) updateData.description = req.body.description || null;
      if (req.body.sku !== void 0) updateData.sku = req.body.sku || null;
      if (req.body.price !== void 0) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
      if (req.file) {
        updateData.imageUrl = req.file.filename;
        if (product.imageUrl) {
          const oldImagePath = path.join(__dirname, "..", "uploads", product.imageUrl);
          try {
            if (fs2.existsSync(oldImagePath)) {
              fs2.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error removing old product image:", err);
          }
        }
      }
      const updatedProduct = await global.storage.updateProduct(productId, updateData);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error al actualizar el producto" });
    }
  });
  app2.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inv\xE1lido" });
      }
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        product.projectId,
        req.user.isPrimary
      );
      if (!hasAccess || !req.user.isPrimary) {
        return res.status(403).json({ message: "No tienes permisos para eliminar este producto" });
      }
      if (product.imageUrl) {
        const imagePath = path.join(__dirname, "..", "uploads", product.imageUrl);
        try {
          if (fs2.existsSync(imagePath)) {
            fs2.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error("Error removing product image:", err);
        }
      }
      await global.storage.deleteProduct(productId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error al eliminar el producto" });
    }
  });
  app2.patch("/api/schedule-entries/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const { comments } = req.body;
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "ID de entrada inv\xE1lido" });
      }
      const entry = await global.storage.getScheduleEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entrada no encontrada" });
      }
      await global.storage.updateScheduleEntry(entryId, { comments });
      res.status(200).json({
        message: "Comentarios actualizados correctamente",
        entryId
      });
    } catch (error) {
      console.error("Error al actualizar comentarios:", error);
      res.status(500).json({ message: "Error al actualizar comentarios", error: String(error) });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer2({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "subscribe") {
          console.log(`Client subscribed to ${data.entity} updates`);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  const broadcastUpdate = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  app2.get("/api/projects/:projectId/views", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const views = await global.storage.listProjectViews(projectId);
      res.json(views);
    } catch (error) {
      console.error("Error al obtener vistas de proyecto:", error);
      res.status(500).json({ message: "Error al obtener vistas de proyecto" });
    }
  });
  app2.post("/api/projects/:projectId/views", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const viewData = insertProjectViewSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user.id
      });
      const newView = await global.storage.createProjectView(viewData);
      if (viewData.isDefault) {
        await global.storage.updateOtherViewsDefaultStatus(projectId, newView.id);
      }
      res.status(201).json(newView);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error al crear vista de proyecto:", error);
      res.status(500).json({ message: "Error al crear vista de proyecto" });
    }
  });
  app2.patch("/api/project-views/:id", isAuthenticated, async (req, res) => {
    try {
      const viewId = parseInt(req.params.id);
      if (isNaN(viewId)) {
        return res.status(400).json({ message: "ID de vista inv\xE1lido" });
      }
      const view = await global.storage.getProjectView(viewId);
      if (!view) {
        return res.status(404).json({ message: "Vista no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        view.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const updatedView = await global.storage.updateProjectView(viewId, req.body);
      if (req.body.isDefault === true) {
        await global.storage.updateOtherViewsDefaultStatus(view.projectId, viewId);
      }
      res.json(updatedView);
    } catch (error) {
      console.error("Error al actualizar vista de proyecto:", error);
      res.status(500).json({ message: "Error al actualizar vista de proyecto" });
    }
  });
  app2.delete("/api/project-views/:id", isAuthenticated, async (req, res) => {
    try {
      const viewId = parseInt(req.params.id);
      if (isNaN(viewId)) {
        return res.status(400).json({ message: "ID de vista inv\xE1lido" });
      }
      const view = await global.storage.getProjectView(viewId);
      if (!view) {
        return res.status(404).json({ message: "Vista no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        view.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      if (view.isDefault) {
        const projectViews2 = await global.storage.listProjectViews(view.projectId);
        if (projectViews2.length <= 1) {
          return res.status(400).json({ message: "No puedes eliminar la \xFAnica vista del proyecto" });
        }
      }
      await global.storage.deleteProjectView(viewId);
      if (view.isDefault) {
        const remainingViews = await global.storage.listProjectViews(view.projectId);
        if (remainingViews.length > 0) {
          await global.storage.updateProjectView(remainingViews[0].id, { isDefault: true });
        }
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar vista de proyecto:", error);
      res.status(500).json({ message: "Error al eliminar vista de proyecto" });
    }
  });
  app2.get("/api/projects/:projectId/automation-rules", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const rules = await global.storage.listAutomationRules(projectId);
      res.json(rules);
    } catch (error) {
      console.error("Error al obtener reglas de automatizaci\xF3n:", error);
      res.status(500).json({ message: "Error al obtener reglas de automatizaci\xF3n" });
    }
  });
  app2.post("/api/projects/:projectId/automation-rules", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const ruleData = insertAutomationRuleSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user.id
      });
      const newRule = await global.storage.createAutomationRule(ruleData);
      res.status(201).json(newRule);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error al crear regla de automatizaci\xF3n:", error);
      res.status(500).json({ message: "Error al crear regla de automatizaci\xF3n" });
    }
  });
  app2.patch("/api/automation-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      if (isNaN(ruleId)) {
        return res.status(400).json({ message: "ID de regla inv\xE1lido" });
      }
      const rule = await global.storage.getAutomationRule(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Regla no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        rule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const updatedRule = await global.storage.updateAutomationRule(ruleId, req.body);
      res.json(updatedRule);
    } catch (error) {
      console.error("Error al actualizar regla de automatizaci\xF3n:", error);
      res.status(500).json({ message: "Error al actualizar regla de automatizaci\xF3n" });
    }
  });
  app2.delete("/api/automation-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      if (isNaN(ruleId)) {
        return res.status(400).json({ message: "ID de regla inv\xE1lido" });
      }
      const rule = await global.storage.getAutomationRule(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Regla no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        rule.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      await global.storage.deleteAutomationRule(ruleId);
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar regla de automatizaci\xF3n:", error);
      res.status(500).json({ message: "Error al eliminar regla de automatizaci\xF3n" });
    }
  });
  app2.get("/api/tasks/:taskId/time-entries", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarea inv\xE1lido" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const timeEntries2 = await global.storage.listTimeEntriesByTask(taskId);
      res.json(timeEntries2);
    } catch (error) {
      console.error("Error al obtener registros de tiempo:", error);
      res.status(500).json({ message: "Error al obtener registros de tiempo" });
    }
  });
  app2.post("/api/tasks/:taskId/time-entries", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarea inv\xE1lido" });
      }
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const timeEntryData = insertTimeEntrySchema.parse({
        ...req.body,
        taskId,
        userId: req.user.id
      });
      const newTimeEntry = await global.storage.createTimeEntry(timeEntryData);
      res.status(201).json(newTimeEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error al crear registro de tiempo:", error);
      res.status(500).json({ message: "Error al crear registro de tiempo" });
    }
  });
  app2.patch("/api/time-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "ID de registro inv\xE1lido" });
      }
      const timeEntry = await global.storage.getTimeEntry(entryId);
      if (!timeEntry) {
        return res.status(404).json({ message: "Registro de tiempo no encontrado" });
      }
      if (timeEntry.userId !== req.user.id && !req.user.isPrimary) {
        return res.status(403).json({ message: "No puedes editar registros de tiempo de otros usuarios" });
      }
      const updatedEntry = await global.storage.updateTimeEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error al actualizar registro de tiempo:", error);
      res.status(500).json({ message: "Error al actualizar registro de tiempo" });
    }
  });
  app2.delete("/api/time-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "ID de registro inv\xE1lido" });
      }
      const timeEntry = await global.storage.getTimeEntry(entryId);
      if (!timeEntry) {
        return res.status(404).json({ message: "Registro de tiempo no encontrado" });
      }
      if (timeEntry.userId !== req.user.id && !req.user.isPrimary) {
        return res.status(403).json({ message: "No puedes eliminar registros de tiempo de otros usuarios" });
      }
      await global.storage.deleteTimeEntry(entryId);
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar registro de tiempo:", error);
      res.status(500).json({ message: "Error al eliminar registro de tiempo" });
    }
  });
  app2.get("/api/projects/:projectId/tags", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const tags2 = await global.storage.listTags(projectId);
      res.json(tags2);
    } catch (error) {
      console.error("Error al obtener etiquetas:", error);
      res.status(500).json({ message: "Error al obtener etiquetas" });
    }
  });
  app2.post("/api/projects/:projectId/tags", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const tagData = insertTagSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user.id
      });
      const newTag = await global.storage.createTag(tagData);
      res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error al crear etiqueta:", error);
      res.status(500).json({ message: "Error al crear etiqueta" });
    }
  });
  app2.patch("/api/tags/:id", isAuthenticated, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      if (isNaN(tagId)) {
        return res.status(400).json({ message: "ID de etiqueta inv\xE1lido" });
      }
      const tag = await global.storage.getTag(tagId);
      if (!tag) {
        return res.status(404).json({ message: "Etiqueta no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        tag.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const updatedTag = await global.storage.updateTag(tagId, req.body);
      res.json(updatedTag);
    } catch (error) {
      console.error("Error al actualizar etiqueta:", error);
      res.status(500).json({ message: "Error al actualizar etiqueta" });
    }
  });
  app2.delete("/api/tags/:id", isAuthenticated, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      if (isNaN(tagId)) {
        return res.status(400).json({ message: "ID de etiqueta inv\xE1lido" });
      }
      const tag = await global.storage.getTag(tagId);
      if (!tag) {
        return res.status(404).json({ message: "Etiqueta no encontrada" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        tag.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      await global.storage.deleteTag(tagId);
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar etiqueta:", error);
      res.status(500).json({ message: "Error al eliminar etiqueta" });
    }
  });
  app2.get("/api/projects/:projectId/collaborative-docs", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const docs = await global.storage.listCollaborativeDocs(projectId);
      res.json(docs);
    } catch (error) {
      console.error("Error al obtener documentos colaborativos:", error);
      res.status(500).json({ message: "Error al obtener documentos colaborativos" });
    }
  });
  app2.post("/api/projects/:projectId/collaborative-docs", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inv\xE1lido" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const docData = insertCollaborativeDocSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user.id,
        lastEditedBy: req.user.id
      });
      const newDoc = await global.storage.createCollaborativeDoc(docData);
      res.status(201).json(newDoc);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error al crear documento colaborativo:", error);
      res.status(500).json({ message: "Error al crear documento colaborativo" });
    }
  });
  app2.get("/api/collaborative-docs/:id", isAuthenticated, async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "ID de documento inv\xE1lido" });
      }
      const doc = await global.storage.getCollaborativeDoc(docId);
      if (!doc) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        doc.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      res.json(doc);
    } catch (error) {
      console.error("Error al obtener documento colaborativo:", error);
      res.status(500).json({ message: "Error al obtener documento colaborativo" });
    }
  });
  app2.patch("/api/collaborative-docs/:id", isAuthenticated, async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "ID de documento inv\xE1lido" });
      }
      const doc = await global.storage.getCollaborativeDoc(docId);
      if (!doc) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        doc.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      const updatedDoc = await global.storage.updateCollaborativeDoc(docId, {
        ...req.body,
        lastEditedBy: req.user.id
      });
      broadcastUpdate({
        type: "doc_updated",
        docId,
        projectId: doc.projectId,
        editor: {
          id: req.user.id,
          fullName: req.user.fullName
        }
      });
      res.json(updatedDoc);
    } catch (error) {
      console.error("Error al actualizar documento colaborativo:", error);
      res.status(500).json({ message: "Error al actualizar documento colaborativo" });
    }
  });
  app2.delete("/api/collaborative-docs/:id", isAuthenticated, async (req, res) => {
    try {
      const docId = parseInt(req.params.id);
      if (isNaN(docId)) {
        return res.status(400).json({ message: "ID de documento inv\xE1lido" });
      }
      const doc = await global.storage.getCollaborativeDoc(docId);
      if (!doc) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        doc.projectId,
        req.user.isPrimary
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      await global.storage.deleteCollaborativeDoc(docId);
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar documento colaborativo:", error);
      res.status(500).json({ message: "Error al eliminar documento colaborativo" });
    }
  });
  app2.get("/api/projects/:projectId/tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tasks2 = await db.select().from(tasks).where(eq3(tasks.projectId, projectId)).orderBy(asc2(tasks.id));
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ error: "Failed to fetch project tasks" });
    }
  });
  app2.post("/api/projects/:projectId/tasks", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const taskData = {
        ...req.body,
        projectId,
        createdById: req.user.id,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [task] = await db.insert(tasks).values(taskData).returning();
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });
  app2.patch("/api/tasks/:taskId", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const updateData = {
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [updatedTask] = await db.update(tasks).set(updateData).where(eq3(tasks.id, taskId)).returning();
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });
  app2.get("/api/projects/:projectId/task-groups", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const taskGroups2 = await db.select().from(taskGroups).where(eq3(taskGroups.projectId, projectId)).orderBy(taskGroups.position);
      res.json(taskGroups2);
    } catch (error) {
      console.error("Error fetching task groups:", error);
      res.status(500).json({ error: "Failed to fetch task groups" });
    }
  });
  app2.post("/api/projects/:projectId/task-groups", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const taskGroupData = insertTaskGroupSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user?.id
      });
      const [taskGroup] = await db.insert(taskGroups).values(taskGroupData).returning();
      res.status(201).json(taskGroup);
    } catch (error) {
      console.error("Error creating task group:", error);
      res.status(500).json({ error: "Failed to create task group" });
    }
  });
  app2.patch("/api/task-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const updates = req.body;
      const [updatedGroup] = await db.update(taskGroups).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(taskGroups.id, groupId)).returning();
      if (!updatedGroup) {
        return res.status(404).json({ error: "Task group not found" });
      }
      res.json(updatedGroup);
    } catch (error) {
      console.error("Error updating task group:", error);
      res.status(500).json({ error: "Failed to update task group" });
    }
  });
  app2.delete("/api/task-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      await db.delete(taskGroups).where(eq3(taskGroups.id, groupId));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task group:", error);
      res.status(500).json({ error: "Failed to delete task group" });
    }
  });
  app2.get("/api/projects/:projectId/columns", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const columns = await db.select().from(projectColumnSettings).where(eq3(projectColumnSettings.projectId, projectId)).orderBy(projectColumnSettings.position);
      res.json(columns);
    } catch (error) {
      console.error("Error fetching project columns:", error);
      res.status(500).json({ error: "Failed to fetch project columns" });
    }
  });
  app2.post("/api/projects/:projectId/columns", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const columnData = insertProjectColumnSettingSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.user?.id
      });
      const [column] = await db.insert(projectColumnSettings).values(columnData).returning();
      res.status(201).json(column);
    } catch (error) {
      console.error("Error creating project column:", error);
      res.status(500).json({ error: "Failed to create project column" });
    }
  });
  app2.patch("/api/project-columns/:id", isAuthenticated, async (req, res) => {
    try {
      const columnId = parseInt(req.params.id);
      const updates = req.body;
      const [updatedColumn] = await db.update(projectColumnSettings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(projectColumnSettings.id, columnId)).returning();
      if (!updatedColumn) {
        return res.status(404).json({ error: "Project column not found" });
      }
      res.json(updatedColumn);
    } catch (error) {
      console.error("Error updating project column:", error);
      res.status(500).json({ error: "Failed to update project column" });
    }
  });
  app2.delete("/api/project-columns/:id", isAuthenticated, async (req, res) => {
    try {
      const columnId = parseInt(req.params.id);
      await db.delete(projectColumnSettings).where(eq3(projectColumnSettings.id, columnId));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project column:", error);
      res.status(500).json({ error: "Failed to delete project column" });
    }
  });
  app2.get("/api/tasks/:taskId/column-values", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const columnValues = await db.select().from(taskColumnValues).where(eq3(taskColumnValues.taskId, taskId));
      res.json(columnValues);
    } catch (error) {
      console.error("Error fetching task column values:", error);
      res.status(500).json({ error: "Failed to fetch task column values" });
    }
  });
  app2.post("/api/tasks/:taskId/column-values", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const valueData = insertTaskColumnValueSchema.parse({
        ...req.body,
        taskId
      });
      const [columnValue] = await db.insert(taskColumnValues).values(valueData).returning();
      res.status(201).json(columnValue);
    } catch (error) {
      console.error("Error creating task column value:", error);
      res.status(500).json({ error: "Failed to create task column value" });
    }
  });
  app2.patch("/api/task-column-values/:id", isAuthenticated, async (req, res) => {
    try {
      const valueId = parseInt(req.params.id);
      const updates = req.body;
      const [updatedValue] = await db.update(taskColumnValues).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(taskColumnValues.id, valueId)).returning();
      if (!updatedValue) {
        return res.status(404).json({ error: "Task column value not found" });
      }
      res.json(updatedValue);
    } catch (error) {
      console.error("Error updating task column value:", error);
      res.status(500).json({ error: "Failed to update task column value" });
    }
  });
  app2.get("/api/tasks/:taskId/assignees", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const assignees = await db.select({
        id: taskAssignees.id,
        taskId: taskAssignees.taskId,
        userId: taskAssignees.userId,
        assignedBy: taskAssignees.assignedBy,
        assignedAt: taskAssignees.assignedAt,
        user: {
          id: users2.id,
          fullName: users2.fullName,
          username: users2.username,
          profileImage: users2.profileImage,
          role: users2.role
        }
      }).from(taskAssignees).innerJoin(users2, eq3(taskAssignees.userId, users2.id)).where(eq3(taskAssignees.taskId, taskId));
      res.json(assignees);
    } catch (error) {
      console.error("Error fetching task assignees:", error);
      res.status(500).json({ error: "Failed to fetch task assignees" });
    }
  });
  app2.post("/api/tasks/:taskId/assignees", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { userId } = req.body;
      const assigneeData = {
        taskId,
        userId,
        assignedBy: req.user?.id
      };
      const [assignee] = await db.insert(taskAssignees).values(assigneeData).returning();
      res.status(201).json(assignee);
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({ error: "Failed to assign task" });
    }
  });
  app2.delete("/api/task-assignees/:id", isAuthenticated, async (req, res) => {
    try {
      const assigneeId = parseInt(req.params.id);
      await db.delete(taskAssignees).where(eq3(taskAssignees.id, assigneeId));
      res.status(204).send();
    } catch (error) {
      console.error("Error removing task assignee:", error);
      res.status(500).json({ error: "Failed to remove task assignee" });
    }
  });
  app2.get("/api/tasks-with-groups", isAuthenticated, async (req, res) => {
    try {
      const tasks2 = await db.select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        progress: tasks.progress,
        dueDate: tasks.dueDate,
        tags: tasks.tags,
        groupId: tasks.groupId,
        createdById: tasks.createdById,
        assignedToId: tasks.assignedToId,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt
      }).from(tasks).orderBy(asc2(tasks.id));
      const taskGroups2 = await db.select().from(taskGroups);
      const projects2 = await db.select().from(projects);
      const users3 = await db.select().from(users2);
      const tasksWithDetails = tasks2.map((task) => {
        const group = taskGroups2.find((g) => g.id === task.groupId);
        const project = projects2.find((p) => p.id === task.projectId);
        const assignee = users3.find((u) => u.id === task.assignedToId || u.id === task.createdById);
        return {
          task: {
            id: task.id,
            projectId: task.projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            dueDate: task.dueDate,
            tags: task.tags,
            groupId: task.groupId,
            createdById: task.createdById,
            assignedToId: task.assignedToId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          },
          group: group ? {
            id: group.id,
            projectId: group.projectId,
            name: group.name,
            description: group.description,
            color: group.color,
            position: group.position
          } : null,
          project: project ? {
            id: project.id,
            name: project.name,
            client: project.client
          } : null,
          assignee: assignee ? {
            id: assignee.id,
            fullName: assignee.fullName,
            username: assignee.username,
            profileImage: assignee.profileImage
          } : null
        };
      });
      const groupedTasks = tasksWithDetails.reduce((acc, item) => {
        const groupId = item.group?.id || "ungrouped";
        if (!acc[groupId]) {
          acc[groupId] = {
            group: item.group,
            tasks: []
          };
        }
        const task = {
          ...item.task,
          assignee: item.assignee,
          additionalAssignees: []
        };
        acc[groupId].tasks.push(task);
        return acc;
      }, {});
      res.json(Object.values(groupedTasks));
    } catch (error) {
      console.error("Error fetching tasks with groups:", error);
      res.status(500).json({ error: "Failed to fetch tasks with groups" });
    }
  });
  app2.get("/api/tasks/:taskId/comments", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const comments = await global.storage.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error obteniendo comentarios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/tasks/:taskId/comments", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { content, mentionedUsers = [] } = req.body;
      const comment = await global.storage.createTaskComment({
        taskId,
        userId: req.user.id,
        content,
        mentionedUsers
      });
      if (mentionedUsers && mentionedUsers.length > 0) {
        for (const userId of mentionedUsers) {
          await global.storage.createNotification({
            userId,
            type: "mentioned_in_comment",
            title: "Te mencionaron en un comentario",
            message: `${req.user.fullName} te mencion\xF3 en un comentario`,
            relatedTaskId: taskId,
            relatedCommentId: comment.id
          });
        }
      }
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creando comentario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const notifications2 = await global.storage.getUserNotifications(req.user.id);
      res.json(notifications2);
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      await global.storage.markNotificationAsRead(notificationId, req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marcando notificaci\xF3n:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/projects/:projectId/members", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const members = await global.storage.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      console.error("Error obteniendo miembros:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/projects/:projectId/members", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { userId, role = "member" } = req.body;
      const member = await global.storage.addProjectMember({
        projectId,
        userId,
        role
      });
      res.status(201).json(member);
    } catch (error) {
      console.error("Error agregando miembro:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/tasks/:taskId/dependencies", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const dependencies = await global.storage.getTaskDependencies(taskId);
      res.json(dependencies);
    } catch (error) {
      console.error("Error obteniendo dependencias:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/tasks/:taskId/dependencies", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const { dependsOnTaskId } = req.body;
      const dependency = await global.storage.createTaskDependency({
        taskId,
        dependsOnTaskId
      });
      res.status(201).json(dependency);
    } catch (error) {
      console.error("Error creando dependencia:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/teams", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const userTeams = await db.select({
        team: teams,
        membership: teamMembers
      }).from(teamMembers).innerJoin(teams, eq3(teamMembers.teamId, teams.id)).where(eq3(teamMembers.userId, req.user.id));
      res.json(userTeams);
    } catch (error) {
      console.error("Error obteniendo equipos:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/teams/:teamId/members", isAuthenticated, async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const [membership] = await db.select().from(teamMembers).where(and2(
        eq3(teamMembers.teamId, teamId),
        eq3(teamMembers.userId, req.user.id)
      ));
      if (!membership) {
        return res.status(403).json({ message: "No tienes acceso a este equipo" });
      }
      const members = await db.select({
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          role: users.role
        },
        membership: {
          role: teamMembers.role,
          joinedAt: teamMembers.joinedAt
        }
      }).from(teamMembers).innerJoin(users, eq3(teamMembers.userId, users.id)).where(eq3(teamMembers.teamId, teamId));
      res.json(members);
    } catch (error) {
      console.error("Error obteniendo miembros del equipo:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/teams", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Solo los administradores pueden crear equipos" });
      }
      const { name, domain, description } = req.body;
      const [newTeam] = await db.insert(teams).values({
        name,
        domain,
        description,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      await db.insert(teamMembers).values({
        teamId: newTeam.id,
        userId: req.user.id,
        role: "owner",
        joinedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(newTeam);
    } catch (error) {
      console.error("Error creando equipo:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.patch("/api/tasks/:taskId", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const updates = req.body;
      const updatedTask = await db.update(tasks).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq3(tasks.id, taskId)).returning();
      if (updatedTask.length === 0) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      if (req.user && req.user.id) {
        await db.insert(activityLog).values({
          description: `Tarea actualizada: ${updatedTask[0].title}`,
          taskId,
          projectId: updatedTask[0].projectId,
          userId: req.user.id
        });
      }
      res.json(updatedTask[0]);
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/tasks/:taskId/attachments", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const attachments = await db.select().from(taskAttachments).where(eq3(taskAttachments.taskId, taskId)).orderBy(desc2(taskAttachments.uploadedAt));
      res.json(attachments);
    } catch (error) {
      console.error("Error obteniendo archivos adjuntos:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/tasks/:taskId/attachments", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcion\xF3 archivo" });
      }
      const attachment = await db.insert(taskAttachments).values({
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        taskId
      }).returning();
      if (req.user && req.user.id) {
        const task = await db.select().from(tasks).where(eq3(tasks.id, taskId)).limit(1);
        if (task.length > 0) {
          await db.insert(activityLog).values({
            description: `Archivo adjunto a\xF1adido: ${req.file.originalname}`,
            taskId,
            projectId: task[0].projectId,
            userId: req.user.id
          });
        }
      }
      res.status(201).json(attachment[0]);
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/tasks/:taskId", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (!req.user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const taskWithDetails = await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        assignedToId: tasks.assignedToId,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignedTo: {
          id: users2.id,
          fullName: users2.fullName,
          username: users2.username
        }
      }).from(tasks).leftJoin(users2, eq3(tasks.assignedToId, users2.id)).where(eq3(tasks.id, taskId)).limit(1);
      if (taskWithDetails.length === 0) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      res.json(taskWithDetails[0]);
    } catch (error) {
      console.error("Error obteniendo tarea:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path3, { dirname as dirname3 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname as dirname2 } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname2, "client", "src"),
      "@shared": path2.resolve(__dirname2, "shared"),
      "@assets": path2.resolve(__dirname2, "attached_assets")
    }
  },
  root: path2.resolve(__dirname2, "client"),
  build: {
    outDir: path2.resolve(__dirname2, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath3(import.meta.url);
var __dirname3 = dirname3(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
import cors from "cors";
import path4 from "path";
var app = express3();
var port = parseInt(process.env.PORT || "5000");
var allowedOrigins = [];
if (process.env.NODE_ENV === "production") {
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    allowedOrigins.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
  allowedOrigins.push(`https://${process.env.REPL_SLUG || "localhost"}.replit.dev`);
  allowedOrigins.push(`https://${process.env.REPL_ID || "localhost"}.replit.app`);
} else {
  allowedOrigins.push("http://localhost:5173", "http://localhost:5000", "http://0.0.0.0:5000");
}
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"]
}));
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const server = await registerRoutes(app);
    app.use((err, req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Server Error:", {
        error: err,
        path: req.path,
        method: req.method,
        headers: req.headers,
        body: req.body,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(status).json({
        message,
        path: req.path,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    app.set("trust proxy", 1);
    app.get("/health", (req, res) => {
      res.status(200).json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    });
    if (process.env.NODE_ENV === "production") {
      const staticPath = path4.join(__dirname, "../client/dist");
      app.use(express3.static(staticPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
          return next();
        }
        res.sendFile(path4.join(staticPath, "index.html"));
      });
    } else {
      await setupVite(app, server);
    }
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
