import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, CalendarIcon, Clock, Info, Plus, Trash, ArrowRight, Sparkles } from "lucide-react";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define interfaces
interface Project {
  id: number;
  name: string;
  client: string;
}
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="specifications"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium dark:text-slate-300">Instrucciones Especiales</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Añade cualquier requerimiento específico o notas..." 
                                className="min-h-[150px] resize-none transition-all duration-200 hover:border-primary focus:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5] dark:focus:border-[#65cef5]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                              Puedes incluir aquí información sobre campañas específicas, fechas importantes, o cualquier otra instrucción relevante.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300">
                        <AlertCircle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
                        <AlertTitle>Consejo</AlertTitle>
                        <AlertDescription className="text-sm dark:text-amber-300/80">
                          Selecciona un proyecto y proporciona instrucciones claras para obtener mejores resultados. Puedes especificar temas, tono de voz, o estrategias específicas.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Plataformas */}
                <TabsContent value="platforms" className="space-y-6 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 dark:text-white">Selecciona las plataformas</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {PLATFORMS.map(platform => (
                          <Button
                            key={platform.id}
                            type="button"
                            variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                            className={`justify-start h-auto py-3 px-4 transition-all duration-200 ${
                              selectedPlatforms.includes(platform.id) 
                                ? `bg-${platform.id === 'facebook' ? 'blue-600' : platform.id === 'instagram' ? 'pink-500' : platform.id === 'twitter' ? 'sky-500' : platform.id === 'linkedin' ? 'blue-700' : platform.id === 'tiktok' ? 'neutral-800' : platform.id === 'youtube' ? 'red-600' : 'red-500'} text-white hover:opacity-90 dark:hover:opacity-90 shadow-sm hover:shadow-md`
                                : 'border-gray-200 bg-white dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white'
                            }`}
                            onClick={() => handleTogglePlatform(platform.id)}
                          >
                            <div className={`w-4 h-4 rounded-full mr-2 ${platform.color}`}></div>
                            <span>{platform.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4 dark:text-white">Tipos de contenido</h3>
                      {selectedPlatforms.length === 0 ? (
                        <div className="rounded-lg border p-4 bg-gray-50 text-muted-foreground dark:bg-[#1e293b] dark:border-[#3e4a6d] dark:text-slate-400">
                          <p className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
                            Selecciona plataformas para configurar los tipos de contenido.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <ScrollArea className="h-[300px] rounded-md border dark:border-[#3e4a6d]">
                            <div className="p-4">
                              <Accordion type="multiple" className="space-y-3">
                                {selectedPlatforms.map(platformId => {
                                  const platform = PLATFORMS.find(p => p.id === platformId);
                                  const platformConfig = form.getValues('platforms').find(p => p.platformId === platformId);
                                  
                                  if (!platform || !platformConfig) return null;
                                  
                                  return (
                                    <AccordionItem 
                                      key={platformId} 
                                      value={platformId}
                                      className="border dark:border-[#3e4a6d] rounded-lg overflow-hidden"
                                    >
                                      <AccordionTrigger className="px-4 py-3 hover:no-underline dark:text-white group transition-all duration-200">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-2.5 transition-transform duration-200 transform group-data-[state=open]:scale-110 ${platform.color}`}></div>
                                            <span className="font-medium group-data-[state=open]:text-primary dark:group-data-[state=open]:text-[#65cef5] transition-colors duration-200">{platform.name}</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="flex -space-x-1.5">
                                              {platform.contentTypes.slice(0, 3).map((type) => (
                                                <span 
                                                  key={type} 
                                                  className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs dark:bg-slate-700 dark:border-[#1e293b]"
                                                  title={type}
                                                >
                                                  {CONTENT_TYPE_EMOJIS[type] ? CONTENT_TYPE_EMOJIS[type] : '📄'}
                                                </span>
                                              ))}
                                              {platform.contentTypes.length > 3 && (
                                                <span className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] dark:bg-slate-700 dark:border-[#1e293b] dark:text-slate-300">
                                                  +{platform.contentTypes.length - 3}
                                                </span>
                                              )}
                                            </div>
                                            
                                            {platformConfig.customInstructions && (
                                              <div className="bg-amber-100 dark:bg-amber-900/30 p-0.5 rounded-sm">
                                                <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-4 pb-3 pt-1">
                                        <div className="space-y-3">
                                          {platform.contentTypes.map(contentType => {
                                            const contentTypeConfig = platformConfig?.contentTypes.find(ct => ct.type === contentType);
                                            const quantity = contentTypeConfig?.quantity || 0;
                                            
                                            return (
                                              <div key={contentType} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 dark:text-slate-300">
                                                  <span className="text-lg">{CONTENT_TYPE_EMOJIS[contentType] || '📄'}</span>
                                                  <span className="capitalize">{contentType}</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 rounded-md p-0 dark:text-slate-400 dark:hover:text-white"
                                                    onClick={() => handleContentTypeQuantityChange(
                                                      platformId, 
                                                      contentType, 
                                                      Math.max(1, quantity - 1)
                                                    )}
                                                    disabled={quantity <= 1}
                                                  >
                                                    -
                                                  </Button>
                                                  <span className="w-8 text-center font-medium dark:text-white">{quantity}</span>
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 rounded-md p-0 dark:text-slate-400 dark:hover:text-white"
                                                    onClick={() => handleContentTypeQuantityChange(
                                                      platformId, 
                                                      contentType, 
                                                      Math.min(30, quantity + 1)
                                                    )}
                                                    disabled={quantity >= 30}
                                                  >
                                                    +
                                                  </Button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                          
                                          <div className="mt-5 pt-4 border-t dark:border-[#3e4a6d]">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center gap-2 dark:text-white">
                                                <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-1 shadow-sm dark:from-amber-500 dark:to-amber-600 dark:shadow-[0_0_3px_rgba(245,158,11,0.3)]">
                                                  <Sparkles className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                <h4 className="text-sm font-medium">Instrucciones Personalizadas</h4>
                                              </div>
                                              <Badge 
                                                variant="outline" 
                                                className={`text-xs ${
                                                  platformConfig.customInstructions ? 
                                                  'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300' : 
                                                  'bg-gray-50 text-gray-500 border-gray-200 dark:bg-slate-800/40 dark:border-slate-700/40 dark:text-slate-400'
                                                }`}
                                              >
                                                {platformConfig.customInstructions ? 'Personalizado' : 'Opcional'}
                                              </Badge>
                                            </div>
                                            
                                            <div className="relative group">
                                              <Textarea
                                                placeholder={`Instrucciones específicas para ${platform.name}...`}
                                                className="resize-none min-h-[100px] text-sm transition-all duration-200 hover:border-primary focus:border-primary dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white dark:hover:border-[#65cef5] dark:focus:border-[#65cef5]"
                                                value={platformConfig.customInstructions || ""}
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
                                              <div className="absolute inset-0 pointer-events-none border rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-primary dark:border-[#65cef5]"></div>
                                            </div>
                                            
                                            <div className="flex items-start gap-2 mt-3">
                                              <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                              <p className="text-xs text-muted-foreground dark:text-slate-400">
                                                Personaliza el contenido generado específicamente para {platform.name}. Puedes especificar tono, estilo, hashtags preferidos, menciones, temas a evitar, o cualquier instrucción especial.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            </div>
                          </ScrollArea>
                          
                          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300/80">
                              Ajusta la cantidad de cada tipo de contenido según tus necesidades. El calendario se generará respetando estas cantidades.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Distribución de Contenido */}
                <TabsContent value="content" className="space-y-6 p-1">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="postsDistribution"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-medium dark:text-white">Distribución de Publicaciones</FormLabel>
                          <FormDescription className="text-muted-foreground dark:text-slate-400">
                            Elige cómo quieres que se distribuyan las publicaciones a lo largo del período seleccionado.
                          </FormDescription>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div 
                              className={`rounded-lg border p-4 relative cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                                field.value === 'uniform' ? 'border-primary bg-primary/5 dark:border-[#65cef5] dark:bg-[#65cef5]/10' : 'border-gray-200 dark:border-[#3e4a6d] dark:bg-[#1e293b]'
                              }`}
                              onClick={() => form.setValue('postsDistribution', 'uniform')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium dark:text-white">Uniforme</h3>
                                {field.value === 'uniform' && (
                                  <div className="rounded-full bg-primary h-3 w-3 dark:bg-[#65cef5]"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-slate-400">Publicaciones distribuidas uniformemente a lo largo del período.</p>
                              <div className="mt-2 flex justify-between">
                                {[...Array(7)].map((_, i) => (
                                  <div key={i} className="w-2 h-10 bg-primary/30 rounded-t-sm dark:bg-[#65cef5]/30"></div>
                                ))}
                              </div>
                            </div>
                            
                            <div 
                              className={`rounded-lg border p-4 relative cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                                field.value === 'frontloaded' ? 'border-primary bg-primary/5 dark:border-[#65cef5] dark:bg-[#65cef5]/10' : 'border-gray-200 dark:border-[#3e4a6d] dark:bg-[#1e293b]'
                              }`}
                              onClick={() => form.setValue('postsDistribution', 'frontloaded')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium dark:text-white">Inicio Intensivo</h3>
                                {field.value === 'frontloaded' && (
                                  <div className="rounded-full bg-primary h-3 w-3 dark:bg-[#65cef5]"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-slate-400">Más publicaciones al inicio del período.</p>
                              <div className="mt-2 flex justify-between">
                                {[...Array(7)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-2 bg-primary/30 rounded-t-sm dark:bg-[#65cef5]/30"
                                    style={{ height: `${Math.max(3, 10 - i * 1.5)}px` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            <div 
                              className={`rounded-lg border p-4 relative cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                                field.value === 'backloaded' ? 'border-primary bg-primary/5 dark:border-[#65cef5] dark:bg-[#65cef5]/10' : 'border-gray-200 dark:border-[#3e4a6d] dark:bg-[#1e293b]'
                              }`}
                              onClick={() => form.setValue('postsDistribution', 'backloaded')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium dark:text-white">Final Intensivo</h3>
                                {field.value === 'backloaded' && (
                                  <div className="rounded-full bg-primary h-3 w-3 dark:bg-[#65cef5]"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-slate-400">Más publicaciones hacia el final del período.</p>
                              <div className="mt-2 flex justify-between">
                                {[...Array(7)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-2 bg-primary/30 rounded-t-sm dark:bg-[#65cef5]/30"
                                    style={{ height: `${Math.max(3, 3 + i * 1.5)}px` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            <div 
                              className={`rounded-lg border p-4 relative cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                                field.value === 'weekends' ? 'border-primary bg-primary/5 dark:border-[#65cef5] dark:bg-[#65cef5]/10' : 'border-gray-200 dark:border-[#3e4a6d] dark:bg-[#1e293b]'
                              }`}
                              onClick={() => form.setValue('postsDistribution', 'weekends')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium dark:text-white">Fines de Semana</h3>
                                {field.value === 'weekends' && (
                                  <div className="rounded-full bg-primary h-3 w-3 dark:bg-[#65cef5]"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-slate-400">Concentra publicaciones en sábados y domingos.</p>
                              <div className="mt-2 flex justify-between">
                                {[...Array(7)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-2 bg-primary/30 rounded-t-sm dark:bg-[#65cef5]/30"
                                    style={{ height: `${i < 5 ? 3 : 10}px` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            
                            <div 
                              className={`rounded-lg border p-4 relative cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                                field.value === 'weekdays' ? 'border-primary bg-primary/5 dark:border-[#65cef5] dark:bg-[#65cef5]/10' : 'border-gray-200 dark:border-[#3e4a6d] dark:bg-[#1e293b]'
                              }`}
                              onClick={() => form.setValue('postsDistribution', 'weekdays')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium dark:text-white">Días Laborables</h3>
                                {field.value === 'weekdays' && (
                                  <div className="rounded-full bg-primary h-3 w-3 dark:bg-[#65cef5]"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-slate-400">Concentra publicaciones de lunes a viernes.</p>
                              <div className="mt-2 flex justify-between">
                                {[...Array(7)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-2 bg-primary/30 rounded-t-sm dark:bg-[#65cef5]/30"
                                    style={{ height: `${i < 5 ? 10 : 3}px` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                      <h3 className="font-medium text-lg mb-4 flex items-center gap-2 dark:text-white">
                        <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        Previsualización de Distribución
                      </h3>
                      
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
                            <div key={day} className="text-sm font-medium dark:text-slate-400">{day}</div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {Array(28).fill(null).map((_, index) => {
                            const distribution = form.watch('postsDistribution');
                            const dayOfWeek = index % 7;
                            const weekNumber = Math.floor(index / 7);
                            
                            // Calculate post probability based on distribution pattern
                            let postProbability = 0.5; // Uniform default
                            
                            if (distribution === 'frontloaded') {
                              postProbability = 0.8 - (weekNumber * 0.2);
                            } else if (distribution === 'backloaded') {
                              postProbability = 0.2 + (weekNumber * 0.2);
                            } else if (distribution === 'weekends') {
                              postProbability = (dayOfWeek >= 5) ? 0.8 : 0.2;
                            } else if (distribution === 'weekdays') {
                              postProbability = (dayOfWeek < 5) ? 0.8 : 0.2;
                            }
                            
                            // Simulated post indicator
                            const hasPost = Math.random() < postProbability;
                            
                            return (
                              <div 
                                key={index}
                                className={`rounded-md h-12 transition-all border flex items-center justify-center text-xs ${
                                  hasPost 
                                    ? 'bg-primary/10 border-primary dark:bg-[#65cef5]/20 dark:border-[#65cef5]' 
                                    : 'bg-gray-50 border-gray-200 dark:bg-[#1e293b] dark:border-[#3e4a6d]'
                                }`}
                              >
                                <span className={hasPost ? 'dark:text-white' : 'text-muted-foreground dark:text-slate-500'}>
                                  {index + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <p className="text-sm text-muted-foreground italic dark:text-slate-400">
                          * Esta es una visualización aproximada. El calendario final puede variar.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab: Configuración Avanzada */}
                <TabsContent value="advanced" className="space-y-6 p-1">
                  <div className="space-y-6">
                    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d]">
                      <h3 className="font-medium text-lg mb-4 dark:text-white">Opciones de Contenido</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="advanced.includeCopyIn"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-[#65cef5] dark:data-[state=checked]:border-[#65cef5]"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium dark:text-white">
                                  Incluir texto integrado en diseño
                                </FormLabel>
                                <FormDescription className="text-sm dark:text-slate-400">
                                  Texto que aparecerá integrado dentro del diseño de la publicación.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeCopyOut"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-[#65cef5] dark:data-[state=checked]:border-[#65cef5]"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium dark:text-white">
                                  Incluir texto de descripción
                                </FormLabel>
                                <FormDescription className="text-sm dark:text-slate-400">
                                  Texto que se utilizará como pie de foto o descripción de la publicación.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeHashtags"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-[#65cef5] dark:data-[state=checked]:border-[#65cef5]"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium dark:text-white">
                                  Incluir hashtags
                                </FormLabel>
                                <FormDescription className="text-sm dark:text-slate-400">
                                  Generar hashtags relevantes para cada publicación.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="advanced.includeDesignInstructions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 dark:border-[#3e4a6d]">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary dark:data-[state=checked]:bg-[#65cef5] dark:data-[state=checked]:border-[#65cef5]"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium dark:text-white">
                                  Incluir instrucciones de diseño
                                </FormLabel>
                                <FormDescription className="text-sm dark:text-slate-400">
                                  Sugerencias para el departamento de diseño sobre el aspecto visual de cada publicación.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
                      <AlertTitle>Información</AlertTitle>
                      <AlertDescription className="text-sm dark:text-amber-300/80">
                        La creación avanzada de calendarios permite una mayor personalización y control sobre el contenido generado. Revisa todos los ajustes antes de generar el calendario.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Separator className="my-6 dark:bg-[#3e4a6d]" />
              
              <div className="flex justify-end space-x-4">
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
                  className="interactive-element dark:bg-[#65cef5] dark:text-[#1e293b] dark:hover:bg-[#5bb7dd] dark:font-medium"
                >
                  {isGenerating ? (
                    <>Generando Calendario...</>
                  ) : (
                    <>
                      Generar Calendario
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
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