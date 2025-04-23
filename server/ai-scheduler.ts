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
    const scheduleText = await grokService.generateText(prompt, {
      // Aumentamos temperatura para evitar respuestas demasiado estructuradas que puedan causar problemas
      temperature: 0.4,
      // Aumentamos tokens máximos para obtener respuestas más completas
      maxTokens: 4000
    });
    
    // Registramos una versión truncada para debug
    console.log("Respuesta de Grok AI (primeros 200 caracteres):", 
      scheduleText.substring(0, 200) + "... [truncado]");
    
    try {
      // Registro posiciones
      const jsonStart = scheduleText.indexOf('{');
      const jsonEnd = scheduleText.lastIndexOf('}') + 1;
      console.log(`Posiciones JSON detectadas: inicio=${jsonStart}, fin=${jsonEnd}`);
      
      // Estrategia 1: Extraer y parsear directamente
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          const jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          // Registrar longitud para depuración
          console.log(`Longitud del contenido JSON: ${jsonContent.length} caracteres`);
          
          const parsedContent = JSON.parse(jsonContent);
          
          if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
            console.log(`Cronograma parseado correctamente con ${parsedContent.entries.length} entradas`);
            // Verificar que las entradas tengan los campos requeridos mínimos
            const validEntries = parsedContent.entries.filter((entry: any) => 
              entry.title && entry.platform && entry.postDate && 
              typeof entry.title === 'string' &&
              typeof entry.platform === 'string' &&
              typeof entry.postDate === 'string'
            );
            
            if (validEntries.length === parsedContent.entries.length) {
              // Todas las entradas son válidas
              return parsedContent;
            } else {
              // Algunas entradas son inválidas, pero tenemos suficientes
              if (validEntries.length > 0) {
                console.log(`Se filtraron ${parsedContent.entries.length - validEntries.length} entradas inválidas`);
                return {
                  name: parsedContent.name || `Cronograma para ${projectName}`,
                  entries: validEntries
                };
              }
              // Si no hay entradas válidas, continuamos con la siguiente estrategia
            }
          }
        } catch (error) {
          console.error("Error al parsear JSON completo:", error);
        }
      }
      
      // Estrategia 2: Normalizar y limpiar el JSON antes de parsearlo
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          console.log("Aplicando limpieza al JSON...");
          
          // Normalizar saltos de línea y espacios
          jsonContent = jsonContent.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
          
          // Arreglar problemas comunes en JSON como separaciones, comillas, etc.
          jsonContent = jsonContent.replace(/}\s*{/g, '},{');
          jsonContent = jsonContent.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          jsonContent = jsonContent.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
          jsonContent = jsonContent.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
          // Reemplazar comillas españolas por comillas inglesas
          jsonContent = jsonContent.replace(/«/g, '"').replace(/»/g, '"');
          // Asegurar comillas alrededor de strings en español con acentos y ñ
          jsonContent = jsonContent.replace(/:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g, ':"$2"$3');
          
          // Limpiar casos de comas incorrectas o faltantes
          jsonContent = jsonContent.replace(/",\s*"/g, '","');
          jsonContent = jsonContent.replace(/",\s*}/g, '"}');
          jsonContent = jsonContent.replace(/"\s*}/g, '"}');
          jsonContent = jsonContent.replace(/"\s*]/g, '"]');
          
          // Arreglar caracteres de escape
          jsonContent = jsonContent.replace(/\\"/g, '"').replace(/\\'/g, "'");
          jsonContent = jsonContent.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, "\\\\");
          
          // Corregir problemas de anidamiento
          jsonContent = jsonContent.replace(/\}\s*"/g, '},"');
          jsonContent = jsonContent.replace(/\}\s*\{/g, '},{');
          
          // Eliminar caracteres Unicode que puedan interferir
          jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
          
          // Reemplazar cualquier coma final antes de cerrar arrays o objetos
          jsonContent = jsonContent.replace(/,(\s*[\]}])/g, '$1');
          
          // Asegurar que todas las propiedades tengan comillas dobles
          jsonContent = jsonContent.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          
          console.log("JSON limpiado (primeros 100 caracteres):", 
            jsonContent.substring(0, 100) + "... [truncado]");
          
          try {
            const parsedContent = JSON.parse(jsonContent);
            
            if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
              console.log(`Cronograma limpiado y parseado con ${parsedContent.entries.length} entradas`);
              // Verificar entradas válidas
              const validEntries = parsedContent.entries.filter((entry: any) => 
                entry.title && entry.platform && entry.postDate
              );
              
              if (validEntries.length > 0) {
                return {
                  name: parsedContent.name || `Cronograma para ${projectName}`,
                  entries: validEntries
                };
              }
            }
          } catch (parseError) {
            console.error("Error al parsear JSON limpiado:", parseError);
            
            // Último intento: corregir errores comunes de JSON
            try {
              console.log("Intentando reparación profunda del JSON...");
              // Usar RegEx para extraer manualmente la estructura básica
              const nameMatch = jsonContent.match(/"name"\s*:\s*"([^"]+)"/);
              const name = nameMatch ? nameMatch[1] : `Cronograma para ${projectName}`;
              
              // Intentar extraer las entradas como un array
              let entriesMatch = jsonContent.match(/"entries"\s*:\s*\[([\s\S]+?)\](?=\s*\})/);
              if (entriesMatch && entriesMatch[1]) {
                // Tokenizar la cadena de entradas en objetos individuales
                const entriesStr = entriesMatch[1].trim();
                // Dividir por cierre y apertura de objetos para obtener entradas individuales
                const rawEntries = entriesStr.split(/}\s*,\s*{/);
                
                const validEntries: ContentScheduleEntry[] = [];
                
                for (let i = 0; i < rawEntries.length; i++) {
                  try {
                    // Reconstruir el objeto con llaves de apertura/cierre
                    let entryStr = rawEntries[i];
                    if (!entryStr.startsWith('{')) entryStr = '{' + entryStr;
                    if (!entryStr.endsWith('}')) entryStr = entryStr + '}';
                    
                    // Limpiar la cadena de entrada
                    entryStr = entryStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
                    entryStr = entryStr.replace(/:\s*'([^']*)'/g, ':"$1"');
                    entryStr = entryStr.replace(/:\s*"([^"]*)"/g, ':"$1"');
                    
                    // Intentar parsear como JSON
                    const entry = JSON.parse(entryStr);
                    
                    if (entry.title && entry.platform && entry.postDate) {
                      const completeEntry: ContentScheduleEntry = {
                        title: entry.title,
                        description: entry.description || "",
                        content: entry.content || "",
                        copyIn: entry.copyIn || "",
                        copyOut: entry.copyOut || "",
                        designInstructions: entry.designInstructions || "",
                        platform: entry.platform,
                        postDate: entry.postDate,
                        postTime: entry.postTime || "12:00",
                        hashtags: entry.hashtags || ""
                      };
                      validEntries.push(completeEntry);
                    }
                  } catch (innerError) {
                    console.warn(`Error procesando entrada ${i}:`, innerError);
                  }
                }
                
                if (validEntries.length > 0) {
                  console.log(`Recuperadas ${validEntries.length} entradas mediante reparación profunda`);
                  return {
                    name,
                    entries: validEntries
                  };
                }
              }
            } catch (repairError) {
              console.error("La reparación profunda del JSON falló:", repairError);
            }
          }
        } catch (error) {
          console.error("Error al limpiar y procesar JSON:", error);
        }
      }
      
      // Estrategia 3: Buscar y extraer entradas individuales con regex más flexible
      try {
        console.log("Aplicando extracción por expresiones regulares...");
        // Regex mejorada para detectar objetos que parezcan entradas del calendario
        const entriesRegex = /{(?:[^{}]|"[^"]*")*?"title"(?:[^{}]|"[^"]*")*?"platform"(?:[^{}]|"[^"]*")*?"postDate"(?:[^{}]|"[^"]*")*?}/g;
        const validEntries: ContentScheduleEntry[] = [];
        let match;
        
        // Primero intentamos una reparación general del texto completo
        try {
          console.log("Aplicando reparación general del JSON antes de procesamiento por piezas");
          const repairedFullText = repairMalformedJson(scheduleText);
          const jsonStart = repairedFullText.indexOf('{');
          const jsonEnd = repairedFullText.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            try {
              const jsonContent = repairedFullText.substring(jsonStart, jsonEnd);
              const parsedContent = JSON.parse(jsonContent);
              
              if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries) && parsedContent.entries.length > 0) {
                console.log(`JSON reparado correctamente con ${parsedContent.entries.length} entradas`);
                const validEntries = parsedContent.entries.filter((entry: any) => 
                  entry.title && entry.platform && entry.postDate
                );
                
                if (validEntries.length > 0) {
                  return {
                    name: parsedContent.name || `Cronograma para ${projectName}`,
                    entries: validEntries
                  };
                }
              }
            } catch (error) {
              console.log("La reparación general del JSON no fue suficiente, continuando con procesamiento por piezas");
            }
          }
        } catch (repairError) {
          console.warn("Error en reparación general:", repairError);
        }
        
        // Si la reparación general falló, continuamos con la extracción pieza por pieza
        while ((match = entriesRegex.exec(scheduleText)) !== null) {
          try {
            let entryText = match[0];
            console.log("Encontrada posible entrada:", entryText.substring(0, 50) + "... [truncado]");
            
            // Normalizar
            entryText = entryText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
            // Limpiar campos con técnicas básicas
            entryText = entryText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
            entryText = entryText.replace(/:(\s*)'([^']*)'/g, ':$1"$2"');
            entryText = entryText.replace(/«/g, '"').replace(/»/g, '"');
            entryText = entryText.replace(/:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g, ':"$2"$3');
            
            try {
              // Intentar parsear directamente
              const entry = JSON.parse(entryText);
              if (entry.title && entry.platform && entry.postDate) {
                // Aseguramos que tenga al menos campos mínimos
                const completeEntry: ContentScheduleEntry = {
                  title: entry.title,
                  description: entry.description || "",
                  content: entry.content || "",
                  copyIn: entry.copyIn || "",
                  copyOut: entry.copyOut || "",
                  designInstructions: entry.designInstructions || "",
                  platform: entry.platform,
                  postDate: entry.postDate,
                  postTime: entry.postTime || "12:00",
                  hashtags: entry.hashtags || ""
                };
                validEntries.push(completeEntry);
                console.log(`Entrada válida para ${entry.platform} en fecha ${entry.postDate}`);
              }
            } catch (parseError) {
              // Si el parseo directo falla, intentar con reparación avanzada
              console.log("Intentando reparación avanzada para entrada individual");
              try {
                const repairedEntryText = repairMalformedJson(entryText);
                const entry = JSON.parse(repairedEntryText);
                
                if (entry.title && entry.platform && entry.postDate) {
                  // Procesar entrada reparada
                  const completeEntry: ContentScheduleEntry = {
                    title: entry.title,
                    description: entry.description || "",
                    content: entry.content || "",
                    copyIn: entry.copyIn || "",
                    copyOut: entry.copyOut || "",
                    designInstructions: entry.designInstructions || "",
                    platform: entry.platform,
                    postDate: entry.postDate,
                    postTime: entry.postTime || "12:00",
                    hashtags: entry.hashtags || ""
                  };
                  validEntries.push(completeEntry);
                  console.log(`Entrada reparada válida para ${entry.platform} en fecha ${entry.postDate}`);
                }
              } catch (repairError) {
                console.warn("Error en reparación individual:", repairError);
              }
            }
          } catch (e) {
            console.warn("Error procesando entrada individual:", e);
          }
        }
        
        if (validEntries.length > 0) {
          console.log(`Recuperadas ${validEntries.length} entradas de forma individual mediante regex`);
          
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
      
      // Estrategia 4: Intento de análisis inteligente línea por línea para extraer contenido
      console.log("Intentando extracción línea por línea para buscar publicaciones...");
      
      try {
        // Dividir el texto en líneas y buscar patrones que parezcan entradas
        const lines = scheduleText.split('\n');
        const entries: ContentScheduleEntry[] = [];
        
        // Variables para rastrear una entrada en construcción
        let currentEntry: Partial<ContentScheduleEntry> | null = null;
        let potentialPlatforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'WhatsApp'];
        
        // Patrones de fecha (formato YYYY-MM-DD)
        const datePattern = /\d{4}-\d{2}-\d{2}/;
        // Patrón de tiempo (formato HH:MM o H:MM)
        const timePattern = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/;
        
        // Iterar por cada línea
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Ignorar líneas vacías
          if (!line) continue;
          
          // Buscar plataformas
          const platformFound = potentialPlatforms.find(platform => 
            line.includes(platform) || 
            line.toLowerCase().includes(platform.toLowerCase())
          );
          
          // Buscar fechas
          const dateMatch = line.match(datePattern);
          // Buscar tiempos
          const timeMatch = line.match(timePattern);
          
          // Si encontramos una plataforma o fecha, podría ser el inicio de una nueva entrada
          if (platformFound || dateMatch) {
            // Si ya teníamos una entrada en construcción con datos suficientes, guardémosla
            if (currentEntry && currentEntry.title && currentEntry.platform && currentEntry.postDate) {
              // Asegurar que todos los campos requeridos estén presentes
              entries.push({
                title: currentEntry.title,
                description: currentEntry.description || "",
                content: currentEntry.content || "",
                copyIn: currentEntry.copyIn || "",
                copyOut: currentEntry.copyOut || "",
                designInstructions: currentEntry.designInstructions || "",
                platform: currentEntry.platform,
                postDate: currentEntry.postDate,
                postTime: currentEntry.postTime || "12:00",
                hashtags: currentEntry.hashtags || ""
              });
            }
            
            // Iniciar una nueva entrada
            currentEntry = {};
            
            // Asignar plataforma si la encontramos
            if (platformFound) {
              currentEntry.platform = platformFound;
            }
            
            // Asignar fecha si la encontramos
            if (dateMatch) {
              currentEntry.postDate = dateMatch[0];
            }
            
            // Intenta extraer un título de esta línea o la siguiente
            if (line.length > 5 && !line.startsWith('{') && !line.startsWith('"')) {
              // Usar esta línea como título si parece un título (no demasiado largo)
              if (line.length < 100) {
                currentEntry.title = line;
              } 
              // O intenta ver si la siguiente línea podría ser un título
              else if (i+1 < lines.length && lines[i+1].length < 100) {
                currentEntry.title = lines[i+1].trim();
              }
            }
          }
          
          // Si ya tenemos una entrada en construcción, seguir agregando datos
          if (currentEntry) {
            // Buscar tiempo si no lo tenemos
            if (!currentEntry.postTime && timeMatch) {
              currentEntry.postTime = timeMatch[0];
            }
            
            // Intenta identificar contenido según palabras clave
            if (line.toLowerCase().includes("descripción") || line.toLowerCase().includes("description")) {
              currentEntry.description = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("contenido") || line.toLowerCase().includes("content")) {
              currentEntry.content = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("copy in") || line.toLowerCase().includes("copyin")) {
              currentEntry.copyIn = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("copy out") || line.toLowerCase().includes("copyout")) {
              currentEntry.copyOut = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("instrucciones") || line.toLowerCase().includes("diseño")) {
              currentEntry.designInstructions = extractContentAfterLabel(line);
            } else if (line.toLowerCase().includes("hashtag")) {
              currentEntry.hashtags = extractContentAfterLabel(line);
            }
            
            // Si no tenemos título y esta línea parece un buen candidato, úsala
            if (!currentEntry.title && line.length > 5 && line.length < 100 && 
                !line.includes(':') && !line.includes('{') && !line.includes('}')) {
              currentEntry.title = line;
            }
            
            // Si no hemos encontrado fecha, intenta buscarla
            if (!currentEntry.postDate && dateMatch) {
              currentEntry.postDate = dateMatch[0];
            }
          }
        }
        
        // Agregar la última entrada si existe
        if (currentEntry && currentEntry.title && currentEntry.platform) {
          // Si no tenemos fecha, usa la fecha inicial
          if (!currentEntry.postDate) {
            currentEntry.postDate = formattedDate;
          }
          
          entries.push({
            title: currentEntry.title,
            description: currentEntry.description || "",
            content: currentEntry.content || "",
            copyIn: currentEntry.copyIn || "",
            copyOut: currentEntry.copyOut || "",
            designInstructions: currentEntry.designInstructions || "",
            platform: currentEntry.platform,
            postDate: currentEntry.postDate,
            postTime: currentEntry.postTime || "12:00",
            hashtags: currentEntry.hashtags || ""
          });
        }
        
        if (entries.length > 0) {
          console.log(`Extraídas ${entries.length} entradas mediante análisis línea por línea`);
          return {
            name: `Cronograma para ${projectName}`,
            entries: entries
          };
        }
        
      } catch (error) {
        console.error("Error en la extracción línea por línea:", error);
      }
      
      // Fallback final cuando ninguna estrategia funcionó
      console.log("Usando cronograma fallback básico (último recurso)");
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

/**
 * Extrae el contenido después de una etiqueta o dos puntos en una línea
 * Útil para analizar líneas en formato clave-valor
 */
function extractContentAfterLabel(line: string): string {
  // Buscar el patrón "etiqueta:" o después de un separador ":"
  const colonIndex = line.indexOf(':');
  if (colonIndex > 0 && colonIndex < line.length - 1) {
    return line.substring(colonIndex + 1).trim();
  }
  
  // Si no hay ":", intentar con otros separadores comunes
  const separators = ['-', '–', '—', '>', '=', '|', '•'];
  for (const sep of separators) {
    const sepIndex = line.indexOf(sep);
    if (sepIndex > 0 && sepIndex < line.length - 1) {
      return line.substring(sepIndex + 1).trim();
    }
  }
  
  // Si no hay separadores conocidos, intentar separar por la primera palabra si hay al menos 2 palabras
  const words = line.trim().split(/\s+/);
  if (words.length >= 2) {
    // Devolver todo menos la primera palabra
    return words.slice(1).join(' ').trim();
  }
  
  // Si no podemos extraer, devolver la línea completa
  return line.trim();
}

/**
 * Intenta reparar un JSON malformado utilizando estrategias avanzadas
 * Se usa como último recurso cuando los parsers normales fallan
 */
function repairMalformedJson(jsonString: string): string {
  let result = jsonString;
  
  // 1. Corregir comillas mal cerradas
  result = result.replace(/([a-zA-Z0-9_]+)(?=:)/g, '"$1"'); // Asegurar comillas en claves
  
  // 2. Corregir problemas comunes de escape
  result = result.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, "\\\\"); // Escape de backslash
  
  // 3. Reemplazar comillas simples con comillas dobles
  const singleQuoteRegex = /'([^']*?)'/g;
  result = result.replace(singleQuoteRegex, '"$1"');
  
  // 4. Arreglar propiedades en español con acentos
  const spanishWordRegex = /:(\s*)([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)(\s*[,}])/g;
  result = result.replace(spanishWordRegex, ':"$2"$3');
  
  // 5. Eliminar comas extra antes de cerrar objetos o arrays
  result = result.replace(/,(\s*[\]}])/g, '$1');
  
  // 6. Asegurar que las llaves y corchetes estén correctamente balanceados
  const countOccurrences = (str: string, char: string): number => {
    return (str.match(new RegExp(`\\${char}`, 'g')) || []).length;
  };
  
  const openBraces = countOccurrences(result, '{');
  const closeBraces = countOccurrences(result, '}');
  if (openBraces > closeBraces) {
    result += '}'.repeat(openBraces - closeBraces);
  } else if (closeBraces > openBraces) {
    result = '{'.repeat(closeBraces - openBraces) + result;
  }
  
  const openBrackets = countOccurrences(result, '[');
  const closeBrackets = countOccurrences(result, ']');
  if (openBrackets > closeBrackets) {
    result += ']'.repeat(openBrackets - closeBrackets);
  } else if (closeBrackets > openBrackets) {
    result = '['.repeat(closeBrackets - openBrackets) + result;
  }
  
  // 7. Corregir valores con espacios que deberían tener comillas
  result = result.replace(/:\s*([^"{}\[\],\d][^,}\]]*[^"{}\[\],\d])\s*([,}\]])/g, ':"$1"$2');
  
  // 8. Quitar espacios entre comillas y dos puntos
  result = result.replace(/"\s+:/g, '":');
  
  // 9. Asegurar que no haya comas extras al final de objetos o arrays
  result = result.replace(/,(\s*})/g, '$1');
  result = result.replace(/,(\s*\])/g, '$1');
  
  // 10. Arreglar valores booleanos y numéricos
  result = result.replace(/"(true|false)"(?=[\s,}\]])/g, '$1');
  result = result.replace(/"(\d+)"(?=[\s,}\]])/g, '$1');
  
  return result;
}
