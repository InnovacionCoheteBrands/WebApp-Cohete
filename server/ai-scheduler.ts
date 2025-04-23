import { format, parseISO, addDays } from "date-fns";
import { AIModel } from "@shared/schema";
import { grokService } from "./grok-integration";

// Solo usamos la integración de Grok para IA

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
}

export interface ContentSchedule {
  name: string;
  entries: ContentScheduleEntry[];
}

/**
 * Genera un cronograma de contenido para redes sociales usando exclusivamente Grok AI
 * Tiene en cuenta la frecuencia mensual de publicaciones definida para cada red social
 */
export async function generateSchedule(
  projectName: string,
  projectDetails: any,
  startDate: string,
  specifications?: string,
  durationDays: number = 15, // Periodo quincenal fijo (15 días)
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

      3.  **Periodo del Cronograma Quincenal:**
          - Fecha de Inicio: ${formattedDate}
          - Duración: 15 días (periodo quincenal fijo)
          - Distribución: Uniforme quincenal
          - Fecha de Fin (Referencia): ${endDate}
          - IMPORTANTE: El cronograma debe ser SIEMPRE quincenal (15 días), independientemente de otros parámetros.

      4.  **Especificaciones Adicionales del Usuario:** ${specifications || "Ninguna especificación adicional proporcionada."}
          *Interpretación Clave Requerida:* Incorpora estas especificaciones en el cronograma donde sea relevante.

      5.  **Redes Sociales y Directrices Específicas:**
          ${socialNetworksSection || "No se especificaron redes sociales. Basado en 'Detalles Clave del Proyecto', sugiere las 2-3 redes más relevantes y una cadencia óptima para cada una."}
          *Interpretación Clave Requerida:* **Adapta el tipo de contenido, formato y frecuencia** a las mejores prácticas y directrices de CADA red social especificada o sugerida. Considera los formatos nativos (Reels, Stories, etc.).

      6.  **Contexto de Contenido Previo (Opcional):**
          ${previousContentSection || "No se proporcionó información sobre contenido previo. Enfócate en las mejores prácticas y los detalles del proyecto."}
          *Interpretación Clave Requerida:* Si se proporciona, **analiza insights clave** (qué funcionó/no funcionó, temas/formatos exitosos) y úsalos activamente para informar las nuevas ideas. Evita repetir errores, potencia éxitos.

      **III. FORMATO DE SALIDA OBLIGATORIO:**

      Devuelve el cronograma en formato JSON, con todo el contenido en español:
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
            "hashtags": "Mezcla estratégica de hashtags en español"
          }
        ]
      }
    `;

    // Usamos exclusivamente Grok AI para generar el cronograma
    console.log("Generando cronograma con Grok AI");
    const scheduleText = await grokService.generateText(prompt);
    
    // Intentar parsear el resultado como JSON con un enfoque más robusto
    try {
      // Primero depuramos la respuesta
      console.log("Longitud de la respuesta de Grok:", scheduleText.length);
      console.log("Primeros 200 caracteres:", scheduleText.substring(0, 200));
      
      // Intentamos encontrar el JSON usando una expresión regular más precisa
      // Buscamos específicamente un objeto JSON que tenga las propiedades esperadas
      const jsonRegex = /{[\s\S]*?"name"[\s\S]*?"entries"[\s\S]*?}/;
      const jsonMatch = scheduleText.match(jsonRegex);
      
      if (jsonMatch) {
        console.log("Encontrado JSON completo con regex");
        try {
          return JSON.parse(jsonMatch[0]) as ContentSchedule;
        } catch (parseError) {
          console.error("Error parseando JSON encontrado con regex:", parseError);
          // Continuamos con otros métodos si este falla
        }
      }
      
      // Si el regex específico falla, intentamos extraer manualmente el JSON
      console.log("Intentando extracción manual del JSON");
      const jsonStart = scheduleText.indexOf('{');
      const jsonEnd = scheduleText.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonPart = scheduleText.substring(jsonStart, jsonEnd);
        console.log("JSON extraído manualmente (longitud):", jsonPart.length);
        
        try {
          // Intentamos limpiar el JSON de posibles errores
          let cleanedJson = jsonPart;
          // Reemplazar comas extra antes de cerrar objetos o arrays
          cleanedJson = cleanedJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          const parsed = JSON.parse(cleanedJson);
          
          if (parsed && parsed.entries && Array.isArray(parsed.entries)) {
            console.log("JSON parseado manualmente con éxito, entradas:", parsed.entries.length);
            return {
              name: parsed.name || `Cronograma para ${projectName}`,
              entries: parsed.entries
            };
          } else {
            console.error("El JSON extraído no tiene la estructura esperada");
          }
        } catch (jsonError) {
          console.error("Error parseando JSON extraído manualmente:", jsonError);
        }
      }
      
      // Si todos los intentos anteriores fallan, tratamos de reconstruir el JSON
      console.error("No se pudo parsear el JSON con métodos estándar, intentando reconstrucción");
      console.log("Respuesta original (primeros 1000 caracteres):", scheduleText.substring(0, 1000));
      
      // Intentamos una última estrategia
      try {
        // Buscar partes del JSON que podamos utilizar
        const nameMatch = scheduleText.match(/"name"\s*:\s*"([^"]+)"/);
        const entriesStartMatch = scheduleText.match(/"entries"\s*:\s*\[/);
        
        if (nameMatch && entriesStartMatch) {
          console.log("Encontrados elementos clave para reconstrucción parcial");
          // Reconstruimos un JSON mínimo válido con el nombre y al menos una entrada
          return {
            name: nameMatch[1] || `Cronograma para ${projectName}`,
            entries: [
              {
                title: "Reconstrucción parcial",
                description: "Este es un cronograma reconstruido parcialmente debido a problemas de formato en la respuesta.",
                content: "Contenido recuperado parcialmente. Recomendamos revisar y personalizar este contenido.",
                copyIn: "Texto recuperado parcialmente",
                copyOut: "Texto descriptivo recuperado parcialmente",
                designInstructions: "Instrucciones de diseño básicas",
                platform: "Red social principal",
                postDate: formattedDate,
                postTime: "12:00",
                hashtags: "#reconstruido #marketing #contenido"
              }
            ]
          };
        }
      } catch (reconstructError) {
        console.error("Error en la reconstrucción final:", reconstructError);
      }
      
      // Si no se pudo recuperar, crear un cronograma mínimo como fallback
      console.log("Usando cronograma fallback debido a error de parseo");
      return {
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
            hashtags: "#ejemplo #cronograma #marketing"
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw new Error(`Failed to generate schedule: ${(error as Error).message}`);
  }
}

// Función de generación de imágenes eliminada (ya no se generan imágenes)
