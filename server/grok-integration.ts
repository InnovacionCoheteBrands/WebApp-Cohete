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
    maxTokens?: number 
  } = {}): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'grok-3-beta',
          messages: [
            {
              role: 'user',
              content: prompt
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
    } catch (error) {
      console.error('Error generando texto con Grok:', error);
      
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
      throw new Error(`Error inesperado al utilizar el servicio de Grok AI: ${error.message || "Detalles no disponibles"}`);
    }
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
    } catch (error) {
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
      throw new Error(`Error inesperado al utilizar el servicio de Grok AI para análisis de imagen: ${error.message || "Detalles no disponibles"}`);
    }
  }
}

// Exportamos una instancia del servicio para su uso en toda la aplicación
export const grokService = new GrokService(process.env.GROK_API_KEY || '');