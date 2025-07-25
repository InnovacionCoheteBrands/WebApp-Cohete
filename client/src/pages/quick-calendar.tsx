import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const quickCalendarSchema = z.object({
  projectId: z.string().min(1, "Selecciona un proyecto"),
  duration: z.string().min(1, "Selecciona una duración"),
  startDate: z.date({
    required_error: "Selecciona una fecha de inicio",
  }),
  specifications: z.string().optional(),
});

type QuickCalendarFormData = z.infer<typeof quickCalendarSchema>;



const durationOptions = [
  { value: "7", label: "1 semana (7 días)" },
  { value: "14", label: "2 semanas (14 días)" },
  { value: "30", label: "1 mes (30 días)" },
];

export default function QuickCalendar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<QuickCalendarFormData>({
    resolver: zodResolver(quickCalendarSchema),
    defaultValues: {
      duration: "14",
      startDate: new Date(),
      specifications: "",
    },
  });

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    staleTime: 30000,
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (data: QuickCalendarFormData) => {
      if (!projects || projects.length === 0) {
        throw new Error("No hay proyectos disponibles");
      }
      
      const selectedProject = projects.find((p: any) => p.id.toString() === data.projectId);
      if (!selectedProject) {
        throw new Error("Proyecto no encontrado");
      }

      // Usar la ruta del proyecto para generar el calendario (la misma que usa el calendario avanzado)
      // Esto asegura que se pasen todos los datos del proyecto incluyendo el análisis completo
      const requestData = {
        projectId: parseInt(data.projectId),
        startDate: format(data.startDate, "yyyy-MM-dd"),
        specifications: data.specifications || `Cronograma rápido y simple`,
        periodType: parseInt(data.duration) > 15 ? "mensual" : "quincenal",
        additionalInstructions: `Este es un calendario RÁPIDO y simple. IMPORTANTE: NO uses cantidad fija de publicaciones. Debes ADAPTARTE completamente a las especificaciones del proyecto y sus redes sociales configuradas. Si el proyecto define frecuencias mensuales (ej: 20 publicaciones/mes), calcula proporcionalmente para el período de ${data.duration} días. Mantén el contenido directo y efectivo pero respeta siempre las características específicas de cada proyecto.`,
      };

      const response = await fetch(`/api/projects/${data.projectId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error al generar el cronograma");
      }

      return response.json();
    },
    onSuccess: (schedule) => {
      toast({
        title: "¡Cronograma generado exitosamente!",
        description: `Se creó "${schedule.name}" con ${schedule.entries?.length || 0} entradas`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setLocation(`/schedules/${schedule.id}`);
    },
    onError: (error: any) => {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error al generar cronograma",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: QuickCalendarFormData) => {
    setIsGenerating(true);
    try {
      await generateScheduleMutation.mutateAsync(data);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Calendario Rápido
          </h1>
          <p className="text-muted-foreground">
            Genera un cronograma básico en minutos con opciones simples
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuración Rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Proyecto */}
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proyecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proyecto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects && projects.length > 0 ? (
                              projects.map((project: any) => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                  {project.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No hay proyectos disponibles
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fecha de inicio */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duración */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona duración" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  {/* Especificaciones adicionales */}
                  <FormField
                    control={form.control}
                    name="specifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrucciones Adicionales (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ejemplo: Enfoque en promociones de verano, tono casual, incluir testimonios..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Generando Cronograma...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generar Calendario Rápido
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Información lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué incluye?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Generación en 1-2 minutos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>Contenido optimizado por IA</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span>Cronograma automático</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Calendario Rápido:</h4>
                <p className="text-muted-foreground">Opciones básicas, generación inmediata</p>
              </div>
              <div>
                <h4 className="font-medium">Calendario Avanzado:</h4>
                <p className="text-muted-foreground">Control total, personalización detallada</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/calendar-creator")}
                className="w-full"
              >
                Ir a Calendario Avanzado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}