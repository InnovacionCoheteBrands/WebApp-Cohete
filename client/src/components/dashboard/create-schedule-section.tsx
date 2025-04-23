import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Clock, Share2, Download, CheckCircle, Edit, AlertCircle, ThumbsUp, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  aiModel: z.enum(["openai", "grok"]).default("openai"),
});

// Tipo para los comentarios de revisión
type ScheduleReview = {
  generalComments: string;
  entryComments: {
    [entryId: number]: string;
  };
};

export default function CreateScheduleSection() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewComments, setReviewComments] = useState<ScheduleReview>({
    generalComments: '',
    entryComments: {}
  });

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
      aiModel: "openai", // Por defecto usamos OpenAI
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
          aiModel: values.aiModel, // Incluimos el modelo de IA seleccionado
        }
      );
      return await res.json();
    },
    onSuccess: (data: Schedule) => {
      toast({
        title: "Calendario creado",
        description: "Tu calendario de contenido ha sido generado exitosamente",
      });
      setIsGenerating(false);
      setGeneratedSchedule(data); // Store the generated schedule
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/recent"] });
      // Don't reset the form so users can see what they generated
    },
    onError: (error) => {
      toast({
        title: "Error al crear el calendario",
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
  
  // Función para manejar la entrada en modo revisión
  const handleEnterReviewMode = () => {
    setIsReviewMode(true);
    setReviewComments({
      generalComments: '',
      entryComments: {}
    });
    toast({
      title: "Modo de revisión activado",
      description: "Puedes agregar comentarios generales o específicos para cada publicación",
    });
  };
  
  // Función para manejar la salida del modo revisión
  const handleExitReviewMode = () => {
    setIsReviewMode(false);
    toast({
      title: "Modo de revisión desactivado",
      description: "Has salido del modo de revisión",
    });
  };
  
  // Función para actualizar los comentarios generales
  const handleGeneralCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewComments((prev) => ({
      ...prev,
      generalComments: e.target.value
    }));
  };
  
  // Función para actualizar los comentarios específicos de una entrada
  const handleEntryCommentChange = (entryId: number, comment: string) => {
    setReviewComments((prev) => ({
      ...prev,
      entryComments: {
        ...prev.entryComments,
        [entryId]: comment
      }
    }));
  };
  
  // Función para enviar los comentarios de revisión
  const handleSubmitReview = async () => {
    try {
      // Aquí podrías enviar los comentarios al backend si fuera necesario
      toast({
        title: "Revisión enviada",
        description: "Tus comentarios han sido registrados correctamente",
      });
      setIsReviewMode(false);
    } catch (error) {
      toast({
        title: "Error al enviar revisión",
        description: "Ocurrió un error al enviar tus comentarios",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg overflow-hidden border-none light-gradient-bg dark:bg-gradient-to-br dark:from-[#1a1d2d] dark:to-[#141825] dark:border dark:border-[#2a3349]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl dark:bg-[#65cef5]/5"></div>
        <CardContent className="p-8 relative z-10">
          <h2 className="mb-6 text-2xl font-bold tracking-tight flex items-center dark:text-white">
            <span className="mr-3 p-1.5 rounded-lg bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]">
              <CalendarIcon className="h-6 w-6" />
            </span>
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
                        <FormLabel className="text-sm font-medium dark:text-slate-300">Seleccionar Proyecto</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={projectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]">
                              <SelectValue placeholder="Elige un proyecto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                            {projects?.map((project) => (
                              <SelectItem 
                                key={project.id} 
                                value={project.id.toString()}
                                className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]"
                              >
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
                        <FormLabel className="text-sm font-medium dark:text-slate-300">Fecha de Inicio</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type="date" 
                              className="h-11 pl-10 transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]" 
                              onChange={(e) => {
                                if (e.target.value) {
                                  field.onChange(e.target.value);
                                }
                              }}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-slate-400" />
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
                        <FormLabel className="text-sm font-medium dark:text-slate-300">Instrucciones Especiales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Añade cualquier requisito específico o notas..." 
                            rows={4} 
                            className="min-h-[120px] resize-none transition-all duration-200 hover:border-primary focus:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5] dark:focus:border-[#65cef5]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="aiModel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium flex items-center gap-2 dark:text-slate-300">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Modelo de IA
                        </FormLabel>
                        <FormDescription className="text-xs dark:text-slate-400 mb-3">
                          Selecciona el modelo de IA para generar el contenido.
                        </FormDescription>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="openai" className="data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer dark:text-white">
                                <div className="flex items-center">
                                  OpenAI GPT-4o
                                  <Badge variant="outline" className="ml-2 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700/40 dark:text-green-300">
                                    Recomendado
                                  </Badge>
                                </div>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="grok" className="data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer dark:text-white">
                                <div className="flex items-center">
                                  Grok AI
                                  <Badge variant="outline" className="ml-2 bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/40 dark:text-purple-300">
                                    Nuevo
                                  </Badge>
                                </div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 interactive-element dark:bg-[#65cef5] dark:text-[#1e293b] dark:hover:bg-[#5bb7dd] dark:font-medium"
                    disabled={isGenerating || createScheduleMutation.isPending}
                  >
                    {isGenerating || createScheduleMutation.isPending
                      ? "Generando Calendario..."
                      : "Generar Calendario"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm relative overflow-hidden light-hover dark:bg-[#1e293b]/70 dark:border-[#3e4a6d] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-2xl dark:bg-[#65cef5]/5"></div>
              <h3 className="text-lg font-semibold mb-4 flex items-center tracking-tight dark:text-white">
                <span className="mr-2 p-1.5 rounded-md bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300">
                  <Clock className="h-5 w-5" />
                </span>
                Beneficios del Calendario IA
              </h3>
              <div className="space-y-4 text-sm relative z-10">
                <p className="text-muted-foreground leading-relaxed dark:text-slate-400">
                  Selecciona un proyecto y genera un calendario de publicaciones optimizado con nuestra tecnología de IA.
                </p>
                
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 shadow-sm dark:bg-[#2a3349] dark:border-[#3e4a6d]">
                  <h4 className="font-medium text-primary mb-2 dark:text-[#65cef5]">Tu calendario incluirá:</h4>
                  <ul className="space-y-2">
                    {[
                      "Horarios óptimos de publicación",
                      "Temas y tópicos de contenido relevantes",
                      "Sugerencias de texto para cada publicación",
                      "Recomendaciones de hashtags estratégicos",
                      "Ideas para contenido visual efectivo"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1 dark:text-[#65cef5]">•</span> 
                        <span className="dark:text-white">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="italic text-muted-foreground text-xs border-l-2 border-primary/20 pl-3 dark:text-slate-400 dark:border-[#65cef5]/30">
                  La IA analizará los datos de tu proyecto para crear un calendario personalizado que se alinee perfectamente con tus objetivos de marketing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de cronograma generado */}
      {generatedSchedule && generatedSchedule.entries.length > 0 && (
        <Card className="shadow-lg overflow-hidden border-none relative light-gradient-bg dark:bg-gradient-to-br dark:from-[#1a1d2d] dark:to-[#141825] dark:border dark:border-[#2a3349]">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mt-32 blur-3xl dark:bg-blue-500/5"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mb-32 blur-3xl dark:bg-[#65cef5]/5"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
                  <span className="bg-blue-500/10 text-blue-600 p-1.5 rounded-md dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                  {generatedSchedule.name}
                </h2>
                <p className="text-muted-foreground text-sm dark:text-slate-400">
                  Calendario generado el {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-lg transition-all duration-200 shadow-sm hover:shadow interactive-element dark:bg-[#65cef5] dark:text-[#1e293b] dark:hover:bg-[#5bb7dd] dark:font-medium"
                  onClick={() => window.open(`/schedules/${generatedSchedule.id}`, '_blank')}
                >
                  Ver Completo
                </Button>
                {!isReviewMode && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg gap-1 transition-all duration-200 shadow-sm hover:shadow border-amber-200 hover:border-amber-300 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 interactive-element dark:border-amber-600/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                    onClick={handleEnterReviewMode}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Revisar y Comentar
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg gap-1 transition-all duration-200 shadow-sm hover:shadow border-blue-200 hover:border-blue-300 interactive-element dark:border-[#3e4a6d] dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=excel`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-lg gap-1 transition-all duration-200 shadow-sm hover:shadow border-blue-200 hover:border-blue-300 interactive-element dark:border-[#3e4a6d] dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20" 
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=pdf`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  PDF
                </Button>
                <Badge className="px-3 py-1.5 bg-blue-500/10 text-blue-600 border-none hover:bg-blue-500/20 transition-colors duration-200 dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                  {generatedSchedule.entries.length} publicaciones
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[450px] rounded-xl border shadow-sm overflow-hidden dark:border-[#3e4a6d] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <Table>
                <TableHeader className="sticky top-0 bg-card shadow-sm dark:bg-[#1e293b] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  <TableRow className="border-b-0 dark:border-b dark:border-b-[#2a3349]">
                    <TableHead className="w-[250px] font-medium text-foreground dark:text-[#65cef5]">Título</TableHead>
                    <TableHead className="font-medium text-foreground dark:text-[#65cef5]">Plataforma</TableHead>
                    <TableHead className="font-medium text-foreground dark:text-[#65cef5]">Fecha</TableHead>
                    <TableHead className="font-medium text-foreground dark:text-[#65cef5]">Hora</TableHead>
                    <TableHead className="font-medium text-foreground dark:text-[#65cef5]">Texto en Diseño</TableHead>
                    <TableHead className="text-right font-medium text-foreground dark:text-[#65cef5]">Imagen</TableHead>
                    {isReviewMode && (
                      <TableHead className="text-center font-medium text-amber-600 dark:text-amber-300">
                        Revisión
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedSchedule.entries.map((entry, idx) => (
                    <TableRow 
                      key={entry.id}
                      className={`transition-colors duration-200 hover:bg-accent/20 dark:border-b dark:border-b-[#2a3349] dark:last:border-b-0 dark:hover:bg-[#2a3349]/50 ${
                        isReviewMode && reviewComments.entryComments[entry.id] ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                      }`}
                    >
                      <TableCell className="font-medium dark:text-white">{entry.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className="shadow-sm transition-all duration-200 hover:shadow dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                        >
                          <Share2 className="w-3.5 h-3.5 mr-1.5" />
                          {entry.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-slate-300">{formatDate(entry.postDate)}</TableCell>
                      <TableCell className="dark:text-slate-300">{entry.postTime}</TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        <div className="line-clamp-2 text-sm hover:text-clip dark:text-slate-300">
                          {entry.copyIn}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.referenceImageUrl ? (
                          <img 
                            src={entry.referenceImageUrl} 
                            alt={entry.title}
                            className="inline-block w-12 h-12 object-cover rounded-md border shadow-sm hover:shadow-md transition-all duration-200 dark:border-[#3e4a6d] dark:shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground italic dark:text-slate-500">Pendiente</span>
                        )}
                      </TableCell>
                      {isReviewMode && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-full p-2 h-auto w-auto ${
                              reviewComments.entryComments[entry.id]
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-500 dark:hover:text-amber-300 dark:hover:bg-amber-900/20'
                            }`}
                            onClick={() => {
                              document.getElementById(`entry-${entry.id}`)?.click();
                              setTimeout(() => {
                                const element = document.getElementById(`entry-${entry.id}-textarea`);
                                if (element) element.focus();
                              }, 300);
                            }}
                          >
                            {reviewComments.entryComments[entry.id] ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {/* Sección de revisión y comentarios */}
            {isReviewMode && (
              <div className="mt-8 space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-1.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Modo de Revisión</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-200/80">
                        Puedes agregar comentarios generales o específicos para cada publicación. Estos comentarios serán utilizados para mejorar el cronograma.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Comentarios generales */}
                    <div>
                      <label htmlFor="general-comments" className="block text-sm font-medium text-amber-800 dark:text-amber-300 mb-1.5">
                        Comentarios Generales
                      </label>
                      <Textarea 
                        id="general-comments"
                        placeholder="Añade cualquier comentario o sugerencia general sobre el cronograma..."
                        value={reviewComments.generalComments}
                        onChange={handleGeneralCommentsChange}
                        rows={4}
                        className="w-full resize-none border-amber-300 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-800/50 dark:bg-[#1e293b] dark:text-white dark:focus:border-amber-600 dark:focus:ring-amber-600"
                      />
                    </div>
                    
                    {/* Comentarios específicos para cada entrada */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Edit className="h-4 w-4" />
                        Comentarios Específicos por Publicación
                      </h4>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {generatedSchedule.entries.map((entry) => (
                          <AccordionItem 
                            key={entry.id} 
                            value={`entry-${entry.id}`}
                            className="border-amber-200 dark:border-amber-800/40"
                          >
                            <AccordionTrigger 
                              id={`entry-${entry.id}`} 
                              className="text-sm text-amber-800 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline"
                                  className="border-amber-300 text-amber-700 dark:border-amber-700/50 dark:text-amber-300"
                                >
                                  {entry.platform}
                                </Badge>
                                <span>{entry.title}</span>
                                <span className="text-xs text-amber-600/80 dark:text-amber-400/60">
                                  ({formatDate(entry.postDate)} {entry.postTime})
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                              <Textarea 
                                id={`entry-${entry.id}-textarea`}
                                placeholder={`Comentarios sobre "${entry.title}"...`}
                                value={reviewComments.entryComments[entry.id] || ''}
                                onChange={(e) => handleEntryCommentChange(entry.id, e.target.value)}
                                rows={3}
                                className="w-full resize-none border-amber-200 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-800/50 dark:bg-[#1e293b] dark:text-white dark:focus:border-amber-600 dark:focus:ring-amber-600"
                              />
                              <div className="mt-2 text-xs text-amber-700 dark:text-amber-400/80">
                                <p>Puedes comentar sobre el título, texto, horario o cualquier otro aspecto de esta publicación.</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-5 flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleExitReviewMode}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800/40 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSubmitReview}
                      className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Enviar Comentarios
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
