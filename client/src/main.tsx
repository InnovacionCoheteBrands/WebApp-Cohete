import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";

// Arreglar el problema de WebSocket en Replit
// Esta implementación ya corrige los problemas básicos sin desactivar funcionalidad
fixViteWebsocketInReplit();

// Interceptor robusto para errores de DOMException y WebSocket
if (typeof window !== 'undefined') {
  // Interceptar errores de consola específicos
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorStr = args.join(' ');
    
    // Filtrar errores de DOMException, WebSocket y Vite HMR
    if (errorStr.includes('DOMException') || 
        errorStr.includes('WebSocket') ||
        errorStr.includes('INVALID_STATE_ERR') ||
        errorStr.includes('[vite] ws connection failed')) {
      return; // No mostrar
    }
    
    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };

  // Interceptor adicional para unhandled rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        (event.reason.name === 'DOMException' ||
         (event.reason.message && (
           event.reason.message.includes('WebSocket') ||
           event.reason.message.includes('INVALID_STATE_ERR')
         ))
        )
    ) {
      event.preventDefault();
    }
  });
}

// Renderizar la aplicación normalmente
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
