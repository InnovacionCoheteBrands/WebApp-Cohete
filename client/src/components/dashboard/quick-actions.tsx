import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock, LucideIcon } from "lucide-react";

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
      {/* Primera fila: Acciones principales */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Proyectos activos */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-primary dark:border-t-[#65cef5] dark:border dark:border-[#2a3349] dark:shadow-none dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] dark-hover dark-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white">Proyectos Activos</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Campañas de marketing actualmente activas
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-[#1e293b] dark:text-[#65cef5] dark:shadow-[0_0_10px_rgba(101,206,245,0.15)] dark:border dark:border-[#3e4a6d]">
                <span className="font-semibold text-lg">{activeProjectsCount}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/projects">
                <Button className="w-full relative overflow-hidden group dark:bg-[#2a3349] dark:text-white dark:hover:bg-[#374151]">
                  <span className="relative z-10">Ver Todos los Proyectos</span>
                  <div className="absolute inset-0 translate-y-[100%] bg-primary-foreground/10 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-[#65cef5]/10"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Calendarios recientes */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-amber-500 dark:border-t-amber-500 dark:border dark:border-[#2a3349] dark:shadow-none dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d]">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white">Calendarios Recientes</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Calendarios de contenido generados recientemente
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-600/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)] dark:border dark:border-amber-600/30">
                <span className="font-semibold text-lg">{recentSchedulesCount}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 relative overflow-hidden group dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white">
                <span className="relative z-10">Ver Calendarios</span>
                <div className="absolute inset-0 translate-y-[100%] bg-amber-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-amber-400/20"></div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-destructive dark:border dark:border-[#2a3349] dark:shadow-none dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] dark-hover dark-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white">Tareas Pendientes</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Tareas que requieren tu atención inmediata
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-red-500/20 dark:text-red-300 dark:shadow-[0_0_10px_rgba(239,68,68,0.15)] dark:border dark:border-red-500/30">
                <span className="font-semibold text-lg">{pendingTasksCount}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/tasks">
                <Button 
                  variant="outline" 
                  className="w-full border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 relative overflow-hidden group dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-800/50 dark:text-red-300"
                >
                  <span className="relative z-10">Ver Tareas</span>
                  <div className="absolute inset-0 translate-y-[100%] bg-destructive/10 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-red-500/10"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila: Creación de Calendarios */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendario Rápido */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-l-[3px] border-l-blue-500 dark:border-l-blue-500 dark:border dark:border-[#2a3349] dark:shadow-none dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] light-gradient-bg">
          <CardContent className="p-5">
            <div className="flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 mr-4 dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white">Calendario Rápido</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Genera un calendario básico con pocas opciones en segundos
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 text-sm p-3 rounded-md bg-white/80 border border-gray-100 dark:bg-[#1e293b]/50 dark:border-[#3e4a6d]">
                <div className="font-medium dark:text-white">Tiempo estimado</div>
                <div className="text-muted-foreground dark:text-slate-400">1-2 minutos</div>
              </div>
              <div className="space-y-1 text-sm p-3 rounded-md bg-white/80 border border-gray-100 dark:bg-[#1e293b]/50 dark:border-[#3e4a6d]">
                <div className="font-medium dark:text-white">Opciones</div>
                <div className="text-muted-foreground dark:text-slate-400">Básicas</div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link href="/#crear-calendario-rapido">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white relative overflow-hidden group dark:bg-blue-600 dark:hover:bg-blue-700">
                  <span className="relative z-10">Crear Calendario Rápido</span>
                  <div className="absolute inset-0 translate-y-[100%] bg-blue-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-blue-500/20"></div>
                  <Clock className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Calendario Avanzado */}
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-l-[3px] border-l-amber-500 dark:border-l-amber-500 dark:border dark:border-[#2a3349] dark:shadow-none dark:hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] light-gradient-bg">
          <CardContent className="p-5">
            <div className="flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 mr-4 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white">Calendario Avanzado</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Control total sobre plataformas, tipos y distribución de contenido
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 text-sm p-3 rounded-md bg-white/80 border border-gray-100 dark:bg-[#1e293b]/50 dark:border-[#3e4a6d]">
                <div className="font-medium dark:text-white">Tiempo estimado</div>
                <div className="text-muted-foreground dark:text-slate-400">5-10 minutos</div>
              </div>
              <div className="space-y-1 text-sm p-3 rounded-md bg-white/80 border border-gray-100 dark:bg-[#1e293b]/50 dark:border-[#3e4a6d]">
                <div className="font-medium dark:text-white">Opciones</div>
                <div className="text-muted-foreground dark:text-slate-400">Avanzadas y detalladas</div>
              </div>
            </div>
            
            <div className="mt-4">
              <Link href="/calendar-creator">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden group dark:bg-amber-600 dark:hover:bg-amber-700">
                  <span className="relative z-10">Crear Calendario Avanzado</span>
                  <div className="absolute inset-0 translate-y-[100%] bg-amber-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-amber-400/20"></div>
                  <CalendarPlus className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
