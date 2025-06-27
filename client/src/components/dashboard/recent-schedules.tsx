import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, ArrowRight, Clock, FileText } from "lucide-react";

interface Schedule {
  id: number;
  name: string;
  projectId: number;
  createdAt: string;
  entriesCount?: number;
}

interface RecentSchedulesProps {
  schedules?: Schedule[];
}

export default function RecentSchedules({ schedules = [] }: RecentSchedulesProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronogramas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentSchedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay cronogramas creados</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation("/calendar-creator")}
            >
              Crear Primer Cronograma
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSchedules.map((schedule) => (
              <div 
                key={schedule.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{schedule.name}</h4>
                    {schedule.entriesCount && (
                      <Badge variant="secondary" className="text-xs">
                        {schedule.entriesCount} entradas
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(schedule.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Proyecto #{schedule.projectId}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(`/projects/${schedule.projectId}/schedule/${schedule.id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full"
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