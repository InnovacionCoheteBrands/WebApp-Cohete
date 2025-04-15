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
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Proyectos Activos</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {activeProjectsCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Campañas de marketing actualmente activas
          </p>
          <Link href="/projects">
            <Button className="mt-4 w-full">
              Ver Todos los Proyectos
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Calendarios Recientes</h3>
            <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-sm font-medium text-secondary">
              {recentSchedulesCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Calendarios de contenido generados recientemente
          </p>
          <Button className="mt-4 w-full" variant="secondary">
            Ver Calendarios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Tareas Pendientes</h3>
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-sm font-medium text-destructive">
              {pendingTasksCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tareas que requieren tu atención
          </p>
          <Button 
            variant="outline" 
            className="mt-4 w-full border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            Ver Tareas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
