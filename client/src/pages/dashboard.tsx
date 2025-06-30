// ===== IMPORTACIONES DEL DASHBOARD =====
// TanStack Query: Para consultas de datos del servidor
import { useQuery } from "@tanstack/react-query";
// Hook para mostrar notificaciones
import { useToast } from "@/hooks/use-toast";

// ===== COMPONENTES DEL DASHBOARD =====
// Sección de bienvenida con información del usuario
import WelcomeSection from "@/components/dashboard/welcome-section";
// Acciones rápidas (crear proyecto, calendario, etc.)
import QuickActions from "@/components/dashboard/quick-actions";
// Lista de proyectos recientes
import RecentProjects from "@/components/dashboard/recent-projects";
// Lista de cronogramas recientes
import RecentSchedules from "@/components/dashboard/recent-schedules";

// ===== COMPONENTE PRINCIPAL DEL DASHBOARD =====
// Página principal que muestra un resumen del estado del usuario y proyectos
export default function Dashboard() {
  // Hook para mostrar notificaciones toast
  const { toast } = useToast();

  // ===== CONSULTA DE DATOS DEL USUARIO =====
  // Obtiene información del usuario autenticado
  const { data: user } = useQuery({
    queryKey: ['user'], // Clave para el cache
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Error al cargar datos del usuario');
      return res.json();
    },
    retry: 1 // Solo reintentar una vez en caso de error
  });

  // ===== CONSULTA DE PROYECTOS =====
  // Obtiene lista de todos los proyectos del usuario
  const { data: projects } = useQuery({
    queryKey: ['projects'], // Clave para el cache
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Error al cargar proyectos');
      return res.json();
    },
    retry: 1 // Solo reintentar una vez en caso de error
  });

  // ===== CONSULTA DE CRONOGRAMAS RECIENTES =====
  // Obtiene cronogramas de contenido recientes
  const { data: schedules } = useQuery({
    queryKey: ['schedules', 'recent'], // Clave compuesta para el cache
    queryFn: async () => {
      const res = await fetch('/api/schedules/recent');
      if (!res.ok) throw new Error('Error al cargar horarios');
      return res.json();
    },
    retry: 1 // Solo reintentar una vez en caso de error
  });

  // ===== RENDERIZADO DEL DASHBOARD =====
  return (
    <div className="space-y-6 hide-scrollbar">
      {/* Sección de bienvenida con información del usuario */}
      <WelcomeSection user={user} />
      
      {/* Acciones rápidas para crear contenido */}
      <QuickActions />
      
      {/* Grid responsivo con proyectos y cronogramas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <RecentSchedules />
      </div>
    </div>
  );
}