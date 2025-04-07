import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { DatabaseStorage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { analyzeDocument, processChatMessage } from "./ai-analyzer";
import { generateSchedule, generateReferenceImage } from "./ai-scheduler";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import ExcelJS from 'exceljs';
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import { hashPassword } from "./auth";
import {
  insertProjectSchema,
  insertAnalysisResultsSchema,
  insertScheduleSchema,
  insertChatMessageSchema,
  insertTaskSchema,
  insertUserSchema,
  scheduleEntries
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

const upload = multer({ 
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
      
      // Establecer como usuario secundario por defecto
      userData.isPrimary = false;
      
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

  // Endpoint para obtener todos los usuarios (para asignación de tareas)
  app.get("/api/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const users = await global.storage.listUsers();
      
      // Incluir solo información básica de usuario para seguridad
      const safeUsers = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        isPrimary: user.isPrimary
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
  app.post("/api/projects/:projectId/documents", isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
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
      const { startDate, specifications } = req.body;
      if (!startDate) {
        return res.status(400).json({ message: "Start date is required" });
      }
      
      // Get project with analysis
      const project = await global.storage.getProjectWithAnalysis(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get content history for this project to avoid repetition
      const contentHistory = await global.storage.listContentHistoryByProject(projectId);
      const previousContent = contentHistory.map(entry => entry.content);
      
      // Generate schedule using AI, passing previous content
      const generatedSchedule = await generateSchedule(
        project.name,
        {
          client: project.client,
          description: project.description,
          ...project.analysis
        },
        startDate,
        specifications,
        14, // Default duration days
        previousContent
      );
      
      // Save schedule to database
      const schedule = await global.storage.createSchedule({
        projectId,
        name: generatedSchedule.name,
        startDate: new Date(startDate),
        specifications,
        createdBy: req.user.id
      });
      
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
          hashtags: entry.hashtags,
          referenceImagePrompt: entry.referenceImagePrompt
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
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ message: "Failed to create schedule", error: error.message });
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
      
      // Sort entries by date
      const sortedEntries = [...schedule.entries].sort((a, b) => {
        return new Date(a.postDate).getTime() - new Date(b.postDate).getTime();
      });
      
      if (format === 'excel') {
        // Generate Excel file
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Cohete Workflow';
        workbook.created = new Date();
        
        const worksheet = workbook.addWorksheet(schedule.name);
        
        // Define columns
        worksheet.columns = [
          { header: 'Fecha', key: 'postDate', width: 12 },
          { header: 'Hora', key: 'postTime', width: 8 },
          { header: 'Plataforma', key: 'platform', width: 12 },
          { header: 'Título', key: 'title', width: 20 },
          { header: 'Descripción', key: 'description', width: 20 },
          { header: 'Copy In', key: 'copyIn', width: 30 },
          { header: 'Copy Out', key: 'copyOut', width: 30 },
          { header: 'Hashtags', key: 'hashtags', width: 20 },
          { header: 'Instrucciones de Diseño', key: 'designInstructions', width: 30 },
          { header: 'URL de Imagen', key: 'referenceImageUrl', width: 50 }
        ];
        
        // Add rows
        sortedEntries.forEach((entry) => {
          worksheet.addRow({
            postDate: new Date(entry.postDate).toLocaleDateString(),
            postTime: entry.postTime,
            platform: entry.platform,
            title: entry.title,
            description: entry.description,
            copyIn: entry.copyIn,
            copyOut: entry.copyOut,
            hashtags: entry.hashtags,
            designInstructions: entry.designInstructions,
            referenceImageUrl: entry.referenceImageUrl || 'Sin imagen'
          });
        });
        
        // Apply some styling
        worksheet.getRow(1).font = { bold: true };
        
        // Generate file and send
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${schedule.name.replace(/[^a-z0-9]/gi, '_')}.xlsx"`);
        res.send(buffer);
      } else if (format === 'pdf') {
        // Generar archivo PDF con html-pdf-node
        const pdf = require('html-pdf-node');
        
        // Crear tabla HTML para el PDF
        let htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
                th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                .image-cell { width: 100px; height: 100px; text-align: center; }
                .image-container { width: 100px; height: 100px; overflow: hidden; display: inline-block; }
                .image-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
                h1 { font-size: 18px; margin-bottom: 5px; }
                .subtitle { font-size: 14px; color: #666; margin-top: 0; }
                @page { size: A4 landscape; margin: 1cm; }
              </style>
            </head>
            <body>
              <h1>${schedule.name}</h1>
              <p class="subtitle">Cohete Workflow - Cronograma de Contenido</p>
              <table>
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Plataforma</th>
                    <th>Título</th>
                    <th>Copy In</th>
                    <th>Copy Out</th>
                    <th>Hashtags</th>
                    <th>Imagen</th>
                  </tr>
                </thead>
                <tbody>
        `;
        
        // Agregar filas a la tabla
        sortedEntries.forEach((entry) => {
          const dateFormatted = new Date(entry.postDate).toLocaleDateString();
          const imageHtml = entry.referenceImageUrl 
            ? `<div class="image-container"><img src="${entry.referenceImageUrl}" alt="${entry.title}"></div>` 
            : 'Sin imagen';
          
          htmlContent += `
            <tr>
              <td>${dateFormatted} ${entry.postTime || ''}</td>
              <td>${entry.platform}</td>
              <td>${entry.title}</td>
              <td>${entry.copyIn ? entry.copyIn.substring(0, 150) + (entry.copyIn.length > 150 ? '...' : '') : ''}</td>
              <td>${entry.copyOut ? entry.copyOut.substring(0, 150) + (entry.copyOut.length > 150 ? '...' : '') : ''}</td>
              <td>${entry.hashtags || ''}</td>
              <td class="image-cell">${imageHtml}</td>
            </tr>
          `;
        });
        
        // Cerrar la tabla y el HTML
        htmlContent += `
                </tbody>
              </table>
            </body>
          </html>
        `;
        
        // Opciones para la generación del PDF
        const options = { 
          format: 'A4',
          landscape: true,
          margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
          printBackground: true,
          preferCSSPageSize: true,
        };
        
        // Generar el PDF
        const file = { content: htmlContent };
        
        try {
          const pdfBuffer = await pdf.generatePdf(file, options);
          
          // Enviar el archivo al cliente
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${schedule.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
          res.send(pdfBuffer);
        } catch (pdfError) {
          console.error("Error generating PDF:", pdfError);
          res.status(500).json({ message: "Failed to generate PDF" });
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

  app.post("/api/schedule-entries/:id/generate-image", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await global.storage.getScheduleEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Get schedule to check project access
      const schedule = await global.storage.getSchedule(entry.scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Check if user has access to the project
      const hasAccess = await global.storage.checkUserProjectAccess(
        req.user.id,
        schedule.projectId,
        req.user.isPrimary
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this entry" });
      }
      
      // Check if entry has a prompt
      const prompt = entry.referenceImagePrompt || req.body.prompt;
      if (!prompt) {
        return res.status(400).json({ message: "No prompt available for image generation" });
      }
      
      // Generate image
      const imageUrl = await generateReferenceImage(prompt);
      
      // Update entry with new image URL
      await global.storage.updateScheduleEntry(entryId, {
        referenceImageUrl: imageUrl
      });
      
      res.json({ referenceImageUrl: imageUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

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
        createdBy: req.user.id
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
            createdBy: req.user.id
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

  // Get all recent schedules
  app.get("/api/schedules/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const schedules = await global.storage.listRecentSchedules(limit);
      res.json(schedules);
    } catch (error) {
      console.error("Error getting recent schedules:", error);
      res.status(500).json({ message: "Failed to get recent schedules" });
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
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  return httpServer;
}