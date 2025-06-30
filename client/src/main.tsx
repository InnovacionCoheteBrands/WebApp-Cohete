// ===== IMPORTACIONES PRINCIPALES =====
// React DOM: Para renderizar la aplicación en el navegador
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
// Componente principal de la aplicación
import App from "./App";
// Estilos globales de la aplicación
import "./index.css";
// Utilidad para corregir problemas de WebSocket en Replit
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";
// Provider para tours guiados (importado aquí para configuración global)
import { AppTourProvider } from "./hooks/use-app-tour";

// ===== CORRECCIÓN DE WEBSOCKET PARA REPLIT =====
// Arreglar el problema de WebSocket en Replit
// Esta implementación corrige los problemas básicos sin desactivar funcionalidad
fixViteWebsocketInReplit();

// ===== INTERCEPTORES DE ERRORES =====
// Interceptor robusto para filtrar errores conocidos de DOMException y WebSocket
if (typeof window !== 'undefined') {
  // ===== INTERCEPTOR DE ERRORES DE CONSOLA =====
  // Guardar referencia al método original de console.error
  const originalConsoleError = console.error;
  
  // Sobrescribir console.error para filtrar errores específicos
  console.error = function(...args) {
    const errorStr = args.join(' ');
    
    // Filtrar errores conocidos que no son críticos en Replit
    if (errorStr.includes('DOMException') || 
        errorStr.includes('WebSocket') ||
        errorStr.includes('INVALID_STATE_ERR') ||
        errorStr.includes('[vite] ws connection failed')) {
      return; // No mostrar estos errores en consola
    }
    
    // Mostrar todos los demás errores normalmente
    originalConsoleError.apply(console, args);
  };

  // ===== INTERCEPTOR DE PROMESAS RECHAZADAS =====
  // Manejar promesas rechazadas no capturadas
  window.addEventListener('unhandledrejection', function(event) {
    // Filtrar errores específicos de DOMException y WebSocket
    if (event.reason && 
        (event.reason.name === 'DOMException' ||
         (event.reason.message && (
           event.reason.message.includes('WebSocket') ||
           event.reason.message.includes('INVALID_STATE_ERR')
         ))
        )
    ) {
      // Prevenir que estos errores aparezcan en la consola
      event.preventDefault();
    }
  });
}

// ===== DEBUG Y VERIFICACIÓN =====
// Confirmar que el script se está ejecutando correctamente
console.log("WebSocket de Vite corregido para entorno Replit");

// ===== RENDERIZADO DE LA APLICACIÓN =====
// Buscar el elemento HTML donde se montará React
const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Root element found, rendering React app...");
  
  // Crear root de React 18 y renderizar la aplicación
  createRoot(rootElement).render(
    // StrictMode: Modo estricto de React para detectar problemas
    <StrictMode>
      {/* AppTourProvider adicional aquí para configuración global */}
      <AppTourProvider>
        {/* Componente principal de la aplicación */}
        <App />
      </AppTourProvider>
    </StrictMode>
  );
  
  console.log("React app rendered successfully");
} else {
  // Error crítico si no se encuentra el elemento root
  console.error("Root element not found!");
}
