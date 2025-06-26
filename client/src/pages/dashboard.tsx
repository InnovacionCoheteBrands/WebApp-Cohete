
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FolderOpen, 
  Plus, 
  TrendingUp, 
  Users,
  AlertCircle,
  Activity
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectId: number;
  assignedTo: number | null;
  dueDate: string | null;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 30000,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 30000,
  });

  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Cargando dashboard...</h1>
        </div>
      </div>
    );
  }

  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
  const pendingTasks = tasks?.filter(task => task.status === 'pending' || task.status === 'in_progress').length || 0;
  const overdueTask = tasks?.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length || 0;

  const recentProjects = projects?.slice(0, 5) || [];
  const recentTasks = tasks?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general de tus proyectos y tareas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setLocation('/projects')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Proyectos activos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              De {totalTasks} tareas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTask}</div>
            <p className="text-xs text-muted-foreground">
              Necesitan atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Proyectos Recientes
            </CardTitle>
            <CardDescription>
              Últimos proyectos creados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setLocation(`/projects/${project.id}`)}>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay proyectos aún</p>
              )}
            </div>
            {recentProjects.length > 0 && (
              <Button variant="outline" className="w-full mt-4" onClick={() => setLocation('/projects')}>
                Ver todos los proyectos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tareas Recientes
            </CardTitle>
            <CardDescription>
              Últimas tareas creadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(task.status)} variant="secondary">
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="text-sm text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay tareas aún</p>
              )}
            </div>
            {recentTasks.length > 0 && (
              <Button variant="outline" className="w-full mt-4" onClick={() => setLocation('/project-manager')}>
                Ver todas las tareas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => setLocation('/projects')}>
              <FolderOpen className="w-6 h-6" />
              <span className="text-sm">Proyectos</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => setLocation('/project-manager')}>
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm">Tareas</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => setLocation('/calendar-creator')}>
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Calendario</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => setLocation('/analytics')}>
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Analíticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
