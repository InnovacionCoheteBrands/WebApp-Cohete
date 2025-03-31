import OpenAI from "openai";
import { format, parseISO, addDays } from "date-fns";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface ContentScheduleEntry {
  title: string;
  description: string;
  content: string;
  copyIn: string;      // Texto integrado dentro del diseño
  copyOut: string;     // Texto para la descripción del post
  designInstructions: string; // Indicaciones para el departamento de diseño
  platform: string;
  postDate: string; // ISO string format
  postTime: string; // HH:MM format
  hashtags: string;
  referenceImagePrompt?: string;
}

export interface ContentSchedule {
  name: string;
  entries: ContentScheduleEntry[];
}

/**
 * Generates a content schedule for social media using GPT-4o
 */
export async function generateSchedule(
  projectName: string,
  projectDetails: any,
  startDate: string,
  specifications?: string,
  durationDays: number = 14,
  previousContent: string[] = []
): Promise<ContentSchedule> {
  try {
    // Format the start date using date-fns
    const formattedDate = format(parseISO(startDate), 'yyyy-MM-dd');
    const endDate = format(addDays(parseISO(startDate), durationDays), 'yyyy-MM-dd');
    
    // Prepare previous content section
    const previousContentSection = previousContent.length > 0
      ? `Previously used content (AVOID REPEATING THESE TOPICS AND IDEAS):
        ${previousContent.join('\n')}`
      : "No previous content history available.";
    
    const prompt = `
      Crea un cronograma detallado de contenido para redes sociales para el proyecto "${projectName}".
      
      DETALLES DEL PROYECTO:
      ${JSON.stringify(projectDetails, null, 2)}
      
      REQUISITOS DEL CRONOGRAMA:
      - Fecha de inicio: ${formattedDate}
      - Duración: ${durationDays} días (hasta ${endDate})
      - Especificaciones adicionales: ${specifications || "No proporcionadas"}
      
      ${previousContentSection}
      
      INSTRUCCIONES MAESTRAS:
      Actúa como un Director de Marketing Digital con 15 años de experiencia en Creación de Contenido de Alto Rendimiento. Tu misión es crear un cronograma de contenido que verdaderamente impulse los objetivos comerciales mientras resuena con la audiencia objetivo del proyecto.

      METODOLOGÍA AVANZADA PARA CADA PUBLICACIÓN:
      1. Analiza profundamente: Objetivos comerciales, insights del mercado y psicología de la audiencia
      2. Personaliza estratégicamente: Adapta cada pieza a las particularidades y algoritmos de cada plataforma
      3. Optimiza para conversión: Utiliza principios de psicología persuasiva y storytelling emocional
      4. Diseña para impacto visual: Crea instrucciones que resulten en diseños memorables y alineados con la marca
      5. Secuencia estratégicamente: Asegura que cada pieza construya sobre las anteriores para crear una narrativa cohesiva

      ELEMENTOS CLAVE POR PIEZA DE CONTENIDO:
      1. Título: Altamente específico, evocativo e intrigante (máx. 60 caracteres)
      2. Descripción: Resumen conciso orientado a beneficios (máx. 150 caracteres)
      3. Contenido principal: Mensaje completo estructurado para engagement máximo
      4. Copy In: Texto integrado en el diseño - impactante, directo, sin emojis (máx. 60 caracteres)
      5. Copy Out: Texto para caption - persuasivo, estructurado en párrafos, con llamada a la acción clara y emojis estratégicos
      6. Instrucciones de diseño: Extraordinariamente detalladas, incluyendo composición, paleta de colores, tipografía, jerarquía visual y elementos específicos
      7. Plataforma: Red social específica con formato adaptado a sus particularidades
      8. Fecha y hora: Optimizadas según métricas actuales de engagement por plataforma
      9. Hashtags: Combinación estratégica de hashtags populares, nicho y marca
      10. Prompt para imagen: Detallado y técnico, diseñado para generar referencias visuales profesionales

      ESPECIFICIDADES POR PLATAFORMA:
      - Instagram: 
         * Feed: Visuales impactantes, máximo 2250 caracteres en caption, 3-5 párrafos con espaciado
         * Stories: Copy mínimo, diseño inmersivo, incluir elementos interactivos
         * Reels: Energía alta, tendencia, guión con gancho en primeros 3 segundos
      
      - Facebook: 
         * Posts estándar: Hasta 400 caracteres para mejor engagement, incluir elemento visual
         * Videos: Optimizados para visualización sin sonido, subtítulos incluidos
         * Artículos/Notas: Contenido valioso y detallado, estructura clara
      
      - TikTok: 
         * Estructura: Gancho (3s) + Contenido principal (20-25s) + CTA (2-3s)
         * Estilo: Auténtico, entretenido, uso de trending sounds
         * Descripción: Concisa, con pregunta o intriga
      
      - LinkedIn: 
         * Estructura: Gancho inicial + Valor principal + Insight profesional + CTA
         * Tono: Profesional pero conversacional, enfocado en expertise
         * Formato: Párrafos cortos, espaciados, uso de bullet points para escaneabilidad
      
      - Twitter: 
         * Tweets principales: 240-250 caracteres máximo para permitir engagement
         * Hilos: 4-6 tweets conectados, cada uno auto-contenido
         * Elementos: Pregunta provocativa o estadística sorprendente + insight + CTA
      
      TÉCNICAS AVANZADAS DE COPYWRITING:
      - Utiliza la estructura AIDA (Atención, Interés, Deseo, Acción) para copyOut
      - Implementa principios de escasez y exclusividad cuando sea relevante
      - Incorpora storytelling micro-narrativo para crear conexión emocional
      - Usa gatillos psicológicos específicos según la plataforma y audiencia
      - Evita absolutamente frases genéricas como "¡No te lo pierdas!" o "Más información en nuestro link"
      
      FORMATO DE ENTREGA:
      Devuelve el cronograma en formato JSON, con todo el contenido en español EXCEPTO el "referenceImagePrompt" que DEBE estar en inglés:
      {
        "name": "Nombre del cronograma - creativo y específico al proyecto",
        "entries": [
          {
            "title": "Título impactante en español",
            "description": "Descripción persuasiva en español",
            "content": "Contenido principal detallado en español",
            "copyIn": "Texto integrado conciso e impactante en español",
            "copyOut": "Texto estructurado para descripción en español con emojis estratégicos",
            "designInstructions": "Instrucciones ultra-detalladas de diseño en español",
            "platform": "Plataforma específica",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "Mezcla estratégica de hashtags en español",
            "referenceImagePrompt": "DETAILED IMAGE PROMPT IN ENGLISH with specific art direction, composition, lighting, style, and technical specifications"
          }
        ]
      }
      
      REQUERIMIENTOS CRÍTICOS:
      - Crea un balance estratégico entre contenido educativo (30%), inspiracional (25%), promocional (25%) y de engagement (20%)
      - Optimiza los horarios según métricas actuales de engagement por plataforma y segmento
      - Asegura variedad visual en el feed al alternar formatos y composiciones
      - Proporciona instrucciones de diseño extraordinariamente detalladas y ejecutables
      - Desarrolla prompts de imágenes en inglés técnicamente sofisticados para generar visuales profesionales
      - Diseña el cronograma como una campaña estratégica integrada, no como publicaciones aisladas
      - Absolutamente EVITA repetir contenido, temas o enfoques utilizados previamente
      - Los copyIn deben ser concisos e impactantes, adecuados para superponerse en imágenes
      - Los copyOut deben usar estructura de párrafos y ser persuasivos con llamadas a la acción específicas
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const scheduleText = response.choices[0].message.content;
    if (!scheduleText) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(scheduleText) as ContentSchedule;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${(error as Error).message}`);
  }
}

/**
 * Genera una imagen de referencia para publicaciones en redes sociales usando Mistral AI
 * Como la biblioteca cliente de Mistral no soporta directamente la generación de imágenes,
 * usamos la API de OpenAI como fallback pero con el prompt preparado para ser de alta calidad
 */
export async function generateReferenceImage(prompt: string): Promise<string> {
  try {
    console.log(`Generando imagen con prompt: ${prompt}`);
    
    // Mejorar el prompt para obtener mejores resultados
    const enhancedPrompt = `Professional marketing image for social media: ${prompt}. High quality, professional lighting, brand appropriate, suitable for advertising, photorealistic, detailed.`;
    
    // Usar OpenAI mientras la integración con Mistral se completa
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data[0]?.url) {
      throw new Error("No image URL returned from image generation");
    }

    return response.data[0].url;
  } catch (error) {
    console.error("Error al generar imagen de referencia:", error);
    // Proporcionar información detallada del error para facilitar la depuración
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido';
    throw new Error(`Error al generar imagen de referencia: ${errorMessage}`);
  }
}
