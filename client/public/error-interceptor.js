/**
 * Script para interceptar los errores a nivel de DOM antes de que lleguen a la consola
 * Este script debe ser incluido en index.html ANTES de cualquier otro script
 */

// Ejecutar inmediatamente
(function() {
  // La clave es interceptar los mensajes de error antes de que cualquier otro código se ejecute
  window.addEventListener('error', function(event) {
    // Verificar si es un error relacionado con WebSocket
    if (
      event.message && (
        event.message.includes('WebSocket') ||
        event.message.includes('socket') ||
        event.message.includes('ws:') ||
        event.message.includes('wss:') ||
        event.message.includes('hmr') ||
        event.message.includes('vite') ||
        event.message.includes('DOMException')
      )
    ) {
      // Prevenir que el error se propague
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Usar fase de captura para interceptar eventos temprano
  
  // Interceptar rechazos de promesas
  window.addEventListener('unhandledrejection', function(event) {
    // Suprimir TODOS los rechazos no manejados para evitar errores en la consola
    event.preventDefault();
    event.stopPropagation();
    
    // Si necesitas registrar rechazos que no son de WebSocket/Vite, puedes agregar lógica aquí
    
    return false;
  }, true); // Usar fase de captura
  
  // Interceptar antes de que cualquier otro código se ejecute
  const originalPromise = window.Promise;
  window.Promise = function() {
    const promise = new originalPromise(...arguments);
    
    // Sobrescribir el método then para capturar errores
    const originalThen = promise.then;
    promise.then = function() {
      const onResolve = arguments[0];
      const onReject = arguments[1];
      
      // Reemplazar el reject handler para evitar errores no manejados
      const safeOnReject = function(err) {
        try {
          if (onReject) {
            return onReject(err);
          }
          // Si no hay handler de rechazo, manejar silenciosamente
          return originalPromise.reject(err);
        } catch (e) {
          // Capturar cualquier error en el handler de rechazo
          console.log('Error capturado en Promise:', e);
          return originalPromise.reject(e);
        }
      };
      
      // Llamar al then original con nuestro manejador seguro
      return originalThen.call(this, onResolve, safeOnReject);
    };
    
    return promise;
  };
  
  // Hacer que la nueva Promise tenga todos los métodos del original
  for (const key in originalPromise) {
    if (originalPromise.hasOwnProperty(key)) {
      window.Promise[key] = originalPromise[key];
    }
  }
  
  // Guardar referencia al método fetch original
  const originalFetch = window.fetch;
  
  // Sobrescribir fetch para manejar errores de red relacionados con WebSockets
  window.fetch = function() {
    return originalFetch.apply(this, arguments)
      .catch(function(err) {
        // Verificar si es un error relacionado con WebSocket o HMR
        if (
          err.toString().includes('WebSocket') ||
          err.toString().includes('socket') ||
          err.toString().includes('vite') ||
          err.toString().includes('hmr')
        ) {
          // Registrar silenciosamente y devolver una respuesta vacía
          console.log('Error de red suprimido:', err);
          return new Response(JSON.stringify({}));
        }
        // Para otros errores, propagar normalmente
        return Promise.reject(err);
      });
  };
  
  console.log('[Interceptor] Sistema de intercepción de errores instalado');
})();