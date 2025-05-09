import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { DatabaseStorage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { analyzeDocument, processChatMessage } from "./ai-analyzer";
import { generateSchedule } from "./ai-scheduler";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import ExcelJS from 'exceljs';
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import * as htmlPdf from 'html-pdf-node';
import { jsPDF } from 'jspdf';
import { AIModel } from "@shared/schema";
import {
  insertProjectSchema,
  insertAnalysisResultsSchema,
  insertScheduleSchema,
  insertChatMessageSchema,
  insertTaskSchema,
  insertUserSchema,
  insertProductSchema,
  updateProfileSchema,
  scheduleEntries,
  Product
} from "@shared/schema";
import { WebSocketServer } from "ws";

// Global declaration for storage
declare global {
  var storage: DatabaseStorage;
}

// Set up storage for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configuración de multer para documentos (PDF, DOCX, TXT)
const documentUpload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOCX, and TXT files
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.') as any);
    }
  }
});

// Configuración de multer para imágenes (JPG, PNG, GIF, WEBP)
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit para imágenes
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, GIF o WEBP.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const { isAuthenticated, isPrimaryUser, sessionStore } = setupAuth(app);
  
  // Initialize storage with session store
  global.storage = new DatabaseStorage(sessionStore);

  // User Management API
  
  // Endpoint para la ruta secreta de creación de cuenta de administrador principal
  const PRIMARY_ACCOUNT_SECRET = process.env.PRIMARY_ACCOUNT_SECRET || 'cohete-workflow-secret';
  
  app.post("/api/create-primary-account", async (req: Request, res: Response) => {
    try {
      const { fullName, username, password, secretKey } = req.body;
      
      // Validar datos
      if (!fullName || !username || !password || !secretKey) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
      
      // Verificar clave secreta
      if (secretKey !== PRIMARY_ACCOUNT_SECRET) {
        return res.status(403).json({ message: "Clave secreta incorrecta" });
      }
      
      // Verificar si el usuario ya existe
      const existingUser = await global.storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }
      
      // Crear usuario primario
      const hashedPassword = await hashPassword(password);
      const newUser = await global.storage.createUser({
        fullName,
        username,
        password: hashedPassword,
        isPrimary: true,
        role: 'admin',
        preferredLanguage: 'es',
        theme: 'light'
      });
      
      // Eliminar password del response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating primary account:", error);
      res.status(500).json({ message: "Error al crear cuenta primaria" });
    }
  });
  
  // Endpoint para listar usuarios (solo para usuarios primarios)
  app.get("/api/admin/users", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const users = await global.storage.listUsers();
      
      // Eliminar contraseñas del resultado
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ message: "Error al listar usuarios" });
    }
  });
  
  // Endpoint para crear usuarios (solo para usuarios primarios)
  app.post("/api/admin/users", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await global.storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
      }
      
      // Los usuarios primarios solo pueden ser creados por otros usuarios primarios
      // El valor de isPrimary vendrá directamente desde el frontend
      
      // Crear usuario
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await global.storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Eliminar password del response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  });
  
  // Endpoint para eliminar usuarios (solo para usuarios primarios)
  app.delete("/api/admin/users/:id", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      
      // No permitir eliminar el propio usuario
      if (userId === req.user.id) {
        return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
      }
      
      // Verificar que el usuario existe
      const user = await global.storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Si es un usuario primario, verificar que no sea el último
      if (user.isPrimary) {
        const allUsers = await global.storage.listUsers();
        const primaryUsers = allUsers.filter(u => u.isPrimary);
        
        if (primaryUsers.length <= 1) {
          return res.status(400).json({ message: "No se puede eliminar el último usuario administrador" });
        }
      }
      
      // Eliminar usuario
      await global.storage.deleteUser(userId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });

  
  // Endpoint para actualizar el perfil del usuario actual
  app.patch("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const profileData = updateProfileSchema.parse(req.body);
      const userId = req.user.id;
      
      // Actualizar el perfil del usuario
      const updatedUser = await global.storage.updateUser(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Eliminar contraseña del resultado
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  });
  
  // Endpoint para cambiar la contraseña del usuario actual
  app.post("/api/profile/change-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Se requiere la contraseña actual y la nueva contraseña" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
      }
      
      // Obtener usuario actual
      const user = await global.storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Verificar contraseña actual
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" });
      }
      
      // Actualizar contraseña
      const hashedPassword = await hashPassword(newPassword);
      await global.storage.updateUser(req.user.id, { password: hashedPassword });
      
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  });

  app.get("/api/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const users = await global.storage.listUsers();
      
      // Incluir solo información básica de usuario para seguridad
      const safeUsers = users.map(user => ({
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

  // Projects API
  app.post("/api/projects", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      // Set created by to current user
      projectData.createdBy = req.user.id;
      
      const newProject = await global.storage.createProject(projectData);
      
      // If analysis data is provided, create analysis result
      if (req.body.analysisResults) {
        const analysisData = {
          projectId: newProject.id,
          ...req.body.analysisResults
        };
        
        await global.storage.createAnalysisResult(analysisData);
      }
      
      // Initial products will be created in a separate API call from the frontend
      // using FormData to handle the image uploads
      
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projects = await global.storage.listProjectsByUser(req.user.id, req.user.isPrimary);
      res.json(projects);
    } catch (error) {
      console.error("Error listing projects:", error);
      res.status(500).json({ message: "Failed to list projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
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
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Primary users can update any project, secondary users cannot update project details
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

  app.delete("/api/projects/:id", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
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

  // Project Analysis API
  app.patch("/api/projects/:id/analysis", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const analysisData = insertAnalysisResultsSchema.parse({
        projectId,
        ...req.body
      });
      
      // Check if analysis exists for this project
      const existingAnalysis = await global.storage.getAnalysisResult(projectId);
      
      let result;
      if (existingAnalysis) {
        // Update existing analysis
        result = await global.storage.updateAnalysisResult(projectId, analysisData);
      } else {
        // Create new analysis
        result = await global.storage.createAnalysisResult(analysisData);
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating project analysis:", error);
      res.status(500).json({ message: "Failed to update project analysis" });
    }
  });

  // Documents API
  app.post("/api/projects/:projectId/documents", isAuthenticated, documentUpload.single('file'), async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
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
      
      // Document data
      const documentData = {
        projectId,
        uploadedBy: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      };
      
      // Create document record
      const document = await global.storage.createDocument(documentData);
      
      // Extract text from document (currently only PDF supported)
      let extractedText = "";
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else if (req.file.mimetype === 'text/plain') {
        extractedText = fs.readFileSync(req.file.path, 'utf8');
      } else {
        // For DOCX files or other formats, we'd need additional libraries
        extractedText = "Text extraction not supported for this file type yet.";
      }
      
      // Update document with extracted text
      let updatedDocument = await global.storage.updateDocument(document.id, {
        extractedText,
        analysisStatus: 'processing'
      });
      
      // Process with AI in the background
      analyzeDocument(extractedText)
        .then(async (analysis) => {
          await global.storage.updateDocument(document.id, {
            analysisResults: analysis,
            analysisStatus: 'completed'
          });
        })
        .catch(async (error) => {
          console.error("AI analysis error:", error);
          await global.storage.updateDocument(document.id, {
            analysisStatus: 'failed'
          });
        });
      
      res.status(201).json(updatedDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/projects/:projectId/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      const documents = await global.storage.listDocumentsByProject(projectId);
      res.json(documents);
    } catch (error) {
      console.error("Error listing documents:", error);
      res.status(500).json({ message: "Failed to list documents" });
    }
  });

  app.post("/api/projects/:projectId/documents/:documentId/use-analysis", isAuthenticated, isPrimaryUser, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const documentId = parseInt(req.params.documentId);
      
      if (isNaN(projectId) || isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get document
      const document = await global.storage.getDocument(documentId);
      if (!document || document.projectId !== projectId) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.analysisStatus !== 'completed' || !document.analysisResults) {
        return res.status(400).json({ message: "Document analysis not available" });
      }
      
      // Extract analysis results
      const analysis = document.analysisResults;
      
      // Check if analysis exists for this project
      const existingAnalysis = await global.storage.getAnalysisResult(projectId);
      
      // Update or create project analysis
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

  // Schedules API
  app.post("/api/projects/:projectId/schedule", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Validate distribution preferences
      const { distributionPreferences, ...otherData } = req.body;
      if (distributionPreferences?.type === 'custom' && (!distributionPreferences.frequency || !distributionPreferences.preferredTimes || !distributionPreferences.preferredDays)) {
        return res.status(400).json({ message: "Custom distribution requires frequency, preferred times and days" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      // Validate required data
      const { startDate, specifications, periodType, additionalInstructions } = req.body;
      if (!startDate) {
        return res.status(400).json({ message: "Start date is required" });
      }
      
      // Forzamos el uso de Grok como único modelo de IA disponible
      const selectedAIModel = AIModel.GROK;
      
      // Determinar el número de días según el tipo de periodo
      let periodDays = 15; // Valor predeterminado: quincenal (15 días)
      if (periodType === "mensual") {
        periodDays = 31; // Periodo mensual: 31 días
      }
      
      // Get project with analysis
      const project = await global.storage.getProjectWithAnalysis(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get content history for this project to avoid repetition
      const contentHistory = await global.storage.listContentHistoryByProject(projectId);
      const previousContent = contentHistory.map(entry => entry.content);
      
      // Generate schedule using Grok AI, passing previous content
      console.log("[CALENDAR] Iniciando generación de cronograma");
      console.log("[CALENDAR] Instrucciones adicionales: ", additionalInstructions || "Ninguna");
      
      // Intentamos generar el cronograma
      const generatedSchedule = await generateSchedule(
        project.name,
        {
          client: project.client,
          description: project.description,
          ...project.analysis
        },
        startDate,
        specifications,
        periodDays, // Usar el número de días según el tipo de periodo seleccionado
        previousContent,
        additionalInstructions // Pasamos las instrucciones adicionales a la función
      );
      
      // Save schedule to database
      const scheduleData: any = {
        projectId,
        name: generatedSchedule.name,
        startDate: new Date(startDate),
        specifications,
        additionalInstructions, // Guardar instrucciones adicionales en la base de datos
        createdBy: req.user.id
        // Omitimos los campos aiModel y periodType que ya no existen en la base de datos
      };
      
      const schedule = await global.storage.createSchedule(scheduleData);
      
      // Save schedule entries without generating images automatically
      const entryPromises = generatedSchedule.entries.map(async (entry) => {
        // 1. Crear la entrada en la base de datos
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
        
        // 2. Guardar el contenido en el historial para evitar repeticiones
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
          // Continuamos aunque no se pueda guardar el historial
        }
        
        // Ya no generamos imágenes automáticamente para evitar problemas con las APIs
        // El usuario podrá generar las imágenes manualmente desde la interfaz cuando sea necesario
        
        return savedEntry;
      });
      
      // Wait for all entries to be processed
      await Promise.all(entryPromises);
      
      // Get the schedule with all its entries
      const scheduleWithEntries = await global.storage.getScheduleWithEntries(schedule.id);
      
      res.status(201).json(scheduleWithEntries);
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      
      // Extraer tipo de error si está disponible
      const errorType = error.errorType || "UNKNOWN";
      const errorMessage = error.message || "Error desconocido";
      
      // Log detallado para diagnóstico
      console.log(`[CALENDAR ROUTE] Error tipo: ${errorType}, Mensaje: ${errorMessage}`);
      
      // Mensajes de error específicos basados en el tipo de error
      if (errorType === "NETWORK" || errorMessage.includes("connect") || errorMessage.includes("Servicio de Grok AI temporalmente no disponible")) {
        // Error de conexión o disponibilidad de Grok API
        return res.status(503).json({ 
          message: "Servicio de IA temporalmente no disponible. Por favor intenta nuevamente en unos minutos.", 
          error: errorMessage,
          errorType: "SERVICIO_NO_DISPONIBLE"
        });
      } else if (errorType === "RATE_LIMIT" || errorMessage.includes("límite de peticiones")) {
        // Error de límite de peticiones
        return res.status(429).json({ 
          message: "Hemos alcanzado el límite de generaciones. Por favor espera unos minutos antes de intentar crear otro calendario.", 
          error: errorMessage,
          errorType: "LIMITE_EXCEDIDO"
        });
      } else if (errorType === "AUTH" || errorMessage.includes("autenticación") || errorMessage.includes("authentication")) {
        // Error de autenticación con la API
        return res.status(401).json({ 
          message: "Error en la configuración del servicio de IA. Por favor contacta al administrador.", 
          error: errorMessage,
          errorType: "ERROR_AUTENTICACION"
        });
      } else if (errorType === "JSON_PARSING" || errorMessage.includes("JSON") || errorMessage.includes("parse")) {
        // Error de procesamiento de la respuesta JSON
        return res.status(422).json({
          message: "Error al procesar la respuesta del servicio de IA. Intenta con menos contenido o diferentes configuraciones.",
          error: errorMessage,
          errorType: "ERROR_FORMATO_RESPUESTA"
        });
      } else if (errorType === "JSON_PROCESSING" || errorMessage.includes("ERROR_JSON_PROCESSING")) {
        // Error en el procesamiento de datos JSON
        return res.status(422).json({
          message: "No pudimos procesar correctamente el calendario generado. Intenta con diferentes ajustes o menos plataformas.",
          error: errorMessage,
          errorType: "ERROR_DATOS"
        });
      }
      
      // Errores generales
      res.status(500).json({ 
        message: "Ocurrió un error al crear el calendario. Por favor intenta con menos plataformas o en otro momento.", 
        error: errorMessage,
        errorType: "ERROR_GENERAL"
      });
    }
  });

  app.get("/api/projects/:projectId/schedules", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      const schedules = await global.storage.listSchedulesByProject(projectId);
      res.json(schedules);
    } catch (error) {
      console.error("Error listing schedules:", error);
      res.status(500).json({ message: "Failed to list schedules" });
    }
  });

  // Get all recent schedules - IMPORTANT: esta ruta debe ir ANTES de las rutas con parámetros como :id
  app.get("/api/schedules/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Si no hay usuario autenticado, devolvemos array vacío
      if (!req.user) {
        return res.json([]);
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Obtener schedules recientes
      const recentSchedules = await global.storage.listRecentSchedules(limit);
      
      if (!recentSchedules || recentSchedules.length === 0) {
        return res.json([]); // Retornar array vacío si no hay schedules
      }
      
      // Verificar que el usuario tenga acceso a los proyectos de los schedules
      const accessibleSchedules = [];
      for (const schedule of recentSchedules) {
        try {
          if (!schedule || !schedule.projectId) {
            console.warn("Schedule incompleto encontrado en el endpoint:", schedule);
            continue; // Saltamos schedules incorrectos
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
          // Continuamos con el siguiente schedule
        }
      }
      
      res.json(accessibleSchedules);
    } catch (error) {
      console.error("Error getting recent schedules:", error);
      // Devolver array vacío en lugar de error para mejorar la experiencia del usuario
      return res.json([]);
    }
  });

  app.get("/api/schedules/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      
      const schedule = await global.storage.getScheduleWithEntries(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Check if user has access to the project this schedule belongs to
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

  app.get("/api/schedules/:id/download", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const format = req.query.format || 'excel';
      
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      
      const schedule = await global.storage.getScheduleWithEntries(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Check if user has access to the project this schedule belongs to
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this schedule" });
      }
      
      // Get project info for headers
      const project = await global.storage.getProject(schedule.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Sort entries by date
      const sortedEntries = [...schedule.entries].sort((a, b) => {
        const dateA = a.postDate ? new Date(a.postDate) : new Date(0);
        const dateB = b.postDate ? new Date(b.postDate) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      
      if (format === 'excel') {
        // Obtener el formato según la plataforma para incluirlo en el Excel
        const getFormatByPlatform = (platform: string): string => {
          const formats: Record<string, string> = {
            'Instagram': 'Carrusel/Reels • 9:16 o 1:1',
            'Facebook': 'Imagen/Video • 16:9 o 1:1',
            'Twitter': 'Imagen/GIF • 16:9',
            'LinkedIn': 'Imagen/Artículo • 16:9 o 1:1',
            'TikTok': 'Video • 9:16 vertical',
            'YouTube': 'Video • 16:9 horizontal',
            'Pinterest': 'Pin • 2:3 vertical',
            'WhatsApp': 'Imagen/Video • 1:1 o 9:16'
          };
          
          return formats[platform] || 'Formato estándar';
        };
        
        // Generate Excel file
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Cohete Workflow';
        workbook.created = new Date();
        
        // Limpiar caracteres no permitidos en nombres de hojas de Excel: * ? : \ / [ ]
        const safeWorksheetName = schedule.name.replace(/[\*\?\:\\/\[\]]/g, '-');
        
        const worksheet = workbook.addWorksheet(safeWorksheetName, {
          properties: {
            tabColor: { argb: '4F46E5' }, // Color primario (indigo)
            defaultRowHeight: 22
          }
        });
        
        // Agregar encabezado con información del cronograma
        worksheet.mergeCells('A1:J1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = schedule.name;
        titleCell.font = { size: 16, bold: true, color: { argb: '4F46E5' } };
        titleCell.alignment = { horizontal: 'center' };
        
        worksheet.mergeCells('A2:J2');
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.value = 'Cohete Workflow - Cronograma de Contenido';
        subtitleCell.font = { size: 12, color: { argb: '6B7280' } };
        subtitleCell.alignment = { horizontal: 'center' };
        
        // Agregar información del proyecto y detalles del cronograma
        worksheet.mergeCells('A3:B3');
        worksheet.getCell('A3').value = 'Proyecto:';
        worksheet.getCell('A3').font = { bold: true };
        worksheet.getCell('A3').alignment = { horizontal: 'right' };
        
        worksheet.mergeCells('C3:D3');
        worksheet.getCell('C3').value = project.name;
        worksheet.getCell('C3').font = { bold: true, color: { argb: '4F46E5' } };
        
        worksheet.mergeCells('E3:F3');
        worksheet.getCell('E3').value = 'Cliente:';
        worksheet.getCell('E3').font = { bold: true };
        worksheet.getCell('E3').alignment = { horizontal: 'right' };
        
        worksheet.mergeCells('G3:H3');
        worksheet.getCell('G3').value = project.client;
        
        worksheet.mergeCells('I3:J3');
        worksheet.getCell('I3').value = `Total de publicaciones: ${sortedEntries.length}`;
        worksheet.getCell('I3').font = { bold: true };
        worksheet.getCell('I3').alignment = { horizontal: 'right' };
        
        // Agregar fecha de generación y notas
        worksheet.mergeCells('A4:B4');
        worksheet.getCell('A4').value = 'Fecha de inicio:';
        worksheet.getCell('A4').font = { bold: true };
        worksheet.getCell('A4').alignment = { horizontal: 'right' };
        
        worksheet.mergeCells('C4:D4');
        worksheet.getCell('C4').value = new Date(schedule.startDate || new Date()).toLocaleDateString('es-ES', { 
          day: '2-digit', month: '2-digit', year: 'numeric' 
        });
        
        worksheet.mergeCells('E4:F4');
        worksheet.getCell('E4').value = 'Generado el:';
        worksheet.getCell('E4').font = { bold: true };
        worksheet.getCell('E4').alignment = { horizontal: 'right' };
        
        worksheet.mergeCells('G4:J4');
        worksheet.getCell('G4').value = new Date().toLocaleDateString('es-ES', { 
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        // Espaciado
        worksheet.mergeCells('A5:J5');
        
        // Fila de encabezados empieza en la fila 6
        const headerRowIndex = 6;
        
        // Define columns with their properties but without adding headers yet
        // (we'll manually add the headers to the specific row)
        worksheet.columns = [
          { key: 'postDate', width: 15 },
          { key: 'postTime', width: 12 },
          { key: 'platform', width: 20 },
          { key: 'format', width: 30 },
          { key: 'title', width: 35 },
          { key: 'copyIn', width: 60 },
          { key: 'copyOut', width: 60 },
          { key: 'hashtags', width: 40 },
          { key: 'designInstructions', width: 60 },
          { key: 'referenceImageUrl', width: 20 }
        ];
        
        // Agregar encabezados manualmente a la fila correspondiente
        const headerRow = worksheet.getRow(headerRowIndex);
        headerRow.values = [
          'Fecha', 'Hora', 'Plataforma', 'Formato', 'Título', 
          'Copy In (texto en diseño)', 'Copy Out (descripción)', 
          'Hashtags', 'Instrucciones de Diseño', 'URL de Imagen'
        ];
        
        // Estilo para los encabezados
        headerRow.height = 24;
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F46E5' }
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        
        // Add rows
        sortedEntries.forEach((entry, index) => {
          const rowIndex = headerRowIndex + index + 1;
          const row = worksheet.addRow({
            postDate: entry.postDate ? new Date(entry.postDate).toLocaleDateString('es-ES', { 
              day: '2-digit', month: '2-digit', year: 'numeric' 
            }) : 'Sin fecha',
            postTime: entry.postTime || 'Sin hora',
            platform: entry.platform,
            format: getFormatByPlatform(entry.platform),
            title: entry.title,
            copyIn: entry.copyIn,
            copyOut: entry.copyOut,
            hashtags: entry.hashtags,
            designInstructions: entry.designInstructions,
            referenceImageUrl: entry.referenceImageUrl ? 'Ver en plataforma' : 'Sin imagen'
          });
          
          // Aplicar estilos alternando colores para facilitar la lectura
          const fillColor = index % 2 === 0 ? 'F9FAFB' : 'F3F4F6';
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: fillColor }
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'E5E7EB' } },
              left: { style: 'thin', color: { argb: 'E5E7EB' } },
              bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
              right: { style: 'thin', color: { argb: 'E5E7EB' } }
            };
            
            // Ajustar texto para celdas con mucho contenido
            cell.alignment = { 
              vertical: 'top', 
              wrapText: true,
              shrinkToFit: false // Deshabilitar la reducción del tamaño de texto
            };
          });
          
          // Destacar la celda de plataforma con un color según el tipo
          const platformCell = row.getCell(3);
          let platformColor = '4F46E5'; // Color por defecto (indigo)
          
          switch(entry.platform) {
            case 'Instagram':
              platformColor = 'E1306C'; // Rosa Instagram
              break;
            case 'Facebook':
              platformColor = '1877F2'; // Azul Facebook
              break;
            case 'Twitter':
              platformColor = '1DA1F2'; // Azul Twitter
              break;
            case 'LinkedIn':
              platformColor = '0A66C2'; // Azul LinkedIn
              break;
            case 'TikTok':
              platformColor = '000000'; // Negro TikTok
              break;
            case 'YouTube':
              platformColor = 'FF0000'; // Rojo YouTube
              break;
            case 'Pinterest':
              platformColor = 'BD081C'; // Rojo Pinterest
              break;
            case 'WhatsApp':
              platformColor = '25D366'; // Verde WhatsApp
              break;
          }
          
          platformCell.font = { color: { argb: 'FFFFFF' }, bold: true };
          platformCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: platformColor }
          };
          platformCell.alignment = { horizontal: 'center', vertical: 'middle' };
          
          // Ajustar altura según el contenido
          const maxContentLength = Math.max(
            entry.copyIn?.length || 0,
            entry.copyOut?.length || 0,
            entry.designInstructions?.length || 0
          );
          
          // Fórmula que calcula la altura de fila basada en la longitud del contenido 
          // y ancho disponible para asegurar visibilidad completa
          const contentWidth = 60; // Ancho de las columnas más largas (copyIn, copyOut, designInstructions)
          const charsPerLine = contentWidth * 1.5; // Aproximadamente 1.5 caracteres por unidad de ancho
          const estimatedLines = Math.max(1, Math.ceil(maxContentLength / charsPerLine));
          const lineHeight = 15; // Altura aproximada por línea en puntos
          const minHeight = 40; // Altura mínima de fila
          const padding = 20; // Espacio extra para padding y bordes
          
          // Calcular altura final (con un tope máximo razonable)
          const calculatedHeight = Math.min(300, (estimatedLines * lineHeight) + padding);
          row.height = Math.max(minHeight, calculatedHeight);
          
          // Ajuste fino para contenido muy largo
          if (maxContentLength > 1000) {
            // Para contenido excepcionalmente largo, aumentar aún más
            row.height = Math.max(row.height, 200);
          }
        });
        
        // Agregar autofilters
        worksheet.autoFilter = {
          from: { row: headerRowIndex, column: 1 },
          to: { row: headerRowIndex + sortedEntries.length, column: 10 }
        };
        
        // Congelar paneles
        worksheet.views = [
          { state: 'frozen', xSplit: 4, ySplit: headerRowIndex }
        ];
        
        // Generate file and send
        const buffer = await workbook.xlsx.writeBuffer();
        const safeFileName = schedule.name.replace(/[^a-z0-9]/gi, '_');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.xlsx"`);
        res.send(buffer);
      } else if (format === 'pdf') {
        // Generar archivo PDF mejorado usando jsPDF (método alternativo sin puppeteer)
        
        // Obtener el formato según la plataforma
        const getFormatByPlatform = (platform: string): string => {
          const formats: Record<string, string> = {
            'Instagram': 'Carrusel/Reels • 9:16 o 1:1',
            'Facebook': 'Imagen/Video • 16:9 o 1:1',
            'Twitter': 'Imagen/GIF • 16:9',
            'LinkedIn': 'Imagen/Artículo • 16:9 o 1:1',
            'TikTok': 'Video • 9:16 vertical',
            'YouTube': 'Video • 16:9 horizontal',
            'Pinterest': 'Pin • 2:3 vertical',
            'WhatsApp': 'Imagen/Video • 1:1 o 9:16'
          };
          
          return formats[platform] || 'Formato estándar';
        };
        
        // Obtener color según la plataforma
        const getPlatformColor = (platform: string): string => {
          const colors: Record<string, string> = {
            'Instagram': '#E1306C',
            'Facebook': '#1877F2',
            'Twitter': '#1DA1F2',
            'LinkedIn': '#0A66C2',
            'TikTok': '#000000',
            'YouTube': '#FF0000',
            'Pinterest': '#BD081C',
            'WhatsApp': '#25D366'
          };
          
          return colors[platform] || '#4F46E5';
        };
        
        try {
          // Crear nuevo documento PDF con jsPDF
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });
          
          // Definir colores mejorados
          const primaryColor = [79/255, 70/255, 229/255]; // #4F46E5 en RGB
          const primaryLightColor = [224/255, 231/255, 255/255]; // #E0E7FF en RGB
          const grayColor = [107/255, 114/255, 128/255]; // #6B7280 en RGB
          const accentColor = [245/255, 158/255, 11/255]; // #F59E0B en RGB - Amber
          
          // Añadir imágenes y diseños
          
          // Fondo encabezado simplificado (sin bordes redondeados)
          doc.setFillColor(primaryLightColor[0], primaryLightColor[1], primaryLightColor[2]);
          doc.rect(10, 10, 277, 35, 'F');
          
          // Borde decorativo
          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setLineWidth(1.5);
          doc.line(10, 10, 287, 10);
          
          // Eliminamos el fondo decorativo lateral que podría estar causando los cuadros negros
          
          // Título con estilo mejorado
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFontSize(22);
          doc.text(schedule.name, 20, 25);
          
          // Eliminamos el logo circular que podría estar causando problemas
          
          // Subtítulo
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFontSize(12);
          doc.text('Cohete Workflow - Cronograma de Contenido', 20, 33);
          
          // Información del proyecto - Diseño en tarjetas
          const infoCards = [
            { title: 'PROYECTO', value: project.name },
            { title: 'CLIENTE', value: project.client },
            { title: 'TOTAL PUBLICACIONES', value: sortedEntries.length.toString() },
            { 
              title: 'FECHA DE INICIO', 
              value: schedule.startDate 
                ? new Date(schedule.startDate).toLocaleDateString('es-ES', { 
                    day: '2-digit', month: '2-digit', year: 'numeric' 
                  })
                : 'No definida'
            }
          ];
          
          const cardWidth = 65;
          const cardGap = 4;
          const cardsStartX = 20;
          let cardX = cardsStartX;
          
          // Añadir tarjetas de información
          infoCards.forEach(card => {
            // Fondo de tarjeta - usando rect simple en lugar de roundedRect para evitar problemas
            doc.setFillColor(0.98, 0.98, 0.98); // #fafafa
            doc.rect(cardX, 50, cardWidth, 20, 'F');
            
            // Borde superior de color
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(cardX, 50, cardWidth, 1, 'F');
            
            // Título de tarjeta
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            doc.text(card.title, cardX + 5, 55);
            
            // Valor de tarjeta
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0.1, 0.1, 0.1); // Casi negro para mejor contraste
            doc.text(card.value, cardX + 5, 62);
            
            // Avanzar a la siguiente tarjeta
            cardX += cardWidth + cardGap;
          });
          
          // Añadir fecha actual
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          const currentDate = new Date().toLocaleDateString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          });
          doc.text(`Generado el: ${currentDate}`, 260, 55, { align: 'right' });
          
          // Configuración de la tabla mejorada
          const tableStartY = 78;
          let currentY = tableStartY;
          
          // Simplificamos el área de tabla para eliminar posibles problemas con los cuadros negros
          // En lugar de usar fondos con bordes redondeados, usamos líneas simples
          doc.setDrawColor(0.9, 0.9, 0.9); // #e6e6e6 
          doc.setLineWidth(0.5);
          doc.rect(10, currentY - 3, 277, 112);
          
          // Títulos de columna
          const headers = [
            { name: 'FECHA', width: 20 },
            { name: 'HORA', width: 15 },
            { name: 'PLATAFORMA', width: 25 },
            { name: 'TÍTULO', width: 35 },
            { name: 'COPY IN', width: 50 },
            { name: 'COPY OUT', width: 50 },
            { name: 'INSTRUCCIONES', width: 50 },
            { name: 'HASHTAGS', width: 30 }
          ];
          
          // Header de tabla con diseño mejorado
          let colX = 15;
          
          // Encabezados con estilo
          headers.forEach(header => {
            // Título de columna
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(7);
            doc.text(header.name, colX, currentY);
            
            // Línea decorativa bajo el título
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(0.5);
            doc.line(colX, currentY + 1, colX + header.width - 5, currentY + 1);
            
            colX += header.width;
          });
          
          currentY += 8;
          
          // Función para truncar texto
          const truncateText = (text: string | null, maxLength: number = 45) => {
            if (!text) return '';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
          };
          
          // Añadir filas de datos con diseño mejorado
          sortedEntries.forEach((entry, index) => {
            // Verificar si necesitamos una nueva página
            if (currentY > 178) { // Dejar espacio para el pie de página
              doc.addPage();
              
              // Simplificado diseño de cabecera en nueva página para evitar problemas con cuadros negros
              doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setLineWidth(1);
              doc.line(10, 10, 287, 10);
              
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setFontSize(14);
              doc.text(schedule.name + ' (continuación)', 20, 22);
              
              // Área de tabla con líneas simples
              currentY = 40;
              doc.setDrawColor(0.9, 0.9, 0.9);
              doc.setLineWidth(0.5);
              doc.rect(10, currentY - 3, 277, 150);
              
              // Repetir encabezados
              colX = 15;
              headers.forEach(header => {
                doc.setFont('helvetica', 'bold');
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
            
            // Línea de separación sutil entre filas
            if (index > 0) {
              doc.setDrawColor(0.9, 0.9, 0.9); // #e5e5e5
              doc.setLineWidth(0.2);
              doc.line(15, currentY - 4, 280, currentY - 4);
            }
            
            // Formatear fecha
            const dateFormatted = entry.postDate 
              ? new Date(entry.postDate).toLocaleDateString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })
              : 'Sin fecha';
            
            // Convertir color de plataforma
            const platformColor = getPlatformColor(entry.platform || '');
            const r = parseInt(platformColor.slice(1, 3), 16) / 255;
            const g = parseInt(platformColor.slice(3, 5), 16) / 255;
            const b = parseInt(platformColor.slice(5, 7), 16) / 255;
            
            colX = 15;
            
            // Columna: Fecha
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(0.2, 0.2, 0.2);
            doc.text(dateFormatted, colX, currentY);
            colX += headers[0].width;
            
            // Columna: Hora 
            doc.text(entry.postTime || '-', colX, currentY);
            colX += headers[1].width;
            
            // Columna: Plataforma (con etiqueta normal en lugar de redondeada)
            if (entry.platform) {
              doc.setFillColor(r, g, b);
              doc.rect(colX, currentY - 3.5, 20, 5, 'F');
              doc.setTextColor(1, 1, 1);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.5);
              doc.text(entry.platform, colX + 10, currentY, { align: 'center' });
            }
            colX += headers[2].width;
            
            // Columna: Título
            doc.setTextColor(0.1, 0.1, 0.1);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(truncateText(entry.title, 30), colX, currentY);
            colX += headers[3].width;
            
            // Resto de columnas con texto formateado
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(0.2, 0.2, 0.2);
            
            // Copy In con formato adecuado, usando splitTextToSize para ajustar largas líneas
            const copyInLines = doc.splitTextToSize(truncateText(entry.copyIn, 80), headers[4].width - 5);
            doc.text(copyInLines, colX, currentY);
            colX += headers[4].width;
            
            // Copy Out
            const copyOutLines = doc.splitTextToSize(truncateText(entry.copyOut, 80), headers[5].width - 5);
            doc.text(copyOutLines, colX, currentY);
            colX += headers[5].width;
            
            // Instrucciones
            const instructionsLines = doc.splitTextToSize(truncateText(entry.designInstructions, 80), headers[6].width - 5);
            doc.text(instructionsLines, colX, currentY);
            colX += headers[6].width;
            
            // Hashtags con formato especial
            if (entry.hashtags) {
              const hashtagsArr = entry.hashtags.split(' ');
              const formattedHashtags = hashtagsArr.map(tag => {
                return tag.startsWith('#') ? tag : '#' + tag;
              }).join(' ');
              
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.setFont('helvetica', 'bold');
              const hashtagLines = doc.splitTextToSize(truncateText(formattedHashtags, 50), headers[7].width - 5);
              doc.text(hashtagLines, colX, currentY);
            }
            
            currentY += 10; // Espacio entre filas
          });
          
          // Añadir pie de página elegante
          const footerY = 192;
          
          // Línea decorativa
          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setLineWidth(0.5);
          doc.line(10, footerY - 2, 287, footerY - 2);
          
          // Texto de pie de página
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.setFontSize(7);
          doc.text('Generado por Cohete Workflow © 2024-2025', 15, footerY);
          
          // Añadir número de página en el lado derecho
          doc.text('Página 1 de 1', 280, footerY, { align: 'right' });
          
          // Obtener el PDF como buffer
          const pdfBuffer = doc.output('arraybuffer');
          
          // Enviar el archivo al cliente
          const safeFileName = schedule.name.replace(/[^a-z0-9]/gi, '_');
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.pdf"`);
          res.send(Buffer.from(pdfBuffer));
        } catch (error) {
          console.error("Error generando PDF:", error);
          res.status(500).json({ message: "Error al generar el PDF", details: error.message });
        }
      } else {
        // Format not supported
        return res.status(400).json({ message: "Format not supported. Use 'excel' or 'pdf'." });
      }
    } catch (error) {
      console.error("Error downloading schedule:", error);
      res.status(500).json({ message: "Failed to download schedule" });
    }
  });

  // Endpoint para generar imágenes eliminado (ya no se generan imágenes)

  // Chat API
  app.post("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { message, projectId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      if (projectId) {
        // Check if user has access to project
        const hasAccess = await global.storage.checkUserProjectAccess(
          req.user.id,
          projectId,
          req.user.isPrimary
        );
        
        if (!hasAccess) {
          return res.status(403).json({ message: "You don't have access to this project" });
        }
        
        // Get project with analysis
        const project = await global.storage.getProjectWithAnalysis(projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        // Get context from previous messages
        const previousMessages = await global.storage.listChatMessagesByProject(projectId);
        
        // Convertir los mensajes anteriores al formato requerido por OpenAI
        const formattedMessages = previousMessages.map(msg => {
          // En el schema tenemos 'role' pero la API necesita 'user' o 'assistant'
          return {
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          };
        });
        
        // Use AI to process message with project context
        const response = await processChatMessage(
          message,
          {
            name: project.name,
            client: project.client,
            description: project.description,
            ...(project.analysis || {})
          },
          formattedMessages
        );
        
        // Save user message
        await global.storage.createChatMessage({
          projectId,
          userId: req.user.id,
          content: message,
          role: 'user'
        });
        
        // Save AI response
        const savedResponse = await global.storage.createChatMessage({
          projectId,
          content: response,
          role: 'assistant'
        });
        
        res.json(savedResponse);
      } else {
        // General chat without project context
        // Use AI to process message
        const response = await processChatMessage(message, {}, []);
        
        res.json({
          content: response,
          role: 'assistant',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/projects/:projectId/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
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

  // Tasks API
  app.get("/api/projects/:projectId/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      const tasks = await global.storage.listTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error listing tasks:", error);
      res.status(500).json({ message: "Failed to list tasks" });
    }
  });

  app.post("/api/projects/:projectId/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to the project this task belongs to
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

  app.patch("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to the project this task belongs to
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      
      // Update task (only certain fields can be updated)
      const updatedTask = await global.storage.updateTask(taskId, req.body);
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to the project this task belongs to
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        task.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      
      // Delete task
      await global.storage.deleteTask(taskId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Subtasks API
  app.get("/api/tasks/:taskId/subtasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get parent task to check permissions
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to project
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

  app.post("/api/tasks/:taskId/subtasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get parent task to check permissions and set project
      const parentTask = await global.storage.getTask(taskId);
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        parentTask.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      
      // Create subtask with parent task reference
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

  // Task Comments API
  app.get("/api/tasks/:taskId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get task to check permissions
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to project
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

  app.post("/api/tasks/:taskId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get task to check permissions
      const task = await global.storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to project
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

  app.delete("/api/tasks/comments/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      // Get comment to check permissions
      const comment = await global.storage.getTaskComment(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Get task to check project access
      const task = await global.storage.getTask(comment.taskId);
      if (!task) {
        return res.status(404).json({ message: "Associated task not found" });
      }
      
      // Check if user has access to project or is comment author
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

  app.post("/api/projects/:projectId/generate-tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if user has access to project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      // Get project with analysis
      const project = await global.storage.getProjectWithAnalysis(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get all users who can be assigned to tasks
      const users = await global.storage.listUsers();
      
      // Use AI to generate tasks (to be implemented in another file)
      // For now, create a few sample tasks
      const sampleTasks = [
        {
          title: "Crear contenido para Instagram",
          description: "Desarrollar contenido visual y textual para la próxima campaña en Instagram",
          priority: "high",
          status: "pending",
          tags: ["contenido", "instagram", "marketing"],
          taskGroup: "content",
          aiGenerated: true
        },
        {
          title: "Diseñar publicaciones para Facebook",
          description: "Crear diseños para las próximas publicaciones en Facebook siguiendo la guía de estilo",
          priority: "medium",
          status: "pending",
          tags: ["diseño", "facebook", "marketing"],
          taskGroup: "design",
          aiGenerated: true
        },
        {
          title: "Revisar métricas de campaña anterior",
          description: "Analizar el rendimiento de la campaña anterior y preparar informe",
          priority: "low",
          status: "pending",
          tags: ["análisis", "métricas", "informe"],
          taskGroup: "analysis",
          aiGenerated: true
        }
      ];
      
      // Save tasks to database
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

  app.get("/api/users/me/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const tasks = await global.storage.listTasksByAssignee(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error listing user tasks:", error);
      res.status(500).json({ message: "Failed to list user tasks" });
    }
  });

  // Products API
  app.post("/api/projects/:projectId/products", isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inválido" });
      }
      
      // Verificar acceso al proyecto
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      
      // Verificar si el proyecto existe
      const project = await global.storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }
      
      // Verificar datos del producto
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "El nombre del producto es requerido" });
      }
      
      // Datos del producto
      const productData = {
        projectId,
        createdBy: req.user?.id,
        name,
        description: description || null,
        sku: null,
        price: null,
        imageUrl: req.file ? req.file.filename : null
      };
      
      // Validar con Zod
      const validatedData = insertProductSchema.parse(productData);
      
      // Crear producto
      const newProduct = await global.storage.createProduct(validatedData);
      
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error al crear el producto" });
    }
  });
  
  app.get("/api/projects/:projectId/products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "ID de proyecto inválido" });
      }
      
      // Verificar acceso al proyecto
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este proyecto" });
      }
      
      const products = await global.storage.listProductsByProject(projectId);
      res.json(products);
    } catch (error) {
      console.error("Error listing products:", error);
      res.status(500).json({ message: "Error al listar productos" });
    }
  });
  
  app.get("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inválido" });
      }
      
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      // Verificar acceso al proyecto
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
  
  app.patch("/api/products/:id", isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inválido" });
      }
      
      // Obtener el producto actual
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      // Verificar acceso al proyecto
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        product.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "No tienes acceso a este producto" });
      }
      
      // Preparar datos actualizados
      const updateData: Partial<Product> = {};
      
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description || null;
      if (req.body.sku !== undefined) updateData.sku = req.body.sku || null;
      if (req.body.price !== undefined) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
      
      // Si hay una nueva imagen
      if (req.file) {
        updateData.imageUrl = req.file.filename;
        
        // Eliminar la imagen anterior si existe
        if (product.imageUrl) {
          const oldImagePath = path.join(__dirname, '..', 'uploads', product.imageUrl);
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
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
  
  app.delete("/api/products/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto inválido" });
      }
      
      // Obtener el producto
      const product = await global.storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      // Verificar acceso al proyecto (solo usuarios primarios pueden eliminar)
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        product.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess || !req.user.isPrimary) {
        return res.status(403).json({ message: "No tienes permisos para eliminar este producto" });
      }
      
      // Eliminar la imagen asociada si existe
      if (product.imageUrl) {
        const imagePath = path.join(__dirname, '..', 'uploads', product.imageUrl);
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error("Error removing product image:", err);
        }
      }
      
      // Eliminar el producto
      await global.storage.deleteProduct(productId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error al eliminar el producto" });
    }
  });
  
  // Actualizar comentarios de una entrada del cronograma
  app.patch("/api/schedule-entries/:id/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      const { comments } = req.body;
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "ID de entrada inválido" });
      }
      
      // Verificar si la entrada existe
      const entry = await global.storage.getScheduleEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entrada no encontrada" });
      }
      
      // Actualizar los comentarios
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

  // Set up WebSocket for real-time task updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Could store subscription info to know which clients to notify
          console.log(`Client subscribed to ${data.entity} updates`);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Function to broadcast updates to all connected clients
  const broadcastUpdate = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  return httpServer;
}