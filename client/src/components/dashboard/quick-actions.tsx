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
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-primary dark:before:bg-[#65cef5]">
          <CardContent className="p-0">
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-primary dark:group-hover:text-[#65cef5] transition-colors duration-300">Proyectos Activos</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Campañas de marketing actualmente activas
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-[#65cef5] dark:text-[#65cef5] dark:shadow-[0_0_10px_rgba(101,206,245,0.15)] dark:border dark:border-[#3e4a6d] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="font-semibold text-xl bg-[#c4c7cc00] text-[#ffffff]">{activeProjectsCount}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary dark:bg-[#65cef5]" style={{ width: `${activeProjectsCount > 0 ? Math.min((activeProjectsCount / 10) * 100, 100) : 0}%` }}></div>
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-400 flex justify-between">
                  <span>Total: {activeProjectsCount}</span>
                  <span className="font-medium text-primary dark:text-[#65cef5]">{activeProjectsCount > 0 ? Math.min(Math.round((activeProjectsCount / 10) * 100), 100) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 px-5 pb-5">
              <Link href="/projects" className="block w-full">
                <Button className="w-full relative overflow-hidden group dark:bg-[#2a3349] dark:text-white dark:hover:bg-[#37415b] font-medium shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                  <span className="relative z-10 flex items-center">
                    Ver Todos los Proyectos
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 translate-y-[100%] bg-primary-foreground/10 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-[#65cef5]/10"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Calendarios recientes */}
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-amber-500">
          <CardContent className="p-0">
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">Calendarios Recientes</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Calendarios de contenido generados recientemente
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)] dark:border dark:border-amber-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="font-semibold text-xl">{recentSchedulesCount}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="h-1.5 bg-slate-100 dark:bg-amber-500/00 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${recentSchedulesCount > 0 ? Math.min((recentSchedulesCount / 5) * 100, 100) : 0}%` }}></div>
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-400 flex justify-between">
                  <span>Total: {recentSchedulesCount}</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{recentSchedulesCount > 0 ? Math.min(Math.round((recentSchedulesCount / 5) * 100), 100) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 px-5 pb-5">
              <Link href="/projects" className="block w-full">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 relative overflow-hidden group dark:bg-amber-600 dark:hover:bg-amber-700 text-white h-11 font-medium shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                  <span className="relative z-10 flex items-center">
                    Ver Calendarios
                    <CalendarDays className="ml-2 h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 translate-y-[100%] bg-amber-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-amber-400/20"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tareas pendientes */}
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-destructive dark:before:bg-red-500">
          <CardContent className="p-0">
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-destructive dark:group-hover:text-red-400 transition-colors duration-300">Tareas Pendientes</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Tareas que requieren tu atención inmediata
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:text-red-300 dark:shadow-[0_0_10px_rgba(239,68,68,0.15)] dark:border dark:border-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="font-semibold text-xl">{pendingTasksCount}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-destructive dark:bg-red-500/80" style={{ width: `${pendingTasksCount > 0 ? Math.min((pendingTasksCount / 10) * 100, 100) : 0}%` }}></div>
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-400 flex justify-between">
                  <span>Total: {pendingTasksCount}</span>
                  <span className="font-medium text-destructive dark:text-red-400">{pendingTasksCount > 0 ? Math.min(Math.round((pendingTasksCount / 10) * 100), 100) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 px-5 pb-5">
              <Link href="/tasks" className="block w-full">
                <Button variant="outline" className="w-full border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 relative overflow-hidden group dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-800/50 dark:text-red-300 h-11 font-medium shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                  <span className="relative z-10 flex items-center">
                    Ver Tareas
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 12 2 2 4-4" />
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </span>
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
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-blue-500">
          <CardContent className="p-0">
            <div className="p-5 relative z-10">
              <div className="flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mr-4 dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Calendario Rápido</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Genera un calendario básico con pocas opciones en segundos
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-blue-200 dark:group-hover:border-blue-800/30 transition-colors duration-300">
                  <div className="font-medium dark:text-white flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Tiempo estimado
                  </div>
                  <div className="text-muted-foreground dark:text-slate-400 pl-5">1-2 minutos</div>
                </div>
                <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-blue-200 dark:group-hover:border-blue-800/30 transition-colors duration-300">
                  <div className="font-medium dark:text-white flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Opciones
                  </div>
                  <div className="text-muted-foreground dark:text-slate-400 pl-5">Básicas</div>
                </div>
              </div>
            </div>
            <div className="mt-2 px-5 pb-5">
              <Link href="#crear-calendario-rapido" className="block w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] h-11 font-medium relative overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    Crear Calendario Rápido
                    <Clock className="ml-2 h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 translate-y-[100%] bg-blue-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-blue-500/20"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Calendario Avanzado */}
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-amber-500">
          <CardContent className="p-0">
            <div className="p-5 relative z-10">
              <div className="flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mr-4 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform duration-300">
                  <CalendarPlus className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">Calendario Avanzado</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Control total sobre plataformas, tipos y distribución de contenido
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-amber-200 dark:group-hover:border-amber-800/30 transition-colors duration-300">
                  <div className="font-medium dark:text-white flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Tiempo estimado
                  </div>
                  <div className="text-muted-foreground dark:text-slate-400 pl-5">5-10 minutos</div>
                </div>
                <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-amber-200 dark:group-hover:border-amber-800/30 transition-colors duration-300">
                  <div className="font-medium dark:text-white flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Opciones
                  </div>
                  <div className="text-muted-foreground dark:text-slate-400 pl-5">Avanzadas y detalladas</div>
                </div>
              </div>
            </div>
            <div className="mt-2 px-5 pb-5">
              <Link href="/calendar-creator" className="block w-full">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm dark:bg-amber-600 dark:hover:bg-amber-700 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] h-11 font-medium relative overflow-hidden group">
                  <span className="relative z-10 flex items-center">
                    Crear Calendario Avanzado
                    <CalendarPlus className="ml-2 h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 translate-y-[100%] bg-amber-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-amber-400/20"></div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}