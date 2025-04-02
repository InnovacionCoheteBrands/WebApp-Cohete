import axios from 'axios';

/**
 * Clase para la integración con Mistral API
 * Implementación directa con Axios para evitar problemas de tipado con la biblioteca oficial
 */
export class MistralService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Genera imágenes usando la API de Mistral
   * Implementación completa utilizando la API REST directa para la generación de imágenes
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      console.log('Generando imagen con Mistral:', prompt);
      
      // Mejorar el prompt para obtener mejores resultados
      const enhancedPrompt = `Professional marketing image for social media: ${prompt}. High quality, professional lighting, brand appropriate, suitable for advertising, photorealistic, detailed.`;
      
      // Configuración para la API de Mistral para generación de imágenes
      const apiUrl = 'https://api.mistral.ai/v1/images/generations';
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const requestData = {
        prompt: enhancedPrompt,
        model: 'mistral-image-large', // Modelo para generación de imágenes
        n: 1,                        // Número de imágenes a generar
        size: '1024x1024',           // Tamaño de la imagen
        quality: 'standard'          // Calidad de la imagen
      };
      
      // Llamada a la API REST de Mistral
      const response = await axios.post(apiUrl, requestData, { headers });
      
      if (response.status !== 200 || !response.data || !response.data.data || !response.data.data[0]?.url) {
        throw new Error('No image URL returned from Mistral API');
      }
      
      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image with Mistral:', error);
      
      // Proporcionar detalles del error para facilitar la depuración
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Si el error es por falta de acceso o permisos insuficientes en la API
        if (error.response?.status === 403) {
          throw new Error('Acceso denegado a la API de generación de imágenes de Mistral. Verifica tu API key y permisos.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Genera texto usando el modelo de chat de Mistral
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const apiUrl = 'https://api.mistral.ai/v1/chat/completions';
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const requestData = {
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }]
      };
      
      const response = await axios.post(apiUrl, requestData, { headers });
      
      if (response.status !== 200 || !response.data || !response.data.choices || !response.data.choices[0]?.message?.content) {
        throw new Error('Invalid response from Mistral chat API');
      }
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating text with Mistral:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      throw error;
    }
  }
}

// Singleton para usar en toda la aplicación
export const mistralService = new MistralService(process.env.MISTRAL_API_KEY || '');