import axios from "axios";
import { z, type ZodSchema } from "zod";

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AITextResponse {
  provider: string;
  model: string;
  content: string;
  usage?: TokenUsage;
}

export interface GenerateTextOptions {
  model: string;
  prompt: string;
  temperature?: number;
  maxCompletionTokens?: number;
  reasoningEffort?: "none" | "default" | "low" | "medium" | "high";
  reasoningFormat?: "hidden" | "parsed" | "raw";
  responseFormat?: "text" | "json_object";
}

export interface AIProvider {
  readonly name: string;
  generateText(options: GenerateTextOptions): Promise<AITextResponse>;
  generateStructured<T>(options: GenerateTextOptions & { schema: ZodSchema<T> }): Promise<AITextResponse & { data: T }>;
}

type GroqChatResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  private readonly apiKey: string;
  private readonly baseURL = "https://api.groq.com/openai/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || "";
  }

  private ensureConfigured() {
    if (!this.apiKey) {
      const error = new Error("GROQ_API_KEY is not configured.");
      (error as Error & { errorType?: string }).errorType = "AUTH";
      throw error;
    }
  }

  async generateText(options: GenerateTextOptions): Promise<AITextResponse> {
    this.ensureConfigured();

    const payload: Record<string, unknown> = {
      model: options.model,
      messages: [
        {
          role: "user",
          content: options.prompt,
        },
      ],
      temperature: options.temperature ?? 0.2,
      max_completion_tokens: options.maxCompletionTokens ?? 1200,
    };

    if (options.responseFormat === "json_object") {
      payload.response_format = { type: "json_object" };
    }

    if (options.reasoningEffort) {
      payload.reasoning_effort = options.reasoningEffort;
    }

    if (options.reasoningFormat) {
      payload.reasoning_format = options.reasoningFormat;
    }

    try {
      const response = await axios.post<GroqChatResponse>(
        `${this.baseURL}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        },
      );

      const content = response.data.choices?.[0]?.message?.content?.trim() || "";
      return {
        provider: this.name,
        model: response.data.model || options.model,
        content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens,
          completionTokens: response.data.usage?.completion_tokens,
          totalTokens: response.data.usage?.total_tokens,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data as { error?: { message?: string } } | undefined;
        const wrappedError = new Error(responseData?.error?.message || error.message);
        if (status === 401 || status === 403) {
          (wrappedError as Error & { errorType?: string }).errorType = "AUTH";
        } else if (status === 429) {
          (wrappedError as Error & { errorType?: string }).errorType = "RATE_LIMIT";
        } else if (status && status >= 500) {
          (wrappedError as Error & { errorType?: string }).errorType = "NETWORK";
        }
        throw wrappedError;
      }
      throw error;
    }
  }

  async generateStructured<T>(options: GenerateTextOptions & { schema: ZodSchema<T> }): Promise<AITextResponse & { data: T }> {
    const firstAttempt = await this.generateText({
      ...options,
      responseFormat: "json_object",
      reasoningFormat: options.reasoningFormat || "hidden",
    });

    const firstParse = safeParseStructured(firstAttempt.content, options.schema);
    if (firstParse.success) {
      return { ...firstAttempt, data: firstParse.data };
    }

    const repairPrompt = [
      "Corrige el siguiente JSON para que sea válido y cumpla exactamente con la estructura solicitada.",
      "Devuelve solo JSON válido, sin explicaciones.",
      "",
      "Instrucción original:",
      options.prompt,
      "",
      "JSON previo inválido o incompatible:",
      firstAttempt.content,
    ].join("\n");

    const repairedAttempt = await this.generateText({
      ...options,
      prompt: repairPrompt,
      responseFormat: "json_object",
      temperature: 0,
      reasoningFormat: options.reasoningFormat || "hidden",
    });

    const repairedParse = safeParseStructured(repairedAttempt.content, options.schema);
    if (!repairedParse.success) {
      const error = new Error(`Structured output validation failed: ${repairedParse.error.message}`);
      (error as Error & { errorType?: string }).errorType = "JSON_PARSING";
      throw error;
    }

    const totalTokens = [
      firstAttempt.usage?.totalTokens || 0,
      repairedAttempt.usage?.totalTokens || 0,
    ].reduce((sum, value) => sum + value, 0);

    return {
      ...repairedAttempt,
      usage: {
        totalTokens,
      },
      data: repairedParse.data,
    };
  }
}

function safeParseStructured<T>(rawContent: string, schema: ZodSchema<T>) {
  const parsedJson = z.string().transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON content",
      });
      return z.NEVER;
    }
  }).safeParse(rawContent);

  if (!parsedJson.success) {
    return {
      success: false as const,
      error: parsedJson.error,
    };
  }

  const parsedSchema = schema.safeParse(parsedJson.data);
  if (!parsedSchema.success) {
    return {
      success: false as const,
      error: parsedSchema.error,
    };
  }

  return {
    success: true as const,
    data: parsedSchema.data,
  };
}
