
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, ArrowRight, Calendar } from "lucide-react";
import { CustomCard } from "@/components/ui/custom-card";

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
      case 'completed': return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'in_progress': return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'planning': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      case 'paused': return 'bg-gray-900/50 text-gray-300 border-gray-700/50';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700/50';
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
    <CustomCard
      title="PROYECTOS RECIENTES"
      icon={<FolderOpen className="h-5 w-5 text-purple-400" />}
      defaultExpanded={true}
    >
      {recentProjects.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-500" />
          <p className="mb-4">No hay proyectos recientes</p>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 hover:border-transparent hover:text-white transition-all duration-300"
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
              className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg hover:bg-slate-800/30 hover:border-purple-400/30 transition-all duration-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <Badge className={`${getStatusColor(project.status)} border`}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Cliente: {project.client}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-800/50 transition-all duration-200"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 hover:border-transparent hover:text-white transition-all duration-300"
            onClick={() => setLocation("/projects")}
          >
            Ver Todos los Proyectos
          </Button>
        </div>
      )}
    </CustomCard>
  );
}
