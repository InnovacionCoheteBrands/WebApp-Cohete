import { users, projects, analysisResults, projectAssignments, documents, schedules, scheduleEntries, chatMessages, contentHistory, tasks, taskComments, products, projectViews, automationRules, timeEntries, tags, collaborativeDocs, notifications, taskDependencies, projectMembers } from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, desc, asc, or, sql, isNull } from "drizzle-orm";
import type { Store } from "express-session";
import {
  User,
  InsertUser,
  UpsertUser,
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
  InsertTask,
  TaskComment,
  InsertTaskComment,
  Product,
  InsertProduct,
  ProjectView,
  InsertProjectView,
  AutomationRule,
  InsertAutomationRule,
  TimeEntry,
  InsertTimeEntry,
  Tag,
  InsertTag,
  CollaborativeDoc,
  InsertCollaborativeDoc,
  Notification,
  InsertNotification,
  TaskDependency,
  InsertTaskDependency,
  ProjectMember,
  InsertProjectMember
} from "@shared/schema";

// Interfaz para los tokens de recuperación
export interface PasswordResetToken {
  userId: number;
  token: string;
  expires: Date;
}

export interface IStorage {
  // Session management
  sessionStore: Store;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>; // Busca por username o email
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Password reset methods
  createPasswordResetToken(userId: number): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<boolean>;

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
  listSchedulesByProject(projectId: number): Promise<(Schedule & { entries: ScheduleEntry[] })[]>;
  listRecentSchedules(limit?: number): Promise<(Schedule & { project: Project })[]>;
  
  // Schedule Entry methods
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  getScheduleEntry(id: number): Promise<ScheduleEntry | undefined>;
  updateScheduleEntry(id: number, entryData: Partial<ScheduleEntry>): Promise<ScheduleEntry | undefined>;
  deleteScheduleEntry(id: number): Promise<boolean>;
  deleteScheduleEntries(scheduleId: number): Promise<boolean>;
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
  listSubtasks(parentTaskId: number): Promise<Task[]>;
  
  // Task Comments methods
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  getTaskComment(id: number): Promise<TaskComment | undefined>;
  deleteTaskComment(id: number): Promise<boolean>;
  listTaskComments(taskId: number): Promise<TaskComment[]>;
  
  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  listProductsByProject(projectId: number): Promise<Product[]>;

  // Project Views methods
  getProjectView(id: number): Promise<ProjectView | undefined>;
  listProjectViews(projectId: number): Promise<ProjectView[]>;
  createProjectView(view: InsertProjectView): Promise<ProjectView>;
  updateProjectView(id: number, viewData: Partial<ProjectView>): Promise<ProjectView | undefined>;
  deleteProjectView(id: number): Promise<boolean>;
  updateOtherViewsDefaultStatus(projectId: number, currentViewId: number): Promise<void>;

  // Automation Rules methods
  getAutomationRule(id: number): Promise<AutomationRule | undefined>;
  listAutomationRules(projectId: number): Promise<AutomationRule[]>;
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  updateAutomationRule(id: number, ruleData: Partial<AutomationRule>): Promise<AutomationRule | undefined>;
  deleteAutomationRule(id: number): Promise<boolean>;

  // Time Entries methods
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  listTimeEntriesByTask(taskId: number): Promise<TimeEntry[]>;
  listTimeEntriesByUser(userId: number): Promise<TimeEntry[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entryData: Partial<TimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // Tags methods
  getTag(id: number): Promise<Tag | undefined>;
  listTags(projectId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tagData: Partial<Tag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;

  // Collaborative Docs methods
  getCollaborativeDoc(id: number): Promise<CollaborativeDoc | undefined>;
  listCollaborativeDocs(projectId: number): Promise<CollaborativeDoc[]>;
  createCollaborativeDoc(doc: InsertCollaborativeDoc): Promise<CollaborativeDoc>;
  updateCollaborativeDoc(id: number, docData: Partial<CollaborativeDoc>): Promise<CollaborativeDoc | undefined>;
  deleteCollaborativeDoc(id: number): Promise<boolean>;

  // Collaboration methods
  getTaskComments(taskId: number): Promise<any[]>;
  createTaskComment(comment: InsertNotification): Promise<any>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<boolean>;
  getProjectMembers(projectId: number): Promise<ProjectMember[]>;
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  getTaskDependencies(taskId: number): Promise<TaskDependency[]>;
  createTaskDependency(dependency: InsertTaskDependency): Promise<TaskDependency>;

  // Password reset methods
  createPasswordResetToken(userId: number): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor(store: Store) {
    this.sessionStore = store;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Email temporalmente deshabilitado - devolvemos null
    return undefined;
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    // Busca un usuario por nombre de usuario (email temporalmente deshabilitado)
    console.log(`Buscando usuario con identifier: ${identifier}`);
    const [user] = await db.select().from(users).where(eq(users.username, identifier));
    if (user) {
      console.log(`Usuario encontrado con username: ${user.username}`);
    } else {
      console.log('No se encontró ningún usuario con ese identifier');
    }
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Ahora incluimos el campo email ya que está en la base de datos
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Usuario OAuth',
        username: user.email || user.id,
        isPrimary: false,
        role: 'content_creator',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    // Filtrar el campo email ya que no existe en la base de datos
    const { email, ...filteredUserData } = userData as any;
    const [updatedUser] = await db
      .update(users)
      .set(filteredUserData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    // Convertir fechas para que sean compatibles con la base de datos
    const processedProject = {
      ...project,
      startDate: project.startDate ? (typeof project.startDate === 'string' ? new Date(project.startDate) : project.startDate) : null,
      endDate: project.endDate ? (typeof project.endDate === 'string' ? new Date(project.endDate) : project.endDate) : null
    };
    
    const [newProject] = await db.insert(projects).values(processedProject).returning();
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

  async listSchedulesByProject(projectId: number): Promise<(Schedule & { entries: ScheduleEntry[] })[]> {
    try {
      // Obtener los cronogramas del proyecto
      const schedulesList = await db
        .select()
        .from(schedules)
        .where(eq(schedules.projectId, projectId))
        .orderBy(desc(schedules.createdAt));
      
      if (!schedulesList || schedulesList.length === 0) {
        return [];
      }
      
      // Para cada cronograma, obtener sus entradas
      const results: (Schedule & { entries: ScheduleEntry[] })[] = [];
      
      for (const schedule of schedulesList) {
        try {
          // Obtener las entradas para este cronograma
          const entries = await this.listEntriesBySchedule(schedule.id);
          
          // Combinar los resultados
          results.push({
            ...schedule,
            entries: entries || [] // Asegurarnos que nunca es null
          });
        } catch (err) {
          console.error(`Error obteniendo entradas para el cronograma ${schedule.id}:`, err);
          // Si falla obtener las entradas, incluimos el cronograma con entradas vacías
          results.push({
            ...schedule,
            entries: []
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error in listSchedulesByProject:", error);
      return []; // Devolver array vacío en lugar de lanzar error
    }
  }

  async listRecentSchedules(limit: number = 5): Promise<(Schedule & { project: Project, entries: ScheduleEntry[] })[]> {
    try {
      // Obtener schedules recientes con join a projects para asegurar que el proyecto existe
      const schedulesResult = await db
        .select({
          schedule: schedules,
          project: projects
        })
        .from(schedules)
        .innerJoin(projects, eq(schedules.projectId, projects.id))
        .orderBy(desc(schedules.createdAt))
        .limit(limit);
      
      if (!schedulesResult || schedulesResult.length === 0) {
        return []; // No hay schedules para procesar
      }
      
      // Para cada schedule, obtener sus entradas
      const results: (Schedule & { project: Project, entries: ScheduleEntry[] })[] = [];
      
      for (const { schedule, project } of schedulesResult) {
        try {
          if (!schedule || !schedule.id) {
            console.warn("Schedule inválido encontrado");
            continue;
          }
          
          // Obtener las entradas para este cronograma
          const entries = await this.listEntriesBySchedule(schedule.id);
          
          results.push({
            ...schedule,
            project,
            entries: entries || [] // Incluir las entradas en el resultado, asegurando que nunca es null
          });
        } catch (err) {
          console.error(`Error getting project for schedule ${schedule?.id}:`, err);
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
  
  async deleteScheduleEntries(scheduleId: number): Promise<boolean> {
    await db.delete(scheduleEntries).where(eq(scheduleEntries.scheduleId, scheduleId));
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
    // Usar una consulta SQL directa para evitar el error de la columna reminderDate
    // Seleccionamos solo las columnas que sabemos que existen en la tabla
    return await db.execute(sql`
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
  
  async listTasksByAssignee(userId: number): Promise<Task[]> {
    // Usar una consulta SQL directa para evitar el error de la columna reminderDate
    return await db.execute(sql`
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
  
  async listSubtasks(parentTaskId: number): Promise<Task[]> {
    // Usar una consulta SQL directa para evitar el error de la columna reminderDate
    return await db.execute(sql`
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
  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const [newComment] = await db
      .insert(taskComments)
      .values(comment)
      .returning();
    return newComment;
  }
  
  async getTaskComment(id: number): Promise<TaskComment | undefined> {
    const [comment] = await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.id, id));
    return comment;
  }
  
  async deleteTaskComment(id: number): Promise<boolean> {
    await db.delete(taskComments).where(eq(taskComments.id, id));
    return true;
  }
  
  async listTaskComments(taskId: number): Promise<TaskComment[]> {
    return await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(asc(taskComments.createdAt));
  }
  
  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }
  
  async listProductsByProject(projectId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.projectId, projectId))
      .orderBy(desc(products.createdAt));
  }

  // Password reset methods usando memoria ya que no tenemos una tabla específica
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();

  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    // Generar un token único usando crypto
    const tokenStr = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    
    // Establecer expiración a 1 hora
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    
    const tokenData: PasswordResetToken = {
      userId,
      token: tokenStr,
      expires
    };
    
    // Almacenar el token
    this.passwordResetTokens.set(tokenStr, tokenData);
    
    return tokenData;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const tokenData = this.passwordResetTokens.get(token);
    
    if (!tokenData) {
      return undefined;
    }
    
    // Verificar si expiró
    if (new Date() > tokenData.expires) {
      this.passwordResetTokens.delete(token);
      return undefined;
    }
    
    return tokenData;
  }

  async deletePasswordResetToken(token: string): Promise<boolean> {
    return this.passwordResetTokens.delete(token);
  }

  // Project Views methods
  async getProjectView(id: number): Promise<ProjectView | undefined> {
    const [view] = await db
      .select()
      .from(projectViews)
      .where(eq(projectViews.id, id));
    return view;
  }

  async listProjectViews(projectId: number): Promise<ProjectView[]> {
    const views = await db
      .select()
      .from(projectViews)
      .where(eq(projectViews.projectId, projectId))
      .orderBy(asc(projectViews.name));
    return views;
  }

  async createProjectView(view: InsertProjectView): Promise<ProjectView> {
    const [newView] = await db
      .insert(projectViews)
      .values(view)
      .returning();
    return newView;
  }

  async updateProjectView(id: number, viewData: Partial<ProjectView>): Promise<ProjectView | undefined> {
    const [updatedView] = await db
      .update(projectViews)
      .set(viewData)
      .where(eq(projectViews.id, id))
      .returning();
    return updatedView;
  }

  async deleteProjectView(id: number): Promise<boolean> {
    const result = await db
      .delete(projectViews)
      .where(eq(projectViews.id, id));
    return !!result;
  }

  async updateOtherViewsDefaultStatus(projectId: number, currentViewId: number): Promise<void> {
    await db
      .update(projectViews)
      .set({ isDefault: false })
      .where(and(
        eq(projectViews.projectId, projectId),
        sql`${projectViews.id} != ${currentViewId}`
      ));
  }

  // Automation Rules methods
  async getAutomationRule(id: number): Promise<AutomationRule | undefined> {
    const [rule] = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.id, id));
    return rule;
  }

  async listAutomationRules(projectId: number): Promise<AutomationRule[]> {
    const rules = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.projectId, projectId))
      .orderBy(asc(automationRules.name));
    return rules;
  }

  async createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule> {
    const [newRule] = await db
      .insert(automationRules)
      .values(rule)
      .returning();
    return newRule;
  }

  async updateAutomationRule(id: number, ruleData: Partial<AutomationRule>): Promise<AutomationRule | undefined> {
    const [updatedRule] = await db
      .update(automationRules)
      .set(ruleData)
      .where(eq(automationRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteAutomationRule(id: number): Promise<boolean> {
    const result = await db
      .delete(automationRules)
      .where(eq(automationRules.id, id));
    return !!result;
  }

  // Time Entries methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.id, id));
    return entry;
  }

  async listTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> {
    const entries = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId))
      .orderBy(desc(timeEntries.startTime));
    return entries;
  }

  async listTimeEntriesByUser(userId: number): Promise<TimeEntry[]> {
    const entries = await db
      .select({
        ...timeEntries,
        task: tasks
      })
      .from(timeEntries)
      .innerJoin(tasks, eq(timeEntries.taskId, tasks.id))
      .where(eq(timeEntries.userId, userId))
      .orderBy(desc(timeEntries.startTime));
    return entries;
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    // Si no se proporciona la duración pero sí el inicio y fin, calcularla
    let entryData = { ...entry };
    
    if (!entryData.duration && entryData.startTime && entryData.endTime) {
      const startTime = new Date(entryData.startTime).getTime();
      const endTime = new Date(entryData.endTime).getTime();
      entryData.duration = Math.floor((endTime - startTime) / 1000); // duración en segundos
    }
    
    const [newEntry] = await db
      .insert(timeEntries)
      .values(entryData)
      .returning();
    return newEntry;
  }

  async updateTimeEntry(id: number, entryData: Partial<TimeEntry>): Promise<TimeEntry | undefined> {
    // Actualizar la duración si se modifican las fechas
    let dataToUpdate = { ...entryData };
    
    if ((entryData.startTime || entryData.endTime) && !entryData.duration) {
      // Obtener la entrada actual para acceder a los valores no modificados
      const currentEntry = await this.getTimeEntry(id);
      if (currentEntry) {
        const startTime = entryData.startTime 
          ? new Date(entryData.startTime).getTime() 
          : new Date(currentEntry.startTime).getTime();
        
        const endTime = entryData.endTime 
          ? new Date(entryData.endTime).getTime() 
          : currentEntry.endTime 
            ? new Date(currentEntry.endTime).getTime() 
            : null;
        
        if (endTime && startTime) {
          dataToUpdate.duration = Math.floor((endTime - startTime) / 1000);
        }
      }
    }
    
    const [updatedEntry] = await db
      .update(timeEntries)
      .set(dataToUpdate)
      .where(eq(timeEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(timeEntries)
      .where(eq(timeEntries.id, id));
    return !!result;
  }

  // Collaboration methods implementation
  async getTaskComments(taskId: number): Promise<any[]> {
    const comments = await db
      .select({
        id: notifications.id,
        content: notifications.message,
        userId: notifications.userId,
        createdAt: notifications.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.userId, users.id))
      .where(and(
        eq(notifications.type, 'comment'),
        eq(notifications.relatedEntityId, taskId),
        eq(notifications.relatedEntityType, 'task')
      ))
      .orderBy(notifications.createdAt);
    
    return comments;
  }

  async createTaskComment(comment: any): Promise<any> {
    const [newComment] = await db
      .insert(notifications)
      .values({
        type: 'comment',
        message: comment.content,
        userId: comment.userId,
        relatedEntityType: 'task',
        relatedEntityId: comment.taskId,
        isRead: false
      })
      .returning();
    
    return newComment;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    return userNotifications;
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    return !!result;
  }

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    const members = await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(projectMembers)
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));
    
    return members as ProjectMember[];
  }

  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db
      .insert(projectMembers)
      .values(member)
      .returning();
    
    return newMember;
  }

  async getTaskDependencies(taskId: number): Promise<TaskDependency[]> {
    const dependencies = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, taskId));
    
    return dependencies;
  }

  async createTaskDependency(dependency: InsertTaskDependency): Promise<TaskDependency> {
    const [newDependency] = await db
      .insert(taskDependencies)
      .values(dependency)
      .returning();
    
    return newDependency;
  }

  // Tags methods
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));
    return tag;
  }

  async listTags(projectId: number): Promise<Tag[]> {
    const tagsList = await db
      .select()
      .from(tags)
      .where(eq(tags.projectId, projectId))
      .orderBy(asc(tags.name));
    return tagsList;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db
      .insert(tags)
      .values(tag)
      .returning();
    return newTag;
  }

  async updateTag(id: number, tagData: Partial<Tag>): Promise<Tag | undefined> {
    const [updatedTag] = await db
      .update(tags)
      .set(tagData)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await db
      .delete(tags)
      .where(eq(tags.id, id));
    return !!result;
  }

  // Collaborative Docs methods
  async getCollaborativeDoc(id: number): Promise<CollaborativeDoc | undefined> {
    const [doc] = await db
      .select()
      .from(collaborativeDocs)
      .where(eq(collaborativeDocs.id, id));
    return doc;
  }

  async listCollaborativeDocs(projectId: number): Promise<CollaborativeDoc[]> {
    const docs = await db
      .select()
      .from(collaborativeDocs)
      .where(eq(collaborativeDocs.projectId, projectId))
      .orderBy(asc(collaborativeDocs.title));
    return docs;
  }

  async createCollaborativeDoc(doc: InsertCollaborativeDoc): Promise<CollaborativeDoc> {
    const [newDoc] = await db
      .insert(collaborativeDocs)
      .values(doc)
      .returning();
    return newDoc;
  }

  async updateCollaborativeDoc(id: number, docData: Partial<CollaborativeDoc>): Promise<CollaborativeDoc | undefined> {
    const [updatedDoc] = await db
      .update(collaborativeDocs)
      .set({
        ...docData,
        updatedAt: new Date()
      })
      .where(eq(collaborativeDocs.id, id))
      .returning();
    return updatedDoc;
  }

  async deleteCollaborativeDoc(id: number): Promise<boolean> {
    const result = await db
      .delete(collaborativeDocs)
      .where(eq(collaborativeDocs.id, id));
    return !!result;
  }
}

// Create a mock session store for the storage instance
import MemoryStore from "memorystore";
import session from "express-session";
const SessionStore = MemoryStore(session);
const mockStore = new SessionStore({ checkPeriod: 86400000 });

export const storage = new DatabaseStorage(mockStore);
