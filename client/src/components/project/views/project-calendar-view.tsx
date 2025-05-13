import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, taskStatusEnum, taskPriorityEnum } from "@shared/schema";
import { Loader2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCalendarViewProps {
  projectId: number;
  viewId: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  tasks: Task[];
}

export default function ProjectCalendarView({ projectId, viewId }: ProjectCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  // Filtrar tareas por estado si es necesario
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    if (!statusFilter) return tasks;
    
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  // Generar datos del calendario
  const calendarData = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // Último día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo, 1 = lunes, ...)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const startingDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Calcular días previos del mes anterior para completar la primera semana
    const previousMonthDays: CalendarDay[] = [];
    const daysFromPreviousMonth = startingDayOfWeek;
    
    if (daysFromPreviousMonth > 0) {
      for (let i = daysFromPreviousMonth - 1; i >= 0; i--) {
        const day = new Date(year, month, -i);
        previousMonthDays.push({
          date: day,
          isCurrentMonth: false,
          tasks: getTasksForDate(filteredTasks, day)
        });
      }
    }
    
    // Días del mes actual
    const currentMonthDays: CalendarDay[] = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      currentMonthDays.push({
        date: day,
        isCurrentMonth: true,
        tasks: getTasksForDate(filteredTasks, day)
      });
    }
    
    // Calcular días del mes siguiente para completar la última semana
    const nextMonthDays: CalendarDay[] = [];
    const totalDaysDisplayed = previousMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysDisplayed; // 6 semanas x 7 días
    
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      nextMonthDays.push({
        date: day,
        isCurrentMonth: false,
        tasks: getTasksForDate(filteredTasks, day)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate, filteredTasks]);
  
  // Función para obtener tareas para una fecha específica
  function getTasksForDate(tasks: Task[], date: Date): Task[] {
    if (!tasks) return [];
    
    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      // Si la tarea tiene fecha de inicio o fecha límite
      if (task.startDate || task.dueDate) {
        const taskStartDate = task.startDate ? new Date(task.startDate) : null;
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
        
        if (taskStartDate) {
          taskStartDate.setHours(0, 0, 0, 0);
        }
        
        if (taskDueDate) {
          taskDueDate.setHours(0, 0, 0, 0);
        }
        
        // La tarea está en el día si:
        // - La fecha es igual a la fecha de inicio
        // - La fecha es igual a la fecha límite
        // - La fecha está entre la fecha de inicio y la fecha límite
        if (taskStartDate && taskDueDate) {
          return dateWithoutTime >= taskStartDate && dateWithoutTime <= taskDueDate;
        } else if (taskStartDate) {
          return dateWithoutTime.getTime() === taskStartDate.getTime();
        } else if (taskDueDate) {
          return dateWithoutTime.getTime() === taskDueDate.getTime();
        }
      }
      
      return false;
    });
  }
  
  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Navegar al mes actual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nombre del mes y año
  const monthYear = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // Nombres de los días de la semana
  const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

  // Obtener color según estado de tarea
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "review": return "bg-yellow-500";
      case "pending": return "bg-slate-500";
      case "blocked": return "bg-red-500";
      case "deferred": return "bg-gray-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="capitalize text-lg font-medium w-36 text-center">{monthYear}</h3>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
            Hoy
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter || ""} onValueChange={(val) => setStatusFilter(val || null)}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              {Object.values(taskStatusEnum.enumValues).map((status) => (
                <SelectItem key={status} value={status}>
                  {translateStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Cabecera con días de la semana */}
        <div className="grid grid-cols-7 bg-muted/40 border-b">
          {weekdays.map((day) => (
            <div key={day} className="p-2 text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7 min-h-[600px]">
          {calendarData.map((day, index) => {
            // Verificar si es hoy
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`border-r border-b min-h-[100px] ${
                  day.isCurrentMonth ? "bg-background" : "bg-muted/30"
                } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
              >
                {/* Número de día */}
                <div className="p-1 sticky top-0 bg-inherit z-10 border-b flex justify-between items-center">
                  <span className={`${isToday ? "font-bold text-primary" : ""}`}>
                    {day.date.getDate()}
                  </span>
                  {day.isCurrentMonth && (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Tareas del día */}
                <div className="p-1 space-y-1 max-h-[150px] overflow-y-auto">
                  {day.tasks.slice(0, 5).map((task) => (
                    <TooltipProvider key={task.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`text-xs truncate px-1 py-0.5 rounded text-white cursor-pointer ${getStatusColor(task.status)}`}
                          >
                            {task.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 max-w-[300px]">
                            <p className="font-medium">{task.title}</p>
                            <div className="text-xs flex items-center space-x-2">
                              <Badge variant="outline">{translateStatus(task.status)}</Badge>
                              {task.startDate && task.dueDate && (
                                <span>
                                  {new Date(task.startDate).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                  })} - 
                                  {new Date(task.dueDate).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  
                  {day.tasks.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.tasks.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}