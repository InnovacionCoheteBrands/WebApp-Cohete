import type { IStorage } from "../storage";
import type { AgentEntrypoint, AgentName } from "./contracts";

export interface ResolvedModelRoute {
  agent: AgentName;
  provider: "groq";
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  reasoningEffort?: "none" | "default" | "low" | "medium" | "high";
  reasoningFormat?: "hidden" | "parsed" | "raw";
}

const BASE_ROUTE: Pick<ResolvedModelRoute, "provider" | "reasoningFormat"> = {
  provider: "groq",
  reasoningFormat: "hidden",
};

export class AgentRouter {
  constructor(private readonly storage: IStorage) {}

  async resolve(
    entrypoint: AgentEntrypoint,
    agent: AgentName,
    options?: {
      briefComplexity?: "standard" | "long_context";
      strategyMode?: "none" | "new" | "variation";
      copyQuality?: "standard" | "premium";
    },
  ): Promise<ResolvedModelRoute> {
    const configuredRoute = await this.storage.getActiveModelRoute(entrypoint, agent);
    if (configuredRoute) {
      return {
        agent,
        provider: "groq",
        model: configuredRoute.model,
        temperature: 0.2,
        maxCompletionTokens: 1800,
        reasoningEffort: configuredRoute.reasoningMode === "disabled" ? "none" : undefined,
        reasoningFormat: "hidden",
      };
    }

    switch (agent) {
      case "orchestrator":
        return {
          agent,
          ...BASE_ROUTE,
          model: "openai/gpt-oss-20b",
          temperature: 0.2,
          maxCompletionTokens: 1400,
          reasoningEffort: "low",
        };
      case "brief_analyst":
        if (options?.briefComplexity === "long_context") {
          return {
            agent,
            ...BASE_ROUTE,
            model: "moonshotai/kimi-k2-instruct-0905",
            temperature: 0.1,
            maxCompletionTokens: 2200,
          };
        }

        return {
          agent,
          ...BASE_ROUTE,
          model: "openai/gpt-oss-20b",
          temperature: 0.1,
          maxCompletionTokens: 1600,
        };
      case "marketing_strategist":
        if (options?.strategyMode === "variation") {
          return {
            agent,
            ...BASE_ROUTE,
            model: "openai/gpt-oss-20b",
            temperature: 0.3,
            maxCompletionTokens: 1800,
            reasoningEffort: "none",
          };
        }

        return {
          agent,
          ...BASE_ROUTE,
          model: "qwen/qwen3-32b",
          temperature: 0.4,
          maxCompletionTokens: 2200,
          reasoningEffort: "default",
        };
      case "copywriter":
        if (options?.copyQuality === "premium") {
          return {
            agent,
            ...BASE_ROUTE,
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            maxCompletionTokens: 2600,
          };
        }

        return {
          agent,
          ...BASE_ROUTE,
          model: "openai/gpt-oss-20b",
          temperature: 0.6,
          maxCompletionTokens: 2200,
        };
      case "brand_auditor":
        return {
          agent,
          ...BASE_ROUTE,
          model: "openai/gpt-oss-safeguard-20b",
          temperature: 0.1,
          maxCompletionTokens: 1800,
        };
      default:
        return {
          agent,
          ...BASE_ROUTE,
          model: "openai/gpt-oss-20b",
          temperature: 0.2,
          maxCompletionTokens: 1600,
        };
    }
  }
}
