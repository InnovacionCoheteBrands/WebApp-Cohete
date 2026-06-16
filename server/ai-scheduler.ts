// ===== IMPORTACIONES PARA PROGRAMACIÓN DE CONTENIDO =====
// date-fns: Librería para manejo y formateo de fechas
import { format, parseISO, addDays } from "date-fns";
import { eq } from "drizzle-orm";
// Servicio de integración con Gemini
import { geminiService } from "./gemini-integration";
import { buildAssetBundleFromEntry } from "./ai-runtime/marketing-orchestrator";
import { db } from "./db";
import { analysisResults, products, projects } from "./schema";

// ===== CONFIGURACIÓN DE IA =====
// Integración exclusiva con Grok para todas las funcionalidades de IA

// ===== INTERFACES PARA CRONOGRAMA DE CONTENIDO =====
/**
 * Entrada individual de contenido en el cronograma
 * Representa una publicación específica con todos sus elementos
 */
export interface ContentScheduleEntry {
  title: string; // Título de la publicación
  description: string; // Descripción detallada del contenido
  content: string; // Contenido principal de la publicación
  copyIn: string; // Texto integrado dentro del diseño gráfico
  copyOut: string; // Texto para la descripción/caption del post
  designInstructions: string; // Instrucciones específicas para el departamento de diseño
  platform: string; // Plataforma de redes sociales (Instagram, Facebook, etc.)
  postDate: string; // Fecha de publicación en formato ISO
  postTime: string; // Hora de publicación en formato HH:MM
  hashtags: string; // Hashtags relevantes para la publicación
  uvpAlignmentScore?: number; // Puntaje de alineación con la UVP (0-100)
  uvpAlignmentReason?: string; // Explicación breve de la alineación estratégica
  referenceImagePrompt?: string; // Prompt para generar un activo visual
  referenceImageUrl?: string; // Vista previa conceptual del activo visual
  assetBrief?: Record<string, unknown>; // Brief resumido del activo para la UI
}

/**
 * Estructura completa del cronograma de contenido
 * Contiene todas las entradas y configuraciones del cronograma
 */
export interface ContentSchedule {
  name: string; // Nombre del cronograma
  entries: ContentScheduleEntry[]; // Array de todas las publicaciones programadas
  additionalInstructions?: string; // Instrucciones adicionales o especiales
}

const STRATEGIC_STOPWORDS = new Set([
  "para", "como", "desde", "esta", "este", "estos", "estas", "sobre", "entre", "hasta",
  "porque", "donde", "cuando", "marca", "cliente", "valor", "propuesta", "producto",
  "servicio", "social", "contenido", "with", "from", "that", "this", "your", "their"
]);

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeAlignmentScore(value: unknown): number | undefined {
  if (typeof value === "boolean") {
    return value ? 100 : 0;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)));
    }
  }

  return undefined;
}

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStrategicKeywords(text: string, limit = 8): string[] {
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const token of normalizeForComparison(text).split(" ")) {
    if (token.length < 4 || STRATEGIC_STOPWORDS.has(token) || seen.has(token)) {
      continue;
    }

    seen.add(token);
    keywords.push(token);

    if (keywords.length >= limit) {
      break;
    }
  }

  return keywords;
}

function computeUvpAlignmentScore(entry: ContentScheduleEntry, uvp?: string): number | undefined {
  const normalizedUvp = readString(uvp);
  if (!normalizedUvp) {
    return undefined;
  }

  const uvpKeywords = extractStrategicKeywords(normalizedUvp);
  if (uvpKeywords.length === 0) {
    return 60;
  }

  const entryText = normalizeForComparison(
    [entry.title, entry.description, entry.content, entry.copyOut].filter(Boolean).join(" ")
  );

  const matches = uvpKeywords.filter((keyword) => entryText.includes(keyword));
  const ratio = matches.length / uvpKeywords.length;

  return Math.max(25, Math.min(100, Math.round(ratio * 100)));
}

function buildUvpAlignmentReason(entry: ContentScheduleEntry, projectData: Record<string, any>, score: number): string {
  const uvp = readString(projectData.uvp);
  if (!uvp) {
    return "No se encontrÃ³ una UVP registrada; el score refleja coherencia general con la estrategia de marca disponible.";
  }

  const matchedKeywords = extractStrategicKeywords(uvp).filter((keyword) =>
    normalizeForComparison([entry.title, entry.description, entry.content, entry.copyOut].join(" ")).includes(keyword)
  );

  if (matchedKeywords.length > 0) {
    return `Se alinea con la UVP porque enfatiza ${matchedKeywords.slice(0, 3).join(", ")}, conectando el mensaje con el diferencial de la marca.`;
  }

  if (score >= 70) {
    return "La pieza mantiene una alineaciÃ³n estratÃ©gica aceptable con la UVP, aunque podrÃ­a hacer mÃ¡s explÃ­cito el diferenciador principal.";
  }

  return `La pieza necesita reforzar de forma mÃ¡s explÃ­cita la UVP registrada: ${uvp.substring(0, 140)}${uvp.length > 140 ? "..." : ""}`;
}

function normalizeScheduleEntry(entry: any, projectData: Record<string, any>, fallbackDate: string): ContentScheduleEntry {
  const normalizedEntry: ContentScheduleEntry = {
    title: readString(entry.title) || "PublicaciÃ³n estratÃ©gica",
    description: readString(entry.description) || "",
    content: readString(entry.content) || "",
    copyIn: readString(entry.copyIn) || "",
    copyOut: readString(entry.copyOut) || "",
    designInstructions: readString(entry.designInstructions) || "",
    platform: readString(entry.platform) || "Instagram",
    postDate: readString(entry.postDate) || fallbackDate,
    postTime: readString(entry.postTime) || "12:00",
    hashtags: readString(entry.hashtags) || "",
  };

  const modelScore = normalizeAlignmentScore(entry.uvpAlignmentScore ?? entry.uvp_alignment_score);
  const heuristicScore = computeUvpAlignmentScore(normalizedEntry, projectData.uvp);
  const finalScore = modelScore !== undefined && heuristicScore !== undefined
    ? Math.round((modelScore + heuristicScore) / 2)
    : (modelScore ?? heuristicScore ?? 50);

  normalizedEntry.uvpAlignmentScore = finalScore;
  normalizedEntry.uvpAlignmentReason =
    readString(entry.uvpAlignmentReason ?? entry.uvp_alignment_reason) ||
    buildUvpAlignmentReason(normalizedEntry, projectData, finalScore);

  const assetBundle = buildAssetBundleFromEntry(normalizedEntry, projectData);
  normalizedEntry.referenceImagePrompt =
    readString(entry.referenceImagePrompt ?? entry.reference_image_prompt) || assetBundle.prompt;
  normalizedEntry.referenceImageUrl =
    readString(entry.referenceImageUrl ?? entry.reference_image_url) || assetBundle.previewUrl;
  normalizedEntry.assetBrief =
    (entry.assetBrief && typeof entry.assetBrief === "object" ? entry.assetBrief : undefined) ||
    assetBundle.assetBrief;

  return normalizedEntry;
}

function createFallbackEntry(projectName: string, fallbackDate: string, projectData: Record<string, any>): ContentScheduleEntry {
  return normalizeScheduleEntry({
    title: "Publicación principal para redes sociales",
    description: "Este es un cronograma básico para comenzar. Por favor regenera para obtener más opciones.",
    content: `Contenido detallado para la red social principal del proyecto ${projectName}.`,
    copyIn: "Texto integrado para diseño",
    copyOut: "Texto para descripción en redes sociales",
    designInstructions: "Diseño basado en la identidad visual del proyecto",
    platform: "Instagram",
    postDate: fallbackDate,
    postTime: "12:00",
    hashtags: "#marketing #contenido #socialmedia"
  }, projectData, fallbackDate);
}

/**
 * ===== FUNCIÓN PRINCIPAL DE GENERACIÓN DE CRONOGRAMA =====
 * Genera un cronograma de contenido para redes sociales usando exclusivamente Grok AI
 * Tiene en cuenta la frecuencia mensual de publicaciones definida para cada red social
 * @param projectName - Nombre del proyecto
 * @param projectDetails - Detalles y análisis del proyecto
 * @param startDate - Fecha de inicio del cronograma
 * @param specifications - Especificaciones adicionales
 * @param durationDays - Duración en días (por defecto 15 días)
 * @param previousContent - Contenido previo para evitar repetición
 * @param additionalInstructions - Instrucciones adicionales
 * @returns Promise con el cronograma completo generado
 */
export async function generateSchedule(
  projectName: string,
  projectDetails: any, // Note: 'any' used here, consider using a more specific type if available
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
    const projectData = typeof projectDetails === 'object' ? projectDetails : {};
    console.log(`[CALENDAR] Periodo del calendario: ${formattedDate} hasta ${endDate}`);

    // Extract social networks with monthly post frequency data
    let socialNetworksSection = "";
    try {
      console.log(`[CALENDAR] Procesando datos de redes sociales del proyecto`);
      const socialNetworks = projectData.socialNetworks || projectDetails?.analysisResults?.socialNetworks || [];
      const selectedNetworks = socialNetworks
        .filter((network: any) => network.selected && typeof network.postsPerMonth === 'number')
        .map((network: any) => {
          // Calculate posts per period based on monthly frequency
          const postsPerPeriod = Math.ceil(network.postsPerMonth * (durationDays / 30));

          // Extraer tipos de contenido con sus cantidades específicas
          const contentTypeDetails = network.contentTypeDetails || [];
          const selectedContentTypes = contentTypeDetails
            .filter((type: any) => type.count > 0)
            .map((type: any) => `${type.name} (${type.count} posts)`);

          return {
            name: network.name,
            postsPerMonth: network.postsPerMonth,
            postsForPeriod: postsPerPeriod,
            contentTypes: network.contentTypes || [],
            selectedContentTypes: selectedContentTypes,
            contentTypeDetails: contentTypeDetails
          };
        });

      // Calcular total de publicaciones basado en las especificaciones del proyecto
      const totalPostsFromNetworks = selectedNetworks.reduce((sum: number, network: any) => sum + network.postsForPeriod, 0);

      console.log(`[CALENDAR] Redes sociales seleccionadas: ${selectedNetworks.length}`);
      console.log(`[CALENDAR] Total de publicaciones calculadas: ${totalPostsFromNetworks}`);

      if (selectedNetworks.length > 0) {
        console.log(`[CALENDAR] Redes: ${selectedNetworks.map((n: any) => n.name).join(', ')}`);
        socialNetworksSection = `
        DISTRIBUCIÓN DE PUBLICACIONES ADAPTATIVA:
        ${JSON.stringify(selectedNetworks, null, 2)}

        TOTAL DE PUBLICACIONES A GENERAR: ${totalPostsFromNetworks}

        INSTRUCCIONES CRÍTICAS - RESPETAR CONFIGURACIÓN DEL PROYECTO:
        - Genera EXACTAMENTE ${totalPostsFromNetworks} publicaciones (no más, no menos)
        - Respeta la distribución por red social según "postsForPeriod"
        - Esta cantidad se calculó proporcionalmente basándose en las frecuencias mensuales definidas para cada red social del proyecto
        - NO ignores esta distribución específica del proyecto
        - TIPOS DE CONTENIDO: Usa SOLO los tipos de contenido seleccionados para cada red social
        - ADAPTACIÓN 2025: Aplica las mejores prácticas específicas de cada plataforma:
          * Instagram: Prioriza carruseles para engagement, Reels para alcance
          * Facebook: Enfoca en Reels verticales <30s y contenido auténtico
          * LinkedIn: Contenido B2B profesional, publicar en horario laboral
          * TikTok: Videos cortos 10-15s, participación en tendencias
        - RESPETA los valores de marca definidos en el análisis del proyecto
        `;
      } else {
        console.warn(`[CALENDAR] ¡Advertencia! No se encontraron redes sociales seleccionadas en el proyecto`);
        // Calcular cantidad mínima basada en el período cuando no hay redes configuradas
        const minimumPosts = Math.max(3, Math.ceil(durationDays / 5)); // Al menos 3 posts, o 1 cada 5 días
        console.log(`[CALENDAR] Usando cantidad mínima calculada: ${minimumPosts} publicaciones`);

        socialNetworksSection = `
        SIN REDES SOCIALES ESPECÍFICAS CONFIGURADAS:
        - Genera ${minimumPosts} publicaciones para el período de ${durationDays} días
        - Utiliza redes sociales genéricas apropiadas para el tipo de proyecto
        - Distribución sugerida: Instagram, Facebook, LinkedIn (según el contexto del proyecto)
        - Esta cantidad se calculó como mínimo viable: 1 publicación cada 5 días aproximadamente
        `;
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

    const numericProjectId =
      typeof projectData.id === "number" && !Number.isNaN(projectData.id)
        ? projectData.id
        : undefined;

    let projectInfo: { client?: string | null; description?: string | null } | null = null;
    let analysisInfo: Record<string, unknown> | null = null;
    let productsInfo: { name: string; description: string | null }[] = [];

    if (numericProjectId !== undefined) {
      projectInfo = (await db.query.projects.findFirst({
        where: eq(projects.id, numericProjectId),
      })) ?? null;

      analysisInfo = (await db.query.analysisResults.findFirst({
        where: eq(analysisResults.projectId, numericProjectId),
      })) ?? null;

      productsInfo = await db.query.products.findMany({
        where: eq(products.projectId, numericProjectId),
      });
    }

    const projectContext = analysisInfo
      ? `
    INFORMACIÓN COMPLETA DEL PROYECTO:
    - Cliente: ${projectInfo?.client}
    - Descripción: ${projectInfo?.description || (analysisInfo.projectDescription as string) || "No especificada"}

    MISIÓN, VISIÓN Y VALORES:
    - Misión: ${(analysisInfo.mission as string) || "No especificada"}
    - Visión: ${(analysisInfo.vision as string) || "No especificada"}
    - Valores fundamentales: ${(analysisInfo.coreValues as string) || "No especificados"}

    OBJETIVOS:
    - Objetivos generales: ${(analysisInfo.objectives as string) || "No especificados"}
    - Objetivos de comunicación: ${(analysisInfo.communicationObjectives as string) || "No especificados"}

    AUDIENCIA Y PERSONA:
    - Buyer Persona: ${(analysisInfo.buyerPersona as string) || "No especificada"}
    - Audiencia objetivo: ${(analysisInfo.targetAudience as string) || "No especificada"}
    - UVP: ${(analysisInfo.uvp as string) || "No especificada"}
    - VoC: ${(analysisInfo.voiceOfCustomer as string) || "No especificada"}

    ESTRATEGIAS DE MARKETING:
    - Estrategias principales: ${(analysisInfo.marketingStrategies as string) || "No especificadas"}
    - Arquetipos de marca: ${analysisInfo.archetypes ? JSON.stringify(analysisInfo.archetypes) : "No especificados"}

    COMUNICACIÓN Y TONO:
    - Estilo de comunicación: ${(analysisInfo.brandCommunicationStyle as string) || "No especificado"}
    - Tono de marca: ${(analysisInfo.brandTone as string) || "No especificado"}
    - Redes sociales objetivo: ${analysisInfo.socialNetworks ? JSON.stringify(analysisInfo.socialNetworks) : "No especificadas"}

    POLÍTICAS DE RESPUESTA:
    - Política para comentarios positivos: ${(analysisInfo.responsePolicyPositive as string) || "No especificada"}
    - Política para comentarios negativos: ${(analysisInfo.responsePolicyNegative as string) || "No especificada"}

    CONTENIDO ADICIONAL:
    - Palabras clave: ${(analysisInfo.keywords as string) || "No especificadas"}
    - Temas de contenido: ${analysisInfo.contentThemes ? JSON.stringify(analysisInfo.contentThemes) : "No especificados"}
    - Notas adicionales: ${(analysisInfo.additionalNotes as string) || "Ninguna"}

    PRODUCTOS:
    ${productsInfo.length > 0 ? productsInfo.map((product) => `- ${product.name}: ${product.description || "Sin descripción"}`).join("\n    ") : "- No hay productos registrados"}
    `
      : `
    INFORMACIÓN DEL PROYECTO:
    - Cliente: ${projectInfo?.client ?? (projectData.client as string) ?? "No especificado"}
    - Descripción: ${projectInfo?.description ?? (projectData.description as string) ?? "No especificada"}
    `;

    const prompt = `
      Crea un cronograma avanzado de contenido para redes sociales para el proyecto "${projectName}". Actúa como un experto profesional en marketing digital con especialización en contenidos de alto impacto, branding y narrativa de marca. Tu objetivo es crear contenido estratégico, persuasivo y memorable que genere engagement.

      ${projectContext}

      **PERIODO DE PLANIFICACIÓN:** 
      De ${formattedDate} a ${endDate} (${durationDays} días)

      **ESPECIFICACIONES DEL CLIENTE:** 
      ${specifications || "Ninguna especificación adicional proporcionada."}

      **ESTRATEGIA DE REDES SOCIALES:**
      ${socialNetworksSection || "Sugiere 2-3 redes sociales estratégicamente seleccionadas para el público objetivo de este proyecto."}

      **HISTORIAL DE CONTENIDO (EVITAR DUPLICACIÓN):**
      ${previousContentSection || "Sin historial de contenido previo disponible."}

      **INSTRUCCIONES ADICIONALES:**
      ${additionalInstructions || "Ninguna instrucción adicional."}

      **DIRECTRICES CRÍTICAS PARA LA CREACIÓN DE CONTENIDO:**
      1. COHERENCIA CON EL PROYECTO: Cada publicación debe reflejar los valores, objetivos y personalidad definidos arriba.
      2. PERSONALIZACIÓN: Adapta el contenido específicamente para el buyer persona y arquetipos definidos.
      3. ESTRATEGIA: Asegura que cada pieza de contenido apoye las estrategias de marketing establecidas.
      4. VOZ DE MARCA: Mantén consistentemente el estilo de comunicación definido.
      5. PRODUCTOS/SERVICIOS: Integra naturalmente los productos/servicios en el contenido sin ser excesivamente promocional.

      **DIRECTRICES PARA CREACIÓN DE CONTENIDO DE ALTA CALIDAD 2025:**
      6. UVP ALIGNMENT: Cada entrada debe incluir un puntaje de alineaciÃ³n con la UVP (0-100) y una explicaciÃ³n breve del porquÃ©.
      7. VALIDACIÃ“N ESTRATÃ‰GICA: Si una idea no se alinea con la UVP, con el buyer persona o con el tono de marca, reemplÃ¡zala por otra mejor alineada.
      1. STORYTELLING - Utiliza narrativas emocionales y personales que conecten con la audiencia.
      2. VALOR PRÁCTICO - Cada publicación debe ofrecer insights, consejos, o soluciones reales.
      3. LLAMADAS A LA ACCIÓN - Incluye CTAs claros y persuasivos que inciten al compromiso.
      4. ADAPTACIÓN POR PLATAFORMA - Personaliza el tono y formato según cada red social:
         - INSTAGRAM: Carruseles para mayor engagement (0.55%), Reels para alcance (2x más), Stories diarios
         - FACEBOOK: Reels verticales <30 segundos, contenido auténtico sin IA, live videos para engagement
         - LINKEDIN: 3-5 posts/semana B2B, horario 10AM-12PM, contenido de liderazgo de pensamiento
         - TIKTOK: Videos 10-15 segundos, 3-5x/semana, participar en tendencias y challenges
         - YOUTUBE: Combinar Shorts (31-60s) con videos largos educativos
      5. ORIGINALIDAD - Evita clichés y lugares comunes del sector, busca ángulos únicos.
      6. ESTILO DISTINTIVO - Mantén coherencia con la voz de marca pero con variedad creativa.
      7. INSTRUCCIONES VISUALES - Sé específico sobre las imágenes/videos sugiriendo paletas de color, composición y elementos visuales distintivos.
      8. FRECUENCIAS ÓPTIMAS 2025:
         - Instagram: 3-4 posts/semana + 1-2 Stories/día
         - Facebook: 3-5 posts/semana (mínimo), idealmente 1-2/día
         - LinkedIn: 3-5 posts/semana en horario laboral
         - TikTok: 3-5 posts/semana
         - YouTube: Consistencia semanal según capacidad

      **ESPECIFICACIONES TÉCNICAS POR FORMATO 2025:**

      📱 **INSTAGRAM:**
      - Reels: 1080x1920px (9:16), máximo 90 segundos, MP4/MOV, 30fps, archivo máximo 650MB
      - Posts: 1080x1080px (1:1) o 1080x1350px (4:5), imágenes JPG/PNG
      - Stories: 1080x1920px (9:16), máximo 30 segundos, desaparecen en 24h
      - Carruseles: Hasta 20 slides, 1080x1080px o 1080x1350px por slide

      📘 **FACEBOOK:**
      - Videos: 1080x1080px mínimo, hasta 240 minutos, MP4/MOV, 30fps, máximo 10GB
      - Reels: 1440x2560px (9:16), sin límite de tiempo, MP4/MOV
      - Posts imagen: 1200x630px (1.91:1), 4:5 ratio óptimo para feed
      - Stories: 1080x1920px (9:16), máximo 30 minutos

      💼 **LINKEDIN:**
      - Videos: 1080x1080px (1:1) o 1080x1350px (4:5), hasta 15 minutos, MP4/MOV, máximo 5GB
      - Posts imagen: 1200x627px (1.91:1) para enlaces, 1080x1080px (1:1) para posts
      - Artículos: Imagen destacada 1192x628px, texto sin límite

      🎵 **TIKTOK:**
      - Videos: 1080x1920px (9:16), hasta 10 minutos, MP4/MOV, 30fps, máximo 500MB
      - Duración óptima: 15-60 segundos para mayor engagement
      - Audio: AAC 128kbps mínimo, H.264 codec recomendado

      📺 **YOUTUBE:**
      - Shorts: 1080x1920px (9:16), hasta 3 minutos, MP4/MOV, 1080p máximo
      - Videos regulares: 1920x1080px (16:9), hasta 12 horas, MP4 preferido
      - Thumbnails: 1280x720px (16:9), máximo 2MB

      🐦 **TWITTER/X:**
      - Videos: 1280x720px (16:9) o 720x1280px (9:16), hasta 2:20 min (usuarios gratuitos)
      - Formato: MP4/MOV, H.264 codec, máximo 512MB
      - Premium: Hasta 4 horas, máximo 16GB

      **ESTRUCTURA DE LAS PUBLICACIONES POR PLATAFORMA:**
      - TÍTULOS: Concisos, impactantes, con palabras potentes y gatillos emocionales.
      - CONTENIDO PRINCIPAL: Desarrolla ideas completas con narrativa estructurada (problema-solución-beneficio).
      - COPY IN: Texto que aparecerá sobre la imagen/diseño, corto y memorable.
      - COPY OUT: Descripción completa que acompaña a la publicación, escrito en formato conversacional, personal y persuasivo.
      - HASHTAGS: 
        * Instagram: Hashtags relevantes y específicos del nicho
        * Facebook: Hashtags mínimos, enfoque en contenido orgánico
        * LinkedIn: Hashtags profesionales y de industria
        * TikTok: Hashtags trending combinados con nicho específico
      - FORMATOS RECOMENDADOS 2025:
        * Instagram: Carruseles, Reels, Stories interactivas
        * Facebook: Reels, imágenes optimizadas, contenido de valor
        * LinkedIn: Videos educativos, artículos largos, contenido B2B
        * TikTok: Videos verticales dinámicos
        * YouTube: Shorts para descubrimiento, videos largos para profundidad

      **REQUISITOS CRÍTICOS DE CANTIDAD ADAPTATIVA:**
      - NO uses cantidades fijas de publicaciones
      - SIEMPRE analiza las especificaciones del proyecto y sus redes sociales configuradas
      - Si el proyecto define frecuencias mensuales (ej: 20 publicaciones/mes), calcula proporcionalmente para ${durationDays} días
      - Formula: (publicaciones_mensuales × ${durationDays}) ÷ 30 días
      - Si no hay especificaciones claras, genera al menos ${Math.max(3, Math.ceil(durationDays / 5))} publicaciones mínimo
      - Distribuye las publicaciones uniformemente según las especificaciones de cada red social
      - Respeta SIEMPRE las características y frecuencias definidas para cada proyecto

      **FORMATO DE RESPUESTA CRÍTICO:**
      RESPONDE ÚNICAMENTE CON JSON VÁLIDO. NO agregues texto antes o después.
      EVITA comillas dobles dentro del contenido de texto. Usa comillas simples si necesario.
      ESCAPA todos los caracteres especiales que puedan romper el JSON.

      Estructura JSON requerida (todo en español):
      {
        "name": "Nombre estratégico del cronograma",
        "entries": [
          {
            "title": "Título impactante sin comillas dobles",
            "description": "Objetivo estratégico de la publicación",
            "content": "Contenido principal extenso sin comillas dobles",
            "copyIn": "Texto conciso para incluir sobre la imagen",
            "copyOut": "Texto externo detallado para la descripción del post",
            "designInstructions": "Instrucciones detalladas de diseño",
            "platform": "Instagram",
            "postDate": "YYYY-MM-DD",
            "postTime": "HH:MM",
            "hashtags": "#hashtag1 #hashtag2 #hashtag3",
            "uvp_alignment_score": 85,
            "uvp_alignment_reason": "Explicación breve de por qué esta idea se alinea con la UVP"
          }
        ]
      }
    `;

    // Usamos exclusivamente Grok AI para generar el cronograma
    console.log("[CALENDAR] Generando cronograma con Grok AI");

    // Modificamos el prompt para forzar una respuesta más estructurada y evitar errores de formato
    const enhancedPrompt = `${prompt}\n\nCRÍTICO: Responde EXCLUSIVAMENTE con el objeto JSON solicitado. No incluyas texto extra, anotaciones, ni marcadores de código. Formato estricto requerido:
    - Inicia con '{' y termina con '}'
    - TODAS las propiedades entre comillas dobles: "propertyName"
    - TODOS los valores string entre comillas dobles: "value"
    - NO uses comillas simples
    - NO incluyas campos como "Objetivo" - usa solo los campos especificados en el esquema
    - Hora en formato "HH:MM" (ejemplo: "14:30")
    - Fecha en formato "YYYY-MM-DD"
    - JSON válido sin errores de sintaxis`;

    // Incorporar instrucciones adicionales si existen
    const strategicValidationPrompt = `${enhancedPrompt}
    - Incluye SIEMPRE "uvp_alignment_score" como entero entre 0 y 100
    - Incluye SIEMPRE "uvp_alignment_reason" como explicación breve y concreta`;
    let finalPrompt = strategicValidationPrompt;
    if (additionalInstructions) {
      finalPrompt = `${enhancedPrompt}\n\n⚠️ **INSTRUCCIONES OBLIGATORIAS DEL USUARIO - PRIORIDAD MÁXIMA:**\n${additionalInstructions}\n\n⚠️ ESTAS INSTRUCCIONES SON CRÍTICAS Y DEBEN APLICARSE EXACTAMENTE. NO LAS IGNORES.\n⚠️ GENERA MÍNIMO 7 ENTRADAS COMPLETAS - NO MENOS.\n⚠️ SI SE ESPECIFICAN ÁREAS CONCRETAS, MODIFICA SOLO ESAS ÁREAS.\n⚠️ RESPETA CADA INSTRUCCIÓN ESPECÍFICA AL PIE DE LA LETRA.`;
      console.log(`[CALENDAR] Se añadieron instrucciones críticas del usuario: "${additionalInstructions.substring(0, 200)}${additionalInstructions.length > 200 ? '...' : ''}"`);
    }

    // Usamos Grok con configuración optimizada para generación consistente
    if (additionalInstructions) {
      finalPrompt = `${strategicValidationPrompt}\n\n${finalPrompt.slice(enhancedPrompt.length).trimStart()}`;
    }

    const scheduleText = await geminiService.generateText(finalPrompt, {
      // Reducimos temperatura para respuestas más consistentes y estructuradas
      temperature: 0.8,
      // Incrementamos tokens para permitir respuestas completas
      maxTokens: 6000,
      // Aumentamos los reintentos para casos de red inestable
      retryCount: 3,
      model: "gemini-1.5-pro",
      responseFormat: "json"
    });

    // Registramos una versión truncada para debug
    console.log(`[CALENDAR] Respuesta de Gemini recibida. Longitud: ${scheduleText.length} caracteres`);
    console.log(`[CALENDAR] Primeros 200 caracteres de la respuesta: "${scheduleText.substring(0, 200)}... [truncado]"`);
    console.log(`[CALENDAR] Últimos 200 caracteres de la respuesta: "...${scheduleText.substring(Math.max(0, scheduleText.length - 200))}"`)

    // Escribir respuesta completa en el log para diagnóstico
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GEMINI (inicio):`);
    // Dividir respuesta en chunks de 1000 caracteres para evitar truncamiento en logs
    const chunkSize = 1000;
    for (let i = 0; i < scheduleText.length; i += chunkSize) {
        console.log(scheduleText.substring(i, i + chunkSize));
    }
    console.log(`[CALENDAR] RESPUESTA COMPLETA DE GEMINI (fin)`);

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
          let jsonContent = scheduleText.substring(jsonStart, jsonEnd);

          // Pre-procesamiento para corregir errores comunes de formato
          console.log(`[CALENDAR] Aplicando correcciones de formato antes del parsing`);
          jsonContent = jsonContent.replace(/"(\d{2})":\s*(\d{2})"/g, '"$1:$2"');
          jsonContent = jsonContent.replace(/:\s*"(\d{2})":\s*(\d{2})"/g, ': "$1:$2"');
          jsonContent = jsonContent.replace(/"ime":\s*"([^"]+)"/g, '"postTime": "$1"');
          jsonContent = jsonContent.replace(/"time":\s*"([^"]+)"/g, '"postTime": "$1"');
          jsonContent = jsonContent.replace(/,\s*}/g, '}');
          jsonContent = jsonContent.replace(/,\s*]/g, ']');

          // Corregir problema específico con campo "Objetivo" mal formateado
          jsonContent = jsonContent.replace(/"Objetivo":\s*"([^"]+)"/g, '"objective": "$1"');
          jsonContent = jsonContent.replace(/""Objetivo""/g, '"objective"');

          // Limpiar comillas dobles consecutivas
          jsonContent = jsonContent.replace(/""+/g, '"');

          // Arreglar separadores malformados
          jsonContent = jsonContent.replace(/"\s*:\s*"/g, '": "');
          jsonContent = jsonContent.replace(/"\s*,\s*"/g, '", "');

          // Registrar longitud para depuración
          console.log(`[CALENDAR] Longitud del contenido JSON procesado: ${jsonContent.length} caracteres`);
          console.log(`[CALENDAR] Primeros 100 caracteres del JSON procesado: ${jsonContent.substring(0, 100)}...`);

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
              const validEntries = parsedContent.entries
                .filter((entry: any) =>
                  entry.title && entry.platform && entry.postDate &&
                  typeof entry.title === 'string' &&
                  typeof entry.platform === 'string' &&
                  typeof entry.postDate === 'string'
                )
                .map((entry: any) => normalizeScheduleEntry(entry, projectData, formattedDate));

              console.log(`[CALENDAR] Entradas con todos los campos requeridos: ${validEntries.length}/${parsedContent.entries.length}`);

              if (validEntries.length === parsedContent.entries.length) {
                // Todas las entradas son válidas
                console.log(`[CALENDAR] ÉXITO: Estrategia 1 exitosa. Devolviendo cronograma con ${validEntries.length} entradas`);
                return {
                  name: parsedContent.name || `Cronograma para ${projectName}`,
                  entries: validEntries
                };
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
          jsonContent = jsonContent.replace(/:[^"\[\{]*?([\wáéíóúüñÁÉÍÓÚÜÑ\s]+)[^"\]\}]*?([,}\]])/g, (match, p1, p2) => {
            const value = p1.trim();
            const separator = p2.trim();
            // Si es un valor que se ve como un número o booleano, no añadir comillas
            if (/^(\-?\d+\.?\d*|true|false|null)$/.test(value)) {
              return `:"${value}"${separator}`;
            }
            return `:"${value}"${separator}`;
          });

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
              const validEntries = parsedContent.entries
                .filter((entry: any) => entry.title && entry.platform && entry.postDate)
                .map((entry: any) => normalizeScheduleEntry(entry, projectData, formattedDate));

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
                            // Reparar problema específico con campos mal formateados
                            entryStr = entryStr.replace(/"(\d{2})":\s*(\d{2})"/g, '"$1:$2"');
                            entryStr = entryStr.replace(/:\s*"(\d{2})":\s*(\d{2})"/g, ': "$1:$2"');
                            entryStr = entryStr.replace(/"ime":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$1:$2"');
                            entryStr = entryStr.replace(/"time":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$$1:$2"');
                            entryStr = entryStr.replace(/"postTime":\s*"(\d{2})":\s*(\d{2})"/g, '"postTime": "$1:$2"');

                            // Corregir campo "Objetivo" problemático
                            entryStr = entryStr.replace(/""Objetivo""\s*:\s*"([^"]+)"/g, '"objective": "$1"');
                            entryStr = entryStr.replace(/"Objetivo"\s*:\s*"([^"]+)"/g, '"objective": "$1"');
                            entryStr = entryStr.replace(/""Objetivo""/g, '"objective"');

                            // Limpiar comillas dobles consecutivas
                            entryStr = entryStr.replace(/""+/g, '"');
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
                      validEntries.push(normalizeScheduleEntry(entry, projectData, formattedDate));
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
                const validEntries = parsedContent.entries
                  .filter((entry: any) => entry.title && entry.platform && entry.postDate)
                  .map((entry: any) => normalizeScheduleEntry(entry, projectData, formattedDate));

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
                validEntries.push(normalizeScheduleEntry(completeEntry, projectData, formattedDate));
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
                  validEntries.push(normalizeScheduleEntry(completeEntry, projectData, formattedDate));
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
              entries.push(normalizeScheduleEntry({
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
              }, projectData, formattedDate));
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

          entries.push(normalizeScheduleEntry({
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
          }, projectData, formattedDate));
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
            hashtags: "#marketing #contenido #socialmedia",
            uvpAlignmentScore: 50,
            uvpAlignmentReason: buildUvpAlignmentReason(createFallbackEntry(projectName, formattedDate, projectData), projectData, 50)
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
            hashtags: "#marketing #contenido #socialmedia",
            uvpAlignmentScore: 50,
            uvpAlignmentReason: buildUvpAlignmentReason(createFallbackEntry(projectName, formattedDate, projectData), projectData, 50)
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
        errorMessage = `Error de conexión con la API de Gemini: ${error.message}`;
      } else if (errorType === "JSON_PARSING" || error.message.includes("JSON") || error.message.includes("parse")) {
        errorType = "JSON_PARSING";
        errorMessage = `Error de procesamiento de respuesta JSON: ${error.message}`;
      } else if (errorType === "RATE_LIMIT" || error.message.includes("limit")) {
        errorType = "RATE_LIMIT";
        errorMessage = `Se ha excedido el límite de peticiones a Gemini: ${error.message}`;
      } else if (errorType === "AUTH" || error.message.includes("autenticación") || error.message.includes("authentication")) {
        errorType = "AUTH";
        errorMessage = `Error de autenticación con Gemini: ${error.message}`;
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
