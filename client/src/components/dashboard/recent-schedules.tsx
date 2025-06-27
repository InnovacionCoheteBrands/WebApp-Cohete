
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight, Clock, FileText } from "lucide-react";
import { CustomCard } from "@/components/ui/custom-card";

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
    <CustomCard
      title="CRONOGRAMAS RECIENTES"
      icon={<Calendar className="h-5 w-5 text-cyan-400" />}
      defaultExpanded={true}
    >
      {recentSchedules.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-500" />
          <p className="mb-4">No hay cronogramas creados</p>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 hover:border-transparent hover:text-white transition-all duration-300"
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
              className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg hover:bg-slate-800/30 hover:border-cyan-400/30 transition-all duration-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{schedule.name}</h4>
                  {schedule.entriesCount && (
                    <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                      {schedule.entriesCount} entradas
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
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
                className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-200"
                onClick={() => setLocation(`/projects/${schedule.projectId}/schedule/${schedule.id}`)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-slate-600 text-slate-300 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 hover:border-transparent hover:text-white transition-all duration-300"
            onClick={() => setLocation("/calendar-creator")}
          >
            Crear Nuevo Cronograma
          </Button>
        </div>
      )}
    </CustomCard>
  );
}
