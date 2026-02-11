
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight, Clock, FileText } from "lucide-react";

interface Schedule {
  id: number;
  name: string;
  projectId: number;
  createdAt: string;
  entriesCount?: number;
}

export default function RecentSchedules() {
  const { data: schedules = [] } = useQuery<any[]>({
    queryKey: ["/api/schedules/recent"],
    staleTime: 30000,
  });
  const [, setLocation] = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const recentSchedules = schedules.slice(0, 5);

  return (
    <Card className="glass-panel-dark tech-border h-full">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Cronogramas Recientes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {recentSchedules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="relative mx-auto mb-4 h-16 w-16 opacity-20">
              <Calendar className="h-16 w-16" />
            </div>
            <p className="text-lg font-medium text-gray-400 mb-2">No hay cronogramas creados</p>
            <p className="text-sm text-gray-500 mb-6">Genera tu primer calendario de contenido</p>
            <Button
              className="btn-amber-glow font-bold"
              onClick={() => setLocation("/calendar-creator")}
            >
              Crear Primer Cronograma
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => setLocation(`/projects/${schedule.projectId}/schedule/${schedule.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">{schedule.name}</h4>
                    {schedule.entriesCount && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold">
                        {schedule.entriesCount} entradas
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(schedule.createdAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Proyecto #{schedule.projectId}
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
              onClick={() => setLocation("/calendar-creator")}
            >
              Crear Nuevo Cronograma
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
