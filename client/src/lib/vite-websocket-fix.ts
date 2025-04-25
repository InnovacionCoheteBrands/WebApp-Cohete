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
            // Verificar si es una URL inválida o que contiene "localhost:undefined"
            if ((url.includes('localhost:undefined') || !url.match(/^wss?:\/\//)) && url.includes('vite')) {
              // Obtener la URL actual de la página
              const currentHost = window.location.host;
              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
              
              // Crear una nueva URL basada en el host actual
              let newUrl = url;
              if (url.includes('localhost:undefined')) {
                newUrl = url.replace(/wss?:\/\/localhost:undefined/, `${protocol}//${currentHost}`);
              } else if (!url.match(/^wss?:\/\//)) {
                // Si la URL no comienza con ws:// o wss://, añadir el protocolo adecuado
                newUrl = `${protocol}//${currentHost}${url.startsWith('/') ? url : `/${url}`}`;
              }
              
              // Llamar al constructor original con la URL corregida
              super(newUrl, protocols);
            } else {
              // Para WebSockets normales, mantener comportamiento estándar
              super(url, protocols);
            }
          } catch (error) {
            console.error('Error al construir WebSocket:', error);
            // Intentar establecer una conexión con la URL actual como fallback
            const fallbackUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/`;
            try {
              super(fallbackUrl, protocols);
            } catch (e) {
              console.error('Error al conectar con fallback WebSocket:', e);
              // En caso de error completo, llamar al constructor con la URL original
              // y dejar que maneje el error normalmente
              super(url, protocols);
            }
          }
        }
      };
      
      console.log('WebSocket de Vite corregido para entorno Replit');
    } catch (error) {
      console.error('Error al aplicar fix para WebSocket:', error);
    }
  }
}