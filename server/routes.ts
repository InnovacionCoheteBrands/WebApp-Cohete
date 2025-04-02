import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { DatabaseStorage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { analyzeDocument } from "./ai-analyzer";
import { generateSchedule, generateReferenceImage } from "./ai-scheduler";
import { processChatMessage } from "./ai-analyzer";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import ExcelJS from 'exceljs';
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import {
  insertProjectSchema,
  insertAnalysisResultsSchema,
  insertScheduleSchema,
  insertChatMessageSchema,
  scheduleEntries
} from "@shared/schema";

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
      
      // Save schedule entries and generate images
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
        
        // 3. Generar imagen automáticamente si hay un prompt
        if (savedEntry.referenceImagePrompt) {
          try {
            console.log(`Generating image for entry ${savedEntry.id}: ${savedEntry.title}`);
            const imageUrl = await generateReferenceImage(savedEntry.referenceImagePrompt);
            
            // 4. Actualizar la entrada con la URL de la imagen
            await global.storage.updateScheduleEntry(savedEntry.id, {
              referenceImageUrl: imageUrl
            });
          } catch (imgError) {
            console.error(`Error generating image for entry ${savedEntry.id}:`, imgError);
            // Continuamos con el proceso incluso si falla la generación de imagen
          }
        }
        
        return savedEntry;
      });
      
      // Esperar a que se completen todas las operaciones
      await Promise.all(entryPromises);
      
      // Get complete schedule with entries
      const completeSchedule = await global.storage.getScheduleWithEntries(schedule.id);
      res.status(201).json(completeSchedule);
    } catch (error) {
      console.error("Error generating schedule:", error);
      res.status(500).json({ message: "Failed to generate schedule" });
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
      
      // Get basic schedule info first
      const basicSchedules = await global.storage.listSchedulesByProject(projectId);
      
      // Then get full details with entries for each schedule
      const schedulesWithEntries = await Promise.all(
        basicSchedules.map(async (schedule) => {
          try {
            const fullSchedule = await global.storage.getScheduleWithEntries(schedule.id);
            return fullSchedule || {
              ...schedule,
              entries: []
            };
          } catch (err) {
            console.error(`Error getting entries for schedule ${schedule.id}:`, err);
            // Return the schedule without entries if there's an error
            return {
              ...schedule,
              entries: []
            };
          }
        })
      );
      
      res.json(schedulesWithEntries);
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
      
      // Create Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Cronograma', {
        properties: {
          tabColor: { argb: '1E40AF' },
          defaultRowHeight: 25
        }
      });
      
      // Configurar propiedades del libro
      workbook.creator = 'Cohete Workflow';
      workbook.lastModifiedBy = 'Cohete Workflow';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // Formatear encabezados
      worksheet.columns = [
        { header: '📅 Fecha', key: 'date', width: 15 },
        { header: '⏰ Hora', key: 'time', width: 10 },
        { header: '📱 Plataforma', key: 'platform', width: 15 },
        { header: '📝 Título', key: 'title', width: 30 },
        { header: '📋 Descripción', key: 'description', width: 40 },
        { header: '🎨 Texto en Diseño', key: 'copyIn', width: 40 },
        { header: '📢 Texto Descripción', key: 'copyOut', width: 40 },
        { header: '🎯 Instrucciones Diseño', key: 'designInstructions', width: 40 },
        { header: '📏 Formato', key: 'format', width: 20 },
        { header: '#️⃣ Hashtags', key: 'hashtags', width: 30 },
        { header: '🖼️ URL Imagen', key: 'imageUrl', width: 50 },
        { header: '🤖 Prompt Imagen', key: 'imagePrompt', width: 50 }
      ];
      
      // Añadir logo o título decorativo
      worksheet.mergeCells('A1:K1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '📊 Cronograma de Contenido - Cohete Workflow';
      titleCell.font = {
        size: 20,
        bold: true,
        color: { argb: 'FF1E40AF' }
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
      };
      
      // Ajustar el inicio de los datos
      worksheet.insertRow(2, []);
      
      // Estilo de encabezados
      worksheet.getRow(3).font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' }, 
        size: 12,
        name: 'Arial'
      };
      worksheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };
      worksheet.getRow(3).height = 35;
      
      // Bordes para encabezados
      worksheet.getRow(3).eachCell((cell) => {
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF1E40AF' } },
          left: { style: 'thin', color: { argb: 'FF1E40AF' } },
          bottom: { style: 'medium', color: { argb: 'FF1E40AF' } },
          right: { style: 'thin', color: { argb: 'FF1E40AF' } }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
      });
      
      // Formato para fechas
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        });
      };
      
      // Añadir datos de entradas (empezando desde la fila 4 por el título)
      let rowIndex = 4;
      schedule.entries.forEach((entry) => {
        // Determinar formato según la plataforma
        let format;
        switch(entry.platform.toLowerCase()) {
          case 'instagram':
            format = 'Feed: 1080x1080px\nStories: 1080x1920px\nReels: 1080x1920px';
            break;
          case 'facebook':
            format = 'Feed: 1200x630px\nStories: 1080x1920px\nReels: 1080x1920px';
            break;
          case 'twitter':
            format = 'Post: 1600x900px';
            break;
          case 'linkedin':
            format = 'Post: 1200x627px';
            break;
          case 'tiktok':
            format = 'Video: 1080x1920px';
            break;
          default:
            format = 'Formato estándar';
        }
        
        const row = worksheet.addRow({
          date: formatDate(entry.postDate.toString()),
          time: entry.postTime,
          platform: entry.platform,
          title: entry.title,
          description: entry.description,
          copyIn: entry.copyIn,
          copyOut: entry.copyOut,
          designInstructions: entry.designInstructions,
          format: format,
          hashtags: entry.hashtags,
          imageUrl: entry.referenceImageUrl || 'No disponible',
          imagePrompt: entry.referenceImagePrompt || 'No disponible'
        });
        
        // Ajustar altura de fila según el contenido
        row.height = 40;
        
        // Aplicar estilos específicos a ciertas columnas
        row.getCell('platform').font = { bold: true };
        row.getCell('title').font = { bold: true, color: { argb: 'FF1E40AF' } };
        
        // Ajustar el texto para que sea visible
        row.eachCell((cell) => {
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: 'left',
            wrapText: true 
          };
        });
      });
      
      // Aplicar estilos a las celdas
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) { // Excluir título y encabezados
          row.eachCell((cell) => {
            // Bordes más estilizados
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
            };
            
            // Fuente base para todas las celdas
            cell.font = { 
              ...cell.font, // Mantener estilos específicos si existen
              name: 'Arial',
              size: 11
            };
          });
          
          // Alternar colores de fondo para filas
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' } // Azul muy claro
            };
          }
        }
      });
      
      // Congelar la primera fila
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];
      
      // Configurar respuesta para descargar archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=cronograma_${schedule.name.replace(/\s+/g, '_')}.xlsx`);
      
      // Escribir archivo a response
      await workbook.xlsx.write(res);
      res.end();
      
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).json({ message: "Failed to generate Excel file" });
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
        return res.status(404).json({ message: "Schedule entry not found" });
      }
      
      // Get the schedule to check project access
      const schedule = await global.storage.getSchedule(entry.scheduleId);
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
        return res.status(403).json({ message: "You don't have access to this project" });
      }
      
      // Check if entry has an image prompt
      if (!entry.referenceImagePrompt) {
        return res.status(400).json({ message: "No image prompt available for this entry" });
      }
      
      // Generate image using DALL-E
      const imageUrl = await generateReferenceImage(entry.referenceImagePrompt);
      
      // Update entry with image URL
      const updatedEntry = await global.storage.updateScheduleEntry(entryId, {
        referenceImageUrl: imageUrl
      });
      
      res.json(updatedEntry);
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
      
      let projectContext = null;
      
      // If projectId is provided, check access and get project data
      if (projectId) {
        const parsedId = parseInt(projectId);
        if (isNaN(parsedId)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }
        
        // Check if user has access to project
        const hasAccess = await global.storage.checkUserProjectAccess(
          req.user.id,
          parsedId,
          req.user.isPrimary
        );
        
        if (!hasAccess) {
          return res.status(403).json({ message: "You don't have access to this project" });
        }
        
        // Get project with analysis for context
        const project = await global.storage.getProjectWithAnalysis(parsedId);
        if (project) {
          projectContext = {
            ...project,
            analysis: project.analysis
          };
        }
        
        // Get previous chat messages for context
        const previousMessages = await global.storage.listChatMessagesByProject(parsedId);
        const chatHistory = previousMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Save user message
        await global.storage.createChatMessage({
          projectId: parsedId,
          userId: req.user.id,
          content: message,
          role: 'user'
        });
        
        // Process message with AI
        const aiResponse = await processChatMessage(message, projectContext, chatHistory);
        
        // Save AI response
        const savedResponse = await global.storage.createChatMessage({
          projectId: parsedId,
          content: aiResponse,
          role: 'assistant'
        });
        
        res.json(savedResponse);
      } else {
        // General chat without project context
        
        // Process message with AI
        const aiResponse = await processChatMessage(message);
        
        res.json({
          content: aiResponse,
          role: 'assistant',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error processing chat:", error);
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
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Recent Schedules API
  app.get("/api/schedules/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Obtener los schedules recientes
      const recentSchedules = await global.storage.listRecentSchedules();
      
      if (!recentSchedules || !Array.isArray(recentSchedules)) {
        return res.json([]);
      }
      
      // Preparar array para los schedules accesibles
      const accessibleSchedules = [];
      
      // Procesar cada schedule
      for (const schedule of recentSchedules) {
        try {
          // Verificar que el schedule tenga los campos necesarios
          if (!schedule || !schedule.projectId) {
            console.warn("Schedule missing projectId:", schedule);
            continue;
          }
          
          // Verificar que el schedule tenga ID
          if (!schedule.id) {
            console.warn("Schedule missing ID:", schedule);
            continue;
          }
          
          // Verificar acceso del usuario al proyecto
          try {
            const hasAccess = await global.storage.checkUserProjectAccess(
              req.user.id,
              schedule.projectId,
              req.user.isPrimary
            );
            
            if (hasAccess) {
              try {
                // Obtener entradas para este schedule con manejo explícito de errores
                const entries = await global.storage.listEntriesBySchedule(schedule.id);
                
                // Añadir el schedule con sus entradas
                accessibleSchedules.push({
                  ...schedule,
                  entries: entries || []
                });
              } catch (entriesError) {
                console.error(`Error getting entries for schedule ${schedule.id}:`, entriesError);
                // Añadir el schedule sin entradas
                accessibleSchedules.push({
                  ...schedule,
                  entries: []
                });
              }
            }
          } catch (accessError) {
            console.error(`Error checking access for schedule ${schedule.id}:`, accessError);
            continue;
          }
        } catch (scheduleError) {
          console.error(`Error processing schedule:`, scheduleError);
          // Continuar con el siguiente schedule
          continue;
        }
      }
      
      res.json(accessibleSchedules);
    } catch (error) {
      console.error("Error fetching recent schedules:", error);
      res.status(500).json({ message: "Failed to fetch recent schedules" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}


