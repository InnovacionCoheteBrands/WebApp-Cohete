import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { 
  CalendarIcon, 
  Clock, 
  PlusCircle, 
  ListChecks, 
  AlertCircle, 
  Layout,
  BarChart4,
  Table,
  KanbanSquare,
  GanttChartSquare,
  Tag,
  ListFilter,
  Users,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaciones para los componentes de Kanban
import { TaskForm } from '@/components/tasks/task-form';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { EnhancedKanbanBoard } from '@/components/tasks/enhanced-kanban-board';

// Definir el esquema de validación para crear/editar tareas
const taskSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres",
  }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  dueDate: z.date().optional().nullable(),
  projectId: z.number(),
  assignedToId: z.number().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

// Componente de Tareas
const TaskManager = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'table'>('kanban');
  const [groupBy, setGroupBy] = useState<'status' | 'assignee' | 'priority'>('status');
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Consultar proyectos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    select: (data) => data || [],
  });

  // Consultar tareas del proyecto seleccionado
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/projects', selectedProject, 'tasks'],
    queryFn: async () => {
      if (!selectedProject) return [];
      const res = await apiRequest('GET', `/api/projects/${selectedProject}/tasks`);
      return await res.json();
    },
    enabled: !!selectedProject,
  });

  // Crear nueva tarea
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await apiRequest('POST', `/api/projects/${data.projectId}/tasks`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProject, 'tasks'] });
      setIsNewTaskDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error al crear la tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      const res = await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProject, 'tasks'] });
      setIsEditTaskDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar la tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  // Eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProject, 'tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar la tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generar tareas con IA
  const generateTasksMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await apiRequest('POST', `/api/projects/${projectId}/generate-tasks`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tareas generadas",
        description: `Se han generado ${data.length} tareas con IA`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProject, 'tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error al generar tareas",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Formulario para nueva tarea
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      projectId: selectedProject || undefined,
    },
  });

  // Formulario para editar tarea
  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      projectId: selectedProject || undefined,
    },
  });

  // Actualizar el proyecto seleccionado en el formulario cuando cambia
  React.useEffect(() => {
    if (selectedProject) {
      form.setValue('projectId', selectedProject);
    }
  }, [selectedProject, form]);

  // Preparar el formulario para editar una tarea
  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    
    // Convertir la fecha a un objeto Date
    const dueDateObj = task.dueDate 
      ? new Date(task.dueDate)
      : null;
    
    editForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: dueDateObj,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
    });
    
    setIsEditTaskDialogOpen(true);
  };

  // Cambiar el estado de una tarea
  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      status: newStatus,
    });
  };

  // Obtener usuarios para asignar tareas
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/users');
        return await res.json();
      } catch (error) {
        return [];
      }
    },
  });

  // Renderizar badge según prioridad
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-500">Alta</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Media</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-500">Baja</Badge>;
      default:
        return <Badge variant="outline">No definida</Badge>;
    }
  };

  // Renderizar badge según estado
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">En progreso</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="default" className="bg-gray-500">Cancelada</Badge>;
      default:
        return <Badge variant="outline">No definido</Badge>;
    }
  };

  // Manejadores para las funcionalidades de arrastrar y soltar
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id.toString().split('-')[1]);
    const draggedTask = tasks.find((task: any) => task.id === taskId);
    setDraggedTask(draggedTask);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Manejo opcional para efectos visuales durante el arrastre
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Si no ha cambiado la columna, no hacemos nada
    if (activeId === overId) return;
    
    const taskId = parseInt(activeId.split('-')[1]);
    let newStatus;
    let newAssigneeId;
    let newPriority;
    
    // Determinar qué propiedad actualizar según el groupBy
    if (groupBy === 'status') {
      newStatus = overId;
    } else if (groupBy === 'assignee') {
      if (overId === 'unassigned') {
        newAssigneeId = null;
      } else {
        newAssigneeId = parseInt(overId.split('-')[1]);
      }
    } else if (groupBy === 'priority') {
      newPriority = overId;
    }
    
    const updateData: any = { id: taskId };
    
    if (newStatus) updateData.status = newStatus;
    if (newAssigneeId !== undefined) updateData.assignedToId = newAssigneeId;
    if (newPriority) updateData.priority = newPriority;
    
    // Actualizar la tarea en el servidor
    updateTaskMutation.mutate(updateData);
    
    setDraggedTask(null);
  };
  
  // Filtrar tareas por estado
  const pendingTasks = tasks.filter((task: any) => task.status === 'pending');
  const inProgressTasks = tasks.filter((task: any) => task.status === 'in_progress');
  const completedTasks = tasks.filter((task: any) => task.status === 'completed');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Gestor de Tareas</h1>
      <p className="text-muted-foreground mb-6">
        Administra las tareas de tus proyectos y mejora la productividad del equipo
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select 
              value={selectedProject?.toString() || ""}
              onValueChange={(value) => setSelectedProject(parseInt(value))}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            {selectedProject && (
              <CreateTaskDialog projectId={selectedProject}>
                <Button variant="default">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Tarea
                </Button>
              </CreateTaskDialog>
            )}
  
            <Button
              variant="outline"
              onClick={() => {
                if (selectedProject) {
                  generateTasksMutation.mutate(selectedProject);
                }
              }}
              disabled={!selectedProject || generateTasksMutation.isPending}
            >
              <span className="mr-2">🧠</span>
              Generar Tareas con IA
            </Button>
          </div>
          
          {/* Controles de vista estilo Monday */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={activeView === 'kanban' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setActiveView('kanban')}
                  >
                    <KanbanSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vista Kanban</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={activeView === 'list' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setActiveView('list')}
                  >
                    <ListChecks className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vista Lista</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={activeView === 'table' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setActiveView('table')}
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vista Tabla</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Select
              value={groupBy}
              onValueChange={(value: 'status' | 'assignee' | 'priority') => setGroupBy(value)}
            >
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center">
                  <ListFilter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Agrupar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Estado</SelectItem>
                <SelectItem value="assignee">Asignado a</SelectItem>
                <SelectItem value="priority">Prioridad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {tasks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {users.filter(u => tasks.some((t: any) => t.assignedToId === u.id)).length} asignados
            </Badge>
            
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {tasks.filter((t: any) => t.dueDate).length} con fecha límite
            </Badge>
            
            <Badge variant="outline" className="px-3 py-1 bg-blue-50">
              <span className="mr-1">🧠</span>
              {tasks.filter((t: any) => t.aiGenerated).length} generadas por IA
            </Badge>
            
            <Badge variant="outline" className="px-3 py-1">
              <Tag className="h-3 w-3 mr-1" />
              {tasks.filter((t: any) => t.tags?.length).length} con etiquetas
            </Badge>
          </div>
        )}
      </div>

      {!selectedProject ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">Selecciona un proyecto</h3>
          <p className="text-muted-foreground mt-1">
            Elige un proyecto para ver y gestionar sus tareas
          </p>
        </div>
      ) : isLoadingTasks ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="w-full">
          {/* Vista Kanban */}
          {activeView === 'kanban' && (
            <div className="kanban-board h-[calc(100vh-250px)]">
              <EnhancedKanbanBoard
                tasks={tasks}
                users={users}
                onEdit={handleEditTask}
                onDelete={(taskId: number) => {
                  if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                    deleteTaskMutation.mutate(taskId);
                  }
                }}
                onUpdateTaskStatus={(taskId: number, newStatus: string) => {
                  updateTaskMutation.mutate({
                    taskId,
                    updates: { status: newStatus }
                  });
                }}
                groupBy={groupBy === 'assignee' ? 'assignee' : (groupBy === 'priority' ? 'priority' : 'status')}
              />
            </div>
          )}
          
          {/* Vista Lista */}
          {activeView === 'list' && (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="pending">
                  Pendientes <Badge variant="outline" className="ml-2">{pendingTasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  En Progreso <Badge variant="outline" className="ml-2">{inProgressTasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completadas <Badge variant="outline" className="ml-2">{completedTasks.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No hay tareas pendientes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingTasks.map((task: any) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={handleEditTask} 
                        onDelete={() => deleteTaskMutation.mutate(task.id)}
                        onStatusChange={handleStatusChange}
                        renderPriorityBadge={renderPriorityBadge}
                        renderStatusBadge={renderStatusBadge}
                        users={users}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-4">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No hay tareas en progreso</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inProgressTasks.map((task: any) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={handleEditTask} 
                        onDelete={() => deleteTaskMutation.mutate(task.id)}
                        onStatusChange={handleStatusChange}
                        renderPriorityBadge={renderPriorityBadge}
                        renderStatusBadge={renderStatusBadge}
                        users={users}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedTasks.length === 0 ? (
                  <div className="text-center p-12 border rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No hay tareas completadas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedTasks.map((task: any) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={handleEditTask} 
                        onDelete={() => deleteTaskMutation.mutate(task.id)}
                        onStatusChange={handleStatusChange}
                        renderPriorityBadge={renderPriorityBadge}
                        renderStatusBadge={renderStatusBadge}
                        users={users}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Vista Tabla */}
          {activeView === 'table' && (
            <div className="overflow-auto rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Título</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Prioridad</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Asignado a</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Fecha límite</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No hay tareas disponibles
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task: any, index: number) => {
                      const assignedUser = users.find(user => user.id === task.assignedToId);
                      return (
                        <tr key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                          <td className="p-2 align-middle">{index + 1}</td>
                          <td className="p-2 align-middle font-medium">
                            <div className="flex items-center gap-2">
                              {task.title}
                              {task.aiGenerated && (
                                <div className="text-xs font-medium text-blue-600 flex items-center gap-1">
                                  <span>🧠</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 align-middle">{renderStatusBadge(task.status)}</td>
                          <td className="p-2 align-middle">{renderPriorityBadge(task.priority)}</td>
                          <td className="p-2 align-middle">
                            {assignedUser ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{assignedUser.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{assignedUser.fullName}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No asignado</span>
                            )}
                          </td>
                          <td className="p-2 align-middle">
                            {task.dueDate ? (
                              <div className="flex items-center text-sm">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), "d 'de' MMM, yyyy", { locale: es })}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Sin fecha</span>
                            )}
                          </td>
                          <td className="p-2 align-middle">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
                                Editar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive" 
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Diálogo para crear nueva tarea */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
            <DialogDescription>
              Crea una nueva tarea para el proyecto seleccionado
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la tarea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción detallada de la tarea" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha límite</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: es })
                              ) : (
                                <span>Sin fecha límite</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignar a</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Asignar a un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewTaskDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  )}
                  Crear Tarea
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar tarea */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la tarea seleccionada
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => updateTaskMutation.mutate({ id: selectedTask.id, ...data }))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la tarea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción detallada de la tarea" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha límite</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: es })
                              ) : (
                                <span>Sin fecha límite</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">En progreso</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asignar a</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Asignar a un usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditTaskDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  )}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente de Tarjeta de Tarea
interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: () => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
  renderPriorityBadge: (priority: string) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
  users: any[];
}

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  renderPriorityBadge,
  renderStatusBadge,
  users
}: TaskCardProps) => {
  const assignedUser = users.find(user => user.id === task.assignedToId);
  
  return (
    <Card className={`${task.aiGenerated ? 'border-blue-200 bg-blue-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex gap-2">
            {renderPriorityBadge(task.priority)}
            {renderStatusBadge(task.status)}
          </div>
          {task.aiGenerated && (
            <div className="text-xs font-medium text-blue-600 flex items-center gap-1">
              <span>🧠</span> IA
            </div>
          )}
        </div>
        <CardTitle className="text-lg">{task.title}</CardTitle>
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(task.dueDate), "d 'de' MMMM, yyyy", { locale: es })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {task.description || "Sin descripción"}
        </p>
        
        {assignedUser && (
          <div className="mt-3 flex items-center">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              {assignedUser.fullName.charAt(0)}
            </div>
            <span className="text-xs ml-2">{assignedUser.fullName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div>
          <Select 
            defaultValue={task.status}
            onValueChange={(value) => onStatusChange(task.id, value)}
          >
            <SelectTrigger className="h-8 text-xs border-dashed">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskManager;