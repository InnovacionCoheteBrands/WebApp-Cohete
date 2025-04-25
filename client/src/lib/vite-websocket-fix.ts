/**
 * Este archivo corrige problemas de WebSocket en entornos Replit con Vite
 * Para solucionar el error: "Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=' is invalid"
 */

// Función para ejecutar durante el proceso de inicialización
export function fixViteWebsocketInReplit() {
  if (typeof window !== 'undefined') {
    try {
      // Solo ejecutar en el cliente (navegador)
      const originalWebSocket = window.WebSocket;
      
      // Sobrescribir la clase WebSocket
      // @ts-ignore
      window.WebSocket = class extends originalWebSocket {
        constructor(url: string, protocols?: string | string[]) {
          try {
            // Verificar si es un WebSocket de Vite que contiene "localhost:undefined"
            if (url.includes('localhost:undefined') && url.includes('vite')) {
              // Obtener la URL actual de la página
              const currentHost = window.location.host;
              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
              
              // Crear una nueva URL basada en el host actual
              const newUrl = url.replace(/wss?:\/\/localhost:undefined/, `${protocol}//${currentHost}`);
              
              // Llamar al constructor original con la URL corregida
              super(newUrl, protocols);
            } else {
              // Para WebSockets normales, mantener comportamiento estándar
              super(url, protocols);
            }
          } catch (error) {
            // Fallback a constructor original para no interferir con funcionalidad normal
            super(url, protocols);
          }
        }
      };
      
      console.log('WebSocket de Vite corregido para entorno Replit');
    } catch (error) {
      console.error('Error al aplicar fix para WebSocket:', error);
    }
  }
}