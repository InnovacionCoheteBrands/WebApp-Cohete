import { grokService } from "./grok-integration";
import * as fs from 'fs/promises';
import * as path from 'path';

// Usamos exclusivamente los modelos de Grok para todas las funcionalidades de IA

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
 * Analyzes a document using Grok to extract marketing insights
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

    // Usamos Grok para el análisis de documentos
    const analysisText = await grokService.generateText(prompt, {
      model: "grok-beta", // Usando modelo principal de Grok
      temperature: 0.7,
      maxTokens: 2000
    });
    
    if (!analysisText) {
      throw new Error("Empty response from Grok AI");
    }

    // Intentar parsear la respuesta JSON
    try {
      const parsedResult = JSON.parse(analysisText) as DocumentAnalysisResult;
      console.log("Document analysis completed successfully");
      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", analysisText);
      
      // Si el JSON falla, crear un resultado básico con el texto como resumen
      return {
        summary: analysisText.substring(0, 1000) + (analysisText.length > 1000 ? "..." : "")
      };
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    
    // Crear un resultado de error más específico
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to analyze document: ${errorMessage}`);
  }
}

/**
 * Processes a chat message in the context of a marketing project
 */
/**
 * Analiza una imagen de marketing utilizando la capacidad de visión de Grok
 * @param imagePath Ruta a la imagen a analizar
 * @param analysisType Tipo de análisis a realizar: 'brand', 'content', o 'audience'
 */
export async function analyzeMarketingImage(
  imagePath: string, 
  analysisType: 'brand' | 'content' | 'audience' = 'content'
): Promise<any> {
  try {
    // Verificar que el archivo existe
    await fs.access(imagePath);
    
    // Leer archivo como Base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Seleccionar el prompt según el tipo de análisis
    let prompt: string;
    
    switch (analysisType) {
      case 'brand':
        prompt = `Analiza esta imagen desde una perspectiva de branding y marketing.
        Identifica los siguientes elementos:
        1. Elementos visuales de la marca (logo, colores, tipografía)
        2. Mensaje visual principal
        3. Posicionamiento de marca que transmite
        4. Coherencia con estándares actuales de diseño
        5. Sugerencias para mejorar la alineación de marca`;
        break;
      
      case 'audience':
        prompt = `Analiza esta imagen para identificar el público objetivo:
        1. Perfil demográfico aproximado del público objetivo
        2. Necesidades y deseos que la imagen intenta abordar
        3. Nivel de conexión emocional que podría generar
        4. Posible respuesta del público objetivo
        5. Recomendaciones para mejorar la conexión con la audiencia`;
        break;
      
      case 'content':
      default:
        prompt = `Analiza esta imagen como contenido de marketing:
        1. Tipo de contenido (promocional, educativo, inspiracional, etc.)
        2. Calidad visual y composición
        3. Mensaje principal que transmite
        4. Efectividad para captar atención
        5. Plataformas de redes sociales donde sería más efectiva
        6. Recomendaciones para optimizar su impacto`;
        break;
    }
    
    // Usar el modelo de visión de Grok para analizar la imagen
    const analysisResult = await grokService.generateTextWithImage(
      prompt,
      base64Image,
      {
        model: "grok-vision-beta",
        temperature: 0.5,
        maxTokens: 1500
      }
    );
    
    // Analizar el resultado y estructurarlo si es posible
    try {
      // Intentar extraer datos estructurados del texto
      const parsedResult = {
        analysisType,
        rawAnalysis: analysisResult,
        structuredData: extractStructuredData(analysisResult)
      };
      
      return parsedResult;
    } catch (parseError) {
      // Si no se puede estructurar, devolver el texto crudo
      return {
        analysisType,
        rawAnalysis: analysisResult,
        error: "No se pudo estructurar el análisis"
      };
    }
  } catch (error) {
    console.error("Error analizando imagen de marketing:", error);
    throw new Error(`Error en análisis visual: ${(error as Error).message}`);
  }
}

/**
 * Extrae datos estructurados de un texto de análisis
 */
function extractStructuredData(text: string): any {
  // Intentar detectar si el texto ya es JSON
  try {
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      return JSON.parse(text);
    }
  } catch (e) {
    // No es un JSON válido, seguimos con el análisis de texto
  }
  
  // Proceso heurístico para extraer secciones numeradas
  const result: Record<string, string> = {};
  
  // Buscar patrones comunes como "1. Título: Contenido"
  const sectionRegex = /(\d+)[\.\)]\s*([^:]+):\s*([^\n]+)/g;
  let match;
  
  while ((match = sectionRegex.exec(text)) !== null) {
    const [_, number, title, content] = match;
    result[title.trim()] = content.trim();
  }
  
  // Si no encontramos secciones estructuradas, intentar dividir por líneas numeradas
  if (Object.keys(result).length === 0) {
    const lineRegex = /(\d+)[\.\)]\s*([^\n]+)/g;
    
    while ((match = lineRegex.exec(text)) !== null) {
      const [_, number, content] = match;
      result[`Punto ${number}`] = content.trim();
    }
  }
  
  return Object.keys(result).length > 0 ? result : { summary: text };
}

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
