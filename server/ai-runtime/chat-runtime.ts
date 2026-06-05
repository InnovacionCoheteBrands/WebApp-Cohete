import { z } from "zod";
import type { IStorage } from "../storage";
import {
  agentRequestSchema,
  agentIntentSchema,
  briefContextSchema,
  strategyOutputSchema,
  copyOutputSchema,
  auditResultSchema,
  type AgentRequest,
  type AgentIntent,
  type BriefContext,
  type StrategyOutput,
  type CopyOutput,
  type AuditResult,
  type AgentName,
} from "./contracts";
import { GroqProvider, type AITextResponse, type TokenUsage } from "./provider";
import { AgentRouter } from "./router";

type RuntimeResult = {
  content: string;
  auditWarning?: string;
  runId: number;
  finalModel: string;
  role: "assistant";
  createdAt: Date;
};

type ExecutionState = {
  activatedAgents: AgentName[];
  estimatedTokens: number;
  actualTokens: number;
  finalModel: string;
};

const ENTRYPOINT = "project_chat";
const MAX_WORKFLOW_TOKENS = 80000;
const CHAR_LIMITS: Record<string, number> = {
  "twitter/x": 280,
  twitter: 280,
  x: 280,
  linkedin: 1300,
  instagram: 2200,
};

export class ProjectChatRuntimeError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
  }
}

export async function runProjectChatRuntime(
  rawRequest: AgentRequest,
  storage: IStorage,
): Promise<RuntimeResult> {
  const request = agentRequestSchema.parse(rawRequest);
  const provider = new GroqProvider();
  const router = new AgentRouter(storage);
  const state: ExecutionState = {
    activatedAgents: [],
    estimatedTokens: 0,
    actualTokens: 0,
    finalModel: "openai/gpt-oss-20b",
  };

  const run = await storage.createAgentRun({
    projectId: request.projectId,
    userId: request.userId,
    entrypoint: ENTRYPOINT,
    status: "running",
    route: "pending",
    startedAt: new Date(),
  });

  try {
    const orchestratorRoute = await router.resolve(ENTRYPOINT, "orchestrator");
    state.activatedAgents.push("orchestrator");
    const intentResponse = await provider.generateStructured({
      ...orchestratorRoute,
      prompt: buildOrchestratorPrompt(request),
      schema: agentIntentSchema,
    });
    state.actualTokens += getTotalTokens(intentResponse.usage);
    state.finalModel = intentResponse.model;

    const intent = agentIntentSchema.parse(intentResponse.data);
    state.estimatedTokens = estimateWorkflowTokens(request, intent);

    await storage.createAgentArtifact({
      runId: run.id,
      agent: "orchestrator",
      artifactType: "intent",
      payloadJson: intent,
    });

    if (state.estimatedTokens > MAX_WORKFLOW_TOKENS) {
      const blockedMessage = [
        "Tu solicitud excede el presupuesto operativo configurado para esta fase.",
        "Divídela en partes más pequeñas, por ejemplo: brief, estrategia o copies por separado.",
      ].join(" ");

      await storage.createAgentArtifact({
        runId: run.id,
        agent: "orchestrator",
        artifactType: "execution_trace",
        payloadJson: {
          route: intent.route,
          activatedAgents: state.activatedAgents,
          estimatedTokens: state.estimatedTokens,
          actualTokens: state.actualTokens,
        },
      });

      await storage.updateAgentRun(run.id, {
        status: "blocked",
        route: intent.route,
        finalAgent: "orchestrator",
        provider: intentResponse.provider,
        model: intentResponse.model,
        estimatedTokens: state.estimatedTokens,
        actualTokens: state.actualTokens,
        error: blockedMessage,
        finishedAt: new Date(),
      });

      return {
        content: blockedMessage,
        runId: run.id,
        finalModel: intentResponse.model,
        role: "assistant",
        createdAt: new Date(),
      };
    }

    let briefContext: BriefContext | null = null;
    let strategyOutput: StrategyOutput | null = null;
    let copyOutput: CopyOutput | null = null;
    const briefComplexity = classifyBriefComplexity(request);
    const copyQuality = classifyCopyQuality(request, intent);

    if (intent.needsBrief) {
      const briefRoute = await router.resolve(ENTRYPOINT, "brief_analyst", {
        briefComplexity,
      });
      state.activatedAgents.push("brief_analyst");
      const briefResponse = await provider.generateStructured({
        ...briefRoute,
        prompt: buildBriefPrompt(request, intent),
        schema: briefContextSchema,
      });
      briefContext = briefContextSchema.parse(briefResponse.data);
      state.actualTokens += getTotalTokens(briefResponse.usage);
      state.finalModel = briefResponse.model;

      await storage.createAgentArtifact({
        runId: run.id,
        agent: "brief_analyst",
        artifactType: "brief_context",
        payloadJson: briefContext,
      });
    }

    if (intent.needsStrategy) {
      const strategistRoute = await router.resolve(ENTRYPOINT, "marketing_strategist", {
        strategyMode: intent.strategyMode,
      });
      state.activatedAgents.push("marketing_strategist");
      const strategyResponse = await provider.generateStructured({
        ...strategistRoute,
        prompt: buildStrategyPrompt(request, briefContext, intent),
        schema: strategyOutputSchema,
      });
      strategyOutput = strategyOutputSchema.parse(strategyResponse.data);
      state.actualTokens += getTotalTokens(strategyResponse.usage);
      state.finalModel = strategyResponse.model;

      await storage.createAgentArtifact({
        runId: run.id,
        agent: "marketing_strategist",
        artifactType: "strategy_output",
        payloadJson: strategyOutput,
      });
    }

    if (intent.needsCopy) {
      const copywriterRoute = await router.resolve(ENTRYPOINT, "copywriter", {
        copyQuality,
      });
      state.activatedAgents.push("copywriter");
      const copyResponse = await provider.generateStructured({
        ...copywriterRoute,
        prompt: buildCopyPrompt(request, briefContext, strategyOutput, intent),
        schema: copyOutputSchema,
      });

      copyOutput = validateCopyOutput(copyOutputSchema.parse(copyResponse.data));
      state.actualTokens += getTotalTokens(copyResponse.usage);
      state.finalModel = copyResponse.model;

      await storage.createAgentArtifact({
        runId: run.id,
        agent: "copywriter",
        artifactType: "copy_output",
        payloadJson: copyOutput,
      });
    }

    const draftContent = buildDraftResponse(intent, request, briefContext, strategyOutput, copyOutput);

    const auditRoute = await router.resolve(ENTRYPOINT, "brand_auditor");
    state.activatedAgents.push("brand_auditor");
    const auditResponse = await provider.generateStructured({
      ...auditRoute,
      prompt: buildAuditPrompt(request, draftContent, briefContext),
      schema: auditResultSchema,
    });
    const audit = auditResultSchema.parse(auditResponse.data);
    state.actualTokens += getTotalTokens(auditResponse.usage);

    await storage.createAgentArtifact({
      runId: run.id,
      agent: "brand_auditor",
      artifactType: "audit_result",
      payloadJson: audit,
    });

    if (audit.severity === "critical" || audit.blocked) {
      const blockedContent = buildBlockedAuditMessage(audit);
      await storage.createAgentArtifact({
        runId: run.id,
        agent: "brand_auditor",
        artifactType: "execution_trace",
        payloadJson: {
          route: intent.route,
          activatedAgents: state.activatedAgents,
          estimatedTokens: state.estimatedTokens,
          actualTokens: state.actualTokens,
        },
      });
      await storage.updateAgentRun(run.id, {
        status: "blocked",
        route: intent.route,
        finalAgent: "brand_auditor",
        provider: auditResponse.provider,
        model: auditResponse.model,
        estimatedTokens: state.estimatedTokens,
        actualTokens: state.actualTokens,
        error: audit.summary,
        finishedAt: new Date(),
      });

      return {
        content: blockedContent,
        runId: run.id,
        finalModel: state.finalModel,
        role: "assistant",
        createdAt: new Date(),
      };
    }

    const auditWarning = audit.severity === "medium"
      ? audit.warnings[0] || audit.summary
      : undefined;

    await storage.createAgentArtifact({
      runId: run.id,
      agent: "brand_auditor",
      artifactType: "execution_trace",
      payloadJson: {
        route: intent.route,
        activatedAgents: state.activatedAgents,
        estimatedTokens: state.estimatedTokens,
        actualTokens: state.actualTokens,
      },
    });

    await storage.updateAgentRun(run.id, {
      status: "completed",
      route: intent.route,
      finalAgent: state.activatedAgents[state.activatedAgents.length - 1],
      provider: auditResponse.provider,
      model: state.finalModel,
      estimatedTokens: state.estimatedTokens,
      actualTokens: state.actualTokens,
      finishedAt: new Date(),
    });

    return {
      content: draftContent,
      auditWarning,
      runId: run.id,
      finalModel: state.finalModel,
      role: "assistant",
      createdAt: new Date(),
    };
  } catch (error) {
    const runtimeError = toRuntimeError(error);
    await storage.createAgentArtifact({
      runId: run.id,
      agent: state.activatedAgents[state.activatedAgents.length - 1] || "orchestrator",
      artifactType: "execution_trace",
      payloadJson: {
        route: "failed",
        activatedAgents: state.activatedAgents,
        estimatedTokens: state.estimatedTokens,
        actualTokens: state.actualTokens,
        error: runtimeError.message,
      },
    });
    await storage.updateAgentRun(run.id, {
      status: "failed",
      route: "failed",
      finalAgent: state.activatedAgents[state.activatedAgents.length - 1] || "orchestrator",
      provider: "groq",
      model: state.finalModel,
      estimatedTokens: state.estimatedTokens,
      actualTokens: state.actualTokens,
      error: runtimeError.message,
      finishedAt: new Date(),
    });
    throw runtimeError;
  }
}

function buildOrchestratorPrompt(request: AgentRequest) {
  return [
    "Actúa como un orquestador multi-agente para chat de proyecto.",
    "Devuelve solo JSON válido con este formato exacto:",
    JSON.stringify({
      route: "answer_only",
      needsBrief: false,
      needsStrategy: false,
      needsCopy: false,
      strategyMode: "none",
      channels: [],
      userGoal: "describir objetivo del usuario",
      directResponse: "respuesta directa solo cuando route sea answer_only",
    }, null, 2),
    "",
    "Reglas de clasificación:",
    "- Usa answer_only para preguntas informativas o consultivas que no requieran estrategia ni copy nuevo.",
    "- Usa brief_plus_answer cuando el usuario comparte mucho contexto y conviene estructurarlo primero.",
    "- Usa brief_strategy_copy_audit cuando pida estrategia, tono, ángulos o copy nuevo/reescritura.",
    "- needsBrief debe ser true si el input es largo, ambiguo o trae briefing/proyecto.",
    "- needsStrategy debe ser true si piden campaña, tono, enfoque, posicionamiento o ángulos.",
    "- needsCopy debe ser true si piden copies, hooks, CTAs, captions o reescritura.",
    "- strategyMode debe ser variation si el usuario pide iterar o ajustar algo existente.",
    "- channels debe incluir solo canales realmente pedidos o claramente inferibles.",
    "- directResponse debe ser null salvo en answer_only.",
    "",
    "Contexto del proyecto:",
    formatProjectContext(request),
    "",
    "Historial reciente:",
    formatHistory(request.chatHistory),
    "",
    `Mensaje del usuario: ${request.message}`,
  ].join("\n");
}

function buildBriefPrompt(request: AgentRequest, intent: AgentIntent) {
  return [
    "Convierte el siguiente contexto en un JSON limpio y accionable.",
    "Devuelve solo JSON con estas claves exactas: objetivo, audiencia, tono, canales, kpis, restricciones.",
    "Si falta información, usa supuestos explícitos pero conservadores.",
    "",
    "Contexto del proyecto:",
    formatProjectContext(request),
    "",
    "Meta del usuario:",
    intent.userGoal,
    "",
    "Mensaje del usuario:",
    request.message,
  ].join("\n");
}

function buildStrategyPrompt(request: AgentRequest, briefContext: BriefContext | null, intent: AgentIntent) {
  return [
    "Eres un estratega de marketing. Devuelve solo JSON válido.",
    "La salida debe incluir mínimo 3 ángulos creativos y tono por canal.",
    "",
    "Brief estructurado:",
    JSON.stringify(briefContext || buildFallbackBriefContext(request), null, 2),
    "",
    "Petición del usuario:",
    request.message,
    "",
    "Formato esperado:",
    JSON.stringify({
      resumen: "",
      angulosCreativos: [
        { titulo: "", descripcion: "" },
        { titulo: "", descripcion: "" },
        { titulo: "", descripcion: "" },
      ],
      tonoPorCanal: [{ canal: "", tono: "" }],
      recomendaciones: [""],
    }, null, 2),
  ].join("\n");
}

function buildCopyPrompt(
  request: AgentRequest,
  briefContext: BriefContext | null,
  strategyOutput: StrategyOutput | null,
  intent: AgentIntent,
) {
  const channels = intent.channels.length > 0 ? intent.channels : inferChannelsFromText(request.message, briefContext);
  return [
    "Eres un copywriter senior de marketing. Devuelve solo JSON válido.",
    "Genera mínimo 3 variantes por pieza.",
    "Cada variante debe incluir hook, body, cta, hashtags y charCount.",
    "Respeta límites por canal: Twitter/X 280, LinkedIn 1300, Instagram 2200.",
    "",
    "Canales solicitados:",
    JSON.stringify(channels, null, 2),
    "",
    "Brief estructurado:",
    JSON.stringify(briefContext || buildFallbackBriefContext(request), null, 2),
    "",
    "Estrategia disponible:",
    JSON.stringify(strategyOutput || null, null, 2),
    "",
    "Mensaje del usuario:",
    request.message,
    "",
    "Formato esperado:",
    JSON.stringify({
      pieces: [
        {
          channel: channels[0] || "Instagram",
          variants: [
            { hook: "", body: "", cta: "", hashtags: ["#ejemplo"], charCount: 120 },
            { hook: "", body: "", cta: "", hashtags: ["#ejemplo"], charCount: 120 },
            { hook: "", body: "", cta: "", hashtags: ["#ejemplo"], charCount: 120 },
          ],
        },
      ],
    }, null, 2),
  ].join("\n");
}

function buildAuditPrompt(request: AgentRequest, draftContent: string, briefContext: BriefContext | null) {
  return [
    "Eres un auditor de marca y seguridad.",
    "Revisa consistencia de marca, alineación con buyer persona, tono, riesgos reputacionales y cumplimiento.",
    "Marca severidad critical si el contenido no debe entregarse.",
    "Marca severidad medium si puede entregarse con advertencia.",
    "No permitas más de 3 repeticiones del mismo término dominante por pieza.",
    "Devuelve solo JSON válido.",
    "",
    "Brief de referencia:",
    JSON.stringify(briefContext || buildFallbackBriefContext(request), null, 2),
    "",
    "Contenido a auditar:",
    draftContent,
    "",
    "Formato esperado:",
    JSON.stringify({
      severity: "none",
      blocked: false,
      warnings: [],
      findings: [],
      suggestedFixes: [],
      summary: "",
    }, null, 2),
  ].join("\n");
}

function buildDraftResponse(
  intent: AgentIntent,
  request: AgentRequest,
  briefContext: BriefContext | null,
  strategyOutput: StrategyOutput | null,
  copyOutput: CopyOutput | null,
) {
  if (intent.route === "answer_only") {
    return intent.directResponse || "No pude generar una respuesta directa con el contexto disponible.";
  }

  if (copyOutput) {
    return formatCopyOutput(copyOutput);
  }

  if (strategyOutput) {
    return formatStrategyOutput(strategyOutput);
  }

  if (briefContext) {
    return formatBriefContext(briefContext);
  }

  return `No pude completar la respuesta solicitada para: ${request.message}`;
}

function formatBriefContext(briefContext: BriefContext) {
  return [
    "Resumen estructurado del brief:",
    `- Objetivo: ${briefContext.objetivo}`,
    `- Audiencia: ${briefContext.audiencia}`,
    `- Tono: ${briefContext.tono}`,
    `- Canales: ${briefContext.canales.join(", ") || "No definidos"}`,
    `- KPIs: ${briefContext.kpis.join(", ") || "No definidos"}`,
    `- Restricciones: ${briefContext.restricciones.join(", ") || "No definidas"}`,
  ].join("\n");
}

function formatStrategyOutput(strategyOutput: StrategyOutput) {
  return [
    strategyOutput.resumen,
    "",
    "Angulos creativos:",
    ...strategyOutput.angulosCreativos.map((angle, index) => `${index + 1}. ${angle.titulo}: ${angle.descripcion}`),
    "",
    "Tono por canal:",
    ...strategyOutput.tonoPorCanal.map((entry) => `- ${entry.canal}: ${entry.tono}`),
    "",
    "Recomendaciones:",
    ...(strategyOutput.recomendaciones.length > 0
      ? strategyOutput.recomendaciones.map((recommendation) => `- ${recommendation}`)
      : ["- Sin recomendaciones adicionales."]),
  ].join("\n");
}

function formatCopyOutput(copyOutput: CopyOutput) {
  return copyOutput.pieces.map((piece) => {
    const variants = piece.variants.map((variant, index) => {
      const hashtags = variant.hashtags.length > 0 ? variant.hashtags.join(" ") : "Sin hashtags";
      return [
        `Variante ${index + 1}:`,
        `Hook: ${variant.hook}`,
        `Body: ${variant.body}`,
        `CTA: ${variant.cta}`,
        `Hashtags: ${hashtags}`,
        `Caracteres: ${variant.charCount}`,
      ].join("\n");
    }).join("\n\n");

    return [
      `Canal: ${piece.channel}`,
      variants,
    ].join("\n\n");
  }).join("\n\n---\n\n");
}

function buildBlockedAuditMessage(audit: AuditResult) {
  return [
    "No puedo entregar este contenido porque el auditor detectó un riesgo crítico.",
    audit.summary,
    "",
    "Hallazgos:",
    ...audit.findings.map((finding) => `- ${finding}`),
    "",
    "Ajustes sugeridos:",
    ...audit.suggestedFixes.map((fix) => `- ${fix}`),
  ].join("\n");
}

function buildFallbackBriefContext(request: AgentRequest): BriefContext {
  return {
    objetivo: request.message,
    audiencia: request.projectContext.analysis?.buyerPersona || request.projectContext.client,
    tono: request.projectContext.analysis?.brandCommunicationStyle || "Profesional y claro",
    canales: inferChannelsFromText(request.message),
    kpis: [],
    restricciones: [],
  };
}

function inferChannelsFromText(message: string, briefContext?: BriefContext | null) {
  const lowerText = `${message} ${briefContext?.canales.join(" ") || ""}`.toLowerCase();
  const channels = ["Instagram", "LinkedIn", "Twitter/X"].filter((channel) =>
    lowerText.includes(channel.toLowerCase().replace("/x", "")) ||
    (channel === "Twitter/X" && (lowerText.includes("twitter") || lowerText.includes("x ")))
  );
  return channels.length > 0 ? channels : ["Instagram"];
}

function validateCopyOutput(copyOutput: CopyOutput) {
  return {
    pieces: copyOutput.pieces.map((piece) => ({
      ...piece,
      variants: piece.variants.map((variant) => {
        const normalizedHashtags = variant.hashtags.filter(Boolean).map((tag) => tag.startsWith("#") ? tag : `#${tag}`);
        const fullText = [variant.hook, variant.body, variant.cta, normalizedHashtags.join(" ")].filter(Boolean).join(" ");
        const channelKey = piece.channel.toLowerCase();
        const charLimit = CHAR_LIMITS[channelKey] || CHAR_LIMITS[channelKey.replace(/\s+/g, "")] || 2200;

        if (fullText.length > charLimit) {
          throw new ProjectChatRuntimeError(
            `El copy generado para ${piece.channel} excede el límite de ${charLimit} caracteres.`,
            422,
          );
        }

        return {
          ...variant,
          hashtags: normalizedHashtags,
          charCount: fullText.length,
        };
      }),
    })),
  };
}

function estimateWorkflowTokens(request: AgentRequest, intent: AgentIntent) {
  const baseTokens = Math.ceil(JSON.stringify(request).length / 4);
  let total = baseTokens + 2000;

  if (intent.needsBrief) total += 9000;
  if (intent.needsStrategy) total += intent.strategyMode === "variation" ? 6000 : 16000;
  if (intent.needsCopy) total += 18000;

  total += 5000;
  return total;
}

function classifyBriefComplexity(request: AgentRequest) {
  const combinedLength = JSON.stringify({
    message: request.message,
    projectContext: request.projectContext,
    chatHistory: request.chatHistory.slice(-10),
  }).length;

  if (combinedLength > 7000 || request.message.length > 2200 || request.chatHistory.length > 12) {
    return "long_context" as const;
  }

  return "standard" as const;
}

function classifyCopyQuality(request: AgentRequest, intent: AgentIntent) {
  if (!intent.needsCopy) {
    return "standard" as const;
  }

  const premiumSignals = [
    "final",
    "versión final",
    "premium",
    "cliente",
    "campaña principal",
    "campana principal",
    "lanzamiento",
    "anuncio oficial",
    "high-converting",
    "alta conversión",
    "alta conversion",
    "branding",
    "marca",
    "delicado",
    "sensible",
    "ceo",
    "linkedin",
    "press release",
    "comunicado",
    "ads",
    "anuncio pagado",
  ];

  const lowerText = `${request.message} ${(intent.channels || []).join(" ")}`.toLowerCase();
  const premiumHitCount = premiumSignals.filter((signal) => lowerText.includes(signal)).length;

  if (premiumHitCount >= 2 || (intent.needsStrategy && lowerText.includes("lanzamiento"))) {
    return "premium" as const;
  }

  return "standard" as const;
}

function formatProjectContext(request: AgentRequest) {
  return JSON.stringify({
    name: request.projectContext.name,
    client: request.projectContext.client,
    description: request.projectContext.description,
    analysis: request.projectContext.analysis,
  }, null, 2);
}

function formatHistory(chatHistory: AgentRequest["chatHistory"]) {
  const recentMessages = chatHistory.slice(-8);
  if (recentMessages.length === 0) {
    return "Sin historial previo.";
  }

  return recentMessages
    .map((message) => `${message.role === "user" ? "Usuario" : "Asistente"}: ${message.content}`)
    .join("\n");
}

function getTotalTokens(usage?: TokenUsage) {
  return usage?.totalTokens || 0;
}

function toRuntimeError(error: unknown) {
  if (error instanceof ProjectChatRuntimeError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return new ProjectChatRuntimeError(`Error validando salida multi-agente: ${error.message}`, 422);
  }

  if (error instanceof Error) {
    const errorType = (error as Error & { errorType?: string }).errorType;
    if (errorType === "AUTH") {
      return new ProjectChatRuntimeError(error.message, 503);
    }
    if (errorType === "RATE_LIMIT") {
      return new ProjectChatRuntimeError(error.message, 429);
    }
    if (errorType === "JSON_PARSING") {
      return new ProjectChatRuntimeError(error.message, 422);
    }
    if (errorType === "NETWORK") {
      return new ProjectChatRuntimeError(error.message, 503);
    }
    return new ProjectChatRuntimeError(error.message, 500);
  }

  return new ProjectChatRuntimeError("Ocurrió un error desconocido en el runtime multi-agente.", 500);
}
