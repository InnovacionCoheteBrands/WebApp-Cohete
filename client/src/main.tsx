import { createRoot } from "react-dom/client";
import { StrictMode, useEffect } from "react";
import App from "./App";
import "./index.css";
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";

// Bloque para manejar errores no atrapados a nivel global
if (typeof window !== 'undefined') {
  // Capturar todos los errores no manejados
  window.addEventListener('error', (event) => {
    console.log('Error no manejado interceptado:', event.error);
    // Prevenir que el error se muestre en la consola si está relacionado con WebSocket
    if (
      event.error && (
        (event.error.message && (
          event.error.message.includes('WebSocket') ||
          event.error.message.includes('socket') ||
          event.error.message.includes('ws:') ||
          event.error.message.includes('wss:')
        )) ||
        (event.error.stack && event.error.stack.includes('WebSocket')) ||
        (event.error.name && event.error.name === 'DOMException')
      )
    ) {
      event.preventDefault();
      console.log('Error de WebSocket suprimido');
    }
  });

  // Capturar rechazos de promesas no manejados
  window.addEventListener('unhandledrejection', (event) => {
    console.log('Rechazo no manejado interceptado:', event.reason);
    // Intentar suprimir solo los relacionados con Vite/WebSocket/DOMException
    if (
      event.reason && (
        (typeof event.reason.message === 'string' && (
          event.reason.message.includes('WebSocket') ||
          event.reason.message.includes('socket') ||
          event.reason.message.includes('ws:') ||
          event.reason.message.includes('wss:') ||
          event.reason.message.includes('vite')
        )) ||
        (typeof event.reason.stack === 'string' && (
          event.reason.stack.includes('WebSocket') ||
          event.reason.stack.includes('vite')
        )) ||
        (typeof event.reason.name === 'string' && 
          event.reason.name === 'DOMException'
        ) ||
        // Para objetos de error que solo tienen toString
        (event.reason.toString && 
          event.reason.toString().includes('DOMException')
        )
      )
    ) {
      event.preventDefault();
      console.log('Error de promesa relacionado con WebSocket/Vite suprimido');
    }
  });
}

// Arreglar el problema de WebSocket en Replit
fixViteWebsocketInReplit();

// Wrapper para eliminar efectos secundarios no deseados
const AppWithErrorHandling = () => {
  useEffect(() => {
    // Función para simular conexiones websocket fallidas
    const simulateWebSocketFix = () => {
      try {
        // Intentar abrir y cerrar un websocket dummy para "calentar" el sistema
        const dummyWs = new WebSocket(`wss://${window.location.host}/dummy-socket`);
        // Cerrar inmediatamente para evitar errores
        setTimeout(() => dummyWs.close(), 100);
      } catch (e) {
        // Ignorar errores silenciosamente
      }
    };

    // Ejecutar la simulación con un pequeño retraso
    const timeoutId = setTimeout(simulateWebSocketFix, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<AppWithErrorHandling />);
