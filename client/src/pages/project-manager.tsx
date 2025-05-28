import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces para el sistema Monday.com
interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'blocked' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  dueDate?: string;
  tags: string[];
  projectId: number;
  groupId?: number;
  createdById: number;
  createdAt: string;
}

interface TaskGroup {
  id: number;
  name: string;
  projectId: number;
  position: number;
  color?: string;
  tasks: Task[];
}

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
}

interface TaskWithDetails {
  task: Task;
  group?: TaskGroup;
  project: Project;
  assignee?: {
    id: number;
    fullName: string;
    username: string;
    profileImage?: string;
  };
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  blocked: 'bg-red-100 text-red-800',
  deferred: 'bg-purple-100 text-purple-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function ProjectManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta para obtener todas las tareas con detalles
  const { data: tasksData = [], isLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ['/api/tasks-with-groups'],
  });

  // Consulta para obtener todos los proyectos
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Crear nueva tarea
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Error al crear tarea');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks-with-groups'] });
      toast({ title: 'Tarea creada exitosamente' });
    },
  });

  // Actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: number }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Error al actualizar tarea');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks-with-groups'] });
      toast({ title: 'Tarea actualizada exitosamente' });
    },
  });

  // Extraer todas las tareas de los grupos
  const allTasks = tasksData.flatMap((group: any) => 
    group.tasks?.map((task: any) => ({
      task,
      group: group.group,
      project: { id: task.projectId, name: projects.find((p: any) => p.id === task.projectId)?.name || 'Proyecto', client: projects.find((p: any) => p.id === task.projectId)?.client || 'Cliente' },
      assignee: task.assignee
    })) || []
  );

  // Filtrar tareas
  const filteredTasks = allTasks.filter((item: any) => {
    const matchesSearch = item.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project?.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.task?.status === filterStatus;
    const matchesProject = filterProject === 'all' || item.task?.projectId?.toString() === filterProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Agrupar tareas por proyecto
  const tasksByProject = filteredTasks.reduce((acc: any, item: any) => {
    const projectId = item.task?.projectId;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: item.project,
        tasks: []
      };
    }
    acc[projectId].tasks.push(item);
    return acc;
  }, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestor de Proyectos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las tareas de tus proyectos desde un solo lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            onClick={() => setViewMode('board')}
          >
            Tablero
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tareas, proyectos o clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="review">Revisión</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Tareas</p>
                <p className="text-2xl font-bold">{allTasks.length}</p>
              </div>
              <FolderPlus className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold">
                  {allTasks.filter((t: any) => t.task?.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">
                  {allTasks.filter((t: any) => t.task?.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proyectos Activos</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista por proyectos */}
      <div className="space-y-6">
        {Object.values(tasksByProject).map((projectData: any) => (
          <Card key={projectData.project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    {projectData.project.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {projectData.project.client} • {projectData.tasks.length} tareas
                  </p>
                </div>
                <Badge variant="outline">
                  {projectData.project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectData.tasks.map((item: TaskWithDetails) => (
                  <div
                    key={item.task.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(item.task.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.task.title}</h4>
                        {item.task.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={statusColors[item.task.status]} variant="secondary">
                            {item.task.status}
                          </Badge>
                          <Badge className={priorityColors[item.task.priority]} variant="secondary">
                            {item.task.priority}
                          </Badge>
                          {item.task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {item.task.progress > 0 && (
                        <div className="w-24">
                          <Progress value={item.task.progress} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">{item.task.progress}%</p>
                        </div>
                      )}
                      
                      {item.assignee && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={item.assignee.profileImage} />
                          <AvatarFallback>
                            {item.assignee.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {item.task.dueDate && (
                        <div className="text-sm text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(item.task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron tareas
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterProject !== 'all'
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Crea tu primera tarea para comenzar'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}