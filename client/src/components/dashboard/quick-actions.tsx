import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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
    <div className="grid gap-6 md:grid-cols-3">
      {/* Proyectos activos */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-primary">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg tracking-tight">Proyectos Activos</h3>
              <p className="text-sm text-muted-foreground">
                Campañas de marketing actualmente activas
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="font-semibold text-lg">{activeProjectsCount}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/projects">
              <Button className="w-full relative overflow-hidden group">
                <span className="relative z-10">Ver Todos los Proyectos</span>
                <div className="absolute inset-0 translate-y-[100%] bg-primary-foreground/10 transition-transform duration-300 group-hover:translate-y-[0%]"></div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Calendarios recientes */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-blue-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg tracking-tight">Calendarios Recientes</h3>
              <p className="text-sm text-muted-foreground">
                Calendarios de contenido generados recientemente
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <span className="font-semibold text-lg">{recentSchedulesCount}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 relative overflow-hidden group">
              <span className="relative z-10">Ver Calendarios</span>
              <div className="absolute inset-0 translate-y-[100%] bg-blue-600/20 transition-transform duration-300 group-hover:translate-y-[0%]"></div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tareas pendientes */}
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-t-[3px] border-t-destructive">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg tracking-tight">Tareas Pendientes</h3>
              <p className="text-sm text-muted-foreground">
                Tareas que requieren tu atención inmediata
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <span className="font-semibold text-lg">{pendingTasksCount}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/tasks">
              <Button 
                variant="outline" 
                className="w-full border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 relative overflow-hidden group"
              >
                <span className="relative z-10">Ver Tareas</span>
                <div className="absolute inset-0 translate-y-[100%] bg-destructive/10 transition-transform duration-300 group-hover:translate-y-[0%]"></div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
