import axios from 'axios';

/**
 * Clase para la integración con la API de Grok
 * Sigue un patrón similar a la integración de Mistral para mantener consistencia
 */
export class GrokService {
  private apiKey: string;
  private baseURL = 'https://api.x.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Genera texto usando el modelo de Grok
   */
  async generateText(prompt: string, options: { 
    model?: string, 
    temperature?: number,
    maxTokens?: number,
    retryCount?: number
  } = {}): Promise<string> {
    // Número de intentos (predeterminado: 1)
    const maxRetries = options.retryCount || 1;
    let lastError: any = null;
    
    // Información para log
    console.log(`Iniciando solicitud a Grok AI. Modelo: ${options.model || 'grok-3-beta'}, Temperatura: ${options.temperature || 0.7}, Max tokens: ${options.maxTokens || 2000}`);
    
    // Intentar varias veces si se especificaron reintentos
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Registrar intentos si hay más de uno configurado
        if (maxRetries > 1) {
          console.log(`Intento ${attempt}/${maxRetries} de generar texto con Grok AI...`);
        }
        
        const requestPayload = {
          model: options.model || 'grok-3-beta',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
        };
        
        // Registrar tamaño de la solicitud
        const requestSize = JSON.stringify(requestPayload).length;
        console.log(`Tamaño de la solicitud: ${requestSize} bytes`);
        
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
            timeout: 60000 // 60 segundos de timeout para evitar bloqueos indefinidos
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
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Errores de servidor (500, 502, 503, 504) son candidatos para reintento
            const statusCode = error.response.status;
            if (statusCode >= 500) {
              shouldRetry = true;
              console.log(`Error de servidor ${statusCode}, reintentando...`);
            }
          } else if (error.request) {
            // Errores de red son candidatos para reintento
            shouldRetry = true;
            console.log("Error de red, reintentando...");
          }
        }
        
        // Si es el último intento o no debemos reintentar, lanzar el error
        if (attempt === maxRetries || !shouldRetry) {
          break;
        }
        
        // Esperar brevemente antes de reintentar (backoff exponencial)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
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
          throw new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente más tarde (Error ${statusCode}).`);
        }
        
        // Para error 429 (rate limit)
        if (statusCode === 429) {
          throw new Error(`Se ha excedido el límite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
        }
        
        // Para errores 401, 403 (autenticación)
        if (statusCode === 401 || statusCode === 403) {
          throw new Error(`Error de autenticación con la API de Grok. Verifica que la clave API sea válida.`);
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
        throw new Error(`Error del servicio Grok AI (${statusCode}): ${detailedMessage}`);
      } else if (error.request) {
        // Error sin respuesta (problemas de red)
        throw new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexión a internet.`);
      }
    }
    
    // Errores genéricos
    const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
    throw new Error(`Error inesperado al utilizar el servicio de Grok AI: ${errorMessage}`);
  }

  /**
   * Genera texto con análisis de imágenes usando el modelo de Grok con capacidades visuales
   */
  async generateTextWithImage(prompt: string, imageBase64: string, options: {
    model?: string,
    temperature?: number,
    maxTokens?: number
  } = {}): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'grok-2-vision-1212',
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
            throw new Error(`Servicio de Grok AI temporalmente no disponible. Por favor intenta nuevamente más tarde (Error ${statusCode}).`);
          }
          
          // Para error 429 (rate limit)
          if (statusCode === 429) {
            throw new Error(`Se ha excedido el límite de peticiones a Grok AI. Por favor espera unos minutos antes de intentar nuevamente.`);
          }
          
          // Para errores 401, 403 (autenticación)
          if (statusCode === 401 || statusCode === 403) {
            throw new Error(`Error de autenticación con la API de Grok. Verifica que la clave API sea válida.`);
          }
          
          // Otros errores con respuesta
          throw new Error(`Error del servicio Grok AI (${statusCode}): ${error.response.data.error?.message || "Detalles no disponibles"}`);
        } else if (error.request) {
          // Error sin respuesta (problemas de red)
          throw new Error(`No se pudo conectar con el servicio de Grok AI. Verifica tu conexión a internet.`);
        }
      }
      
      // Errores genéricos
      const errorMessage = error instanceof Error ? error.message : String(error || "Error desconocido");
      throw new Error(`Error inesperado al utilizar el servicio de Grok AI para análisis de imagen: ${errorMessage}`);
    }
  }
}

// Exportamos una instancia del servicio para su uso en toda la aplicación
export const grokService = new GrokService(process.env.GROK_API_KEY || '');