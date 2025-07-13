// ===== DATABASE STORAGE IMPLEMENTATION =====
// This file provides the database storage layer using Drizzle ORM
// It interfaces with PostgreSQL through the configured database connection

import { db } from "./db";
import { eq, asc, desc, and, or, sql, like, inArray } from "drizzle-orm";
import * as schema from "./schema";
import type { 
  User, 
  Project, 
  Task, 
  AnalysisResult, 
  Document, 
  Schedule, 
  ScheduleEntry, 
  ChatMessage, 
  Product,
  ProjectView,
  AutomationRule,
  TimeEntry,
  Tag,
  CollaborativeDoc,
  Notification,
  TaskComment
} from "./schema";

// Type definitions for insert operations
type InsertUser = typeof schema.users.$inferInsert;
type InsertProject = typeof schema.projects.$inferInsert;
type InsertTask = typeof schema.tasks.$inferInsert;
type InsertAnalysisResult = typeof schema.analysisResults.$inferInsert;
type InsertDocument = typeof schema.documents.$inferInsert;
type InsertSchedule = typeof schema.schedules.$inferInsert;
type InsertScheduleEntry = typeof schema.scheduleEntries.$inferInsert;
type InsertChatMessage = typeof schema.chatMessages.$inferInsert;
type InsertProduct = typeof schema.products.$inferInsert;
type InsertProjectView = typeof schema.projectViews.$inferInsert;
type InsertAutomationRule = typeof schema.automationRules.$inferInsert;
type InsertTimeEntry = typeof schema.timeEntries.$inferInsert;
type InsertTag = typeof schema.tags.$inferInsert;
type InsertCollaborativeDoc = typeof schema.collaborativeDocs.$inferInsert;
type InsertNotification = typeof schema.notifications.$inferInsert;
type InsertTaskComment = typeof schema.taskComments.$inferInsert;

// Storage interface definition
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null>;
  upsertUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Project management
  getProject(id: number): Promise<Project | null>;
  getProjectWithAnalysis(id: number): Promise<(Project & { analysis: AnalysisResult | null }) | null>;
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: number): Promise<void>;
  checkUserProjectAccess(userId: string, projectId: number): Promise<boolean>;

  // Task management
  getTask(id: number): Promise<Task | null>;
  getTasks(projectId: number): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | null>;
  deleteTask(id: number): Promise<void>;
  getTasksWithComments(projectId: number): Promise<(Task & { comments: TaskComment[] })[]>;

  // Analysis results
  getAnalysisResult(projectId: number): Promise<AnalysisResult | null>;
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  updateAnalysisResult(projectId: number, updates: Partial<InsertAnalysisResult>): Promise<AnalysisResult | null>;

  // Document management
  getDocument(id: number): Promise<Document | null>;
  getDocuments(projectId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | null>;
  deleteDocument(id: number): Promise<void>;

  // Schedule management
  getSchedule(id: number): Promise<Schedule | null>;
  getSchedules(projectId: number): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | null>;
  deleteSchedule(id: number): Promise<void>;

  // Schedule entries
  getScheduleEntry(id: number): Promise<ScheduleEntry | null>;
  getScheduleEntries(scheduleId: number): Promise<ScheduleEntry[]>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  updateScheduleEntry(id: number, updates: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | null>;
  deleteScheduleEntry(id: number): Promise<void>;

  // Chat messages
  getChatMessages(projectId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Product management
  getProduct(id: number): Promise<Product | null>;
  getProducts(projectId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: number): Promise<void>;

  // Project views
  getProjectView(id: number): Promise<ProjectView | null>;
  getProjectViews(projectId: number): Promise<ProjectView[]>;
  createProjectView(view: InsertProjectView): Promise<ProjectView>;
  updateProjectView(id: number, updates: Partial<InsertProjectView>): Promise<ProjectView | null>;
  deleteProjectView(id: number): Promise<void>;

  // Automation rules
  getAutomationRule(id: number): Promise<AutomationRule | null>;
  getAutomationRules(projectId: number): Promise<AutomationRule[]>;
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  updateAutomationRule(id: number, updates: Partial<InsertAutomationRule>): Promise<AutomationRule | null>;
  deleteAutomationRule(id: number): Promise<void>;

  // Time tracking
  getTimeEntry(id: number): Promise<TimeEntry | null>;
  getTimeEntries(taskId: number): Promise<TimeEntry[]>;
  getTimeEntriesByUser(userId: string): Promise<TimeEntry[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, updates: Partial<InsertTimeEntry>): Promise<TimeEntry | null>;
  deleteTimeEntry(id: number): Promise<void>;

  // Tags
  getTag(id: number): Promise<Tag | null>;
  getTags(projectId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, updates: Partial<InsertTag>): Promise<Tag | null>;
  deleteTag(id: number): Promise<void>;

  // Collaborative documents
  getCollaborativeDoc(id: number): Promise<CollaborativeDoc | null>;
  getCollaborativeDocs(projectId: number): Promise<CollaborativeDoc[]>;
  createCollaborativeDoc(doc: InsertCollaborativeDoc): Promise<CollaborativeDoc>;
  updateCollaborativeDoc(id: number, updates: Partial<InsertCollaborativeDoc>): Promise<CollaborativeDoc | null>;
  deleteCollaborativeDoc(id: number): Promise<void>;

  // Notifications
  getNotification(id: number): Promise<Notification | null>;
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: Partial<InsertNotification>): Promise<Notification | null>;
  deleteNotification(id: number): Promise<void>;

  // Task comments
  getTaskComment(id: number): Promise<TaskComment | null>;
  getTaskComments(taskId: number): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  updateTaskComment(id: number, updates: Partial<InsertTaskComment>): Promise<TaskComment | null>;
  deleteTaskComment(id: number): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User management methods
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    // Ensure ID is generated if not provided
    const userData = {
      ...user,
      id: user.id || crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(schema.users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    try {
      const result = await db.update(schema.users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async upsertUser(user: InsertUser): Promise<User> {
    try {
      // Try to find existing user
      const existingUser = await this.getUser(user.id!);
      
      if (existingUser) {
        // Update existing user
        const updated = await this.updateUser(user.id!, user);
        return updated || existingUser;
      } else {
        // Create new user
        return await this.createUser(user);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(schema.users).orderBy(asc(schema.users.fullName));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Project management methods
  async getProject(id: number): Promise<Project | null> {
    try {
      const result = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  }

  async getProjectWithAnalysis(id: number): Promise<(Project & { analysis: AnalysisResult | null }) | null> {
    try {
      const project = await this.getProject(id);
      if (!project) return null;

      const analysis = await this.getAnalysisResult(id);
      return { ...project, analysis };
    } catch (error) {
      console.error('Error getting project with analysis:', error);
      return null;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(schema.projects).orderBy(desc(schema.projects.createdAt));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    try {
      return await db.select().from(schema.projects)
        .where(eq(schema.projects.createdBy, userId))
        .orderBy(desc(schema.projects.createdAt));
    } catch (error) {
      console.error('Error getting projects by user:', error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(schema.projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | null> {
    try {
      const result = await db.update(schema.projects)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.projects.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  }

  async checkUserProjectAccess(userId: string, projectId: number): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      if (!project) return false;
      
      // For now, allow access if user exists and project exists
      // Can be extended to check team membership or permissions
      const user = await this.getUser(userId);
      return !!user;
    } catch (error) {
      console.error('Error checking user project access:', error);
      return false;
    }
  }

  // Task management methods
  async getTask(id: number): Promise<Task | null> {
    try {
      const result = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting task:', error);
      return null;
    }
  }

  async getTasks(projectId: number): Promise<Task[]> {
    try {
      return await db.select().from(schema.tasks)
        .where(eq(schema.tasks.projectId, projectId))
        .orderBy(asc(schema.tasks.position), desc(schema.tasks.createdAt));
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      return await db.select().from(schema.tasks)
        .where(eq(schema.tasks.assignedToId, userId))
        .orderBy(desc(schema.tasks.createdAt));
    } catch (error) {
      console.error('Error getting tasks by user:', error);
      return [];
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(schema.tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | null> {
    try {
      const result = await db.update(schema.tasks)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.tasks.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  }

  async getTasksWithComments(projectId: number): Promise<(Task & { comments: TaskComment[] })[]> {
    try {
      const tasks = await this.getTasks(projectId);
      const tasksWithComments = await Promise.all(
        tasks.map(async (task) => {
          const comments = await this.getTaskComments(task.id);
          return { ...task, comments };
        })
      );
      return tasksWithComments;
    } catch (error) {
      console.error('Error getting tasks with comments:', error);
      return [];
    }
  }

  // Analysis results methods
  async getAnalysisResult(projectId: number): Promise<AnalysisResult | null> {
    try {
      const result = await db.select().from(schema.analysisResults)
        .where(eq(schema.analysisResults.projectId, projectId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting analysis result:', error);
      return null;
    }
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const result = await db.insert(schema.analysisResults).values(analysis).returning();
    return result[0];
  }

  async updateAnalysisResult(projectId: number, updates: Partial<InsertAnalysisResult>): Promise<AnalysisResult | null> {
    try {
      const result = await db.update(schema.analysisResults)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.analysisResults.projectId, projectId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating analysis result:', error);
      return null;
    }
  }

  // Document management methods
  async getDocument(id: number): Promise<Document | null> {
    try {
      const result = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async getDocuments(projectId: number): Promise<Document[]> {
    try {
      return await db.select().from(schema.documents)
        .where(eq(schema.documents.projectId, projectId))
        .orderBy(desc(schema.documents.createdAt));
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await db.insert(schema.documents).values(document).returning();
    return result[0];
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | null> {
    try {
      const result = await db.update(schema.documents)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.documents.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
  }

  // Schedule management methods
  async getSchedule(id: number): Promise<Schedule | null> {
    try {
      const result = await db.select().from(schema.schedules).where(eq(schema.schedules.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting schedule:', error);
      return null;
    }
  }

  async getSchedules(projectId: number): Promise<Schedule[]> {
    try {
      return await db.select().from(schema.schedules)
        .where(eq(schema.schedules.projectId, projectId))
        .orderBy(desc(schema.schedules.createdAt));
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const result = await db.insert(schema.schedules).values(schedule).returning();
    return result[0];
  }

  async updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | null> {
    try {
      const result = await db.update(schema.schedules)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.schedules.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    await db.delete(schema.schedules).where(eq(schema.schedules.id, id));
  }

  // Schedule entries methods
  async getScheduleEntry(id: number): Promise<ScheduleEntry | null> {
    try {
      const result = await db.select().from(schema.scheduleEntries).where(eq(schema.scheduleEntries.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting schedule entry:', error);
      return null;
    }
  }

  async getScheduleEntries(scheduleId: number): Promise<ScheduleEntry[]> {
    try {
      return await db.select().from(schema.scheduleEntries)
        .where(eq(schema.scheduleEntries.scheduleId, scheduleId))
        .orderBy(asc(schema.scheduleEntries.postDate));
    } catch (error) {
      console.error('Error getting schedule entries:', error);
      return [];
    }
  }

  async createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const result = await db.insert(schema.scheduleEntries).values(entry).returning();
    return result[0];
  }

  async updateScheduleEntry(id: number, updates: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | null> {
    try {
      const result = await db.update(schema.scheduleEntries)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.scheduleEntries.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating schedule entry:', error);
      return null;
    }
  }

  async deleteScheduleEntry(id: number): Promise<void> {
    await db.delete(schema.scheduleEntries).where(eq(schema.scheduleEntries.id, id));
  }

  // Chat messages methods
  async getChatMessages(projectId: number): Promise<ChatMessage[]> {
    try {
      return await db.select().from(schema.chatMessages)
        .where(eq(schema.chatMessages.projectId, projectId))
        .orderBy(asc(schema.chatMessages.createdAt));
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(schema.chatMessages).values(message).returning();
    return result[0];
  }

  // Product management methods
  async getProduct(id: number): Promise<Product | null> {
    try {
      const result = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  async getProducts(projectId: number): Promise<Product[]> {
    try {
      return await db.select().from(schema.products)
        .where(eq(schema.products.projectId, projectId))
        .orderBy(desc(schema.products.createdAt));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | null> {
    try {
      const result = await db.update(schema.products)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.products.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  // Project views methods
  async getProjectView(id: number): Promise<ProjectView | null> {
    try {
      const result = await db.select().from(schema.projectViews).where(eq(schema.projectViews.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting project view:', error);
      return null;
    }
  }

  async getProjectViews(projectId: number): Promise<ProjectView[]> {
    try {
      return await db.select().from(schema.projectViews)
        .where(eq(schema.projectViews.projectId, projectId))
        .orderBy(desc(schema.projectViews.createdAt));
    } catch (error) {
      console.error('Error getting project views:', error);
      return [];
    }
  }

  async createProjectView(view: InsertProjectView): Promise<ProjectView> {
    const result = await db.insert(schema.projectViews).values(view).returning();
    return result[0];
  }

  async updateProjectView(id: number, updates: Partial<InsertProjectView>): Promise<ProjectView | null> {
    try {
      const result = await db.update(schema.projectViews)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.projectViews.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating project view:', error);
      return null;
    }
  }

  async deleteProjectView(id: number): Promise<void> {
    await db.delete(schema.projectViews).where(eq(schema.projectViews.id, id));
  }

  // Automation rules methods
  async getAutomationRule(id: number): Promise<AutomationRule | null> {
    try {
      const result = await db.select().from(schema.automationRules).where(eq(schema.automationRules.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting automation rule:', error);
      return null;
    }
  }

  async getAutomationRules(projectId: number): Promise<AutomationRule[]> {
    try {
      return await db.select().from(schema.automationRules)
        .where(eq(schema.automationRules.projectId, projectId))
        .orderBy(desc(schema.automationRules.createdAt));
    } catch (error) {
      console.error('Error getting automation rules:', error);
      return [];
    }
  }

  async createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule> {
    const result = await db.insert(schema.automationRules).values(rule).returning();
    return result[0];
  }

  async updateAutomationRule(id: number, updates: Partial<InsertAutomationRule>): Promise<AutomationRule | null> {
    try {
      const result = await db.update(schema.automationRules)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.automationRules.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating automation rule:', error);
      return null;
    }
  }

  async deleteAutomationRule(id: number): Promise<void> {
    await db.delete(schema.automationRules).where(eq(schema.automationRules.id, id));
  }

  // Time tracking methods
  async getTimeEntry(id: number): Promise<TimeEntry | null> {
    try {
      const result = await db.select().from(schema.timeEntries).where(eq(schema.timeEntries.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting time entry:', error);
      return null;
    }
  }

  async getTimeEntries(taskId: number): Promise<TimeEntry[]> {
    try {
      return await db.select().from(schema.timeEntries)
        .where(eq(schema.timeEntries.taskId, taskId))
        .orderBy(desc(schema.timeEntries.createdAt));
    } catch (error) {
      console.error('Error getting time entries:', error);
      return [];
    }
  }

  async getTimeEntriesByUser(userId: string): Promise<TimeEntry[]> {
    try {
      return await db.select().from(schema.timeEntries)
        .where(eq(schema.timeEntries.userId, userId))
        .orderBy(desc(schema.timeEntries.createdAt));
    } catch (error) {
      console.error('Error getting time entries by user:', error);
      return [];
    }
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const result = await db.insert(schema.timeEntries).values(entry).returning();
    return result[0];
  }

  async updateTimeEntry(id: number, updates: Partial<InsertTimeEntry>): Promise<TimeEntry | null> {
    try {
      const result = await db.update(schema.timeEntries)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.timeEntries.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating time entry:', error);
      return null;
    }
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await db.delete(schema.timeEntries).where(eq(schema.timeEntries.id, id));
  }

  // Tags methods
  async getTag(id: number): Promise<Tag | null> {
    try {
      const result = await db.select().from(schema.tags).where(eq(schema.tags.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting tag:', error);
      return null;
    }
  }

  async getTags(projectId: number): Promise<Tag[]> {
    try {
      return await db.select().from(schema.tags)
        .where(eq(schema.tags.projectId, projectId))
        .orderBy(asc(schema.tags.name));
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const result = await db.insert(schema.tags).values(tag).returning();
    return result[0];
  }

  async updateTag(id: number, updates: Partial<InsertTag>): Promise<Tag | null> {
    try {
      const result = await db.update(schema.tags)
        .set(updates)
        .where(eq(schema.tags.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating tag:', error);
      return null;
    }
  }

  async deleteTag(id: number): Promise<void> {
    await db.delete(schema.tags).where(eq(schema.tags.id, id));
  }

  // Collaborative documents methods
  async getCollaborativeDoc(id: number): Promise<CollaborativeDoc | null> {
    try {
      const result = await db.select().from(schema.collaborativeDocs).where(eq(schema.collaborativeDocs.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting collaborative doc:', error);
      return null;
    }
  }

  async getCollaborativeDocs(projectId: number): Promise<CollaborativeDoc[]> {
    try {
      return await db.select().from(schema.collaborativeDocs)
        .where(eq(schema.collaborativeDocs.projectId, projectId))
        .orderBy(desc(schema.collaborativeDocs.updatedAt));
    } catch (error) {
      console.error('Error getting collaborative docs:', error);
      return [];
    }
  }

  async createCollaborativeDoc(doc: InsertCollaborativeDoc): Promise<CollaborativeDoc> {
    const result = await db.insert(schema.collaborativeDocs).values(doc).returning();
    return result[0];
  }

  async updateCollaborativeDoc(id: number, updates: Partial<InsertCollaborativeDoc>): Promise<CollaborativeDoc | null> {
    try {
      const result = await db.update(schema.collaborativeDocs)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.collaborativeDocs.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating collaborative doc:', error);
      return null;
    }
  }

  async deleteCollaborativeDoc(id: number): Promise<void> {
    await db.delete(schema.collaborativeDocs).where(eq(schema.collaborativeDocs.id, id));
  }

  // Notifications methods
  async getNotification(id: number): Promise<Notification | null> {
    try {
      const result = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting notification:', error);
      return null;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      return await db.select().from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.createdAt));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(schema.notifications).values(notification).returning();
    return result[0];
  }

  async updateNotification(id: number, updates: Partial<InsertNotification>): Promise<Notification | null> {
    try {
      const result = await db.update(schema.notifications)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.notifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating notification:', error);
      return null;
    }
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
  }

  // Task comments methods
  async getTaskComment(id: number): Promise<TaskComment | null> {
    try {
      const result = await db.select().from(schema.taskComments).where(eq(schema.taskComments.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting task comment:', error);
      return null;
    }
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    try {
      return await db.select().from(schema.taskComments)
        .where(eq(schema.taskComments.taskId, taskId))
        .orderBy(asc(schema.taskComments.createdAt));
    } catch (error) {
      console.error('Error getting task comments:', error);
      return [];
    }
  }

  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const result = await db.insert(schema.taskComments).values(comment).returning();
    return result[0];
  }

  async updateTaskComment(id: number, updates: Partial<InsertTaskComment>): Promise<TaskComment | null> {
    try {
      const result = await db.update(schema.taskComments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.taskComments.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error updating task comment:', error);
      return null;
    }
  }

  async deleteTaskComment(id: number): Promise<void> {
    await db.delete(schema.taskComments).where(eq(schema.taskComments.id, id));
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();