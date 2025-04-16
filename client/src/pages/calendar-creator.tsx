import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  AlertCircle, 
  CalendarIcon, 
  Clock, 
  Info, 
  Plus, 
  Trash, 
  ArrowRight, 
  Sparkles,
  Settings2,
  Calendar as CalendarIcon2,
  BarChart,
  Save,
  Download,
  Check,
  X
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

// Define interfaces
interface Project {
  id: number;
  name: string;
  client: string;
}

// Define supported platforms and content types
const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', 
    contentTypes: ['photo', 'carousel', 'reel', 'story'] },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', 
    contentTypes: ['photo', 'carousel', 'video', 'text', 'event'] },
  { id: 'twitter', name: 'Twitter', color: 'bg-sky-500', 
    contentTypes: ['text', 'photo', 'video'] },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', 
    contentTypes: ['text', 'photo', 'article', 'video'] },
  { id: 'tiktok', name: 'TikTok', color: 'bg-neutral-800', 
    contentTypes: ['video'] },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', 
    contentTypes: ['video', 'short'] },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-red-500', 
    contentTypes: ['pin', 'idea'] },
];

// Mapa de emojis para tipos de contenido
const CONTENT_TYPE_EMOJIS: Record<string, string> = {
  photo: '📷',
  carousel: '📱',
  reel: '🎬',
  story: '⭐',
  video: '🎥',
  text: '📝',
  event: '📅',
  article: '📰',
  pin: '📌',
  idea: '💡',
  short: '⏱️',
};

const contentTypeSchema = z.object({
  type: z.string(),
  quantity: z.number().min(1).max(30)
});

const platformConfigSchema = z.object({
  platformId: z.string(),
  contentTypes: z.array(contentTypeSchema),
  customInstructions: z.string().optional()
});

const formSchema = z.object({
  projectId: z.string({
    required_error: "Por favor selecciona un proyecto",
  }),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  startDate: z.string({
    required_error: "Por favor selecciona una fecha de inicio",
  }),
  endDate: z.string({
    required_error: "Por favor selecciona una fecha de fin",
  }).optional(),
  specifications: z.string().optional(),
  advanced: z.object({
    includeCopyIn: z.boolean().default(true),
    includeCopyOut: z.boolean().default(true),
    includeHashtags: z.boolean().default(true),
    includeDesignInstructions: z.boolean().default(true),
  }),
  postsDistribution: z.enum(["uniform", "frontloaded", "backloaded", "weekends", "weekdays"]).default("uniform"),
  platforms: z.array(platformConfigSchema).min(1, "Debes seleccionar al menos una plataforma")
});

type FormValues = z.infer<typeof formSchema>;

export default function CalendarCreator() {
  const { toast } = useToast();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");
  
  // Estados para las preferencias avanzadas de distribución
  const [planificationType, setPlanificationType] = useState("auto");
  const [timezone, setTimezone] = useState("UTC-6");
  const [dayPriorities, setDayPriorities] = useState<Record<string, string>>({
    "L": "media",
    "M": "baja",
    "X": "media",
    "J": "baja",
    "V": "media",
    "S": "alta",
    "D": "alta"
  });
  const [publicationTimes, setPublicationTimes] = useState([
    { time: "12:00", days: "todos" },
    { time: "18:30", days: "L,X,V" },
    { time: "11:00", days: "S,D" }
  ]);
  const [excludedDates, setExcludedDates] = useState(["15/05/2025", "24/05/2025", "01/06/2025"]);
  const [distributionType, setDistributionType] = useState("equilibrada");
  const [distributionIntensity, setDistributionIntensity] = useState(50);
  
  // Estados para las opciones específicas de planificación
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "X", "V"]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [newPublicationTime, setNewPublicationTime] = useState("12:00");
  const [newPublicationDays, setNewPublicationDays] = useState("todos");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExclusionDatePicker, setShowExclusionDatePicker] = useState(false);
  const [exclusionDates, setExclusionDates] = useState<Date[]>([]);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Error al cargar proyectos');
      return res.json();
    },
  });

  // Create form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specifications: "",
      advanced: {
        includeCopyIn: true,
        includeCopyOut: true,
        includeHashtags: true,
        includeDesignInstructions: true,
      },
      postsDistribution: "uniform",
      platforms: []
    }
  });

  // Initialize selected platforms when form values change
  useEffect(() => {
    const platforms = form.watch('platforms');
    setSelectedPlatforms(platforms.map(p => p.platformId));
  }, [form.watch('platforms')]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una plataforma",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(values.startDate);
    
    // Calcular automáticamente la fecha de fin para periodo quincenal
    // Independientemente de lo que haya seleccionado el usuario
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 14); // 15 días en total (día inicial + 14 días)
    
    // Actualizar el valor en el formulario para que sea visible para el usuario
    if (values.endDate) {
      form.setValue('endDate', endDate.toISOString().split('T')[0], { shouldValidate: true });
    }
    
    toast({
      title: "Periodo quincenal",
      description: `Se generará un calendario desde ${startDate.toLocaleDateString()} hasta ${endDate.toLocaleDateString()}`,
    });

    try {
      setIsGenerating(true);
      
      // Make API request to create schedule
      const response = await apiRequest('POST', `/api/projects/${values.projectId}/schedule`, {
        ...values,
        endDate: values.endDate || endDate.toISOString().split('T')[0],
        isAdvanced: true
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el calendario');
      }
      
      const data = await response.json();
      
      // Invalidate schedules cache to refresh lists
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${values.projectId}/schedules`] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/recent'] });
      
      // Show success message
      toast({
        title: "¡Calendario creado!",
        description: `Se ha creado el calendario "${data.name}" con éxito.`,
      });
      
      // Redirect to schedule detail page
      window.location.href = `/schedules/${data.id}`;
      
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el calendario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle platform selection
  const handleTogglePlatform = (platformId: string) => {
    const platforms = form.getValues('platforms');
    
    if (selectedPlatforms.includes(platformId)) {
      // Remove platform
      const updatedPlatforms = platforms.filter(p => p.platformId !== platformId);
      form.setValue('platforms', updatedPlatforms, { shouldValidate: true });
    } else {
      // Add platform with default content types
      const platform = PLATFORMS.find(p => p.id === platformId);
      const defaultContentTypes = platform?.contentTypes.map(type => ({
        type,
        quantity: 1
      })) || [];
      
      form.setValue('platforms', [
        ...platforms,
        {
          platformId,
          contentTypes: defaultContentTypes,
          customInstructions: ""
        }
      ], { shouldValidate: true });
    }
  };

  // Handle content type quantity change
  const handleContentTypeQuantityChange = (platformId: string, contentType: string, quantity: number) => {
    const platforms = form.getValues('platforms');
    const platformIndex = platforms.findIndex(p => p.platformId === platformId);
    
    if (platformIndex === -1) return;
    
    const platform = platforms[platformIndex];
    const contentTypeIndex = platform.contentTypes.findIndex(ct => ct.type === contentType);
    
    if (contentTypeIndex === -1) return;
    
    // Update quantity
    const updatedPlatforms = [...platforms];
    updatedPlatforms[platformIndex] = {
      ...platform,
      contentTypes: [
        ...platform.contentTypes.slice(0, contentTypeIndex),
        {
          ...platform.contentTypes[contentTypeIndex],
          quantity
        },
        ...platform.contentTypes.slice(contentTypeIndex + 1)
      ]
    };
    
    form.setValue('platforms', updatedPlatforms, { shouldValidate: true });
  };
  
  // Manejadores para opciones avanzadas de distribución
  const handlePlanificationTypeChange = (value: string) => {
    setPlanificationType(value);
    // Actualizar el valor en el formulario si es necesario
    toast({
      title: "Tipo de planificación cambiado",
      description: `Se ha seleccionado: ${value}`,
    });
  };
  
  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    toast({
      description: `Zona horaria cambiada a: ${value}`,
    });
  };
  
  const handleDayPriorityChange = (day: string, priority: string) => {
    setDayPriorities(prev => ({
      ...prev,
      [day]: priority
    }));
    // Mostrar feedback visual
    toast({
      description: `Prioridad de ${day} cambiada a: ${priority}`,
    });
  };
  
  const handleAddPublicationTime = () => {
    // Añadir hora y días seleccionados
    if (newPublicationTime) {
      const newTime = { time: newPublicationTime, days: newPublicationDays };
      setPublicationTimes(prev => [...prev, newTime]);
      toast({
        description: "Horario de publicación añadido",
      });
      // Reiniciar valores por defecto
      setNewPublicationTime("12:00");
      setNewPublicationDays("todos");
    }
  };
  
  const handleRemovePublicationTime = (index: number) => {
    setPublicationTimes(prev => prev.filter((_, i) => i !== index));
    toast({
      description: "Horario de publicación eliminado",
    });
  };
  
  // Manejador para controlar la visibilidad del selector de fechas de exclusión
  
  const handleAddExcludedDate = () => {
    // Alternar visibilidad del calendario
    setShowExclusionDatePicker(!showExclusionDatePicker);
  };
  
  const handleRemoveExcludedDate = (index: number) => {
    setExcludedDates(prev => prev.filter((_, i) => i !== index));
    toast({
      description: "Fecha eliminada de exclusiones",
    });
  };
  
  const handleDistributionTypeChange = (value: string) => {
    setDistributionType(value);
    toast({
      description: `Tipo de distribución cambiado a: ${value}`,
    });
  };
  
  const handleDistributionIntensityChange = (value: number[]) => {
    setDistributionIntensity(value[0]);
    // Actualizar el valor en el formulario
    toast({
      description: `Intensidad de distribución: ${value[0]}%`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg border-none overflow-hidden light-gradient-bg dark:bg-gradient-to-br dark:from-[#1a1d2d] dark:to-[#141825] dark:border dark:border-[#2a3349]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-20 -mt-20 blur-3xl dark:bg-amber-500/5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-20 -mb-20 blur-3xl dark:bg-[#65cef5]/5"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <CalendarIcon className="h-6 w-6" />
            </span>
            Creación Avanzada de Calendario
            <Badge variant="outline" className="ml-2 bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-300">
              Quincenal
            </Badge>
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Configura un calendario detallado con opciones personalizadas para cada plataforma.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 mb-6 dark:bg-[#1e293b] dark:border dark:border-[#3e4a6d]">
                  <TabsTrigger value="general" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    Distribución
                  </TabsTrigger>
                  <TabsTrigger value="platforms" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    Plataformas
                  </TabsTrigger>
                  <TabsTrigger value="content" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    Contenido
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    Avanzado
                  </TabsTrigger>
                </TabsList>
                
                {/* Tab: General */}
                <TabsContent value="general" className="space-y-6 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                                {projects?.map((project: Project) => (
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
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium dark:text-slate-300">Nombre del Calendario</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Calendario Mensual Q2" 
                                className="h-11 transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
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
                                    {...field} 
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
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium dark:text-slate-300">Fecha de Fin (opcional)</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    className="h-11 pl-10 transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-slate-400" />
                              </div>
                              <FormDescription className="text-xs flex items-center gap-1.5 text-amber-600 font-medium dark:text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                La fecha de fin se establecerá automáticamente para un periodo quincenal (15 días).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="specifications"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium dark:text-slate-300">Especificaciones Generales</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe las características generales del calendario, temas principales, etc."
                                className="min-h-[220px] transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs flex items-center gap-1.5 text-muted-foreground dark:text-slate-500">
                              <AlertCircle className="h-4 w-4" />
                              Las instrucciones específicas para cada red social se pueden configurar en la pestaña "Contenido".
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Distribution */}
                <TabsContent value="distribution" className="space-y-6 p-1">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3v18h18" />
                            <path d="M18 17V9" />
                            <path d="M13 17V5" />
                            <path d="M8 17v-3" />
                          </svg>
                        </span>
                        <h3 className="text-lg font-medium dark:text-white">Distribución de Publicaciones</h3>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="postsDistribution"
                        render={({ field }) => (
                          <FormItem className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                              <div 
                                className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md
                                  ${field.value === 'uniform' 
                                    ? 'bg-amber-50 border-amber-300 shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:bg-[#2a3349]'
                                  }`}
                                onClick={() => field.onChange('uniform')}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-12 w-32 bg-slate-100 rounded-md overflow-hidden relative dark:bg-slate-700">
                                    <div className="flex absolute inset-0 items-end pb-1 px-1 gap-0.5">
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-1">
                                    <p className="font-medium dark:text-white">Uniforme</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Distribución equitativa</p>
                                  </div>
                                </div>
                                {field.value === 'uniform' && (
                                  <div className="absolute top-2 right-2 h-5 w-5 bg-amber-400 text-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div 
                                className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md
                                  ${field.value === 'frontloaded' 
                                    ? 'bg-amber-50 border-amber-300 shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:bg-[#2a3349]'
                                  }`}
                                onClick={() => field.onChange('frontloaded')}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-12 w-32 bg-slate-100 rounded-md overflow-hidden relative dark:bg-slate-700">
                                    <div className="flex absolute inset-0 items-end pb-1 px-1 gap-0.5">
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[50%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[30%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[20%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-1">
                                    <p className="font-medium dark:text-white">Mayor al inicio</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Concentración inicial</p>
                                  </div>
                                </div>
                                {field.value === 'frontloaded' && (
                                  <div className="absolute top-2 right-2 h-5 w-5 bg-amber-400 text-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div 
                                className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md
                                  ${field.value === 'backloaded' 
                                    ? 'bg-amber-50 border-amber-300 shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:bg-[#2a3349]'
                                  }`}
                                onClick={() => field.onChange('backloaded')}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-12 w-32 bg-slate-100 rounded-md overflow-hidden relative dark:bg-slate-700">
                                    <div className="flex absolute inset-0 items-end pb-1 px-1 gap-0.5">
                                      <div className="flex-1 h-[20%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[30%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[40%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[50%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-1">
                                    <p className="font-medium dark:text-white">Mayor al final</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Concentración final</p>
                                  </div>
                                </div>
                                {field.value === 'backloaded' && (
                                  <div className="absolute top-2 right-2 h-5 w-5 bg-amber-400 text-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div 
                                className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md
                                  ${field.value === 'weekends' 
                                    ? 'bg-amber-50 border-amber-300 shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:bg-[#2a3349]'
                                  }`}
                                onClick={() => field.onChange('weekends')}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-12 w-32 bg-slate-100 rounded-md overflow-hidden relative dark:bg-slate-700">
                                    <div className="flex absolute inset-0 items-end pb-1 px-1 gap-0.5">
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-1">
                                    <p className="font-medium dark:text-white">Fines de semana</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Sábados y domingos</p>
                                  </div>
                                </div>
                                {field.value === 'weekends' && (
                                  <div className="absolute top-2 right-2 h-5 w-5 bg-amber-400 text-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div 
                                className={`relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md
                                  ${field.value === 'weekdays' 
                                    ? 'bg-amber-50 border-amber-300 shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50' 
                                    : 'bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:bg-[#2a3349]'
                                  }`}
                                onClick={() => field.onChange('weekdays')}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-12 w-32 bg-slate-100 rounded-md overflow-hidden relative dark:bg-slate-700">
                                    <div className="flex absolute inset-0 items-end pb-1 px-1 gap-0.5">
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[60%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                      <div className="flex-1 h-[25%] bg-amber-400 rounded-sm dark:bg-amber-500"></div>
                                    </div>
                                  </div>
                                  <div className="text-center mt-1">
                                    <p className="font-medium dark:text-white">Días laborables</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Lunes a viernes</p>
                                  </div>
                                </div>
                                {field.value === 'weekdays' && (
                                  <div className="absolute top-2 right-2 h-5 w-5 bg-amber-400 text-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Para mantener compatibilidad con el formulario */}
                            <div className="hidden">
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="uniform">Uniforme</SelectItem>
                                  <SelectItem value="frontloaded">Mayor al inicio</SelectItem>
                                  <SelectItem value="backloaded">Mayor al final</SelectItem>
                                  <SelectItem value="weekends">Fines de semana</SelectItem>
                                  <SelectItem value="weekdays">Días laborables</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-4">
                              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-700/40">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-amber-700 dark:text-amber-300">Distribución de publicaciones</AlertTitle>
                                <AlertDescription className="text-amber-600/80 dark:text-amber-400/90">
                                  Esta configuración determina cómo se distribuirán las publicaciones durante el periodo especificado. Escoge el patrón que mejor se adapte a tu estrategia de contenido.
                                </AlertDescription>
                              </Alert>
                              
                              {/* Vista previa del calendario */}
                              <div className="bg-white border rounded-lg p-4 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                                <h4 className="font-medium mb-3 text-sm flex items-center gap-2 dark:text-white">
                                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                                  Simulación de distribución
                                </h4>
                                
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                                    <div 
                                      key={i} 
                                      className="text-center text-xs font-medium py-1 text-slate-500 dark:text-slate-400"
                                    >
                                      {day}
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="grid grid-cols-7 gap-1">
                                  {/* Simulación de 4 semanas (28 días) */}
                                  {Array.from({ length: 28 }).map((_, i) => {
                                    const dayIndex = i;
                                    const weekDay = i % 7; // 0=L, 1=M, ..., 6=D
                                    const weekNumber = Math.floor(i / 7); // 0, 1, 2, 3
                                    const isWeekend = weekDay >= 5; // Si es sábado o domingo
                                    
                                    // Determinamos si hay publicación según el patrón
                                    let hasPost = false;
                                    let postSize = 'small'; // small, medium, large
                                    
                                    // Distribución Uniforme - un post cada 3-4 días aproximadamente
                                    if (field.value === 'uniform') {
                                      // Aproximadamente 8 posts en el mes (2 por semana)
                                      hasPost = [1, 4, 8, 11, 15, 18, 22, 25].includes(dayIndex);
                                      postSize = 'medium';
                                    } 
                                    // Mayor al inicio - concentración al principio del mes
                                    else if (field.value === 'frontloaded') {
                                      if (weekNumber === 0) {
                                        // 4 posts en primera semana
                                        hasPost = [0, 2, 4, 6].includes(dayIndex);
                                        postSize = 'large';
                                      } else if (weekNumber === 1) {
                                        // 2 posts en segunda semana
                                        hasPost = [8, 11].includes(dayIndex);
                                        postSize = 'medium';
                                      } else if (weekNumber === 2 || weekNumber === 3) {
                                        // 1 post por semana restante
                                        hasPost = dayIndex === 16 || dayIndex === 23;
                                        postSize = 'small';
                                      }
                                    } 
                                    // Mayor al final - concentración al final del mes
                                    else if (field.value === 'backloaded') {
                                      if (weekNumber === 3) {
                                        // 4 posts en última semana
                                        hasPost = [21, 23, 25, 27].includes(dayIndex);
                                        postSize = 'large';
                                      } else if (weekNumber === 2) {
                                        // 2 posts en penúltima semana
                                        hasPost = [15, 18].includes(dayIndex);
                                        postSize = 'medium';
                                      } else if (weekNumber === 0 || weekNumber === 1) {
                                        // 1 post por semana al inicio
                                        hasPost = dayIndex === 2 || dayIndex === 9;
                                        postSize = 'small';
                                      }
                                    } 
                                    // Fines de semana - concentración en sábados y domingos
                                    else if (field.value === 'weekends') {
                                      if (isWeekend) {
                                        // Todos los fines de semana
                                        hasPost = true;
                                        postSize = 'large';
                                      } else {
                                        // Algunos días entre semana
                                        hasPost = [2, 10, 16, 24].includes(dayIndex);
                                        postSize = 'small';
                                      }
                                    } 
                                    // Días laborables - concentración de lunes a viernes
                                    else if (field.value === 'weekdays') {
                                      if (!isWeekend) {
                                        // Días laborables seleccionados
                                        hasPost = [0, 3, 7, 11, 14, 17, 21, 24].includes(dayIndex);
                                        postSize = 'large';
                                      } else {
                                        // Algunos fines de semana
                                        hasPost = [5, 19].includes(dayIndex);
                                        postSize = 'small';
                                      }
                                    }
                                    
                                    // Estilos según si hay publicación y tamaño
                                    let borderColor = '';
                                    let bgColor = '';
                                    let dotColor = '';
                                    let sizeClass = '';
                                    
                                    if (hasPost) {
                                      if (postSize === 'small') {
                                        bgColor = 'bg-amber-50 dark:bg-amber-900/10';
                                        borderColor = 'border-amber-100 dark:border-amber-700/20';
                                        dotColor = 'bg-amber-400 dark:bg-amber-500';
                                        sizeClass = 'w-1.5 h-1.5';
                                      } else if (postSize === 'medium') {
                                        bgColor = 'bg-amber-100 dark:bg-amber-900/20';
                                        borderColor = 'border-amber-200 dark:border-amber-700/30';
                                        dotColor = 'bg-amber-500 dark:bg-amber-400';
                                        sizeClass = 'w-2 h-2';
                                      } else { // large
                                        bgColor = 'bg-amber-200 dark:bg-amber-900/30';
                                        borderColor = 'border-amber-300 dark:border-amber-700/40';
                                        dotColor = 'bg-amber-600 dark:bg-amber-300';
                                        sizeClass = 'w-2.5 h-2.5';
                                      }
                                    } else {
                                      bgColor = isWeekend ? 'bg-slate-50 dark:bg-slate-800/30' : 'bg-white dark:bg-[#1e293b]';
                                      borderColor = 'border-slate-100 dark:border-slate-700/20';
                                    }
                                    
                                    return (
                                      <div 
                                        key={i} 
                                        className={`relative h-10 border rounded-md ${bgColor} ${borderColor} transition-colors flex items-center justify-center`}
                                      >
                                        <span className={`text-xs font-medium ${hasPost ? 'text-amber-800 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                          {dayIndex + 1}
                                        </span>
                                        
                                        {hasPost && (
                                          <div className={`absolute bottom-1 ${sizeClass} rounded-full ${dotColor}`} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                <div className="mt-3 flex items-center justify-between border-t pt-3 dark:border-[#3e4a6d]">
                                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Publicaciones simuladas: {field.value === 'uniform' ? '8' : 
                                      field.value === 'frontloaded' || field.value === 'backloaded' ? '8' : 
                                      field.value === 'weekends' ? '12' : '10'}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500" />
                                      <span className="text-xs text-slate-500 dark:text-slate-400">Publicación</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Opciones avanzadas de distribución */}
                              <div className="bg-white border rounded-lg p-4 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                                <h4 className="font-medium mb-3 text-sm flex items-center gap-2 dark:text-white">
                                  <Settings2 className="h-4 w-4 text-amber-500" />
                                  Preferencias de distribución avanzadas
                                </h4>
                                
                                <div className="space-y-5">
                                  {/* Días de publicación */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Publicar en estos días
                                      </h5>
                                      <div className="relative group">
                                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                        <div className="absolute right-0 w-64 p-2 mt-2 text-xs bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 hidden group-hover:block z-50">
                                          Marca los días en que deseas publicar. Las publicaciones se distribuirán entre los días seleccionados.
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                      {[
                                        {id: "L", label: "Lunes"},
                                        {id: "M", label: "Martes"},
                                        {id: "X", label: "Miércoles"},
                                        {id: "J", label: "Jueves"},
                                        {id: "V", label: "Viernes"},
                                        {id: "S", label: "Sábado"},
                                        {id: "D", label: "Domingo"}
                                      ].map((day) => (
                                        <div key={day.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/40 rounded px-2 py-1.5">
                                          <Checkbox 
                                            id={`day-${day.id}`} 
                                            checked={selectedDays.includes(day.id)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setSelectedDays([...selectedDays, day.id]);
                                              } else {
                                                setSelectedDays(selectedDays.filter(d => d !== day.id));
                                              }
                                            }}
                                            className="h-4 w-4 rounded-sm data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-600"
                                          />
                                          <Label 
                                            htmlFor={`day-${day.id}`}
                                            className="text-sm font-medium dark:text-slate-300"
                                          >
                                            {day.label}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {selectedDays.length === 0 && (
                                      <div className="flex items-center text-xs text-amber-700 dark:text-amber-400 mt-2 bg-amber-50/70 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-md p-2">
                                        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                        <span>Selecciona al menos un día para publicar</span>
                                      </div>
                                    )}
                                    
                                    {selectedDays.length > 0 && (
                                      <div className="mt-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/30 rounded-md p-3">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center mb-2">
                                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                          <span>Vista previa de distribución:</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-7 gap-1">
                                          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                                            <div 
                                              key={day}
                                              className={`text-center py-1 text-xs font-medium rounded-sm ${
                                                selectedDays.includes(day)
                                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700/30 dark:text-slate-500'
                                              }`}
                                            >
                                              {day}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Sección de zona horaria */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Zona horaria para publicaciones
                                      </h5>
                                    </div>
                                    
                                    <Select 
                                      value={timezone} 
                                      onValueChange={handleTimezoneChange}
                                      defaultValue="UTC-6"
                                    >
                                      <SelectTrigger className="w-full h-9 text-xs dark:border-[#3e4a6d] dark:bg-slate-800 dark:text-white">
                                        <SelectValue placeholder="Selecciona zona horaria" />
                                      </SelectTrigger>
                                      <SelectContent className="dark:bg-slate-800 dark:border-[#3e4a6d]">
                                        <SelectItem value="UTC-8" className="text-xs">UTC-8 (Pacífico EE.UU.)</SelectItem>
                                        <SelectItem value="UTC-7" className="text-xs">UTC-7 (Montaña EE.UU.)</SelectItem>
                                        <SelectItem value="UTC-6" className="text-xs">UTC-6 (México/Centro EE.UU.)</SelectItem>
                                        <SelectItem value="UTC-5" className="text-xs">UTC-5 (Colombia/Este EE.UU.)</SelectItem>
                                        <SelectItem value="UTC-3" className="text-xs">UTC-3 (Argentina/Brasil)</SelectItem>
                                        <SelectItem value="UTC+0" className="text-xs">UTC+0 (Reino Unido)</SelectItem>
                                        <SelectItem value="UTC+1" className="text-xs">UTC+1 (España/Europa Central)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {/* Bloques horarios para publicaciones */}
                                  <div className="space-y-3 pt-2 border-t dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Bloques horarios para publicar
                                      </h5>
                                      <div className="relative group">
                                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                        <div className="absolute right-0 w-64 p-2 mt-2 text-xs bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 hidden group-hover:block z-50">
                                          Selecciona los bloques de horas en los que prefieres que se programen las publicaciones. El sistema intentará publicar dentro de estos horarios de acuerdo con la cantidad de publicaciones solicitadas.
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {[
                                        {id: "6-9", label: "Mañana (6-9h)"},
                                        {id: "9-12", label: "Media mañana (9-12h)"},
                                        {id: "12-15", label: "Mediodía (12-15h)"},
                                        {id: "15-18", label: "Tarde (15-18h)"},
                                        {id: "18-21", label: "Tarde-noche (18-21h)"},
                                        {id: "21-24", label: "Noche (21-24h)"}
                                      ].map((block) => {
                                        // Simulando estado para los checkboxes de bloques horarios
                                        // En una implementación real, esto debería estar en el estado del componente
                                        const isSelected = publicationTimes.some(t => 
                                          t.time.startsWith(block.id.split('-')[0]) || 
                                          t.time.startsWith(block.id.split('-')[1] - 1)
                                        );
                                        
                                        return (
                                          <div key={block.id} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/40 rounded px-2 py-1.5">
                                            <Checkbox 
                                              id={`block-${block.id}`} 
                                              checked={isSelected}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  // Añadir un tiempo representativo para este bloque
                                                  const [start] = block.id.split('-');
                                                  setPublicationTimes([...publicationTimes, {
                                                    time: `${start}:00`,
                                                    days: "todos"
                                                  }]);
                                                } else {
                                                  // Eliminar tiempos que caigan en este bloque
                                                  const [start, end] = block.id.split('-').map(Number);
                                                  setPublicationTimes(publicationTimes.filter(t => {
                                                    const hour = Number(t.time.split(':')[0]);
                                                    return hour < start || hour >= end;
                                                  }));
                                                }
                                              }}
                                              className="h-4 w-4 rounded-sm data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-600"
                                            />
                                            <Label 
                                              htmlFor={`block-${block.id}`}
                                              className="text-sm font-medium dark:text-slate-300"
                                            >
                                              {block.label}
                                            </Label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-md flex items-start">
                                      <Info className="h-4 w-4 mr-2 mt-0.5" />
                                      <span>
                                        Estos son bloques de preferencia. El sistema colocará las publicaciones dentro de estos horarios de acuerdo con la audiencia óptima y la cantidad total de publicaciones.
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Días preferidos - Versión mejorada con prioridades */}
                                  <div className="space-y-3 pt-2 border-t dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Prioridad de días
                                      </h5>
                                      <div className="relative group">
                                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                        <div className="absolute right-0 w-64 p-2 mt-2 text-xs bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 hidden group-hover:block z-50">
                                          Selecciona la prioridad para cada día de la semana. Mayor prioridad = más publicaciones.
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1">
                                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1">
                                          <span className="text-xs font-medium dark:text-slate-400">{day}</span>
                                          <Select 
                                            value={dayPriorities[day]} 
                                            onValueChange={(value) => handleDayPriorityChange(day, value)}
                                          >
                                            <SelectTrigger className="w-full h-7 text-[10px] px-1 bg-transparent border-dashed dark:border-[#3e4a6d]">
                                              <SelectValue placeholder="-" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-slate-800 dark:border-[#3e4a6d]">
                                              <SelectItem value="ninguna" className="text-xs">Ninguna</SelectItem>
                                              <SelectItem value="baja" className="text-xs">Baja</SelectItem>
                                              <SelectItem value="media" className="text-xs">Media</SelectItem>
                                              <SelectItem value="alta" className="text-xs">Alta</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                            <div 
                                              className={`h-full ${
                                                dayPriorities[day] === "alta" ? "w-full bg-amber-500 dark:bg-amber-400" : 
                                                dayPriorities[day] === "media" ? "w-2/3 bg-amber-300 dark:bg-amber-500/70" : 
                                                dayPriorities[day] === "baja" ? "w-1/3 bg-amber-200 dark:bg-amber-600/50" :
                                                "w-0"
                                              }`} 
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Fechas de exclusión */}
                                  <div className="space-y-3 pt-2 border-t dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Fechas de exclusión
                                      </h5>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-2 text-xs"
                                        onClick={handleAddExcludedDate}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Añadir fecha
                                      </Button>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-4">
                                      {/* Control de calendario para fechas de exclusión */}
                                      {showExclusionDatePicker && (
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 shadow-md">
                                          <Calendar
                                            mode="multiple"
                                            selected={exclusionDates}
                                            onSelect={(dates) => {
                                              setExclusionDates(dates || []);
                                              // Convertir las nuevas fechas seleccionadas a formato de cadena
                                              const formattedDates = dates?.map(date => 
                                                format(date, "dd/MM/yyyy", { locale: es })
                                              ) || [];
                                              
                                              // Actualizar el estado de fechas excluidas
                                              setExcludedDates(formattedDates);
                                            }}
                                            className="rounded-md border border-slate-200 dark:border-slate-700"
                                            locale={es}
                                          />
                                        </div>
                                      )}
                                      
                                      {/* Lista de fechas excluidas */}
                                      <div className="flex flex-wrap gap-2">
                                        {excludedDates.map((date, index) => (
                                          <Badge 
                                            key={index}
                                            variant="outline" 
                                            className="px-2 py-1 text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40 flex items-center gap-1.5"
                                          >
                                            {date}
                                            <X 
                                              className="h-3 w-3 cursor-pointer" 
                                              onClick={() => handleRemoveExcludedDate(index)}
                                            />
                                          </Badge>
                                        ))}
                                        {excludedDates.length === 0 && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                            No hay fechas excluidas. Haga clic en "Añadir fecha" para seleccionar días que desea evitar.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                      No se programarán publicaciones en las fechas marcadas como exclusión.
                                    </p>
                                  </div>
                                  
                                  {/* Densidad de publicaciones - Reemplazo del "nivel de concentración" */}
                                  <div className="space-y-3 pt-2 border-t dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium flex items-center gap-1.5 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        Densidad de publicaciones
                                      </h5>
                                      <div className="relative group">
                                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                        <div className="absolute right-0 w-64 p-2 mt-2 text-xs bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-600 hidden group-hover:block z-50">
                                          Determina si prefieres publicaciones distribuidas uniformemente o concentradas en ciertos días.
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div className="space-x-2 flex items-center">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Distribución:</span>
                                        <Select 
                                          value={distributionType}
                                          onValueChange={handleDistributionTypeChange}
                                        >
                                          <SelectTrigger className="h-8 text-xs dark:border-[#3e4a6d] dark:bg-slate-800 dark:text-white">
                                            <SelectValue placeholder="Tipo de distribución" />
                                          </SelectTrigger>
                                          <SelectContent className="dark:bg-slate-800 dark:border-[#3e4a6d]">
                                            <SelectItem value="equilibrada" className="text-xs">Equilibrada</SelectItem>
                                            <SelectItem value="agrupada" className="text-xs">Agrupada</SelectItem>
                                            <SelectItem value="concentrada" className="text-xs">Muy concentrada</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div className="flex justify-between gap-2 items-center">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20">Intensidad:</span>
                                        <Slider 
                                          value={[distributionIntensity]} 
                                          onValueChange={handleDistributionIntensityChange}
                                          max={100} 
                                          step={1}
                                          className="flex-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Platforms */}
                <TabsContent value="platforms" className="space-y-6 p-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PLATFORMS.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => handleTogglePlatform(platform.id)}
                        className={`
                          relative rounded-xl border p-4 flex flex-col items-center justify-center gap-2 
                          transition-all duration-300 cursor-pointer overflow-hidden
                          ${selectedPlatforms.includes(platform.id) 
                            ? `bg-primary/5 border-primary shadow-sm dark:bg-primary/10 dark:border-primary/40` 
                            : `bg-white border-border hover:border-primary/40 hover:bg-primary/5 
                               dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-primary/40 dark:hover:bg-primary/10`
                          }
                        `}
                      >
                        {/* Gradiente de fondo para efecto visual */}
                        <div className={`absolute inset-0 opacity-10 ${selectedPlatforms.includes(platform.id) ? 'opacity-20' : ''}`}>
                          <div className={`absolute inset-0 ${platform.color} opacity-10 blur-xl`}></div>
                        </div>
                        
                        {/* Ícono y contenido */}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-14 h-14 rounded-xl ${platform.color} flex items-center justify-center text-white shadow-md transform transition-transform duration-300 ${selectedPlatforms.includes(platform.id) ? 'scale-105' : ''}`}>
                            <span className="text-xl font-semibold">{platform.name.substring(0, 1)}</span>
                          </div>
                          <div className="text-center mt-1">
                            <p className="font-medium dark:text-white">{platform.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Badge variant="outline" className={`bg-opacity-20 text-xs px-2 py-0.5 ${selectedPlatforms.includes(platform.id) ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                                {platform.contentTypes.length} {platform.contentTypes.length === 1 ? 'formato' : 'formatos'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicador de selección */}
                        {selectedPlatforms.includes(platform.id) && (
                          <div className="absolute -top-1 -right-1 bg-primary text-white rounded-bl-lg rounded-tr-lg p-1 drop-shadow-md dark:bg-primary dark:shadow-[0_0_10px_rgba(101,206,245,0.25)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedPlatforms.length === 0 && (
                    <Alert variant="destructive" className="mt-4 bg-destructive/5 text-destructive border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30 dark:text-destructive-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No hay plataformas seleccionadas</AlertTitle>
                      <AlertDescription>
                        Selecciona al menos una plataforma para crear el calendario.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedPlatforms.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      <Info className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        Ajusta el contenido de cada plataforma en la pestaña "Contenido".
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Tab: Content */}
                <TabsContent value="content" className="space-y-6 p-1">
                  {selectedPlatforms.length === 0 ? (
                    <Alert variant="default" className="mt-4 bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20 dark:bg-muted-foreground/5 dark:border-muted-foreground/20 dark:text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Configuración pendiente</AlertTitle>
                      <AlertDescription>
                        Primero selecciona las plataformas que deseas incluir en la pestaña "Plataformas".
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-medium dark:text-white">Configuración de contenido por plataforma</h3>
                      </div>
                      
                      <Accordion type="multiple" className="space-y-4">
                        {selectedPlatforms.map((platformId) => {
                          const platform = PLATFORMS.find(p => p.id === platformId);
                          const platformConfig = form.getValues('platforms').find(p => p.platformId === platformId);
                          
                          if (!platform || !platformConfig) return null;
                          
                          return (
                            <AccordionItem 
                              key={platformId} 
                              value={platformId}
                              className="border overflow-hidden rounded-lg dark:border-[#3e4a6d] dark:bg-[#1e293b]"
                            >
                              <AccordionTrigger className={`px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-[#2a3349] group`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white`}>
                                    {platform.name.substring(0, 1)}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium dark:text-white">{platform.name}</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                                      {platformConfig.contentTypes.reduce((acc, ct) => acc + ct.quantity, 0)} publicaciones configuradas
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              
                              <AccordionContent className="px-4 pb-4 pt-2">
                                <div className="space-y-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium dark:text-white">Tipos de contenido</h4>
                                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary-foreground dark:border-primary/30">
                                        Cantidad total: {platformConfig.contentTypes.reduce((acc, ct) => acc + ct.quantity, 0)}
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {platformConfig.contentTypes.map((contentType) => (
                                        <div 
                                          key={`${platformId}-${contentType.type}`} 
                                          className="border rounded-lg p-3 space-y-2 bg-white shadow-sm hover:shadow transition-all 
                                            dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-[#65cef5]/30"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-amber-100 text-amber-600 
                                                dark:bg-amber-900/30 dark:text-amber-300">
                                                <span>{CONTENT_TYPE_EMOJIS[contentType.type]}</span>
                                              </div>
                                              <span className="text-sm font-medium capitalize dark:text-white">{contentType.type}</span>
                                            </div>
                                            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 px-1.5 dark:bg-amber-900/20 dark:border-amber-800/60 dark:text-amber-300">
                                              {contentType.quantity}
                                            </Badge>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 pt-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 rounded-lg bg-white hover:bg-slate-50 dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:hover:bg-[#2a3349]"
                                              onClick={() => handleContentTypeQuantityChange(
                                                platformId, 
                                                contentType.type, 
                                                Math.max(1, contentType.quantity - 1)
                                              )}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                                              </svg>
                                            </Button>
                                            
                                            <div className="flex-1">
                                              <input 
                                                type="range" 
                                                min="1" 
                                                max="30" 
                                                value={contentType.quantity}
                                                onChange={(e) => handleContentTypeQuantityChange(
                                                  platformId, 
                                                  contentType.type, 
                                                  parseInt(e.target.value)
                                                )}
                                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-amber-500 dark:bg-[#2a3349]"
                                              />
                                            </div>
                                            
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 rounded-lg bg-white hover:bg-slate-50 dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:hover:bg-[#2a3349]"
                                              onClick={() => handleContentTypeQuantityChange(
                                                platformId, 
                                                contentType.type, 
                                                Math.min(30, contentType.quantity + 1)
                                              )}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                              </svg>
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <Separator className="dark:bg-[#3e4a6d]" />
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium flex items-center gap-2 dark:text-white">
                                        <span className={`h-4 w-4 rounded-full ${platform.color}`}></span>
                                        Instrucciones personalizadas para {platform.name}
                                      </h4>
                                    </div>
                                    
                                    <div className="relative">
                                      <Textarea
                                        placeholder={`Instrucciones específicas para ${platform.name}. (Ej: tono de voz, requerimientos especiales, información de la estrategia, etc.)`}
                                        className="min-h-[120px] pr-10 border rounded-lg shadow-sm transition-all focus:shadow-md bg-white
                                          dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:focus:border-[#65cef5]/40"
                                        value={platformConfig.customInstructions || ''}
                                        onChange={(e) => {
                                          const platforms = form.getValues('platforms');
                                          const platformIndex = platforms.findIndex(p => p.platformId === platformId);
                                          
                                          if (platformIndex === -1) return;
                                          
                                          const updatedPlatforms = [...platforms];
                                          updatedPlatforms[platformIndex] = {
                                            ...platforms[platformIndex],
                                            customInstructions: e.target.value
                                          };
                                          
                                          form.setValue('platforms', updatedPlatforms, { shouldValidate: true });
                                        }}
                                      />
                                      <div className="absolute right-3 top-3 opacity-50 dark:opacity-30">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M12 20h9"></path>
                                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    <Alert className="bg-primary/5 border-primary/20 py-2 dark:bg-primary/10 dark:border-primary/30">
                                      <Info className="h-4 w-4 text-primary" />
                                      <AlertDescription className="text-xs text-primary-foreground">
                                        Estas instrucciones serán utilizadas por la IA para generar contenido específico para esta plataforma.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  )}
                </TabsContent>
                
                {/* Tab: Advanced */}
                <TabsContent value="advanced" className="space-y-6 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-medium dark:text-white">Elementos de contenido</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="advanced.includeCopyIn"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-[#65cef5]/40">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500 rounded transition-all"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white flex items-center gap-1">
                                  Incluir Copy In
                                  {field.value && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">Activo</span>}
                                </FormLabel>
                                <FormDescription className="text-xs dark:text-slate-400">
                                  Texto integrado dentro del diseño de la publicación
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeCopyOut"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-[#65cef5]/40">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500 rounded transition-all"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white flex items-center gap-1">
                                  Incluir Copy Out
                                  {field.value && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">Activo</span>}
                                </FormLabel>
                                <FormDescription className="text-xs dark:text-slate-400">
                                  Texto para la descripción de la publicación
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeHashtags"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-[#65cef5]/40">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500 rounded transition-all"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white flex items-center gap-1">
                                  Incluir Hashtags
                                  {field.value && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">Activo</span>}
                                </FormLabel>
                                <FormDescription className="text-xs dark:text-slate-400">
                                  Generar hashtags relevantes para cada publicación
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeDesignInstructions"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-[#65cef5]/40">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500 rounded transition-all"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white flex items-center gap-1">
                                  Incluir Instrucciones de Diseño
                                  {field.value && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">Activo</span>}
                                </FormLabel>
                                <FormDescription className="text-xs dark:text-slate-400">
                                  Generar indicaciones para el departamento de diseño
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-medium dark:text-white">Sugerencias</h3>
                      </div>
                      
                      <ScrollArea className="h-[calc(100%-3rem)] pr-4">
                        <div className="space-y-4">
                          <Alert className="bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/30">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-700 dark:text-amber-300">Mantén tus instrucciones claras</AlertTitle>
                            <AlertDescription className="text-amber-700/80 dark:text-amber-400/90">
                              Las instrucciones específicas para cada plataforma generarán mejor contenido. Sé detallado en tus requerimientos.
                            </AlertDescription>
                          </Alert>
                          
                          <Alert className="bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/30">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-700 dark:text-amber-300">Proporciona contexto</AlertTitle>
                            <AlertDescription className="text-amber-700/80 dark:text-amber-400/90">
                              Incluye información sobre tu marca, audiencia y objetivos en las instrucciones para obtener resultados más relevantes.
                            </AlertDescription>
                          </Alert>
                          
                          <Alert className="bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 dark:border-amber-500/30">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertTitle className="text-amber-700 dark:text-amber-300">Balancea los tipos de contenido</AlertTitle>
                            <AlertDescription className="text-amber-700/80 dark:text-amber-400/90">
                              Distribuye tus publicaciones entre diferentes formatos para mantener tu feed dinámico y atractivo.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between items-center pt-4 border-t dark:border-[#3e4a6d]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="dark:border-[#3e4a6d] dark:bg-transparent dark:text-white dark:hover:bg-[#2a3349]"
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isGenerating}
                  className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-white dark:hover:bg-amber-600"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando calendario...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Crear Calendario <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}