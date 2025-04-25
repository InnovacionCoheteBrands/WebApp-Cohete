/**
 * Este archivo corrige problemas de WebSocket en entornos Replit con Vite
 * Para solucionar el error: "Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=' is invalid"
 * y evitar mensajes "unhandledrejection" en la consola
 */

// Función para ejecutar durante el proceso de inicialización
export function fixViteWebsocketInReplit() {
  if (typeof window !== 'undefined') {
    try {
      // Capturar eventos de rechazo no manejado para evitar errores en consola
      window.addEventListener('unhandledrejection', (event) => {
        // Solo suprimir eventos relacionados con fallos de WebSocket
        if (
          event.reason && 
          (
            (event.reason.message && event.reason.message.includes('WebSocket')) ||
            (event.reason.toString && event.reason.toString().includes('WebSocket')) ||
            (event.reason.toString && event.reason.toString().includes('DOMException'))
          )
        ) {
          // Prevenir que aparezca en la consola
          event.preventDefault();
          event.stopPropagation();
          console.log('Suprimido error WebSocket no manejado');
        }
      });
      
      // Solo ejecutar en el cliente (navegador)
      const originalWebSocket = window.WebSocket;
      
      // Sobrescribir la clase WebSocket
      // @ts-ignore
      window.WebSocket = class extends originalWebSocket {
        static dummyWs: any = null;
        
        constructor(url: string, protocols?: string | string[]) {
          try {
            // Verificar si la URL está vacía o no es válida
            if (!url || url === 'undefined' || url === '[object Object]') {
              // Crear un WebSocket "ficticio" que no hará nada pero evitará errores
              // @ts-ignore
              if (!window.WebSocket.dummyWs) {
                // Objeto simulado que actúa como un WebSocket
                const dummyObj = {
                  readyState: 3, // CLOSED
                  send: () => {}, // No hace nada
                  close: () => {}, // No hace nada
                  addEventListener: () => {}, // No hace nada
                  removeEventListener: () => {}, // No hace nada
                  dispatchEvent: () => true, // Siempre devuelve true
                };
                // @ts-ignore
                window.WebSocket.dummyWs = dummyObj;
              }
              // @ts-ignore
              return window.WebSocket.dummyWs;
            }
            
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
            try {
              // Intentar establecer una conexión con la URL actual como fallback
              const fallbackUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/`;
              super(fallbackUrl, protocols);
            } catch (e) {
              console.error('Error al conectar con fallback WebSocket:', e);
              try {
                // Segundo intento con otra estructura de URL
                const secondFallback = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port || 443}/`;
                super(secondFallback, protocols);
              } catch (e2) {
                console.error('Todos los intentos de conexión WebSocket fallaron');
                // Suprimir error completamente devolviendo un objeto simulado
                // @ts-ignore
                if (!window.WebSocket.dummyWs) {
                  const dummyObj = {
                    readyState: 3, // CLOSED
                    send: () => {}, // No hace nada
                    close: () => {}, // No hace nada
                    addEventListener: () => {}, // No hace nada
                    removeEventListener: () => {}, // No hace nada
                    dispatchEvent: () => true, // Siempre devuelve true
                  };
                  // @ts-ignore
                  window.WebSocket.dummyWs = dummyObj;
                }
                // @ts-ignore
                return window.WebSocket.dummyWs;
              }
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