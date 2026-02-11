
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ArrowRight, Calendar } from "lucide-react";

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  createdAt: string;
}

export default function RecentProjects() {
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    staleTime: 30000,
  });
  const [, setLocation] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'planning': return 'Planificación';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const recentProjects = projects.slice(0, 3);

  return (
    <Card className="glass-panel-dark tech-border h-full">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Proyectos Recientes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {recentProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="relative mx-auto mb-4 h-16 w-16 opacity-20">
              <FolderOpen className="h-16 w-16" />
            </div>
            <p className="text-lg font-medium text-gray-400 mb-2">No hay proyectos recientes</p>
            <p className="text-sm text-gray-500 mb-6">Comienza creando tu primera campaña</p>
            <Button
              className="btn-amber-glow font-bold"
              onClick={() => setLocation("/projects")}
            >
              Crear Primer Proyecto
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">{project.name}</h4>
                    <Badge className={`${getStatusColor(project.status)} border-0 font-bold tracking-wide uppercase text-[10px]`}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <span>{project.client}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full mt-2 border-white/10 bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300 uppercase text-xs font-bold tracking-widest h-10"
              onClick={() => setLocation("/projects")}
            >
              Ver Todos los Proyectos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
