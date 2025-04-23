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
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Error de Grok API (${error.response.status}): ${error.response.data.error?.message || JSON.stringify(error.response.data)}`);
      }
      throw new Error('Error al conectar con la API de Grok');
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
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Error de Grok API (${error.response.status}): ${error.response.data.error?.message || JSON.stringify(error.response.data)}`);
      }
      throw new Error('Error al conectar con la API de Grok para análisis de imagen');
    }
  }
}

// Exportamos una instancia del servicio para su uso en toda la aplicación
export const grokService = new GrokService(process.env.GROK_API_KEY || '');