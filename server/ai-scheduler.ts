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
          // Calculate posts per period based on monthly frequency
          const postsPerPeriod = Math.ceil(network.postsPerMonth * (durationDays / 30));
          
          return {
            name: network.name,
            postsPerMonth: network.postsPerMonth,
            postsForPeriod: postsPerPeriod,
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
          - Distribución: Uniforme durante el periodo
          - Fecha de Fin (Referencia): ${endDate}
          - IMPORTANTE: Respeta estrictamente la duración indicada.

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
    
    try {
      // Estrategia 1: Extraer y parsear directamente
      const jsonStart = scheduleText.indexOf('{');
      const jsonEnd = scheduleText.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          const jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          const parsedContent = JSON.parse(jsonContent);
          
          if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
            console.log(`Cronograma parseado correctamente con ${parsedContent.entries.length} entradas`);
            return parsedContent;
          }
        } catch (error) {
          console.error("Error al parsear JSON completo:", error);
        }
      }
      
      // Estrategia 2: Extraer y limpiar el JSON antes de parsearlo
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          
          // Limpiar problemas comunes
          jsonContent = jsonContent.replace(/}\s*{/g, '},{');
          jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          jsonContent = jsonContent.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
          jsonContent = jsonContent.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
          
          const parsedContent = JSON.parse(jsonContent);
          
          if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
            console.log(`Cronograma limpiado y parseado con ${parsedContent.entries.length} entradas`);
            return parsedContent;
          }
        } catch (error) {
          console.error("Error al parsear JSON limpiado:", error);
        }
      }
      
      // Estrategia 3: Extraer objetos individuales
      try {
        const entriesRegex = /{[^{]*"title"[^}]*"platform"[^}]*"postDate"[^}]*}/g;
        const validEntries: ContentScheduleEntry[] = [];
        let match;
        
        while ((match = entriesRegex.exec(scheduleText)) !== null) {
          try {
            let entryText = match[0];
            entryText = entryText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
            entryText = entryText.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
            
            const entry = JSON.parse(entryText);
            if (entry.title && entry.platform && entry.postDate) {
              validEntries.push(entry);
            }
          } catch (e) {
            // Ignorar entradas inválidas
          }
        }
        
        if (validEntries.length > 0) {
          console.log(`Recuperadas ${validEntries.length} entradas de forma individual`);
          
          // Extraer nombre si es posible
          const nameMatch = scheduleText.match(/"name"\s*:\s*"([^"]+)"/);
          const name = nameMatch ? nameMatch[1] : `Cronograma para ${projectName}`;
          
          return {
            name: name,
            entries: validEntries
          };
        }
      } catch (error) {
        console.error("Error al extraer entradas individuales:", error);
      }
      
      // Fallback final
      console.log("Usando cronograma fallback");
      return {
        name: `Cronograma para ${projectName}`,
        entries: [
          {
            title: "Publicación principal para redes sociales",
            description: "Este es un cronograma básico para comenzar. Por favor regenera para obtener más opciones.",
            content: "Contenido detallado para la red social principal del proyecto.",
            copyIn: "Texto integrado para diseño",
            copyOut: "Texto para descripción en redes sociales ✨",
            designInstructions: "Diseño basado en la identidad visual del proyecto",
            platform: "Instagram",
            postDate: formattedDate,
            postTime: "12:00",
            hashtags: "#marketing #contenido #socialmedia"
          }
        ]
      };
    } catch (generalError) {
      console.error("Error general procesando respuesta:", generalError);
      // Fallback final en caso de error general
      return {
        name: `Cronograma para ${projectName}`,
        entries: [
          {
            title: "Publicación principal para redes sociales",
            description: "Este es un cronograma básico para comenzar. Por favor regenera para obtener más opciones.",
            content: "Contenido detallado para la red social principal del proyecto.",
            copyIn: "Texto integrado para diseño",
            copyOut: "Texto para descripción en redes sociales ✨",
            designInstructions: "Diseño basado en la identidad visual del proyecto",
            platform: "Instagram",
            postDate: formattedDate,
            postTime: "12:00",
            hashtags: "#marketing #contenido #socialmedia"
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
