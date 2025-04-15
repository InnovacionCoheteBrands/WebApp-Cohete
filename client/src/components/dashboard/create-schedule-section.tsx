import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Share2, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

// Tipo para las entradas del horario
type ScheduleEntry = {
  id: number;
  title: string;
  platform: string;
  postDate: string;
  postTime: string;
  content: string;
  copyIn: string;
  copyOut: string;
  designInstructions: string;
  hashtags: string;
  referenceImageUrl?: string;
};

// Tipo para el horario completo
type Schedule = {
  id: number;
  name: string;
  projectId: number;
  entries: ScheduleEntry[];
};

const createScheduleSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  startDate: z.string().min(1, "Start date is required"),
  specifications: z.string().optional(),
});

export default function CreateScheduleSection() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    staleTime: 60000,
  });

  // Setup form
  const form = useForm<z.infer<typeof createScheduleSchema>>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      projectId: "",
      startDate: "",
      specifications: "",
    },
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createScheduleSchema>) => {
      setIsGenerating(true);
      setGeneratedSchedule(null); // Reset any previously generated schedule
      const res = await apiRequest(
        "POST",
        `/api/projects/${values.projectId}/schedule`,
        {
          startDate: values.startDate,
          specifications: values.specifications,
        }
      );
      return await res.json();
    },
    onSuccess: (data: Schedule) => {
      toast({
        title: "Schedule created",
        description: "Your content schedule has been successfully generated",
      });
      setIsGenerating(false);
      setGeneratedSchedule(data); // Store the generated schedule
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/recent"] });
      // Don't reset the form so users can see what they generated
    },
    onError: (error) => {
      toast({
        title: "Failed to create schedule",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  // Form submission
  const onSubmit = (values: z.infer<typeof createScheduleSchema>) => {
    createScheduleMutation.mutate(values);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <CardContent className="p-8 relative z-10">
          <h2 className="mb-6 text-2xl font-bold tracking-tight flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
            Crear Calendario Rápido
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">Seleccionar Proyecto</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={projectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 transition-all duration-200 hover:border-primary">
                              <SelectValue placeholder="Elige un proyecto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects?.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name} - {project.client}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">Fecha de Inicio</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type="date" 
                              className="h-11 pl-10 transition-all duration-200 hover:border-primary" 
                              {...field} 
                            />
                          </FormControl>
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specifications"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium">Instrucciones Especiales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Añade cualquier requisito específico o notas..." 
                            rows={4} 
                            className="min-h-[120px] resize-none transition-all duration-200 hover:border-primary focus:border-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 interactive-element"
                    disabled={isGenerating || createScheduleMutation.isPending}
                  >
                    {isGenerating || createScheduleMutation.isPending
                      ? "Generando Calendario..."
                      : "Generar Calendario"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="rounded-xl border bg-card/40 backdrop-blur-sm p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <h3 className="text-lg font-semibold mb-4 flex items-center tracking-tight">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Beneficios del Calendario IA
              </h3>
              <div className="space-y-4 text-sm relative z-10">
                <p className="text-muted-foreground leading-relaxed">
                  Selecciona un proyecto y genera un calendario de publicaciones optimizado con nuestra tecnología de IA.
                </p>
                
                <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                  <h4 className="font-medium text-primary mb-2">Tu calendario incluirá:</h4>
                  <ul className="space-y-2">
                    {[
                      "Horarios óptimos de publicación",
                      "Temas y tópicos de contenido relevantes",
                      "Sugerencias de texto para cada publicación",
                      "Recomendaciones de hashtags estratégicos",
                      "Ideas para contenido visual efectivo"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span> 
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="italic text-muted-foreground text-xs border-l-2 border-primary/20 pl-3">
                  La IA analizará los datos de tu proyecto para crear un calendario personalizado que se alinee perfectamente con tus objetivos de marketing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de cronograma generado */}
      {generatedSchedule && generatedSchedule.entries.length > 0 && (
        <Card className="shadow-lg overflow-hidden border-none relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mb-32 blur-3xl"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span className="bg-blue-500/10 text-blue-600 p-1.5 rounded-md">
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                  {generatedSchedule.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Calendario generado el {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-lg transition-all duration-200 shadow-sm hover:shadow interactive-element"
                  onClick={() => window.open(`/schedules/${generatedSchedule.id}`, '_blank')}
                >
                  Ver Completo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg gap-1 transition-all duration-200 shadow-sm hover:shadow border-blue-200 hover:border-blue-300 interactive-element"
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=excel`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-lg gap-1 transition-all duration-200 shadow-sm hover:shadow border-blue-200 hover:border-blue-300 interactive-element" 
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=pdf`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  PDF
                </Button>
                <Badge className="px-3 py-1.5 bg-blue-500/10 text-blue-600 border-none hover:bg-blue-500/20 transition-colors duration-200">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                  {generatedSchedule.entries.length} publicaciones
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[450px] rounded-xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 bg-card shadow-sm">
                  <TableRow className="border-b-0">
                    <TableHead className="w-[250px] font-medium text-foreground">Título</TableHead>
                    <TableHead className="font-medium text-foreground">Plataforma</TableHead>
                    <TableHead className="font-medium text-foreground">Fecha</TableHead>
                    <TableHead className="font-medium text-foreground">Hora</TableHead>
                    <TableHead className="font-medium text-foreground">Texto en Diseño</TableHead>
                    <TableHead className="text-right font-medium text-foreground">Imagen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedSchedule.entries.map((entry, idx) => (
                    <TableRow 
                      key={entry.id}
                      className="transition-colors duration-200 hover:bg-accent/20"
                    >
                      <TableCell className="font-medium">{entry.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className="shadow-sm transition-all duration-200 hover:shadow"
                        >
                          <Share2 className="w-3.5 h-3.5 mr-1.5" />
                          {entry.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(entry.postDate)}</TableCell>
                      <TableCell>{entry.postTime}</TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        <div className="line-clamp-2 text-sm hover:text-clip">
                          {entry.copyIn}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.referenceImageUrl ? (
                          <img 
                            src={entry.referenceImageUrl} 
                            alt={entry.title}
                            className="inline-block w-12 h-12 object-cover rounded-md border shadow-sm hover:shadow-md transition-all duration-200"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Pendiente</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
