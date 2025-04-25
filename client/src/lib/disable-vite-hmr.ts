/**
 * Este archivo deshabilita completamente el HMR (Hot Module Replacement) de Vite 
 * para evitar los errores de WebSocket que ocurren en el entorno de Replit.
 * 
 * La estrategia es desactivar la función de HMR en el cliente, lo que evitará
 * que Vite intente establecer conexiones WebSocket que pueden fallar.
 */

// Variable para almacenar las funciones de Vite originales si se necesitan restaurar
let originalViteHot: any = null;

export function disableViteHMR() {
  if (typeof window !== 'undefined') {
    try {
      // Verificar si el objeto __vite_plugin_react_preamble_installed__ existe
      if ((window as any).__vite_plugin_react_preamble_installed__) {
        console.log('Deshabilitando HMR de Vite React Plugin...');
        // Guardar el valor original por si necesitamos restaurarlo
        originalViteHot = (window as any).__vite_plugin_react_preamble_installed__;
        // Sobreescribir con objeto vacío para evitar errores
        (window as any).__vite_plugin_react_preamble_installed__ = {
          useRefreshReg: () => {},
          refreshReg: () => {},
          refresh: () => {}
        };
      }

      // Verificar si el objeto HMR de Vite existe
      if ((window as any).__vite_hmr) {
        console.log('Deshabilitando conexión HMR de Vite...');
        const viteHmr = (window as any).__vite_hmr;
        
        // Reemplazar el método de conexión con uno que no hace nada
        if (typeof viteHmr.connection === 'object' && viteHmr.connection) {
          // Cerrar cualquier conexión existente
          if (viteHmr.connection.close) {
            try {
              viteHmr.connection.close();
            } catch (e) {
              // Ignorar errores al cerrar
            }
          }
          
          // Reemplazar con objeto dummy
          viteHmr.connection = {
            readyState: 3, // CLOSED
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
            send: () => {}
          };
        }
      }

      // Sobrescribir la función createHotContext
      if ((window as any).createHotContext) {
        const originalCreateHotContext = (window as any).createHotContext;
        (window as any).createHotContext = (id: string) => {
          // Devolver un contexto hot dummy que no hace nada
          return {
            accept: () => {},
            prune: () => {},
            dispose: () => {},
            decline: () => {},
            invalidate: () => {},
            on: () => {},
            data: {}
          };
        };
        console.log('Reemplazada createHotContext con versión dummy');
      }
      
      // Interceptar y prevenir futuros intentos de conexión WebSocket
      const originalWebSocket = window.WebSocket;
      window.WebSocket = function(url: string, protocols?: string | string[]) {
        // Si es una URL de Vite para HMR, devolver un WebSocket simulado
        if (url.includes('vite') && (url.includes('hmr') || url.includes('hot'))) {
          console.log('Interceptada conexión WebSocket de Vite HMR:', url);
          // Crear un objeto "falso" WebSocket que no hace nada
          const dummyWebSocket = {
            readyState: 3, // CLOSED state
            send: () => {},
            close: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
            onerror: null,
            onmessage: null,
            onopen: null,
            onclose: null,
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3
          };
          
          // Devolver el objeto dummy
          return dummyWebSocket as any;
        }
        
        // Para todas las demás conexiones WebSocket, usar el comportamiento original
        return new originalWebSocket(url, protocols);
      } as any;
      
      console.log('HMR de Vite completamente deshabilitado para evitar errores de WebSocket');
    } catch (error) {
      console.error('Error al deshabilitar HMR de Vite:', error);
    }
  }
}

// Función para restaurar el comportamiento original si es necesario (probablemente no se use)
export function restoreViteHMR() {
  if (typeof window !== 'undefined' && originalViteHot) {
    (window as any).__vite_plugin_react_preamble_installed__ = originalViteHot;
    console.log('HMR de Vite restaurado');
  }
}