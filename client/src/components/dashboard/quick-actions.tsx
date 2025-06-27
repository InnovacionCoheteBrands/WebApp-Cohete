import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock, FolderOpen, CheckSquare, Calendar } from "lucide-react";
import { StatsCard } from "./stats-card";
import { NeonCard, NeonButton } from "@/components/ui/neon-card";

export default function QuickActions() {
  // Fetch project count
  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    staleTime: 30000,
  });

  // Fetch recent schedules
  const { data: schedules } = useQuery<any[]>({
    queryKey: ["/api/schedules/recent"],
    staleTime: 30000,
  });

  const activeProjectsCount = projects?.length || 0;
  const recentSchedulesCount = schedules?.length || 0;
  const pendingTasksCount = 3; // This could be fetched from an API in the future

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas con diseño neón */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Proyectos Activos"
          value={activeProjectsCount}
          icon={FolderOpen}
          description="Campañas de marketing actualmente activas"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatsCard
          title="Calendarios Recientes"
          value={recentSchedulesCount}
          icon={Calendar}
          description="Calendarios de contenido generados"
          trend={{ value: 8, isPositive: false }}
        />
        
        <StatsCard
          title="Tareas Pendientes"
          value={pendingTasksCount}
          icon={CheckSquare}
          description="Tareas que requieren atención"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Sección de creación de calendarios con diseño neón */}
      <div className="grid gap-6 md:grid-cols-2">
        <NeonCard 
          title="Calendario Rápido"
          defaultExpanded={true}
          footer={
            <>
              <NeonButton variant="secondary">Más Info</NeonButton>
              <Link href="#crear-calendario-rapido">
                <NeonButton variant="primary">Crear Ahora</NeonButton>
              </Link>
            </>
          }
        >
          <p className="mb-4">
            Genera un calendario básico con pocas opciones en segundos. 
            Perfecto para campañas simples que necesitan publicarse rápidamente.
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>1-2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>Opciones básicas</span>
            </div>
          </div>
        </NeonCard>

        <NeonCard 
          title="Calendario Avanzado"
          defaultExpanded={true}
          footer={
            <>
              <NeonButton variant="secondary">Tutorial</NeonButton>
              <Link href="#crear-calendario-avanzado">
                <NeonButton variant="primary">Crear Avanzado</NeonButton>
              </Link>
            </>
          }
        >
          <p className="mb-4">
            Control total sobre plataformas, tipos y distribución de contenido. 
            Ideal para campañas complejas con múltiples redes sociales.
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-fuchsia-400" />
              <span>5-10 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-fuchsia-400" />
              <span>Personalización total</span>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  );
}