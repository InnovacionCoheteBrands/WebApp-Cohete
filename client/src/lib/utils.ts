// ===== IMPORTACIONES DE UTILIDADES CSS =====
// clsx: Utilidad para concatenar clases CSS condicionalmente
import { type ClassValue, clsx } from "clsx"
// tailwind-merge: Utilidad para mergear clases de Tailwind CSS de forma inteligente
import { twMerge } from "tailwind-merge"

// ===== FUNCIÓN UTILITARIA PARA CLASES CSS =====
// Combina clsx y tailwind-merge para una gestión óptima de clases CSS
// - clsx: maneja la concatenación condicional de clases
// - twMerge: resuelve conflictos entre clases de Tailwind (ej: p-4 + p-2 = p-2)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}