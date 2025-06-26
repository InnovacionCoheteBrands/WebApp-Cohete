import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  FileText, 
  Play, 
  Plus, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  // Consulta para obtener calendarios/cronogramas
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/schedules"],
    queryFn: async () => {
      const res = await fetch('/api/schedules');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Consulta para obtener proyectos
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Mostrar tutorial automáticamente para nuevos usuarios
  useEffect(() => {
    if (schedules.length === 0 && projects.length === 0) {
      setShowTutorial(true);
    }
  }, [schedules.length, projects.length]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const recentSchedules = schedules.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header de Bienvenida */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {user?.fullName || user?.username || "Usuario"}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a Cohete Workflow - Tu asistente de marketing con IA
        </p>
      </div>

      {/* Tutorial Card (se muestra para nuevos usuarios) */}
      {showTutorial && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              ¡Empecemos tu primer proyecto!
            </CardTitle>
            <CardDescription>
              Te guiaremos paso a paso para crear tu primer cronograma de contenido con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={() => setLocation("/calendar-creator")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Tutorial
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowTutorial(false)}
              >
                Omitir por ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acción Rápida: Crear Calendario */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Crear Cronograma con IA
          </CardTitle>
          <CardDescription>
            Genera contenido inteligente para redes sociales en minutos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Planificación automática</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Contenido personalizado</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Horarios optimizados</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => setLocation("/calendar-creator")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cronograma
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/projects")}
              >
                Ver Proyectos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Calendarios Creados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronogramas Recientes
          </CardTitle>
          <CardDescription>
            Tus últimos calendarios de contenido generados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSchedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Aún no has creado ningún cronograma</p>
              <Button 
                onClick={() => setLocation("/calendar-creator")}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer cronograma
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSchedules.map((schedule, index) => (
                <div 
                  key={schedule.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{schedule.name || `Cronograma ${index + 1}`}</h4>
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {schedule.createdAt ? formatDate(schedule.createdAt) : 'Fecha no disponible'}
                      </span>
                      <span>
                        {schedule.entriesCount || 0} entradas de contenido
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (schedule.projectId && schedule.id) {
                        setLocation(`/projects/${schedule.projectId}/schedule/${schedule.id}`);
                      } else {
                        setLocation('/calendar-creator');
                      }
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/calendar-creator")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Cronograma
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setLocation("/projects")}
        >
          <FileText className="h-6 w-6" />
          <span className="text-sm">Proyectos</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setLocation("/task-manager")}
        >
          <CheckCircle className="h-6 w-6" />
          <span className="text-sm">Tareas</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setLocation("/analytics")}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm">Analytics</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setLocation("/settings")}
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm">Configuración</span>
        </Button>
      </div>
    </div>
  );
}