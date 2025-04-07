import OpenAI from "openai";
import { format, parseISO, addDays } from "date-fns";
import { mistralService } from "./mistral-integration";

// Mantenemos OpenAI como fallback, pero usamos principalmente Mistral AI
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
 * Generates a content schedule for social media using Mistral AI
 * Takes into account the monthly frequency of posts defined for each social network
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
    
    // Extract social networks with monthly post frequency data
    let socialNetworksSection = "";
    try {
      const socialNetworks = projectDetails?.analysisResults?.socialNetworks || [];
      const selectedNetworks = socialNetworks
        .filter((network: any) => network.selected && typeof network.postsPerMonth === 'number')
        .map((network: any) => {
          // Calculate posts per two weeks based on monthly frequency
          // For a 14-day period (2 weeks), we multiply the monthly rate by (14/30)
          const postsPerTwoWeeks = Math.ceil(network.postsPerMonth * (durationDays / 30));
          
          return {
            name: network.name,
            postsPerMonth: network.postsPerMonth,
            postsForPeriod: postsPerTwoWeeks,
            contentTypes: network.contentTypes || []
          };
        });
      
      if (selectedNetworks.length > 0) {
        socialNetworksSection = `
        DISTRIBUCIÓN DE PUBLICACIONES:
        ${JSON.stringify(selectedNetworks, null, 2)}
        
        IMPORTANTE: Respeta la cantidad de publicaciones por red social indicada en "postsForPeriod".
        `;
      }
    } catch (error) {
      console.warn("Error processing social networks frequency data:", error);
      socialNetworksSection = "No hay información específica sobre la frecuencia de publicaciones.";
    }
    
    // Prepare previous content section
    const previousContentSection = previousContent.length > 0
      ? `Previously used content (AVOID REPEATING THESE TOPICS AND IDEAS):
        ${previousContent.join('\n')}`
      : "No previous content history available.";
    
    const prompt = `
      Actúa como un **Director de Marketing Digital Estratégico y Creativo** con 15 años de experiencia, especializado en la creación de contenido de alto rendimiento basado en datos y enfocado en ROI para redes sociales. Eres experto en traducir objetivos de negocio en planes de contenido accionables, optimizar para cada plataforma y adaptarte a las tendencias del mercado.

      Tu misión es generar un **CRONOGRAMA DE CONTENIDO DETALLADO Y ESTRUCTURADO** para el proyecto "${projectName}" que impulse sus objetivos comerciales y resuene profundamente con su audiencia objetivo, listo para ser implementado.

      **I. DATOS DE ENTRADA DEL PROYECTO:**

      1.  **Nombre del Proyecto:** ${projectName}
      2.  **Detalles Clave del Proyecto (Formato JSON):**
          \`\`\`json
          ${typeof projectDetails === 'string' ? projectDetails : JSON.stringify(projectDetails, null, 2)}
          \`\`\`
          *Interpretación Clave Requerida:* **Extrae y utiliza activamente** la siguiente información de este JSON para fundamentar TODO el cronograma:
            - **Objetivos de Negocio/KPIs:** (ej. leads, ventas, engagement, awareness). Cada post debe alinearse a uno.
            - **Audiencia Objetivo:** (ej. demografía, intereses, puntos de dolor, motivaciones). Adapta el contenido y tono a ellos.
            - **Voz y Tono de Marca:** Mantén la coherencia estricta.
            - **Pilares de Contenido/Temas Clave:** Úsalos como base para las ideas de posts.
            - **Productos/Servicios a Promocionar:** Intégralos estratégicamente.

      3.  **Periodo del Cronograma:**
          - Fecha de Inicio: ${formattedDate}
          - Duración: ${durationDays} días
          - Fecha de Fin (Referencia): ${endDate}

      4.  **Especificaciones Adicionales del Usuario:** ${specifications || "Ninguna especificación adicional proporcionada."}
          *Interpretación Clave Requerida:* Incorpora estas especificaciones en el cronograma donde sea relevante.

      5.  **Redes Sociales y Directrices Específicas:**
          ${socialNetworksSection || "No se especificaron redes sociales. Basado en 'Detalles Clave del Proyecto', sugiere las 2-3 redes más relevantes y una cadencia óptima para cada una."}
          *Interpretación Clave Requerida:* **Adapta el tipo de contenido, formato y frecuencia** a las mejores prácticas y directrices de CADA red social especificada o sugerida. Considera los formatos nativos (Reels, Stories, etc.).

      6.  **Contexto de Contenido Previo (Opcional):**
          ${previousContentSection || "No se proporcionó información sobre contenido previo. Enfócate en las mejores prácticas y los detalles del proyecto."}
          *Interpretación Clave Requerida:* Si se proporciona, **analiza insights clave** (qué funcionó/no funcionó, temas/formatos exitosos) y úsalos activamente para informar las nuevas ideas. Evita repetir errores, potencia éxitos.

      **II. INSTRUCCIONES DETALLADAS PARA LA GENERACIÓN DEL CRONOGRAMA:**

      1.  **Estrategia de Contenido Clara:**
          - Define una **mezcla estratégica de pilares de contenido** (ej. 60% Educativo, 20% Interactivo, 10% Promocional, 10% Comunitario) basada en los objetivos y la audiencia.
          - Establece una **cadencia de publicación** y horarios sugeridos óptimos por red social, considerando la audiencia.

      2.  **Generación de Entradas Detalladas por Post:**
          - Para cada día y red social programada, crea una entrada detallada con:
            - **Idea/Brief de Contenido:** Ángulo específico y mensaje clave
            - **Sugerencia Visual/Copy:** Indicación útil y específica
            - **Hashtags Estratégicos:** 3-5 hashtags relevantes
            - **Objetivo Específico del Post (KPI):** Vinculado a objetivos definidos
            - **Llamada a la Acción (CTA):** Clara y medible

      3.  **Coherencia y Adaptación:**
          - Mantén tono consistente con la marca
          - Adapta el mensaje a la audiencia y plataforma

      **III. FORMATO DE SALIDA OBLIGATORIO:**

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
      - IMPORTANTE: Respeta ESTRICTAMENTE el número de publicaciones solicitado para cada red social según el valor "postsForPeriod" indicado en la distribución de publicaciones
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

    // Usar la API de Mistral para generar el cronograma
    console.log("Generando cronograma con Mistral AI");
    const scheduleText = await mistralService.generateText(prompt);
    
    // Intentar parsear el resultado como JSON
    try {
      // Para asegurarnos que obtenemos sólo el JSON, extraemos cualquier parte JSON de la respuesta
      const jsonRegex = /{[\s\S]*}/;
      const jsonMatch = scheduleText.match(jsonRegex);
      
      if (!jsonMatch) {
        throw new Error("No se encontró un objeto JSON válido en la respuesta de Mistral");
      }
      
      const jsonContent = jsonMatch[0];
      return JSON.parse(jsonContent) as ContentSchedule;
    } catch (parseError) {
      console.error("Error al parsear la respuesta de Mistral como JSON:", parseError);
      console.log("Respuesta original:", scheduleText);
      
      // Crear un cronograma mínimo como fallback (en caso de emergencia)
      const fallbackSchedule: ContentSchedule = {
        name: `Cronograma para ${projectName}`,
        entries: [
          {
            title: "Publicación de ejemplo",
            description: "Este es un cronograma básico de ejemplo generado como fallback.",
            content: "Contenido generado como fallback debido a un error en la generación del cronograma completo.",
            copyIn: "Texto de ejemplo",
            copyOut: "Texto de descripción de ejemplo",
            designInstructions: "Instrucciones de diseño básicas",
            platform: "Instagram",
            postDate: formattedDate,
            postTime: "12:00",
            hashtags: "#ejemplo #cronograma #marketing",
            referenceImagePrompt: "Marketing content calendar example image, professional design"
          }
        ]
      };
      
      throw new Error("Error al parsear la respuesta de Mistral como JSON. Verifica los registros del servidor para más detalles.");
    }
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${(error as Error).message}`);
  }
}

/**
 * Genera una imagen de referencia para publicaciones en redes sociales usando Mistral AI
 * Implementación actualizada para usar la API de Mistral directamente
 */
export async function generateReferenceImage(prompt: string): Promise<string> {
  try {
    console.log(`Generando imagen con prompt: ${prompt}`);
    
    // Utilizar el servicio de Mistral para generar la imagen
    return await mistralService.generateImage(prompt);
  } catch (mistralError) {
    console.error("Error al generar imagen con Mistral:", mistralError);
    
    try {
      console.log("Fallback: Intentando generar imagen con OpenAI");
      
      // Mejorar el prompt para obtener mejores resultados
      const enhancedPrompt = `Professional marketing image for social media: ${prompt}. High quality, professional lighting, brand appropriate, suitable for advertising, photorealistic, detailed.`;
      
      // Usar OpenAI como fallback si Mistral falla
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!response.data[0]?.url) {
        throw new Error("No image URL returned from OpenAI image generation");
      }

      return response.data[0].url;
    } catch (openaiError) {
      console.error("Error al generar imagen con OpenAI:", openaiError);
      // Proporcionar información detallada del error para facilitar la depuración
      const errorMessage = openaiError instanceof Error 
        ? openaiError.message 
        : 'Error desconocido';
      throw new Error(`Error al generar imagen de referencia: ${errorMessage}`);
    }
  }
}
