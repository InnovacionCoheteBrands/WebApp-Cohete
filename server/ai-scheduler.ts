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
  additionalInstructions?: string;
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
  previousContent: string[] = [],
  additionalInstructions?: string
): Promise<ContentSchedule> {
  console.log(`[CALENDAR] !! Iniciando generación de calendario para proyecto "${projectName}"`);
  console.log(`[CALENDAR] Parámetros: startDate=${startDate}, durationDays=${durationDays}, prevContent.length=${previousContent.length}`);
  
  try {
    // Format the start date using date-fns
    const formattedDate = format(parseISO(startDate), 'yyyy-MM-dd');
    const endDate = format(addDays(parseISO(startDate), durationDays), 'yyyy-MM-dd');
    console.log(`[CALENDAR] Periodo del calendario: ${formattedDate} hasta ${endDate}`);
    
    // Extract social networks with monthly post frequency data
    let socialNetworksSection = "";
    try {
      console.log(`[CALENDAR] Procesando datos de redes sociales del proyecto`);
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
      
      console.log(`[CALENDAR] Redes sociales seleccionadas: ${selectedNetworks.length}`);
      if (selectedNetworks.length > 0) {
        console.log(`[CALENDAR] Redes: ${selectedNetworks.map((n: any) => n.name).join(', ')}`);
        socialNetworksSection = `
        DISTRIBUCIÓN DE PUBLICACIONES:
        ${JSON.stringify(selectedNetworks, null, 2)}
        
        IMPORTANTE: Respeta la cantidad de publicaciones por red social indicada en "postsForPeriod".
        `;
      } else {
        console.warn(`[CALENDAR] ¡Advertencia! No se encontraron redes sociales seleccionadas en el proyecto`);
      }
    } catch (error) {
      console.error("[CALENDAR] Error procesando datos de redes sociales:", error);
      socialNetworksSection = "No hay información específica sobre la frecuencia de publicaciones.";
    }
    
    // Prepare previous content section
    const previousContentSection = previousContent.length > 0
      ? `Previously used content (AVOID REPEATING THESE TOPICS AND IDEAS):
        ${previousContent.join('\n')}`
      : "No previous content history available.";
    
    console.log(`[CALENDAR] Historial de contenido: ${previousContent.length} elementos`);
    if (previousContent.length > 0) {
      console.log(`[CALENDAR] Muestra del primer elemento: "${previousContent[0].substring(0, 50)}..."`);
    }
    
    const prompt = `
      Crea un cronograma avanzado de contenido para redes sociales para el proyecto "${projectName}". Actúa como un experto profesional en marketing digital con especialización en contenidos de alto impacto, branding y narrativa de marca. Tu objetivo es crear contenido estratégico, persuasivo y memorable que genere engagement.

      **PROYECTO:**
      Nombre: ${projectName}
      
      **DETALLES DEL PROYECTO:**
      ${typeof projectDetails === 'string' ? projectDetails : JSON.stringify(projectDetails, null, 2)}

      **PERIODO DE PLANIFICACIÓN:** 
      De ${formattedDate} a ${endDate} (${durationDays} días)
      
      **ESPECIFICACIONES DEL CLIENTE:** 
      ${specifications || "Ninguna especificación adicional proporcionada."}
      
      **ESTRATEGIA DE REDES SOCIALES:**
      ${socialNetworksSection || "Sugiere 2-3 redes sociales estratégicamente seleccionadas para el público objetivo de este proyecto."}
      
      **HISTORIAL DE CONTENIDO (EVITAR DUPLICACIÓN):**
      ${previousContentSection || "Sin historial de contenido previo disponible."}

      **DIRECTRICES PARA CREACIÓN DE CONTENIDO DE ALTA CALIDAD:**
      1. STORYTELLING - Utiliza narrativas emocionales y personales que conecten con la audiencia.
      2. VALOR PRÁCTICO - Cada publicación debe ofrecer insights, consejos, o soluciones reales.
      3. LLAMADAS A LA ACCIÓN - Incluye CTAs claros y persuasivos que inciten al compromiso.
      4. ADAPTACIÓN POR PLATAFORMA - Personaliza el tono y formato según cada red social.
      5. ORIGINALIDAD - Evita clichés y lugares comunes del sector, busca ángulos únicos.
      6. ESTILO DISTINTIVO - Mantén coherencia con la voz de marca pero con variedad creativa.
      7. INSTRUCCIONES VISUALES - Sé específico sobre las imágenes/videos sugiriendo paletas de color, composición y elementos visuales distintivos.

      **ESTRUCTURA DE LAS PUBLICACIONES:**
      - TÍTULOS: Concisos, impactantes, con palabras potentes y gatillos emocionales.
      - CONTENIDO PRINCIPAL: Desarrolla ideas completas con narrativa estructurada (problema-solución-beneficio).
      - COPY IN: Texto que aparecerá sobre la imagen/diseño, corto y memorable.
      - COPY OUT: Descripción completa que acompaña a la publicación, escrito en formato conversacional, personal y persuasivo.
      - HASHTAGS: Mezcla hashtags populares y específicos del nicho (entre 3-7 por publicación).

      **FORMATO DE RESPUESTA:**
      Devuelve ÚNICAMENTE un objeto JSON con esta estructura (todo en español):
      {
        "name": "Nombre estratégico del cronograma",
        "entries": [
          {
            "title": "Título impactante y único",
            "description": "Objetivo estratégico de la publicación",
            "content": "Contenido principal extenso, desarrollando ideas completas con estructura narrativa clara",
            "copyIn": "Texto conciso, memorable e impactante para incluir sobre la imagen",
            "copyOut": "Texto externo detallado para la descripción del post, escrito en tono conversacional y persuasivo",
            "designInstructions": "Instrucciones detalladas de diseño incluyendo elementos visuales, colores, composición y estilo",
            "platform": "Plataforma específica",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4"
          }
        ]
      }
    `;

    // Usamos exclusivamente Grok AI para generar el cronograma
    console.log("[CALENDAR] Generando cronograma con Grok AI");
    
    // Modificamos el prompt para forzar una respuesta más estructurada
    const enhancedPrompt = `${prompt}\n\nIMPORTANTE: Responde SOLO con el objeto JSON solicitado, sin texto adicional antes o después. No incluyas anotaciones, explicaciones, ni marcadores de código como \`\`\`json. Tu respuesta debe comenzar con '{' y terminar con '}'. Asegúrate de que el JSON sea válido: todas las propiedades y valores deben estar entre comillas dobles, excepto los números y booleanos. No uses comillas simples ni mezcles diferentes tipos de comillas.`;
    
    // Incorporar instrucciones adicionales si existen
    let finalPrompt = enhancedPrompt;
    if (additionalInstructions) {
      finalPrompt = `${enhancedPrompt}\n\n**INSTRUCCIONES ADICIONALES DEL USUARIO:**\n${additionalInstructions}`;
      console.log(`[CALENDAR] Se añadieron instrucciones adicionales al prompt: "${additionalInstructions.substring(0, 100)}${additionalInstructions.length > 100 ? '...' : ''}"`);
    }
    
    // Usamos el formato JSON explícitamente para garantizar una respuesta estructurada
    const scheduleText = await grokService.generateText(finalPrompt, {
      // Aumentamos temperatura a 1.2 para obtener respuesta más creativa y única
      temperature: 1.2,
      // Aumentamos tokens máximos para permitir respuestas más elaboradas
      maxTokens: 4000,
      // Aumentamos los reintentos para casos de red inestable
      retryCount: 3,
      // Solicitar explícitamente respuesta en formato JSON para mayor compatibilidad
      responseFormat: 'json_object',
      // Utilizamos el modelo Grok 1 que es compatible con la API key
      model: 'grok-1'
    });
    
    // Registramos una versión truncada para debug
    console.log(`[CALENDAR] Respuesta de Grok AI recibida. Longitud: ${scheduleText.length} caracteres`);
    console.log(`[CALENDAR] Primeros 200 caracteres de la respuesta: "${scheduleText.substring(0, 200)}... [truncado]"`);
    console.log(`[CALENDAR] Últimos 200 caracteres de la respuesta: "...${scheduleText.substring(Math.max(0, scheduleText.length - 200))}"`)
    
    // Escribir respuesta completa en el log para diagnóstico
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GROK AI (inicio):`);
    // Dividir respuesta en chunks de 1000 caracteres para evitar truncamiento en logs
    const chunkSize = 1000;
    for (let i = 0; i < scheduleText.length; i += chunkSize) {
        console.log(scheduleText.substring(i, i + chunkSize));
    }
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GROK AI (fin)`);
    
    try {
      console.log(`[CALENDAR] Iniciando procesamiento de la respuesta (Estrategia 1: JSON directo)`);
      // Registro posiciones
      const jsonStart = scheduleText.indexOf('{');
      const jsonEnd = scheduleText.lastIndexOf('}') + 1;
      console.log(`[CALENDAR] Posiciones JSON detectadas: inicio=${jsonStart}, fin=${jsonEnd}`);
      
      if (jsonStart < 0) {
        console.error(`[CALENDAR] ERROR: No se encontró carácter de inicio JSON '{' en la respuesta`);
      }
      if (jsonEnd <= jsonStart) {
        console.error(`[CALENDAR] ERROR: Posición de fin inválida o no se encontró carácter de cierre JSON '}'`);
      }
      
      // Estrategia 1: Extraer y parsear directamente
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          console.log(`[CALENDAR] Ejecutando estrategia 1: Extracción directa de JSON`);
          const jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          // Registrar longitud para depuración
          console.log(`[CALENDAR] Longitud del contenido JSON extraído: ${jsonContent.length} caracteres`);
          console.log(`[CALENDAR] Primeros 100 caracteres del JSON extraído: ${jsonContent.substring(0, 100)}...`);
          
          console.log(`[CALENDAR] Intentando parsear JSON con JSON.parse()`);
          const parsedContent = JSON.parse(jsonContent);
          console.log(`[CALENDAR] JSON parseado exitosamente, verificando estructura`);
          
          if (parsedContent && parsedContent.entries && Array.isArray(parsedContent.entries)) {
            console.log(`[CALENDAR] Estructura básica correcta. Entradas encontradas: ${parsedContent.entries.length}`);
            
            if (parsedContent.entries.length === 0) {
              console.error(`[CALENDAR] ERROR: Array de entradas vacío en el JSON`);
              console.log(`[CALENDAR] Detalles del objeto parseado:`, JSON.stringify(parsedContent, null, 2).substring(0, 500) + "...");
            } else {
              console.log(`[CALENDAR] Verificando campos requeridos en las entradas`);
              // Verificar que las entradas tengan los campos requeridos mínimos
              const validEntries = parsedContent.entries.filter((entry: any) => 
                entry.title && entry.platform && entry.postDate && 
                typeof entry.title === 'string' &&
                typeof entry.platform === 'string' &&
                typeof entry.postDate === 'string'
              );
              
              console.log(`[CALENDAR] Entradas con todos los campos requeridos: ${validEntries.length}/${parsedContent.entries.length}`);
              
              if (validEntries.length === parsedContent.entries.length) {
                // Todas las entradas son válidas
                console.log(`[CALENDAR] ÉXITO: Estrategia 1 exitosa. Devolviendo cronograma con ${validEntries.length} entradas`);
                return parsedContent;
              } else {
                // Algunas entradas son inválidas, pero tenemos suficientes
                if (validEntries.length > 0) {
                  console.log(`[CALENDAR] Se filtraron ${parsedContent.entries.length - validEntries.length} entradas inválidas`);
                  // Mostrar la primera entrada inválida para diagnóstico
                  if (parsedContent.entries.length > validEntries.length) {
                    const invalidEntry = parsedContent.entries.find((entry: any) => 
                      !entry.title || !entry.platform || !entry.postDate ||
                      typeof entry.title !== 'string' ||
                      typeof entry.platform !== 'string' ||
                      typeof entry.postDate !== 'string'
                    );
                    console.log(`[CALENDAR] Ejemplo de entrada inválida:`, JSON.stringify(invalidEntry));
                  }
                  
                  console.log(`[CALENDAR] ÉXITO PARCIAL: Estrategia 1 parcialmente exitosa. Devolviendo cronograma con ${validEntries.length} entradas válidas`);
                  return {
                    name: parsedContent.name || `Cronograma para ${projectName}`,
                    entries: validEntries
                  };
                } else {
                  console.error(`[CALENDAR] ERROR: No hay entradas válidas entre las ${parsedContent.entries.length} detectadas`);
                  // Si no hay entradas válidas, continuamos con la siguiente estrategia
                }
              }
            }
          } else {
            console.error(`[CALENDAR] ERROR: Estructura de JSON inválida. entries=${!!parsedContent?.entries}, isArray=${Array.isArray(parsedContent?.entries)}`);
            console.log(`[CALENDAR] Detalles del objeto parseado:`, JSON.stringify(parsedContent, null, 2).substring(0, 500) + "...");
          }
        } catch (error) {
          console.error(`[CALENDAR] ERROR Estrategia 1: Error al parsear JSON completo:`, error);
          // Mostrar el punto exacto donde falló el parsing si es un error de sintaxis
          if (error instanceof SyntaxError && 'message' in error) {
            const errorMsg = (error as SyntaxError).message;
            const positionMatch = errorMsg.match(/position (\d+)/);
            if (positionMatch && positionMatch[1]) {
              const pos = parseInt(positionMatch[1]);
              const contextStart = Math.max(0, pos - 20);
              const contextEnd = Math.min(scheduleText.length, pos + 20);
              console.error(`[CALENDAR] Error de sintaxis cerca de la posición ${pos}. Contexto: '${scheduleText.substring(contextStart, pos)}>>AQUÍ<<${scheduleText.substring(pos, contextEnd)}'`);
            }
          }
        }
      } else {
        console.error(`[CALENDAR] ERROR: No se puede ejecutar Estrategia 1, posiciones JSON inválidas`);
      }
      
      // Estrategia 2: Normalizar y limpiar el JSON antes de parsearlo
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);
          console.log("Aplicando limpieza al JSON...");
          
          // Normalizar saltos de línea y espacios
          jsonContent = jsonContent.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
          
          // Arreglar problemas con caracteres de truncamiento
          jsonContent = jsonContent.replace(/Lujo$/g, 'Lujo"');
          jsonContent = jsonContent.replace(/Lujo\s*}\s*,/g, 'Lujo"},');
          
          // Arreglar específicamente problemas con comillas en el título
          jsonContent = jsonContent.replace(/"name"\s*:\s*"([^"]*)"/g, (match, p1) => {
            // Escapar comillas internas en el nombre
            return `"name":"${p1.replace(/"/g, '\\"')}"`;
          });
          
          // Arreglar problemas con entradas que no cierran correctamente
          jsonContent = jsonContent.replace(/}(\s*)\n?$/g, '}]}');
          if (!jsonContent.endsWith(']}')) {
            if (jsonContent.endsWith('}')) {
              // Si termina con } pero no es el cierre del array y objeto principal
              jsonContent = jsonContent + ']}';
            } else if (!jsonContent.endsWith(']')) {
              // Si no termina con ] añadimos el cierre del array y objeto
              jsonContent = jsonContent + ']}';
            } else if (!jsonContent.endsWith('}}')) {
              // Si termina con ] pero no con el cierre del objeto principal
              jsonContent = jsonContent + '}';
            }
          }
          
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
                    
                    // Limpiar la cadena de entrada - mejora intensiva
                    // 1. Asegurarse que los nombres de propiedades tengan comillas dobles
                    entryStr = entryStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
                    
                    // 2. Convertir comillas simples a dobles para valores
                    entryStr = entryStr.replace(/:\s*'([^']*)'/g, ':"$1"');
                    
                    // 3. Asegurarse que los valores tengan el formato correcto
                    // No sobreescribir valores ya con formato correcto
                    entryStr = entryStr.replace(/"([^"]+)":\s*([^",\{\}\[\]]+)([,\}])/g, (match, p1, p2, p3) => {
                      // Si p2 es un número o true/false/null dejarlo tal cual, de lo contrario añadir comillas
                      if (/^(\-?\d+\.?\d*|true|false|null)$/.test(p2.trim())) {
                        return `"${p1}": ${p2.trim()}${p3}`;
                      } else {
                        return `"${p1}": "${p2.trim()}"${p3}`;
                      }
                    });
                    
                    // 4. Corregir errores comunes de formato
                    entryStr = entryStr.replace(/,\s*}/g, '}'); // Eliminar coma final antes de cierre
                    entryStr = entryStr.replace(/}\s*{/g, '},{'); // Asegurar separación correcta entre objetos
                    entryStr = entryStr.replace(/}\s*"/g, '},"'); // Corregir transición entre objeto y propiedad
                    entryStr = entryStr.replace(/"\s*{/g, '":{'); // Corregir transición entre propiedad y objeto
                    
                    // 5. Corregir comillas dobles duplicadas
                    entryStr = entryStr.replace(/""+/g, '"');
                    
                    // Intentar parsear como JSON con verificación adicional
                    let entry;
                    try {
                      entry = JSON.parse(entryStr);
                    } catch (parseError: any) {
                      // Intentar identificar ubicación del error - extracción específica de mensaje
                      const errorMsg = parseError.message || '';
                      const positionMatch = errorMsg.match(/position\s+(\d+)/i);
                      let errorPosition = -1;
                      
                      if (positionMatch && positionMatch[1]) {
                        errorPosition = parseInt(positionMatch[1]);
                        // Intentar reparar en la posición específica del error
                        if (errorPosition > 0 && errorPosition < entryStr.length) {
                          // Ver contexto de error (10 caracteres antes y después)
                          const start = Math.max(0, errorPosition - 10);
                          const end = Math.min(entryStr.length, errorPosition + 10);
                          const context = entryStr.substring(start, end);
                          console.log(`Contexto de error JSON en pos ${errorPosition}: "${context}"`);
                          
                          // Intentar reparar basado en patrones específicos
                          if (errorMsg.includes("Expected ',' or '}'")) {
                            // Intentar arreglar insertando la coma o llave faltante
                            let fixedStr = entryStr.substring(0, errorPosition) + '}' + entryStr.substring(errorPosition);
                            try {
                              entry = JSON.parse(fixedStr);
                              console.log(`Reparación exitosa insertando '}' en posición ${errorPosition}`);
                            } catch (e) {
                              fixedStr = entryStr.substring(0, errorPosition) + ',' + entryStr.substring(errorPosition);
                              try {
                                entry = JSON.parse(fixedStr);
                                console.log(`Reparación exitosa insertando ',' en posición ${errorPosition}`);
                              } catch (e2) {
                                // Si ambos intentos fallan, eliminar el caracter problemático
                                fixedStr = entryStr.substring(0, errorPosition) + entryStr.substring(errorPosition + 1);
                                try {
                                  entry = JSON.parse(fixedStr);
                                  console.log(`Reparación exitosa eliminando caracter en posición ${errorPosition}`);
                                } catch (e3) {
                                  throw parseError; // Si nada funciona, propagar error original
                                }
                              }
                            }
                          } else {
                            throw parseError;
                          }
                        } else {
                          throw parseError;
                        }
                      } else {
                        throw parseError;
                      }
                    }
                    
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
  } catch (error: any) {
    // Registrar mensaje detallado del error
    console.error("[CALENDAR] Error crítico en generateSchedule:", error);
    
    // Verificar si el error ya tiene un tipo definido
    let errorType = error.errorType || "UNKNOWN";
    let errorMessage = "";
    
    // Loggeamos información detallada del error
    console.log("[CALENDAR ERROR] Detalles completos:", { 
      message: error.message, 
      type: error.errorType, 
      stack: error.stack,
      originalError: error
    });
    
    if (error.message && typeof error.message === 'string') {
      if (errorType === "NETWORK" || error.message.includes("connect")) {
        errorType = "NETWORK";
        errorMessage = `Error de conexión con la API de Grok: ${error.message}`;
      } else if (errorType === "JSON_PARSING" || error.message.includes("JSON") || error.message.includes("parse")) {
        errorType = "JSON_PARSING";
        errorMessage = `Error de procesamiento de respuesta JSON: ${error.message}`;
      } else if (errorType === "RATE_LIMIT" || error.message.includes("limit")) {
        errorType = "RATE_LIMIT";
        errorMessage = `Se ha excedido el límite de peticiones a Grok AI: ${error.message}`;
      } else if (errorType === "AUTH" || error.message.includes("autenticación") || error.message.includes("authentication")) {
        errorType = "AUTH";
        errorMessage = `Error de autenticación con Grok AI: ${error.message}`;
      } else if (error.message.startsWith("ERROR_JSON_PROCESSING:")) {
        // Error ya categorizado
        errorType = "JSON_PROCESSING";
        errorMessage = error.message;
      } else {
        errorMessage = `Error desconocido: ${error.message}`;
      }
    } else {
      errorMessage = "Error desconocido sin mensaje";
    }
    
    // Lanzar error tipificado para mejor manejo en las rutas
    const enhancedError = new Error(`${errorType}: ${errorMessage}`);
    (enhancedError as any).errorType = errorType;
    throw enhancedError;
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
