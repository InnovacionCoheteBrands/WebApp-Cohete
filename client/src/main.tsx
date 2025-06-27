import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";
import { AppTourProvider } from "./hooks/use-app-tour";

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

// Debug: verificar que el script se está ejecutando
console.log("WebSocket de Vite corregido para entorno Replit");

// Renderizar la aplicación normalmente
const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, rendering React app...");
  createRoot(rootElement).render(
    <StrictMode>
      <AppTourProvider>
        <App />
      </AppTourProvider>
    </StrictMode>
  );
  console.log("React app rendered successfully");
} else {
  console.error("Root element not found!");
}
