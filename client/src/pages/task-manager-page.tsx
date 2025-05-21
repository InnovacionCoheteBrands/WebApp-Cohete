import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import ProjectViewContainer from "@/components/project/project-view-container";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Definimos el tipo para los datos del proyecto
interface Project {
  id: number;
  name: string;
  client: string;
  description: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TaskManagerPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  // Obtener detalles del proyecto
  const { 
    data: project, 
    isLoading: isLoadingProject,
    error 
  } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">Proyecto no encontrado</h2>
        <p className="text-muted-foreground mb-6">No se pudo cargar el proyecto solicitado.</p>
        <Button asChild>
          <Link href="/projects">Ver todos los proyectos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Gestión de tareas</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}`}>Ver detalles del proyecto</Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm">
        <ProjectViewContainer projectId={parseInt(projectId as string)} />
      </div>
    </div>
  );
}