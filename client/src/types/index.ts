// Definimos tipos personalizados para nuestra aplicación
import React from "react";

// Estos tipos pueden ser expandidos según las necesidades de la aplicación
export type TaskStatus = 
  | "pending" 
  | "in_progress" 
  | "review" 
  | "completed" 
  | "blocked" 
  | "deferred" 
  | "cancelled";

export type TaskPriority = 
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "critical";