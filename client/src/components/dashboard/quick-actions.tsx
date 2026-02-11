import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock, LayoutDashboard, ListTodo, Rocket } from "lucide-react";

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
    <div className="space-y-8">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-6 bg-primary rounded-full"></div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Acceso Rápido
        </h3>
      </div>

      {/* Primera fila: Acciones principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Proyectos activos */}
        <Card className="group glass-panel-dark tech-border overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)]">
          <CardContent className="p-0">
            <div className="p-6 relative z-10">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <Rocket className="h-24 w-24 text-primary -rotate-12" />
              </div>

              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary icon-3d-amber">
                      <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <span className="text-5xl font-bold gradient-text-amber tracking-tighter">{activeProjectsCount}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors duration-300">PROYECTOS</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Campañas Activas
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-dark shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${activeProjectsCount > 0 ? Math.min((activeProjectsCount / 10) * 100, 100) : 0}%` }}></div>
                  </div>
                  <Link href="/projects" className="block w-full">
                    <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 text-xs uppercase tracking-widest font-bold h-9">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendarios recientes */}
        <Card className="group glass-panel-dark tech-border overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)]">
          <CardContent className="p-0">
            <div className="p-6 relative z-10">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <CalendarDays className="h-24 w-24 text-primary -rotate-12" />
              </div>

              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary icon-3d-amber">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <span className="text-5xl font-bold gradient-text-amber tracking-tighter">{recentSchedulesCount}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors duration-300">CALENDARIOS</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Generados Recientemente
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-dark shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${recentSchedulesCount > 0 ? Math.min((recentSchedulesCount / 5) * 100, 100) : 0}%` }}></div>
                  </div>
                  <Link href="/projects" className="block w-full">
                    <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 text-xs uppercase tracking-widest font-bold h-9">
                      Ver Calendarios
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Segunda fila: Creación de Calendarios */}
      {/* Segunda fila: Creación de Calendarios - Comparison Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendario Rápido - Standard Glass */}
        <Card className="group relative overflow-hidden rounded-xl glass-panel-dark border-white/5 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          {/* Abstract Background Icon */}
          <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rotate-12">
            <Clock className="h-64 w-64 text-white" />
          </div>

          <CardContent className="p-8 relative z-10 flex flex-col h-full">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:text-primary group-hover:border-primary/30 transition-colors duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">CALENDARIO RÁPIDO</h3>
              </div>

              <p className="text-muted-foreground leading-relaxed text-base">
                Generación veloz de contenido. Ideal para ideas espontáneas y cobertura inmediata.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="metric-chip text-xs font-bold uppercase tracking-wider text-gray-400 border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  1-2 Minutos
                </span>
                <span className="metric-chip text-xs font-bold uppercase tracking-wider text-gray-400 border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  Básico
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/quick-calendar" className="block w-full">
                <Button className="w-full glass-premium hover:bg-primary/20 border-white/10 hover:border-primary/50 text-white font-bold tracking-wide h-14 transition-all duration-300 group-hover:translate-y-1">
                  INICIAR SISTEMA RÁPIDO
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Calendario Avanzado - Premium Golden Glow */}
        <Card className="group relative overflow-hidden rounded-xl glass-panel-dark golden-border transition-all duration-500 shadow-[0_0_30px_rgba(var(--primary),0.15)] hover:shadow-[0_0_50px_rgba(var(--primary),0.25)] transform hover:-translate-y-1">
          {/* Abstract Background Icon */}
          <div className="absolute -right-12 -bottom-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 rotate-12">
            <CalendarPlus className="h-64 w-64 text-primary" />
          </div>

          <CardContent className="p-8 relative z-10 flex flex-col h-full">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 text-primary icon-3d-amber">
                  <CalendarPlus className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold gradient-text-amber tracking-tight">CALENDARIO AVANZADO</h3>
              </div>

              <p className="text-gray-300 leading-relaxed text-base">
                Control total de misión. Configura plataformas, formatos y distribución detallada.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="metric-chip text-xs font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
                  5-10 Minutos
                </span>
                <span className="metric-chip text-xs font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  Completo
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/calendar-creator" className="block w-full">
                <Button className="w-full btn-gradient-amber hover:brightness-110 text-black font-bold tracking-wide h-14 shadow-lg shadow-primary/20 transition-all duration-300">
                  INICIAR SISTEMA AVANZADO
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}