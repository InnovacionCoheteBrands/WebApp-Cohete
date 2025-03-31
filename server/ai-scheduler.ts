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
      Create a detailed social media content schedule for a project named "${projectName}".
      
      Project details:
      ${JSON.stringify(projectDetails, null, 2)}
      
      Schedule requirements:
      - Start date: ${formattedDate}
      - Duration: ${durationDays} days (until ${endDate})
      - Special specifications: ${specifications || "None provided"}
      
      ${previousContentSection}
      
      Actúa como un Experto en Marketing Digital y Creación de Contenido optimizado por IA. Genera contenido para múltiples plataformas (Instagram, Facebook, TikTok, LinkedIn, Twitter) basado en el público objetivo y los objetivos del proyecto.

      Sigue estos pasos para cada entrada:
      1. Comprende el proyecto: Objetivos, metas y audiencia
      2. Adapta el contenido a cada plataforma específica
      3. Crea contenido impactante y persuasivo
      4. Integra emojis estratégicamente
      5. Asegura que el mensaje se alinee con la voz y valores de la marca

      Para cada pieza de contenido incluye:
      1. Un título/encabezado impactante
      2. Descripción breve del contenido
      3. Texto principal - Para mensajería general
      4. Copy In - Texto integrado en el diseño (corto, impactante, con emojis estratégicos)
      5. Copy Out - Texto para descripción/caption (adaptado a cada plataforma, con llamada a la acción clara)
      6. Instrucciones de diseño - Guía detallada para crear visuales
      7. Plataforma - Red social específica y sus mejores prácticas
      8. Fecha de publicación (formato YYYY-MM-DD)
      9. Hora de publicación (formato HH:MM)
      10. Hashtags relevantes (5-10 hashtags específicos por post)
      11. Prompt detallado para generar imagen de referencia con IA
      
      Guías específicas por plataforma:
      - Instagram: Enfoque visual, textos cortos y atractivos, uso estratégico de emojis, stories y Reels. Tono cercano y aspiracional.
      - Facebook: Textos más detallados, contenido que genere comunidad, llamadas a la acción claras. Tono conversacional y empático.
      - TikTok: Contenido breve, entretenido y tendencia. Uso de audio viral y engagement rápido. Tono divertido y auténtico.
      - LinkedIn: Tono profesional pero cercano, insights de industria, contenido de valor. Enfoque en credibilidad y expertise.
      - Twitter: Mensajes concisos e ingeniosos, temas tendencia, interacción rápida. Tono directo y memorable.

      Consideraciones importantes:
      - Adapta el tono y estilo a cada plataforma
      - Usa emojis estratégicamente para reforzar el mensaje
      - Incluye llamadas a la acción claras y específicas
      - Mantén la coherencia con la voz de la marca
      - Optimiza el contenido según las limitaciones de cada plataforma
      
      Devuelve el cronograma en el siguiente formato JSON, con todo el contenido en español EXCEPTO el "referenceImagePrompt" que debe mantenerse en inglés:
      {
        "name": "Nombre del cronograma",
        "entries": [
          {
            "title": "Título en español",
            "description": "Descripción en español",
            "content": "Contenido principal en español",
            "copyIn": "Texto integrado en español",
            "copyOut": "Texto para descripción en español",
            "designInstructions": "Instrucciones de diseño en español",
            "platform": "Nombre de la plataforma",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "Hashtags en español cuando sea posible",
            "referenceImagePrompt": "Image prompt in English"
          }
        ]
      }
      
      REQUERIMIENTOS IMPORTANTES:
      - Asegura una buena mezcla de tipos de contenido (educativo, promocional, engagement, etc.)
      - Varía los horarios de publicación estratégicamente según las mejores prácticas de cada plataforma
      - Haz que cada entrada sea específica para su plataforma en formato y estilo
      - Proporciona instrucciones de diseño muy detalladas que un diseñador pueda seguir
      - Los prompts de referencia para imágenes deben mantenerse en inglés y estar diseñados para producir visualizaciones profesionales de alta calidad
      - El cronograma debe tener sentido como una campaña cohesiva
      - NO repitas ni imites de cerca ningún contenido utilizado previamente
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
 * Generates a reference image prompt for a social media post
 */
export async function generateReferenceImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data[0]?.url) {
      throw new Error("No image URL returned from DALL-E");
    }

    return response.data[0].url;
  } catch (error) {
    console.error("Error generating reference image:", error);
    throw new Error(`Failed to generate reference image: ${(error as Error).message}`);
  }
}
