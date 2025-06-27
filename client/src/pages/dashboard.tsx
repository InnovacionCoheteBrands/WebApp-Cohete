import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { 
  Calendar, 
  FileText, 
  Plus, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) return [];
      return res.json();
    },
    retry: 1
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/schedules/recent');
      if (!res.ok) return [];
      return res.json();
    },
    retry: 1
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) return [];
      return res.json();
    },
    retry: 1
  });

  // Calcular estadísticas
  const activeProjects = projects.filter(p => p.status === 'active' || !p.status).length;
  const recentSchedulesCount = schedules.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  return (
    <div className="p-6 space-y-6">
      {/* Panel de Control Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">
              PANEL DE CONTROL
            </h2>
            <h1 className="text-3xl font-bold mb-2">
              ¡Hola, {user?.fullName?.split(' ')[0] || user?.username || 'Adrian'}!
            </h1>
            <p className="text-slate-300">
              Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
              onClick={() => setLocation("/projects")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Recorrido Guiado
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/projects/new")}
            >
              Crear Proyecto
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proyectos Activos */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-700">
                Proyectos Activos
              </CardTitle>
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardDescription className="text-sm text-slate-500">
              Campañas de marketing actualmente activas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-slate-900">{activeProjects}</span>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                10%
              </Badge>
            </div>
            <Progress value={10} className="mb-3" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-blue-600 hover:text-blue-700"
              onClick={() => setLocation("/projects")}
            >
              Ver Todos los Proyectos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Calendarios Recientes */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-700">
                Calendarios Recientes
              </CardTitle>
              <div className="bg-orange-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <CardDescription className="text-sm text-slate-500">
              Calendarios de contenido generados recientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-slate-900">{recentSchedulesCount}</span>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                20%
              </Badge>
            </div>
            <Progress value={20} className="mb-3" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-orange-600 hover:text-orange-700"
              onClick={() => setLocation("/calendar-creator")}
            >
              Ver Calendarios
              <Calendar className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Tareas Pendientes */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-700">
                Tareas Pendientes
              </CardTitle>
              <div className="bg-red-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardDescription className="text-sm text-slate-500">
              Tareas que requieren tu atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-slate-900">{pendingTasks}</span>
              <Badge variant="secondary" className="bg-red-50 text-red-700">
                30%
              </Badge>
            </div>
            <Progress value={30} className="mb-3" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-red-600 hover:text-red-700"
              onClick={() => setLocation("/task-manager")}
            >
              Ver Tareas
              <Target className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendario Rápido */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>Calendario Rápido</CardTitle>
            </div>
            <CardDescription>
              Accede rápidamente a tus horarios y planificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona tus fechas importantes y plazos de entrega
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/calendar")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Abrir Calendario
            </Button>
          </CardContent>
        </Card>

        {/* Calendario Avanzado */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-600" />
              <CardTitle>Calendario Avanzado</CardTitle>
            </div>
            <CardDescription>
              Herramientas avanzadas de planificación y distribución de contenido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Crea cronogramas inteligentes con IA para múltiples plataformas
            </p>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => setLocation("/calendar-creator")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Cronograma
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimos cronogramas y proyectos actualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.slice(0, 3).map((schedule, index) => (
                <div 
                  key={schedule.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{schedule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {schedule.entriesCount || 0} entradas de contenido
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (schedule.projectId && schedule.id) {
                        setLocation(`/projects/${schedule.projectId}/schedule/${schedule.id}`);
                      }
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}