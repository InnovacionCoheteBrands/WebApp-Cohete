import { z } from "zod";

export const agentEntrypointSchema = z.enum(["project_chat"]);
export type AgentEntrypoint = z.infer<typeof agentEntrypointSchema>;

export const agentNameSchema = z.enum([
  "orchestrator",
  "brief_analyst",
  "marketing_strategist",
  "copywriter",
  "brand_auditor",
]);
export type AgentName = z.infer<typeof agentNameSchema>;

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});
export type ChatHistoryMessage = z.infer<typeof chatHistoryMessageSchema>;

export const projectContextSchema = z.object({
  name: z.string(),
  client: z.string(),
  description: z.string().nullable().optional(),
  analysis: z.record(z.string(), z.any()).default({}),
});
export type ProjectContext = z.infer<typeof projectContextSchema>;

export const agentRequestSchema = z.object({
  projectId: z.number().int().positive(),
  userId: z.string().min(1),
  message: z.string().min(1),
  projectContext: projectContextSchema,
  chatHistory: z.array(chatHistoryMessageSchema).default([]),
});
export type AgentRequest = z.infer<typeof agentRequestSchema>;

export const agentIntentSchema = z.object({
  route: z.enum(["answer_only", "brief_plus_answer", "brief_strategy_copy_audit"]),
  needsBrief: z.boolean(),
  needsStrategy: z.boolean(),
  needsCopy: z.boolean(),
  strategyMode: z.enum(["none", "new", "variation"]).default("none"),
  channels: z.array(z.string()).default([]),
  userGoal: z.string().min(1),
  directResponse: z.string().nullable().optional(),
});
export type AgentIntent = z.infer<typeof agentIntentSchema>;

export const briefContextSchema = z.object({
  objetivo: z.string(),
  audiencia: z.string(),
  tono: z.string(),
  canales: z.array(z.string()),
  kpis: z.array(z.string()),
  restricciones: z.array(z.string()),
});
export type BriefContext = z.infer<typeof briefContextSchema>;

export const creativeAngleSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
});

export const toneByChannelSchema = z.object({
  canal: z.string(),
  tono: z.string(),
});

export const strategyOutputSchema = z.object({
  resumen: z.string(),
  angulosCreativos: z.array(creativeAngleSchema).min(3),
  tonoPorCanal: z.array(toneByChannelSchema).min(1),
  recomendaciones: z.array(z.string()).default([]),
});
export type StrategyOutput = z.infer<typeof strategyOutputSchema>;

export const copyVariantSchema = z.object({
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).default([]),
  charCount: z.number().int().nonnegative(),
});
export type CopyVariant = z.infer<typeof copyVariantSchema>;

export const copyPieceSchema = z.object({
  channel: z.string(),
  variants: z.array(copyVariantSchema).min(3),
});

export const copyOutputSchema = z.object({
  pieces: z.array(copyPieceSchema).min(1),
});
export type CopyOutput = z.infer<typeof copyOutputSchema>;

export const auditSeveritySchema = z.enum(["none", "medium", "critical"]);

export const auditResultSchema = z.object({
  severity: auditSeveritySchema,
  blocked: z.boolean(),
  warnings: z.array(z.string()).default([]),
  findings: z.array(z.string()).default([]),
  suggestedFixes: z.array(z.string()).default([]),
  summary: z.string(),
});
export type AuditResult = z.infer<typeof auditResultSchema>;

export const agentExecutionTraceSchema = z.object({
  route: z.string(),
  activatedAgents: z.array(agentNameSchema),
  estimatedTokens: z.number().int().nonnegative(),
  actualTokens: z.number().int().nonnegative(),
});
export type AgentExecutionTrace = z.infer<typeof agentExecutionTraceSchema>;

export const finalChatResponseSchema = z.object({
  content: z.string(),
  role: z.literal("assistant"),
  createdAt: z.date(),
  auditWarning: z.string().optional(),
  runId: z.number().int().positive().optional(),
});
export type FinalChatResponse = z.infer<typeof finalChatResponseSchema>;
