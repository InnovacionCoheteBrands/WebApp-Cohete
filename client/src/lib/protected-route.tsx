// ===== IMPORTACIONES PARA RUTAS PROTEGIDAS =====
// Hook de autenticación personalizado
import { useAuth } from "@/hooks/use-auth";
// Icono de carga de Lucide React
import { Loader2 } from "lucide-react";
// Componente de redirección de Wouter
import { Redirect } from "wouter";
// Tipo para elementos hijo de React
import { ReactNode } from "react";

// ===== COMPONENTE DE RUTA PROTEGIDA =====
/**
 * HOC (Higher Order Component) que protege rutas requiriendo autenticación
 * Verifica si el usuario está autenticado antes de mostrar el contenido
 * Si no está autenticado, redirige a la página de login
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  // ===== OBTENER ESTADO DE AUTENTICACIÓN =====
  // Extraer información de usuario y estado de carga del contexto de auth
  const { user, isLoading } = useAuth();
  
  // Log para debugging del estado de autenticación
  console.log("ProtectedRoute:", { user: user?.username, isLoading });

  // ===== MOSTRAR PANTALLA DE CARGA =====
  // Si aún se está verificando la autenticación, mostrar indicador de carga
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', // Layout flexbox
        justifyContent: 'center', // Centrar horizontalmente
        alignItems: 'center', // Centrar verticalmente
        height: '100vh', // Ocupar toda la altura de la pantalla
        color: 'var(--foreground)' // Usar color de tema
      }}>
        Loading... {/* Mensaje de carga */}
      </div>
    );
  }

  // ===== VERIFICAR AUTENTICACIÓN =====
  // Si no hay usuario autenticado, redirigir a página de login
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // ===== RENDERIZAR CONTENIDO PROTEGIDO =====
  // Si el usuario está autenticado, mostrar el contenido hijo
  return <>{children}</>;
}
