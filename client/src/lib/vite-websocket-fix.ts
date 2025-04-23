/**
 * Este archivo corrige problemas de WebSocket en entornos Replit con Vite
 * Para solucionar el error: "Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=' is invalid"
 */

// Función para ejecutar durante el proceso de inicialización
export function fixViteWebsocketInReplit() {
  if (typeof window !== 'undefined') {
    // Solo ejecutar en el cliente (navegador)
    const originalWebSocket = window.WebSocket;
    
    // Sobrescribir la clase WebSocket
    // @ts-ignore
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string, protocols?: string | string[]) {
        // Verificar si es un WebSocket de Vite que contiene "localhost:undefined"
        if (url.includes('localhost:undefined') && url.includes('vite')) {
          console.log('Corrigiendo URL de WebSocket de Vite:', url);
          
          // Obtener la URL actual de la página
          const currentHost = window.location.host;
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          
          // Crear una nueva URL basada en el host actual
          const newUrl = url.replace(/wss?:\/\/localhost:undefined/, `${protocol}//${currentHost}`);
          console.log('Nueva URL de WebSocket:', newUrl);
          
          // Llamar al constructor original con la URL corregida
          super(newUrl, protocols);
        } else {
          // Para WebSockets normales, mantener comportamiento estándar
          super(url, protocols);
        }
      }
    };
    
    console.log('WebSocket de Vite corregido para entorno Replit');
  }
}