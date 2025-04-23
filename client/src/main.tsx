import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
import { fixViteWebsocketInReplit } from "./lib/vite-websocket-fix";

// Arreglar el problema de WebSocket en Replit
fixViteWebsocketInReplit();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
