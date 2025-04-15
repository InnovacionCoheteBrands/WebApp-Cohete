import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, CalendarIcon, Clock, Info, Plus, Trash, ArrowRight, Sparkles } from "lucide-react";

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
    const endDate = values.endDate ? new Date(values.endDate) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha de fin",
        variant: "destructive",
      });
      return;
    }

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
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Configura un calendario detallado con opciones personalizadas para cada plataforma.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-6 dark:bg-[#1e293b] dark:border dark:border-[#3e4a6d]">
                  <TabsTrigger value="general" className="dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
                    General
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
                              <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                                Si no se especifica, se utilizará un mes a partir de la fecha de inicio.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="postsDistribution"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium dark:text-slate-300">Distribución de Publicaciones</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 transition-all duration-200 hover:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5]">
                                  <SelectValue placeholder="Elige una distribución" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                                <SelectItem value="uniform" className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]">
                                  Uniforme (Distribución equitativa)
                                </SelectItem>
                                <SelectItem value="frontloaded" className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]">
                                  Mayor al inicio
                                </SelectItem>
                                <SelectItem value="backloaded" className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]">
                                  Mayor al final
                                </SelectItem>
                                <SelectItem value="weekends" className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]">
                                  Enfoque en fines de semana
                                </SelectItem>
                                <SelectItem value="weekdays" className="dark:text-white dark:focus:bg-[#2a3349] dark:data-[state=checked]:text-[#65cef5]">
                                  Enfoque en días laborables
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                              Determina cómo se distribuirán las publicaciones en el periodo especificado.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                
                {/* Tab: Platforms */}
                <TabsContent value="platforms" className="space-y-6 p-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PLATFORMS.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => handleTogglePlatform(platform.id)}
                        className={`
                          relative rounded-xl border p-4 flex flex-col items-center justify-center gap-2 
                          transition-all duration-200 cursor-pointer overflow-hidden
                          ${selectedPlatforms.includes(platform.id) 
                            ? `bg-primary/5 border-primary shadow-md dark:bg-primary/10 dark:border-primary/40` 
                            : `bg-white border-border hover:border-primary/40 hover:bg-primary/5 
                               dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:hover:border-primary/40 dark:hover:bg-primary/10`
                          }
                        `}
                      >
                        <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white`}>
                          {platform.name.substring(0, 1)}
                        </div>
                        <div className="text-center">
                          <p className="font-medium dark:text-white">{platform.name}</p>
                          <p className="text-xs text-muted-foreground dark:text-slate-400">
                            {platform.contentTypes.length} {platform.contentTypes.length === 1 ? 'formato' : 'formatos'}
                          </p>
                        </div>
                        
                        {selectedPlatforms.includes(platform.id) && (
                          <div className="absolute -top-1 -right-1 bg-primary text-white rounded-bl-lg rounded-tr-lg p-1 dark:bg-primary dark:shadow-[0_0_10px_rgba(101,206,245,0.25)]">
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
                                        <div key={`${platformId}-${contentType.type}`} className="border rounded-lg p-3 space-y-2 dark:border-[#3e4a6d]">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">{CONTENT_TYPE_EMOJIS[contentType.type]}</span>
                                              <span className="text-sm font-medium capitalize dark:text-white">{contentType.type}</span>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 rounded-lg dark:border-[#3e4a6d]"
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
                                            
                                            <div className="flex-1 text-center">
                                              <span className="text-sm font-medium dark:text-white">{contentType.quantity}</span>
                                            </div>
                                            
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 rounded-lg dark:border-[#3e4a6d]"
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
                                      <h4 className="text-sm font-medium dark:text-white">Instrucciones personalizadas</h4>
                                    </div>
                                    
                                    <Textarea
                                      placeholder={`Instrucciones específicas para ${platform.name}. (Ej: tono de voz, requerimientos especiales, información de la estrategia, etc.)`}
                                      className="min-h-[100px] dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
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
                                    <p className="text-xs text-muted-foreground dark:text-slate-500">
                                      Estas instrucciones serán utilizadas por la IA para generar contenido específico para esta plataforma.
                                    </p>
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
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white">Incluir Copy In</FormLabel>
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
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white">Incluir Copy Out</FormLabel>
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
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white">Incluir Hashtags</FormLabel>
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
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 dark:border-slate-500"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium dark:text-white">Incluir Instrucciones de Diseño</FormLabel>
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