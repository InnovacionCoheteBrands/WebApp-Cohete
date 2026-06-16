// Servicio de integración con Gemini
import { geminiService } from "./gemini-integration";
// Módulos de Node.js para manejo de archivos
import * as fs from 'fs/promises';
import * as path from 'path';
import { GroqProvider } from "./ai-runtime/provider";
import { feedbackLoopInsightSchema, socialMetricSchema, type FeedbackLoopInsight, type SocialMetric } from "./schema";

// ===== CONFIGURACIÓN DE IA =====
// Usamos exclusivamente los modelos de Grok para todas las funcionalidades de IA

// ===== INTERFACE PARA RESULTADOS DE ANÁLISIS =====
type StrategicProjectContext = {
  name?: string;
  client?: string;
  description?: string;
  analysisResults?: Record<string, unknown> | null;
  [key: string]: unknown;
};

interface BrandBrainContext {
  brandName: string;
  clientName: string;
  description?: string;
  brandTone: string;
  buyerPersona: string;
  uvp?: string;
  voiceOfCustomer?: string;
  mission?: string;
  vision?: string;
  coreValues?: string;
}

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getAnalysisResults(context?: StrategicProjectContext): Record<string, unknown> | undefined {
  if (!context?.analysisResults || typeof context.analysisResults !== "object") {
    return undefined;
  }

  return context.analysisResults;
}

function getStrategicField(context: StrategicProjectContext | undefined, ...keys: string[]): string | undefined {
  const analysisResults = getAnalysisResults(context);

  for (const key of keys) {
    const directValue = readNonEmptyString(context?.[key]);
    if (directValue) {
      return directValue;
    }

    const nestedValue = readNonEmptyString(analysisResults?.[key]);
    if (nestedValue) {
      return nestedValue;
    }
  }

  return undefined;
}

function resolveBrandBrainContext(projectContext?: StrategicProjectContext): BrandBrainContext {
  return {
    brandName: getStrategicField(projectContext, "name", "projectName") || "la marca del proyecto",
    clientName: getStrategicField(projectContext, "client") || "cliente no especificado",
    description: getStrategicField(projectContext, "description"),
    brandTone: getStrategicField(projectContext, "brandTone", "brandCommunicationStyle") || "no especificado",
    buyerPersona: getStrategicField(projectContext, "buyerPersona", "targetAudience") || "no especificado",
    uvp: getStrategicField(projectContext, "uvp"),
    voiceOfCustomer: getStrategicField(projectContext, "voiceOfCustomer", "keywords"),
    mission: getStrategicField(projectContext, "mission"),
    vision: getStrategicField(projectContext, "vision"),
    coreValues: getStrategicField(projectContext, "coreValues"),
  };
}

function buildBrandBrainPromptSection(brandBrain: BrandBrainContext): string {
  return `
CONTEXTO ESTRATÃ‰GICO DE MARCA:
- Marca: ${brandBrain.brandName}
- Cliente: ${brandBrain.clientName}
- Tono de marca: ${brandBrain.brandTone}
- Buyer Persona: ${brandBrain.buyerPersona}
${brandBrain.uvp ? `- UVP: ${brandBrain.uvp}` : "- UVP: No registrada"}
${brandBrain.voiceOfCustomer ? `- VoC / Voz del cliente: ${brandBrain.voiceOfCustomer}` : ""}
${brandBrain.description ? `- DescripciÃ³n del proyecto: ${brandBrain.description}` : ""}
${brandBrain.mission ? `- MisiÃ³n: ${brandBrain.mission}` : ""}
${brandBrain.vision ? `- VisiÃ³n: ${brandBrain.vision}` : ""}
${brandBrain.coreValues ? `- Valores centrales: ${brandBrain.coreValues}` : ""}
`;
}

/**
 * Estructura que define los resultados del análisis de documentos de marketing
 * Contiene todos los elementos clave extraídos por la IA
 */
export interface DocumentAnalysisResult {
  mission?: string; // Misión de la empresa/marca
  vision?: string; // Visión de la empresa/marca
  objectives?: string; // Objetivos de marketing específicos
  targetAudience?: string; // Descripción de la audiencia objetivo
  brandTone?: string; // Tono y voz de la marca
  keywords?: string; // Palabras clave importantes
  coreValues?: string; // Valores fundamentales de la marca
  contentThemes?: { // Temas de contenido identificados
    theme: string; // Nombre del tema
    keywords: string[]; // Palabras clave asociadas al tema
  }[];
  competitorAnalysis?: { // Análisis de competencia si se encuentra
    name: string; // Nombre del competidor
    strengths: string; // Fortalezas identificadas
    weaknesses: string; // Debilidades encontradas
    contentStrategy: string; // Estrategia de contenido del competidor
  }[];
  summary: string; // Resumen general del análisis
}

/**
 * ===== FUNCIÓN PRINCIPAL DE ANÁLISIS DE DOCUMENTOS =====
 * Analiza un documento utilizando Grok AI para extraer insights de marketing
 * @param documentText - Texto del documento a analizar
 * @returns Promise con los resultados del análisis estructurado
 */
export async function analyzeDocument(
  documentText: string,
  projectContext?: StrategicProjectContext
): Promise<DocumentAnalysisResult> {
  try {
    const brandBrain = resolveBrandBrainContext(projectContext);
    const brandBrainSection = buildBrandBrainPromptSection(brandBrain);
    const prompt = `
      Analiza este documento asumiendo el rol de experto estratÃ©gico para la marca "${brandBrain.brandName}", cuyo tono es "${brandBrain.brandTone}" y su Buyer Persona es "${brandBrain.buyerPersona}".

      ${brandBrainSection}

      OBJETIVO:
      Extrae insights de marketing accionables sin perder la alineaciÃ³n con la estrategia de marca.
      Prioriza cualquier hallazgo relacionado con la UVP, la voz del cliente, el tono de marca, el buyer persona y el posicionamiento diferencial.

      Identifica como mÃ­nimo:
      1. MisiÃ³n y visiÃ³n de la marca
      2. Objetivos de marketing/comunicaciÃ³n
      3. Audiencia o buyer persona implÃ­cito
      4. Tono y voz de marca
      5. Keywords y mensajes repetidos
      6. Valores centrales
      7. Temas de contenido con keywords asociadas
      8. AnÃ¡lisis de competencia si aparece

      Responde ÃšNICAMENTE en JSON vÃ¡lido con esta estructura:
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
      
      MantÃ©n los textos concisos pero Ãºtiles. Si un campo no aparece en el documento, omÃ­telo del JSON.

      Documento a analizar:
      ${documentText}
    `;

    // Usamos Gemini para el análisis de documentos
    const analysisText = await geminiService.generateText(prompt, {
      model: "gemini-1.5-pro",
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: "json"
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
  analysisType: 'brand' | 'content' | 'audience' = 'content',
  projectContext?: StrategicProjectContext
): Promise<any> {
  try {
    // Verificar que el archivo existe
    await fs.access(imagePath);
    
    // Leer archivo como Base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const brandBrain = resolveBrandBrainContext(projectContext);
    const brandBrainSection = buildBrandBrainPromptSection(brandBrain);
    
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
    prompt = `Analiza esta imagen asumiendo el rol de experto para la marca "${brandBrain.brandName}", cuyo tono es "${brandBrain.brandTone}" y su Buyer Persona es "${brandBrain.buyerPersona}".
    ${brandBrainSection}
    EvalÃºa siempre la coherencia de la pieza con la UVP, la voz del cliente y la estrategia general del proyecto.

    ${prompt}`;

    const analysisResult = await geminiService.generateTextWithImage(
      prompt,
      base64Image,
      {
        model: "gemini-1.5-pro",
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
    const strategicChatContext = projectContext
      ? buildBrandBrainPromptSection(resolveBrandBrainContext(projectContext as StrategicProjectContext))
      : "";
    let promptText = `${systemPrompt}\n${strategicChatContext}\n\n`;
    
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

    // Usar el servicio de Gemini con el modelo solicitado
    const response = await geminiService.generateText(promptText, {
      model: "gemini-1.5-pro",
      temperature: 0.7,
      maxTokens: 1000
    });

    return response || "Lo siento, no pude procesar esa solicitud.";
  } catch (error) {
    console.error("Error procesando mensaje de chat:", error);
    throw new Error(`Error al procesar mensaje de chat: ${(error as Error).message}`);
  }
}

function parseMetricNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const normalized = value.replace(/[%,$\s]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseSocialMetricsCsv(csvText: string): SocialMetric[] {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return [];
  }

  const [headerLine, ...rows] = trimmed.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((header) => header.trim().toLowerCase());

  return rows
    .map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const record = headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] || "";
        return acc;
      }, {});

      return {
        platform: record.platform || record.red || "unknown",
        format: record.format || record.formato || undefined,
        title: record.title || record.titulo || undefined,
        publishedAt: record.publishedat || record.fecha || undefined,
        impressions: parseMetricNumber(record.impressions || record.impresiones),
        reach: parseMetricNumber(record.reach || record.alcance),
        engagement: parseMetricNumber(record.engagement || record.interacciones),
        engagementRate: parseMetricNumber(record.engagementrate || record.engagement_rate || record.tasa_engagement),
        clicks: parseMetricNumber(record.clicks || record.clics),
        saves: parseMetricNumber(record.saves || record.guardados),
        shares: parseMetricNumber(record.shares || record.compartidos),
        comments: parseMetricNumber(record.comments || record.comentarios),
        conversions: parseMetricNumber(record.conversions || record.conversiones),
      };
    })
    .filter((metric) => metric.platform && metric.platform !== "unknown")
    .map((metric) => socialMetricSchema.parse(metric));
}

function summarizeMetrics(metrics: SocialMetric[]) {
  const totals = metrics.reduce((acc, metric) => {
    acc.impressions += metric.impressions || 0;
    acc.reach += metric.reach || 0;
    acc.engagement += metric.engagement || 0;
    acc.clicks += metric.clicks || 0;
    acc.conversions += metric.conversions || 0;
    return acc;
  }, {
    impressions: 0,
    reach: 0,
    engagement: 0,
    clicks: 0,
    conversions: 0,
  });

  const byPlatform = new Map<string, { engagement: number; reach: number; count: number }>();
  const byFormat = new Map<string, { engagement: number; count: number }>();

  for (const metric of metrics) {
    const platformKey = metric.platform || "unknown";
    const platformAggregate = byPlatform.get(platformKey) || { engagement: 0, reach: 0, count: 0 };
    platformAggregate.engagement += metric.engagement || 0;
    platformAggregate.reach += metric.reach || 0;
    platformAggregate.count += 1;
    byPlatform.set(platformKey, platformAggregate);

    if (metric.format) {
      const formatAggregate = byFormat.get(metric.format) || { engagement: 0, count: 0 };
      formatAggregate.engagement += metric.engagement || 0;
      formatAggregate.count += 1;
      byFormat.set(metric.format, formatAggregate);
    }
  }

  const topPlatform = Array.from(byPlatform.entries())
    .sort((a, b) => (b[1].engagement + b[1].reach) - (a[1].engagement + a[1].reach))[0];
  const topFormat = Array.from(byFormat.entries())
    .sort((a, b) => b[1].engagement - a[1].engagement)[0];

  return {
    totals,
    topPlatform: topPlatform ? topPlatform[0] : undefined,
    topFormat: topFormat ? topFormat[0] : undefined,
  };
}

function buildFallbackFeedback(metrics: SocialMetric[], projectContext?: StrategicProjectContext): FeedbackLoopInsight {
  const summary = summarizeMetrics(metrics);
  const tone = resolveBrandBrainContext(projectContext).brandTone;
  const highPerformingPatterns = [
    summary.topPlatform ? `La mejor tracción se concentra en ${summary.topPlatform}.` : null,
    summary.topFormat ? `El formato más sólido es ${summary.topFormat}.` : null,
  ].filter(Boolean) as string[];

  const recommendedActions = [
    summary.topPlatform ? `Redistribuir el calendario para dar más peso a ${summary.topPlatform}.` : "Priorizar el canal con mejor reach histórico.",
    summary.topFormat ? `Repetir el formato ${summary.topFormat} con nuevas variantes de hook.` : "Probar al menos dos formatos creativos distintos en la siguiente iteración.",
    `Mantener el tono ${tone} pero reforzar mensajes con prueba social y CTA más directo.`,
  ];

  return {
    summary: `Se analizaron ${metrics.length} piezas con ${summary.totals.engagement} interacciones totales y ${summary.totals.reach} de alcance agregado.`,
    highPerformingPatterns,
    lowPerformingPatterns: [],
    recommendedActions,
    contentOpportunities: [
      "Crear una nueva tanda de piezas centradas en beneficios concretos.",
      "A/B testear hooks y formatos para capturar aprendizaje incremental.",
    ],
  };
}

export async function analyzeSocialPerformance(
  metrics: SocialMetric[],
  projectContext?: StrategicProjectContext,
): Promise<FeedbackLoopInsight> {
  const normalizedMetrics = metrics.map((metric) => socialMetricSchema.parse(metric));
  if (normalizedMetrics.length === 0) {
    return {
      summary: "No se recibieron métricas suficientes para generar recomendaciones.",
      highPerformingPatterns: [],
      lowPerformingPatterns: [],
      recommendedActions: [],
      contentOpportunities: [],
    };
  }

  const provider = new GroqProvider();
  const brandBrain = resolveBrandBrainContext(projectContext);
  const prompt = [
    "Actúa como analista senior de performance para marketing.",
    "Evalúa patrones de rendimiento y recomienda ajustes para el siguiente ciclo editorial.",
    "Devuelve solo JSON válido.",
    "",
    buildBrandBrainPromptSection(brandBrain),
    "",
    "Métricas normalizadas:",
    JSON.stringify(normalizedMetrics.slice(0, 50), null, 2),
    "",
    "Formato esperado:",
    JSON.stringify({
      summary: "resumen ejecutivo",
      highPerformingPatterns: ["patrón 1"],
      lowPerformingPatterns: ["patrón 1"],
      recommendedActions: ["acción 1"],
      contentOpportunities: ["oportunidad 1"],
    }, null, 2),
  ].join("\n");

  try {
    const response = await provider.generateStructured({
      model: "qwen/qwen3-32b",
      prompt,
      temperature: 0.2,
      maxCompletionTokens: 1600,
      schema: feedbackLoopInsightSchema,
    });

    return feedbackLoopInsightSchema.parse(response.data);
  } catch (error) {
    return buildFallbackFeedback(normalizedMetrics, projectContext);
  }
}
