// ===== IMPORTACIONES PARA INTEGRACIÓN GROK =====
// Axios: Cliente HTTP para peticiones a la API de Grok
import axios from 'axios';
// Server HTTP para integración con Express
import { Server } from 'http';

// ===== INTERFACES PARA STREAMING =====
/**
 * Callbacks para manejar respuestas de streaming de IA
 * Permite recibir chunks de respuesta en tiempo real
 */
interface StreamCallbacks {
  onMessage: (chunk: string) => void; // Callback cuando llega un chunk de texto
  onComplete: (fullResponse: string) => void; // Callback cuando termina la respuesta
  onError: (error: Error) => void; // Callback cuando ocurre un error
}

/**
 * Estructura de respuesta del streaming de Grok AI
 * Basada en el formato estándar de OpenAI que también usa Grok
 */
interface StreamResponse {
  id: string; // ID único de la respuesta
  object: string; // Tipo de objeto (chat.completion.chunk)
  created: number; // Timestamp de creación
  model: string; // Modelo utilizado
  choices: {
    delta: {
      content?: string; // Contenido del chunk actual
      role?: string; // Rol del mensaje (assistant, user, etc.)
    };
    index: number; // Índice de la opción
    finish_reason: string | null; // Razón de finalización si aplica
  }[];
}

/**
 * ===== CLASE PRINCIPAL PARA INTEGRACIÓN CON GROK AI =====
 * Implementación principal para todas las funcionalidades de IA en la aplicación
 * Maneja comunicación con API de Grok, streaming, y funciones avanzadas de IA
 */
export class GrokService {
  private apiKey: string; // Clave API de acceso a Grok
  private baseURL = 'https://api.x.ai/v1'; // URL base de la API de X.AI (Grok)

  // ===== CONSTRUCTOR =====
  constructor(apiKey: string) {
    // Priorizar la nueva clave XAI_API_KEY sobre la antigua GROK_API_KEY
    this.apiKey = process.env.XAI_API_KEY || apiKey;
  }
  
  /**
   * Inicializa funcionalidades de streaming (WebSocket deshabilitado por compatibilidad)
   * @param server Servidor HTTP de Express
   */
  initWebSocketServer(server: Server) {
    console.log('[GROK-SERVICE] WebSocket streaming deshabilitado - usando HTTP polling para compatibilidad');
    // WebSocket funcionalidad removida para evitar conflictos de dependencias
    // El streaming se maneja através de HTTP polling o Server-Sent Events
  }

  /**
   * Genera texto en streaming usando el modelo de Grok
   * @param prompt Prompt a enviar al modelo
   * @param callbacks Funciones de callback para manejar chunks, finalización y errores
   * @param options Opciones de configuración (modelo, temperatura, tokens, etc.)
   */
  async generateTextStream(
    prompt: string,
    callbacks: StreamCallbacks,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: string;
    } = {}
  ): Promise<void> {
    console.log(`[GROK-STREAM] Iniciando generación de texto en streaming con Grok AI`);
    console.log(`[GROK-STREAM] Modelo: ${options.model || 'grok-3-mini-beta'}, Temperatura: ${options.temperature || 0.7}`);
    
    try {
      // Preparar el payload
      const requestPayload: any = {
        model: options.model || 'grok-3-mini-beta',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        stream: true // Activar streaming
      };
      
      // Grok no soporta response_format en streaming, se controla vía prompt
      
      // Realizar la solicitud con streaming
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: 'stream'
        }
      );
      
      console.log('[GROK-STREAM] Conexión establecida, comenzando a recibir datos...');
      
      let fullResponse = '';
      const stream = response.data;
      
      stream.on('data', (chunk: Buffer) => {
        try {
          const chunkStr = chunk.toString();
          // Los chunks vienen en formato "data: {...JSON...}\n\n"
          const lines = chunkStr.split('\n\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            
            // Extraer el JSON de "data: {...JSON...}"
            const jsonStr = line.replace(/^data: /, '').trim();
            if (!jsonStr) continue;
            
            try {
              const jsonData = JSON.parse(jsonStr) as StreamResponse;
              
              // Procesar el delta de contenido si existe
              if (jsonData.choices && jsonData.choices.length > 0) {
                const delta = jsonData.choices[0]?.delta?.content || '';
                
                if (delta) {
                  fullResponse += delta;
                  callbacks.onMessage(delta);
                }
                
                // Verificar si es el final del streaming
                if (jsonData.choices[0]?.finish_reason === 'stop') {
                  console.log('[GROK-STREAM] Streaming completado por señal de finalización');
                }
              }
            } catch (err) {
              console.warn('[GROK-STREAM] Error parseando chunk JSON:', jsonStr);
            }
          }
        } catch (err) {
          console.error('[GROK-STREAM] Error procesando chunk:', err);
        }
      });
      
      stream.on('end', () => {
        console.log('[GROK-STREAM] Streaming finalizado. Longitud total:', fullResponse.length);
        callbacks.onComplete(fullResponse);
      });
      
      stream.on('error', (err: Error) => {
        console.error('[GROK-STREAM] Error en streaming:', err);
        callbacks.onError(err);
      });
      
    } catch (error: any) {
      console.error('[GROK-STREAM] Error iniciando streaming:', error);
      callbacks.onError(error);
      
      // Manejar errores similares a generateText para consistencia
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          
          if (statusCode >= 502 && statusCode <= 504) {
            const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible (Error ${statusCode}).`);
            callbacks.onError(serviceError);
            return;
          }
          
          if (statusCode === 429) {
            const rateLimitError = new Error(`Se ha excedido el límite de peticiones a Grok AI.`);
            callbacks.onError(rateLimitError);
            return;
          }
          
          if (statusCode === 401 || statusCode === 403) {
            const authError = new Error(`Error de autenticación con la API de Grok.`);
            callbacks.onError(authError);
            return;
          }
        }
      }
    }
  }
  
  /**
   * Genera texto usando el modelo de Grok
   */
  async generateText(prompt: string, options: { 
    model?: string; 
    temperature?: number;
    maxTokens?: number;
    retryCount?: number;
    responseFormat?: string;  // Nuevo: Formato de respuesta deseado: "json_object" o "text"
  } = {}): Promise<string> {
    // Número de intentos (predeterminado: 1)
    const maxRetries = options.retryCount || 1;
    let lastError: any = null;
    
    // Información para log
    console.log(`Iniciando solicitud a Grok AI. Modelo: ${options.model || 'grok-3-mini-beta'}, Temperatura: ${options.temperature || 0.7}, Max tokens: ${options.maxTokens || 2000}${options.responseFormat ? ', Formato: ' + options.responseFormat : ''}`);
    
    // Intentar varias veces si se especificaron reintentos
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Registrar intentos si hay más de uno configurado
        if (maxRetries > 1) {
          console.log(`Intento ${attempt}/${maxRetries} de generar texto con Grok AI...`);
        }
        
        // Si el prompt es muy largo, podría causar problemas
        const promptLength = prompt.length;
        console.log(`[GROK] Longitud del prompt: ${promptLength} caracteres`);
        
        // Preparar el payload de la solicitud
        let requestPayload: any;
        
        // Construir payload completamente limpio - solo parámetros esenciales soportados por Grok
        const finalPrompt = promptLength > 20000 ? 
          `${prompt.substring(0, 10000)}\n\n[CONTENIDO TRUNCADO PARA OPTIMIZAR RENDIMIENTO]\n\n${prompt.substring(prompt.length - 5000)}` 
          : prompt;
        
        if (promptLength > 20000) {
          console.warn(`[GROK] El prompt fue truncado de ${promptLength} a ${finalPrompt.length} caracteres`);
        }
        
        // Payload minimalista - solo lo que Grok definitivamente soporta
        requestPayload = {
          model: options.model || 'grok-3-mini-beta',
          messages: [
            {
              role: 'user',
              content: finalPrompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000
        };
        
        // Grok no soporta response_format, omitimos esta configuración
        // El formato se controla a través del prompt directamente
        
        // Registrar tamaño de la solicitud
        const requestSize = JSON.stringify(requestPayload).length;
        console.log(`Tamaño de la solicitud: ${requestSize} bytes`);
        console.log(`[GROK DEBUG] Payload completo enviado a API:`, JSON.stringify(requestPayload, null, 2));
        
        // Si el tamaño es muy grande, podría causar problemas
        if (requestSize > 100000) {
          console.warn("Advertencia: Solicitud muy grande (>100KB), podría causar problemas de rendimiento");
        }
        
        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 120000 // 120 segundos de timeout para solicitudes grandes
          }
        );
        
        // Verificar que la respuesta tenga el formato esperado
        if (!response.data || !response.data.choices || !response.data.choices.length) {
          console.error("Respuesta de Grok AI sin el formato esperado:", JSON.stringify(response.data).substring(0, 200) + "...");
          throw new Error("La respuesta de Grok AI no tiene el formato esperado");
        }
        
        // Registrar longitud de la respuesta
        const content = response.data.choices[0].message.content;
        console.log(`Respuesta de Grok AI recibida: ${content.length} caracteres`);
        
        return content;
      } catch (error) {
        console.error(`Error en intento ${attempt}/${maxRetries} generando texto con Grok:`, error);
        lastError = error;
        
        // Determinar si debemos reintentar basado en el tipo de error
        let shouldRetry = false;
        let errorCategory = "desconocido";
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Errores de servidor (500, 502, 503, 504) son candidatos para reintento
            const statusCode = error.response.status;
            if (statusCode >= 500) {
              shouldRetry = true;
              errorCategory = `servidor ${statusCode}`;
              console.log(`[GROK] Error de servidor ${statusCode}, reintentando...`);
            } else if (statusCode === 429) {
              // Rate limit - esperamos más tiempo
              shouldRetry = true;
              errorCategory = "límite de peticiones";
              console.log(`[GROK] Error de límite de peticiones, reintentando con espera más larga...`);
            } else if (statusCode === 401 || statusCode === 403) {
              // Error de autenticación - no reintentar
              shouldRetry = false;
              errorCategory = "autenticación";
              console.error(`[GROK] Error de autenticación con la API de Grok (${statusCode})`);
            }
          } else if (error.request) {
            // Errores de red son candidatos para reintento
            shouldRetry = true;
            errorCategory = "red/conexión";
            console.log("[GROK] Error de red, reintentando...");
          }
        }
        
        // Registrar detalle del error para diagnóstico
        console.log(`[GROK] Error (categoría: ${errorCategory}) en intento ${attempt}/${maxRetries}. Reintento: ${shouldRetry ? "Sí" : "No"}`);
        
        // Si estamos en el último intento o no se debe reintentar, lanzar error
        if (attempt === maxRetries || !shouldRetry) {
          console.error(`[GROK] Se agotaron los reintentos o error no recuperable. Categoría: ${errorCategory}`);
          break;
        }
        
        // Esperar con retroceso exponencial antes de reintentar
        const baseDelay = errorCategory === "límite de peticiones" ? 5000 : 1000; // 5 segundos base para errores de rate limit
        const waitTime = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Máximo 30 segundos
        console.log(`[GROK] Esperando ${waitTime}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Si llegamos aquí es porque agotamos los intentos o tuvimos un error que no ameritaba reintento
    // Manejar diferentes tipos de errores, usando el último error capturado
    const error = lastError;
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Error con respuesta del servidor (400, 500, etc.)
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        // Registrar respuesta completa para diagnóstico
        console.error(`Respuesta de error completa de Grok API:`, responseData);
        
        // Para errores 502, 503, 504 (errores de gateway y disponibilidad)
        if (statusCode >= 502 && statusCode <= 504) {
          const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente más tarde (Error ${statusCode}).`);
          (serviceError as any).errorType = "NETWORK";
          throw serviceError;
        }
        
        // Para error 429 (rate limit)
        if (statusCode === 429) {
          const rateLimitError = new Error(`Se ha excedido el límite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
          (rateLimitError as any).errorType = "RATE_LIMIT";
          throw rateLimitError;
        }
        
        // Para errores 401, 403 (autenticación)
        if (statusCode === 401 || statusCode === 403) {
          const authError = new Error(`Error de autenticación con la API de Grok. Verifica que la clave API sea válida.`);
          (authError as any).errorType = "AUTH";
          throw authError;
        }
        
        // Extraer mensaje detallado si está disponible
        let detailedMessage = "Detalles no disponibles";
        if (responseData) {
          if (responseData.error && responseData.error.message) {
            detailedMessage = responseData.error.message;
          } else if (typeof responseData === 'string') {
            detailedMessage = responseData;
          } else {
            try {
              detailedMessage = JSON.stringify(responseData);
            } catch (e) {
              detailedMessage = "No se pudo extraer un mensaje de error detallado";
            }
          }
        }
        
        // Otros errores con respuesta
        const otherResponseError = new Error(`Error del servicio Grok AI (${statusCode}): ${detailedMessage}`);
        (otherResponseError as any).errorType = "API_ERROR";
        throw otherResponseError;
      } else if (error.request) {
        // Error sin respuesta (problemas de red)
        const networkError = new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexión a internet.`);
        (networkError as any).errorType = "NETWORK"; // Añadir el tipo explícitamente
        throw networkError;
      }
    }
    
    // Errores genéricos
    const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
    const genericError = new Error(`Error inesperado al utilizar el servicio de Grok AI: ${errorMessage}`);
    (genericError as any).errorType = "UNKNOWN";
    throw genericError;
  }

  /**
   * Genera texto con análisis de imágenes usando el modelo de Grok con capacidades visuales
   */
  async generateTextWithImage(prompt: string, imageBase64: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'grok-3-mini-beta', // Cambiado a grok-3-mini-beta según solicitud
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error generando texto con imagen en Grok:', error);
      
      // Manejar diferentes tipos de errores
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error con respuesta del servidor (400, 500, etc.)
          const statusCode = error.response.status;
          
          // Para errores 502, 503, 504 (errores de gateway y disponibilidad)
          if (statusCode >= 502 && statusCode <= 504) {
            const serviceError = new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente más tarde (Error ${statusCode}).`);
            (serviceError as any).errorType = "NETWORK";
            throw serviceError;
          }
          
          // Para error 429 (rate limit)
          if (statusCode === 429) {
            const rateLimitError = new Error(`Se ha excedido el límite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
            (rateLimitError as any).errorType = "RATE_LIMIT";
            throw rateLimitError;
          }
          
          // Para errores 401, 403 (autenticación)
          if (statusCode === 401 || statusCode === 403) {
            const authError = new Error(`Error de autenticación con la API de Grok. Verifica que la clave API sea válida.`);
            (authError as any).errorType = "AUTH";
            throw authError;
          }
          
          // Otros errores con respuesta
          const otherResponseError = new Error(`Error del servicio Grok AI (${statusCode}): ${error.response.data.error?.message || "Detalles no disponibles"}`);
          (otherResponseError as any).errorType = "API_ERROR";
          throw otherResponseError;
        } else if (error.request) {
          // Error sin respuesta (problemas de red)
          const networkError = new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexión a internet.`);
          (networkError as any).errorType = "NETWORK";
          throw networkError;
        }
      }
      
      // Errores genéricos
      const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
      const genericError = new Error(`Error inesperado al utilizar el servicio de Grok AI para análisis de imagen: ${errorMessage}`);
      (genericError as any).errorType = "UNKNOWN";
      throw genericError;
    }
  }
}

// Exportamos una instancia del servicio para su uso en toda la aplicación
export const grokService = new GrokService(process.env.GROK_API_KEY || process.env.XAI_API_KEY || '');