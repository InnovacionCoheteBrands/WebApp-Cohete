import { z } from "zod";
import type { IStorage } from "../storage";
import { AgentRouter } from "./router";
import { GroqProvider } from "./provider";
import type { AssetPreviewItem } from "../schema";

type StrategicProjectContext = {
  name?: string;
  client?: string | null;
  description?: string | null;
  analysisResults?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type ScheduleLikeEntry = {
  title: string;
  platform: string;
  description?: string | null;
  content?: string | null;
  copyIn?: string | null;
  copyOut?: string | null;
  designInstructions?: string | null;
  hashtags?: string | null;
};

type AssetBundle = AssetPreviewItem & {
  assetBrief: Record<string, unknown>;
};

const assetItemSchema = z.object({
  title: z.string().min(1),
  platform: z.string().min(1),
  creativeAngle: z.string().min(1),
  assetType: z.string().min(1),
  copyHook: z.string().min(1),
  prompt: z.string().min(1),
});

const assetPreviewResponseSchema = z.object({
  summary: z.string().min(1),
  items: z.array(assetItemSchema).min(1).max(4),
});

type AssetPreviewResponse = z.infer<typeof assetPreviewResponseSchema>;

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getAnalysisResults(context?: StrategicProjectContext): Record<string, unknown> | undefined {
  if (!context?.analysisResults || typeof context.analysisResults !== "object") {
    return undefined;
  }

  return context.analysisResults;
}

function getStrategicField(context: StrategicProjectContext | undefined, ...keys: string[]) {
  const analysisResults = getAnalysisResults(context);

  for (const key of keys) {
    const directValue = readString(context?.[key]);
    if (directValue) {
      return directValue;
    }

    const nestedValue = readString(analysisResults?.[key]);
    if (nestedValue) {
      return nestedValue;
    }
  }

  return undefined;
}

function inferAssetType(platform: string) {
  const normalized = platform.toLowerCase();

  if (normalized.includes("instagram")) return "Carrusel editorial";
  if (normalized.includes("linkedin")) return "Gráfico informativo";
  if (normalized.includes("tiktok")) return "Storyboard vertical";
  if (normalized.includes("youtube")) return "Miniatura + guion visual";
  if (normalized.includes("facebook")) return "Key visual promocional";
  if (normalized.includes("twitter") || normalized.includes("x")) return "Tarjeta visual breve";

  return "Pieza visual de apoyo";
}

function buildCreativeAngle(entry: ScheduleLikeEntry, projectContext?: StrategicProjectContext) {
  return (
    readString(entry.description) ||
    readString(entry.content) ||
    getStrategicField(projectContext, "uvp", "marketingStrategies", "communicationObjectives") ||
    "Refuerzo del posicionamiento principal de la marca"
  );
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function buildPreviewSvgDataUri(args: {
  title: string;
  platform: string;
  creativeAngle: string;
  assetType: string;
  tone?: string;
}) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)" rx="36" />
  <rect x="72" y="72" width="1056" height="756" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="110" y="170" fill="#f8fafc" font-size="44" font-family="Arial, sans-serif" font-weight="700">${escapeXml(
    args.title.slice(0, 48),
  )}</text>
  <text x="110" y="228" fill="#cbd5e1" font-size="28" font-family="Arial, sans-serif">${escapeXml(args.platform)}</text>
  <text x="110" y="310" fill="#fef3c7" font-size="24" font-family="Arial, sans-serif">${escapeXml(
    args.assetType,
  )}</text>
  <foreignObject x="110" y="360" width="980" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: white; font-size: 34px; line-height: 1.35;">
      ${escapeXml(args.creativeAngle.slice(0, 220))}
    </div>
  </foreignObject>
  <text x="110" y="700" fill="#93c5fd" font-size="24" font-family="Arial, sans-serif">Tono: ${escapeXml(
    args.tone || "Estratégico y claro",
  )}</text>
  <text x="110" y="758" fill="#94a3b8" font-size="22" font-family="Arial, sans-serif">Vista previa conceptual generada para revisión interna</text>
</svg>`;

  return encodeSvg(svg);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPrompt(entry: ScheduleLikeEntry, projectContext?: StrategicProjectContext) {
  const tone = getStrategicField(projectContext, "brandTone", "brandCommunicationStyle") || "claro y estratégico";
  const buyerPersona = getStrategicField(projectContext, "buyerPersona", "targetAudience") || "audiencia definida por el proyecto";
  const uvp = getStrategicField(projectContext, "uvp") || "propuesta de valor diferenciada de la marca";
  const visualStyle =
    getStrategicField(projectContext, "visualStyleGuidelines", "brandGuidelines") ||
    "composición limpia, branding consistente y foco en legibilidad";

  return [
    `Crea una pieza visual para ${entry.platform}.`,
    `Objetivo creativo: ${buildCreativeAngle(entry, projectContext)}.`,
    `Título o concepto central: ${entry.title}.`,
    `Tono: ${tone}.`,
    `Buyer persona: ${buyerPersona}.`,
    `UVP a reforzar: ${uvp}.`,
    `Lineamientos visuales: ${visualStyle}.`,
    readString(entry.designInstructions) ? `Instrucciones de diseño: ${entry.designInstructions}.` : null,
    readString(entry.copyIn) ? `Texto principal dentro de la pieza: ${entry.copyIn}.` : null,
    readString(entry.copyOut) ? `Caption de apoyo: ${entry.copyOut}.` : null,
    readString(entry.hashtags) ? `Hashtags de referencia: ${entry.hashtags}.` : null,
  ].filter(Boolean).join(" ");
}

export function buildAssetBundleFromEntry(
  entry: ScheduleLikeEntry,
  projectContext?: StrategicProjectContext,
): AssetBundle {
  const creativeAngle = buildCreativeAngle(entry, projectContext);
  const assetType = inferAssetType(entry.platform);
  const prompt = buildPrompt(entry, projectContext);
  const copyHook = readString(entry.copyIn) || readString(entry.title) || creativeAngle;
  const tone = getStrategicField(projectContext, "brandTone", "brandCommunicationStyle");

  return {
    title: entry.title,
    platform: entry.platform,
    creativeAngle,
    assetType,
    copyHook,
    prompt,
    previewUrl: buildPreviewSvgDataUri({
      title: entry.title,
      platform: entry.platform,
      creativeAngle,
      assetType,
      tone,
    }),
    assetBrief: {
      title: entry.title,
      platform: entry.platform,
      creativeAngle,
      assetType,
      prompt,
      tone,
    },
  };
}

function buildFallbackItems(
  projectName: string,
  projectContext: StrategicProjectContext | undefined,
  platforms: string[],
): AssetPreviewResponse {
  const selectedPlatforms = platforms.length > 0 ? platforms : ["Instagram", "LinkedIn", "Facebook"];
  const tone = getStrategicField(projectContext, "brandTone", "brandCommunicationStyle") || "estratégico";
  const theme =
    getStrategicField(projectContext, "uvp", "marketingStrategies", "communicationObjectives") ||
    "mensaje principal de la marca";

  const items = selectedPlatforms.slice(0, 3).map((platform, index) => {
    const title = `${projectName} · Concepto ${index + 1}`;
    const assetType = inferAssetType(platform);
    const creativeAngle = `${theme} adaptado a ${platform}`;
    const prompt = [
      `Crear un ${assetType.toLowerCase()} para ${platform}.`,
      `Mantener tono ${tone} y foco en ${theme}.`,
      "Priorizar claridad del mensaje, branding consistente y CTA visible.",
    ].join(" ");

    return {
      title,
      platform,
      creativeAngle,
      assetType,
      copyHook: `${projectName}: ${theme}`,
      prompt,
    };
  });

  return {
    summary: "Vista previa generada con lógica heurística mientras se prepara la siguiente iteración del flujo IA.",
    items,
  };
}

export async function generateMarketingAssetPreviews(
  input: {
    projectName: string;
    projectContext?: StrategicProjectContext;
    specifications?: string;
    additionalInstructions?: string;
    platforms: string[];
    periodType?: string;
  },
  storage: IStorage,
): Promise<AssetPreviewResponse> {
  const provider = new GroqProvider();
  const router = new AgentRouter(storage);
  const fallback = buildFallbackItems(input.projectName, input.projectContext, input.platforms);

  try {
    const route = await router.resolve("project_chat", "marketing_strategist", {
      strategyMode: "new",
    });
    const response = await provider.generateStructured({
      ...route,
      prompt: [
        "Actúa como un orquestador creativo para marketing.",
        "Devuelve solo JSON válido con la estructura solicitada.",
        "Genera entre 2 y 4 conceptos de activos visuales para previsualización.",
        "",
        `Proyecto: ${input.projectName}`,
        `Contexto: ${JSON.stringify(input.projectContext || {}, null, 2)}`,
        `Especificaciones del calendario: ${input.specifications || "No especificadas"}`,
        `Instrucciones adicionales: ${input.additionalInstructions || "Sin instrucciones adicionales"}`,
        `Periodo: ${input.periodType || "quincenal"}`,
        `Plataformas: ${(input.platforms || []).join(", ") || "Instagram, LinkedIn, Facebook"}`,
        "",
        "Formato esperado:",
        JSON.stringify({
          summary: "resumen ejecutivo",
          items: [
            {
              title: "Concepto",
              platform: "Instagram",
              creativeAngle: "Ángulo creativo",
              assetType: "Carrusel editorial",
              copyHook: "Hook corto",
              prompt: "Prompt detallado para generación visual",
            },
          ],
        }, null, 2),
      ].join("\n"),
      schema: assetPreviewResponseSchema,
    });

    return {
      summary: response.data.summary,
      items: response.data.items.map((item) => ({
        ...item,
        previewUrl: buildPreviewSvgDataUri({
          title: item.title,
          platform: item.platform,
          creativeAngle: item.creativeAngle,
          assetType: item.assetType,
          tone: getStrategicField(input.projectContext, "brandTone", "brandCommunicationStyle"),
        }),
      })),
    };
  } catch (error) {
    return {
      summary: fallback.summary,
      items: fallback.items.map((item) => ({
        ...item,
        previewUrl: buildPreviewSvgDataUri({
          title: item.title,
          platform: item.platform,
          creativeAngle: item.creativeAngle,
          assetType: item.assetType,
          tone: getStrategicField(input.projectContext, "brandTone", "brandCommunicationStyle"),
        }),
      })),
    };
  }
}
