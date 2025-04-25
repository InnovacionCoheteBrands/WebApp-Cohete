import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";

// Arreglar el problema de WebSocket en Replit
// Esta implementación ya corrige los problemas básicos sin desactivar funcionalidad
fixViteWebsocketInReplit();

// Si queremos ocultar errores específicos de DOMException en la consola,
// podemos usar un interceptor sencillo
if (typeof window !== 'undefined') {
  // Solo interceptar los errores específicos de DOMException
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorStr = args.join(' ');
    
    // Solo filtrar errores de DOMException
    if (errorStr.includes('DOMException')) {
      return; // No mostrar
    }
    
    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };
}

// Renderizar la aplicación normalmente
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
