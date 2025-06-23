import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["admin", "project_manager", "content_creator", "designer", "developer", "stakeholder"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "planning", "completed", "on_hold"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "cancelled", "blocked", "deferred"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent", "critical"]);
export const taskGroupEnum = pgEnum("task_group", ["todo", "in_progress", "completed", "blocked", "upcoming"]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "error", "success", "comment", "mention", "assignment"]);
export const viewTypeEnum = pgEnum("view_type", ["list", "kanban", "calendar", "gantt", "table"]);
export const columnTypeEnum = pgEnum("column_type", ["text", "number", "date", "status", "priority", "people", "checkbox", "dropdown"]);
export const automationTriggerEnum = pgEnum("automation_trigger", ["status_change", "assignment", "due_date", "creation", "completion"]);
export const automationActionEnum = pgEnum("automation_action", ["notify", "assign", "move", "update_status", "create_task"]);
export const aiModelEnum = pgEnum("ai_model", ["gpt-4", "gpt-3.5-turbo", "grok-beta"]);

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull()
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
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
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").default("active"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Tasks table - aligned with actual database structure based on SQL query results
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  createdById: varchar("created_by_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  group: taskGroupEnum("group").default("todo"),
  position: integer("position").default(0),
  aiGenerated: boolean("ai_generated").default(false),
  aiSuggestion: text("ai_suggestion"),
  tags: text("tags").array(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: integer("estimated_hours"),
  dependencies: text("dependencies").array(),
  parentTaskId: integer("parent_task_id").references(() => tasks.id, { onDelete: "set null" }),
  progress: integer("progress").default(0),
  attachments: jsonb("attachments"),
  groupId: integer("group_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Analysis Results table
export const analysisResults = pgTable("analysis_results", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
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

// Export enum types
export const AIModel = z.enum(["gpt-4", "gpt-3.5-turbo", "grok-beta"]);
export type AIModelType = z.infer<typeof AIModel>;