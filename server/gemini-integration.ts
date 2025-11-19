// ===== INTEGRACIÓN CON GOOGLE GEMINI =====
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface StreamCallbacks {
  onMessage: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retryCount?: number;
  responseFormat?: "json" | "text";
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

export class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private wss: WebSocketServer | null = null;

  constructor(apiKey: string) {
    this.apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      apiKey;

    if (!this.apiKey) {
      console.warn(
        "[GEMINI] No se encontró GEMINI_API_KEY. La funcionalidad de IA estará limitada."
      );
      return;
    }

    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  private getModel(modelId?: string): GenerativeModel {
    if (!this.client) {
      throw Object.assign(new Error("Gemini API no configurada"), {
        errorType: "AUTH",
      });
    }
    const modelName = modelId || DEFAULT_MODEL;
    return this.client.getGenerativeModel({ model: modelName });
  }

  initWebSocketServer(server: Server) {
    try {
      console.log("[GEMINI-WS] Inicializando servidor WebSocket para streaming de IA...");
      this.wss = new WebSocketServer({ server });

      this.wss.on("connection", (ws: WebSocket) => {
        console.log("[GEMINI-WS] Nueva conexión WebSocket establecida");

        ws.on("message", async (message: WebSocket.Data) => {
          try {
            const data = JSON.parse(message.toString());
            console.log(
              "[GEMINI-WS] Mensaje recibido:",
              JSON.stringify(data).substring(0, 200) + "..."
            );

            if (data.type === "stream-request") {
              const callbacks: StreamCallbacks = {
                onMessage: (chunk) => {
                  ws.send(JSON.stringify({ type: "chunk", content: chunk }));
                },
                onComplete: (fullResponse) => {
                  ws.send(JSON.stringify({ type: "complete", content: fullResponse }));
                },
                onError: (error) => {
                  console.error("[GEMINI-WS] Error en streaming:", error);
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: error.message || "Error desconocido en streaming",
                    })
                  );
                },
              };

              try {
                await this.generateTextStream(data.prompt, callbacks, {
                  model: data.model,
                  temperature: data.temperature,
                  maxTokens: data.maxTokens,
                  responseFormat: data.responseFormat,
                });
              } catch (error: any) {
                callbacks.onError(error instanceof Error ? error : new Error(String(error)));
              }
            }
          } catch (error) {
            console.error("[GEMINI-WS] Error procesando mensaje WebSocket:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                error: "Error procesando solicitud",
              })
            );
          }
        });

        ws.on("close", () => {
          console.log("[GEMINI-WS] Conexión WebSocket cerrada");
        });

        ws.on("error", (error: Error) => {
          console.error("[GEMINI-WS] Error en conexión WebSocket:", error);
        });
      });

      console.log("[GEMINI-WS] Servidor WebSocket inicializado correctamente");
    } catch (error) {
      console.error("[GEMINI-WS] Error inicializando servidor WebSocket:", error);
    }
  }

  async generateTextStream(
    prompt: string,
    callbacks: StreamCallbacks,
    options: GenerateOptions = {}
  ): Promise<void> {
    console.log(
      `[GEMINI-STREAM] Iniciando generación en streaming con Gemini. Modelo: ${
        options.model || DEFAULT_MODEL
      }, Temperatura: ${options.temperature ?? 0.7}`
    );

    try {
      const model = this.getModel(options.model);
      const generationConfig: Record<string, unknown> = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2000,
      };

      if (options.responseFormat === "json") {
        generationConfig.responseMimeType = "application/json";
      }

      const streamResult = await model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig,
      });

      let aggregated = "";
      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          aggregated += chunkText;
          callbacks.onMessage(chunkText);
        }
      }

      callbacks.onComplete(aggregated);
    } catch (error: any) {
      console.error("[GEMINI-STREAM] Error durante el streaming:", error);
      const mapped = this.mapError(error);
      callbacks.onError(mapped);
      throw mapped;
    }
  }

  async generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const maxRetries = options.retryCount || 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (maxRetries > 1) {
          console.log(`[GEMINI] Intento ${attempt}/${maxRetries} para generación de texto`);
        }

        const model = this.getModel(options.model);
        const generationConfig: Record<string, unknown> = {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2000,
        };

        if (options.responseFormat === "json") {
          generationConfig.responseMimeType = "application/json";
        }

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig,
        });

        const text = result.response.text();
        console.log(`[GEMINI] Respuesta recibida. Longitud: ${text.length} caracteres`);
        return text;
      } catch (error: any) {
        const mapped = this.mapError(error);
        lastError = mapped;

        const shouldRetry =
          attempt < maxRetries && ["NETWORK", "RATE_LIMIT", "UNAVAILABLE"].includes(
            (mapped as any).errorType
          );

        console.error(
          `[GEMINI] Error en intento ${attempt}/${maxRetries}: ${mapped.message}. Reintentar: ${
            shouldRetry ? "sí" : "no"
          }`
        );

        if (!shouldRetry) {
          throw mapped;
        }

        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw (
      lastError ||
      Object.assign(new Error("Error desconocido al generar con Gemini"), {
        errorType: "UNKNOWN",
      })
    );
  }

  async generateTextWithImage(
    prompt: string,
    imageBase64: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const model = this.getModel(options.model);
      const generationConfig: Record<string, unknown> = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2000,
      };

      const cleanedBase64 = imageBase64.includes(",")
        ? imageBase64.split(",").pop() || imageBase64
        : imageBase64;

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanedBase64,
                },
              },
            ],
          },
        ],
        generationConfig,
      });

      const text = result.response.text();
      console.log(
        `[GEMINI] Respuesta multimodal recibida. Longitud: ${text.length} caracteres`
      );
      return text;
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  private mapError(error: any): Error {
    if (error?.message?.includes("API key not valid")) {
      return Object.assign(new Error("Error de autenticación con la API de Gemini."), {
        errorType: "AUTH",
      });
    }

    if (error?.message?.includes("quota") || error?.response?.status === 429) {
      return Object.assign(
        new Error(
          "Se alcanzó el límite de peticiones a Gemini. Intenta nuevamente en unos minutos."
        ),
        { errorType: "RATE_LIMIT" }
      );
    }

    if (error?.response?.status >= 500) {
      return Object.assign(
        new Error(
          `Servicio de Gemini temporalmente no disponible (Error ${error.response.status}).`
        ),
        { errorType: "UNAVAILABLE" }
      );
    }

    if (error?.code === "FETCH_ERROR" || error?.message?.includes("network")) {
      return Object.assign(
        new Error("No se pudo conectar con Gemini. Verifica tu conexión a internet."),
        { errorType: "NETWORK" }
      );
    }

    if (error instanceof Error) {
      return Object.assign(error, { errorType: (error as any).errorType || "UNKNOWN" });
    }

    return Object.assign(
      new Error("Error inesperado al utilizar el servicio de Gemini."),
      { errorType: "UNKNOWN" }
    );
  }
}

export const geminiService = new GeminiService(
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
);

