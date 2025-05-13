import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, taskStatusEnum, taskPriorityEnum } from "@shared/schema";
import { Loader2, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useToast } from "@/hooks/use-toast";

interface ProjectKanbanViewProps {
  projectId: number;
  viewId: number;
}

// Componente para una tarjeta de tarea individual
function TaskCard({ task }: { task: Task }) {
  // Función para obtener el color de la etiqueta de prioridad
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "secondary";
      case "high":
        return "default";
      case "urgent":
        return "destructive";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Traducción de prioridades para mostrar en español
  const translatePriority = (priority: string) => {
    const priorityTranslations: Record<string, string> = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
      critical: "Crítica",
    };
    return priorityTranslations[priority] || priority;
  };

  return (
    <Card className="mb-2 shadow-sm">
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Asignar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description || "Sin descripción"}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <Badge variant={getPriorityBadgeVariant(task.priority) as any} className="text-xs">
          {translatePriority(task.priority)}
        </Badge>
        <div className="text-xs text-muted-foreground">
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              })
            : "Sin fecha"}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ProjectKanbanView({ projectId, viewId }: ProjectKanbanViewProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obtener tareas del proyecto
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId, "tasks"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/projects/${projectId}/tasks`
      );
      return (await res.json()) as Task[];
    },
  });

  // Actualizar tarea (cambio de estado)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/tasks/${taskId}`,
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido movida exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al mover tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    const taskId = parseInt(active.id.toString().split('-')[1]);
    const newStatus = over.id.toString();
    
    if (isValidStatus(newStatus)) {
      updateTaskMutation.mutate({ taskId, status: newStatus });
    }
  };

  const isValidStatus = (status: string): status is keyof typeof taskStatusEnum.enumValues => {
    return Object.values(taskStatusEnum.enumValues).includes(status as any);
  };

  // Filtrar tareas según búsqueda
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    if (!searchTerm) return tasks;
    
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
    );
  }, [tasks, searchTerm]);

  // Agrupar tareas por estado
  const tasksByStatus = React.useMemo(() => {
    const result: Record<string, Task[]> = {};
    
    if (!filteredTasks) return result;
    
    // Inicializar todos los estados con arrays vacíos
    Object.values(taskStatusEnum.enumValues).forEach(status => {
      result[status] = [];
    });
    
    // Agrupar tareas por estado
    filteredTasks.forEach(task => {
      if (result[task.status]) {
        result[task.status].push(task);
      }
    });
    
    return result;
  }, [filteredTasks]);

  // Traducción de estados para mostrar en español
  const translateStatus = (status: string) => {
    const statusTranslations: Record<string, string> = {
      pending: "Pendiente",
      in_progress: "En progreso",
      review: "En revisión",
      completed: "Completada",
      cancelled: "Cancelada",
      blocked: "Bloqueada",
      deferred: "Aplazada",
    };
    return statusTranslations[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Columnas a mostrar (excluimos 'cancelled')
  const columns = Object.values(taskStatusEnum.enumValues).filter(
    status => status !== 'cancelled'
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full sm:w-[300px]"
          />
        </div>

        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {columns.map(status => (
            <div 
              key={status} 
              id={status}
              className="bg-muted/40 rounded-lg p-3 min-h-[300px]"
            >
              <div className="font-medium mb-3 sticky top-0 bg-muted/40 p-2 rounded flex justify-between items-center">
                <h3>{translateStatus(status)}</h3>
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {tasksByStatus[status]?.length || 0}
                </span>
              </div>
              
              <SortableContext 
                items={tasksByStatus[status]?.map(task => `task-${task.id}`) || []}
                strategy={verticalListSortingStrategy}
              >
                {tasksByStatus[status]?.map(task => (
                  <div key={`task-${task.id}`} id={`task-${task.id}`}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </SortableContext>
              
              {tasksByStatus[status]?.length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground">
                  No hay tareas
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-muted-foreground"
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar tarea
              </Button>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}