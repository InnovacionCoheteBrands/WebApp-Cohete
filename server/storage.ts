import { users, projects, analysisResults, projectAssignments, documents, schedules, scheduleEntries, chatMessages, contentHistory, tasks } from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, desc, asc, or, sql, isNull } from "drizzle-orm";
import type { Store } from "express-session";
import {
  User,
  InsertUser,
  Project,
  InsertProject,
  AnalysisResult,
  InsertAnalysisResult,
  Document,
  InsertDocument,
  Schedule,
  InsertSchedule,
  ScheduleEntry,
  InsertScheduleEntry,
  ChatMessage,
  InsertChatMessage,
  ProjectAssignment,
  ContentHistory,
  InsertContentHistory,
  Task,
  InsertTask
} from "@shared/schema";

export interface IStorage {
  // Session management
  sessionStore: Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>; // Busca por username o email
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Project methods
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithAnalysis(id: number): Promise<(Project & { analysis: AnalysisResult | null }) | undefined>;
  updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  listProjects(): Promise<Project[]>;
  listProjectsByUser(userId: number, isPrimary: boolean): Promise<Project[]>;
  
  // Project Analysis methods
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResult(projectId: number): Promise<AnalysisResult | undefined>;
  updateAnalysisResult(projectId: number, analysisData: Partial<InsertAnalysisResult>): Promise<AnalysisResult | undefined>;
  
  // Project Assignment methods
  assignUserToProject(projectId: number, userId: number): Promise<ProjectAssignment>;
  removeUserFromProject(projectId: number, userId: number): Promise<boolean>;
  getProjectAssignments(projectId: number): Promise<User[]>;
  checkUserProjectAccess(userId: number, projectId: number, isPrimary: boolean): Promise<boolean>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  listDocumentsByProject(projectId: number): Promise<Document[]>;
  
  // Schedule methods
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  getScheduleWithEntries(id: number): Promise<(Schedule & { entries: ScheduleEntry[] }) | undefined>;
  updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  listSchedulesByProject(projectId: number): Promise<Schedule[]>;
  listRecentSchedules(limit?: number): Promise<(Schedule & { project: Project })[]>;
  
  // Schedule Entry methods
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  getScheduleEntry(id: number): Promise<ScheduleEntry | undefined>;
  updateScheduleEntry(id: number, entryData: Partial<ScheduleEntry>): Promise<ScheduleEntry | undefined>;
  deleteScheduleEntry(id: number): Promise<boolean>;
  listEntriesBySchedule(scheduleId: number): Promise<ScheduleEntry[]>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  listChatMessagesByProject(projectId: number): Promise<ChatMessage[]>;
  
  // Content History methods
  createContentHistory(entry: InsertContentHistory): Promise<ContentHistory>;
  getContentHistoryByProjectAndContent(projectId: number, content: string): Promise<ContentHistory | undefined>;
  listContentHistoryByProject(projectId: number): Promise<ContentHistory[]>;
  
  // Task methods
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  listTasksByProject(projectId: number): Promise<Task[]>;
  listTasksByAssignee(userId: number): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor(store: Store) {
    this.sessionStore = store;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    // Busca un usuario por nombre de usuario o correo electrónico
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )
    );
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectWithAnalysis(id: number): Promise<(Project & { analysis: AnalysisResult | null }) | undefined> {
    const result = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        analysis: true,
      },
    });
    return result;
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  async listProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async listProjectsByUser(userId: number, isPrimary: boolean): Promise<Project[]> {
    if (isPrimary) {
      // Primary users see all projects
      return await this.listProjects();
    } else {
      // Secondary users see only projects they created or are assigned to
      const assignments = await db
        .select()
        .from(projectAssignments)
        .where(eq(projectAssignments.userId, userId));
      
      const assignedProjectIds = assignments.map(a => a.projectId);
      
      return await db
        .select()
        .from(projects)
        .where(
          or(
            eq(projects.createdBy, userId),
            assignedProjectIds.length > 0 ? inArray(projects.id, assignedProjectIds) : sql`false`
          )
        )
        .orderBy(desc(projects.createdAt));
    }
  }

  // Project Analysis methods
  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newAnalysis] = await db
      .insert(analysisResults)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getAnalysisResult(projectId: number): Promise<AnalysisResult | undefined> {
    const [analysis] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.projectId, projectId));
    return analysis;
  }

  async updateAnalysisResult(projectId: number, analysisData: Partial<InsertAnalysisResult>): Promise<AnalysisResult | undefined> {
    const [updatedAnalysis] = await db
      .update(analysisResults)
      .set({ ...analysisData, updatedAt: new Date() })
      .where(eq(analysisResults.projectId, projectId))
      .returning();
    return updatedAnalysis;
  }

  // Project Assignment methods
  async assignUserToProject(projectId: number, userId: number): Promise<ProjectAssignment> {
    const [assignment] = await db
      .insert(projectAssignments)
      .values({ projectId, userId })
      .returning();
    return assignment;
  }

  async removeUserFromProject(projectId: number, userId: number): Promise<boolean> {
    await db
      .delete(projectAssignments)
      .where(
        and(
          eq(projectAssignments.projectId, projectId),
          eq(projectAssignments.userId, userId)
        )
      );
    return true;
  }

  async getProjectAssignments(projectId: number): Promise<User[]> {
    const assignments = await db
      .select()
      .from(projectAssignments)
      .where(eq(projectAssignments.projectId, projectId));
    
    if (assignments.length === 0) return [];
    
    const userIds = assignments.map(a => a.userId);
    return await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));
  }

  async checkUserProjectAccess(userId: number, projectId: number, isPrimary: boolean): Promise<boolean> {
    if (isPrimary) return true; // Primary users have access to all projects
    
    // Check if user created the project
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.createdBy, userId)
        )
      );
    
    if (project) return true;
    
    // Check if user is assigned to the project
    const [assignment] = await db
      .select()
      .from(projectAssignments)
      .where(
        and(
          eq(projectAssignments.projectId, projectId),
          eq(projectAssignments.userId, userId)
        )
      );
    
    return !!assignment;
  }

  // Document methods
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(documentData)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  async listDocumentsByProject(projectId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.createdAt));
  }

  // Schedule methods
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db
      .insert(schedules)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id));
    return schedule;
  }

  async getScheduleWithEntries(id: number): Promise<(Schedule & { entries: ScheduleEntry[] }) | undefined> {
    try {
      // Obtener primero el schedule
      const [schedule] = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, id));
      
      if (!schedule) {
        return undefined;
      }
      
      // Obtener las entradas relacionadas y asegurarnos que existan
      console.log(`Buscando entradas para el cronograma ID ${id}`);
      const entriesList = await db
        .select()
        .from(scheduleEntries)
        .where(eq(scheduleEntries.scheduleId, id))
        .orderBy(asc(scheduleEntries.postDate));
      
      console.log(`Se encontraron ${entriesList.length} entradas para el cronograma ID ${id}`);
      
      // Combinar los resultados
      return {
        ...schedule,
        entries: entriesList || [] // Asegurarnos que siempre devolvemos un array, incluso si es vacío
      };
    } catch (error) {
      console.error(`Error in getScheduleWithEntries for schedule ID ${id}:`, error);
      // En lugar de lanzar un error, devolvemos el cronograma con un array vacío de entradas
      return {
        ...(await this.getSchedule(id)),
        entries: []
      };
    }
  }

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined> {
    const [updatedSchedule] = await db
      .update(schedules)
      .set(scheduleData)
      .where(eq(schedules.id, id))
      .returning();
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    await db.delete(schedules).where(eq(schedules.id, id));
    return true;
  }

  async listSchedulesByProject(projectId: number): Promise<Schedule[]> {
    return await db
      .select()
      .from(schedules)
      .where(eq(schedules.projectId, projectId))
      .orderBy(desc(schedules.createdAt));
  }

  async listRecentSchedules(limit: number = 5): Promise<(Schedule & { project: Project })[]> {
    try {
      // Obtener schedules recientes
      const schedulesResult = await db
        .select()
        .from(schedules)
        .orderBy(desc(schedules.createdAt))
        .limit(limit);
      
      // Para cada schedule, obtener su proyecto relacionado y las entradas
      const results: (Schedule & { project: Project })[] = [];
      
      for (const schedule of schedulesResult) {
        try {
          // Obtener el proyecto relacionado
          const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, schedule.projectId));
          
          if (project) {
            // También obtener las entradas para este cronograma
            const entries = await this.listEntriesBySchedule(schedule.id);
            
            results.push({
              ...schedule,
              project,
              entries // Incluir las entradas en el resultado
            });
          }
        } catch (err) {
          console.error(`Error getting project for schedule ${schedule.id}:`, err);
          // Si falla obtener el proyecto, saltamos este schedule
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error in listRecentSchedules:", error);
      return []; // Return empty array instead of throwing error
    }
  }

  // Schedule Entry methods
  async createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const [newEntry] = await db
      .insert(scheduleEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getScheduleEntry(id: number): Promise<ScheduleEntry | undefined> {
    const [entry] = await db
      .select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.id, id));
    return entry;
  }

  async updateScheduleEntry(id: number, entryData: Partial<ScheduleEntry>): Promise<ScheduleEntry | undefined> {
    const [updatedEntry] = await db
      .update(scheduleEntries)
      .set(entryData)
      .where(eq(scheduleEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteScheduleEntry(id: number): Promise<boolean> {
    await db.delete(scheduleEntries).where(eq(scheduleEntries.id, id));
    return true;
  }

  async listEntriesBySchedule(scheduleId: number): Promise<ScheduleEntry[]> {
    return await db
      .select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.scheduleId, scheduleId))
      .orderBy(asc(scheduleEntries.postDate));
  }

  // Chat methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async listChatMessagesByProject(projectId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, projectId))
      .orderBy(asc(chatMessages.createdAt));
  }
  
  // Content History methods
  async createContentHistory(entry: InsertContentHistory): Promise<ContentHistory> {
    const [newEntry] = await db
      .insert(contentHistory)
      .values(entry)
      .returning();
    return newEntry;
  }
  
  async getContentHistoryByProjectAndContent(projectId: number, content: string): Promise<ContentHistory | undefined> {
    const [entry] = await db
      .select()
      .from(contentHistory)
      .where(
        and(
          eq(contentHistory.projectId, projectId),
          eq(contentHistory.content, content)
        )
      );
    return entry;
  }
  
  async listContentHistoryByProject(projectId: number): Promise<ContentHistory[]> {
    return await db
      .select()
      .from(contentHistory)
      .where(eq(contentHistory.projectId, projectId))
      .orderBy(desc(contentHistory.createdAt));
  }
  
  // Task methods
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }
  
  async listTasksByProject(projectId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.dueDate), desc(tasks.priority));
  }
  
  async listTasksByAssignee(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(asc(tasks.dueDate), desc(tasks.priority));
  }
}

// The storage instantiation is moved to routes.ts because we need the session store from auth
