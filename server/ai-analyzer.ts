import OpenAI from "openai";
import { grokService } from "./grok-integration";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface DocumentAnalysisResult {
  mission?: string;
  vision?: string;
  objectives?: string;
  targetAudience?: string;
  brandTone?: string;
  keywords?: string;
  coreValues?: string;
  contentThemes?: {
    theme: string;
    keywords: string[];
  }[];
  competitorAnalysis?: {
    name: string;
    strengths: string;
    weaknesses: string;
    contentStrategy: string;
  }[];
  summary: string;
}

/**
 * Analyzes a document using GPT-4o to extract marketing insights
 */
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysisResult> {
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

    // Usamos Grok Vision para el análisis de documentos
    const analysisText = await grokService.generateText(prompt, {
      model: "grok-vision-beta", // Usando modelo de visión de Grok
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: "json_object"
    });
    
    if (!analysisText) {
      throw new Error("Empty response from Grok AI");
    }

    return JSON.parse(analysisText) as DocumentAnalysisResult;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${(error as Error).message}`);
  }
}

/**
 * Processes a chat message in the context of a marketing project
 */
export async function processChatMessage(
  message: string,
  projectContext?: any,
  chatHistory?: { role: string; content: string }[]
): Promise<string> {
  try {
    // Usar el servicio de Grok en lugar de OpenAI
    const systemPrompt = projectContext 
      ? `Eres un asistente de marketing para un proyecto llamado "${projectContext.name}" para el cliente "${projectContext.client}". 
         Utiliza el siguiente contexto del proyecto en tus respuestas cuando sea relevante:
         ${JSON.stringify(projectContext, null, 2)}`
      : "Eres un asistente de marketing para Cohete Workflow, una plataforma de gestión de proyectos de marketing.";

    // Preparar los mensajes para la API
    let promptText = systemPrompt + "\n\n";
    
    // Añadir el historial de chat al prompt
    if (chatHistory && chatHistory.length > 0) {
      promptText += "Historial de conversación:\n";
      for (const msg of chatHistory) {
        promptText += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
      }
      promptText += "\n";
    }
    
    // Añadir el mensaje actual
    promptText += `Usuario: ${message}\n\nAsistente:`;

    // Usar el servicio de Grok con el modelo solicitado
    const response = await grokService.generateText(promptText, {
      model: "grok-3-mini-beta", // Usando modelo de la familia Grok 3
      temperature: 0.7,
      maxTokens: 1000
    });

    return response || "Lo siento, no pude procesar esa solicitud.";
  } catch (error) {
    console.error("Error procesando mensaje de chat:", error);
    throw new Error(`Error al procesar mensaje de chat: ${(error as Error).message}`);
  }
}
