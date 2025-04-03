import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Calendar, Clock, PlusCircle, ListChecks, AlertCircle } from 'lucide-react';
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
  SelectItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Definir el esquema de validación para crear/editar tareas
const taskSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres",
  }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  dueDate: z.string().optional(),
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
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

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
    mutationFn: async (data: any) => {
      const { id, ...taskData } = data;
      const res = await apiRequest('PATCH', `/api/tasks/${id}`, taskData);
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
    
    // Formatear la fecha para el input
    const formattedDate = task.dueDate 
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : undefined;
    
    editForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: formattedDate,
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

      <div className="flex items-center gap-4 mb-6">
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

        <Button
          variant="default"
          onClick={() => setIsNewTaskDialogOpen(true)}
          disabled={!selectedProject}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>

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
                    <FormItem>
                      <FormLabel>Fecha límite</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
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
                    <FormItem>
                      <FormLabel>Fecha límite</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
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
            <Calendar className="h-3 w-3 mr-1" />
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