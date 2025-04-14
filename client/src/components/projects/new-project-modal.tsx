import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Megaphone, Palette, Target, MessageSquare, Package, ShoppingBag, Plus, Trash2, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

// Definición de tipos para arquetipos
interface Archetype {
  name: string;
  profile: string;
}

// Definición de tipos para el detalle de cada formato de contenido
interface ContentTypeDetail {
  name: string;
  count: number;
}

// Definición de tipos para redes sociales
interface SocialNetwork {
  name: string;
  selected: boolean;
  contentTypes: string[];
  contentTypeDetails: ContentTypeDetail[];
  postsPerMonth: number;
}

// Definición de tipos para políticas de respuesta
interface ResponsePolicies {
  positive: string;
  negative: string;
}

// Esquema para productos iniciales
const initialProductSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  description: z.string().optional(),
  file: z.any().optional(), // Para la imagen
});

// Create schema for the form
const projectSchema = z.object({
  name: z.string().min(1, "El nombre del proyecto es requerido"),
  client: z.string().min(1, "El nombre del cliente es requerido"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "planning", "completed", "on_hold"]).default("planning"),
  initialProducts: z.array(initialProductSchema).optional(),
  analysisResults: z.object({
    communicationObjectives: z.string().optional(),
    buyerPersona: z.string().optional(),
    archetypes: z.array(
      z.object({
        name: z.string().optional(),
        profile: z.string().optional(),
      })
    ).optional(),
    socialNetworks: z.array(
      z.object({
        name: z.string(),
        selected: z.boolean().optional(),
        contentTypes: z.array(z.string()).optional(),
        contentTypeDetails: z.array(
          z.object({
            name: z.string(),
            count: z.number().int().min(0)
          })
        ).optional(),
        postsPerMonth: z.number().int().min(0).optional(),
      })
    ).optional(),
    marketingStrategies: z.string().optional(), 
    brandCommunicationStyle: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    coreValues: z.string().optional(),
    responsePolicyPositive: z.string().optional(),
    responsePolicyNegative: z.string().optional()
  }).optional()
});

// Lista predefinida de redes sociales y sus tipos de contenido
const socialNetworksOptions = [
  { 
    name: "Facebook", 
    icon: <Facebook className="h-4 w-4 mr-2" />,
    contentTypes: ["Publicaciones de texto", "Imágenes", "Videos", "Historias", "Transmisiones en vivo", "Eventos", "Grupos"]
  },
  { 
    name: "Instagram", 
    icon: <Instagram className="h-4 w-4 mr-2" />,
    contentTypes: ["Publicaciones en Feed", "Stories", "Reels", "IGTV", "Transmisiones en vivo", "Guías"]
  },
  { 
    name: "Twitter", 
    icon: <Twitter className="h-4 w-4 mr-2" />,
    contentTypes: ["Tweets", "Hilos", "Espacios", "Momentos", "Encuestas"]
  },
  { 
    name: "YouTube", 
    icon: <Youtube className="h-4 w-4 mr-2" />,
    contentTypes: ["Videos largos", "Shorts", "Transmisiones en vivo", "Comunidad", "Playlists"]
  },
  { 
    name: "LinkedIn", 
    icon: <Linkedin className="h-4 w-4 mr-2" />,
    contentTypes: ["Publicaciones de texto", "Artículos", "Documentos", "Videos", "Eventos", "Encuestas"]
  },
  { 
    name: "TikTok", 
    icon: <Megaphone className="h-4 w-4 mr-2" />,
    contentTypes: ["Videos cortos", "Transmisiones en vivo", "Duetos", "Stitch", "Efectos"]
  }
];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("general");

  // Initialize form
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      client: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "planning",
      initialProducts: [],
      analysisResults: {
        communicationObjectives: "",
        buyerPersona: "",
        archetypes: [{ name: "", profile: "" }],
        socialNetworks: socialNetworksOptions.map(network => ({
          name: network.name,
          selected: false,
          contentTypes: [],
          contentTypeDetails: network.contentTypes.map(type => ({
            name: type,
            count: 0
          })),
          postsPerMonth: 0
        })),
        marketingStrategies: "",
        brandCommunicationStyle: "",
        mission: "",
        vision: "",
        coreValues: "",
        responsePolicyPositive: "",
        responsePolicyNegative: ""
      }
    }
  });
  
  // Setup field arrays for arquetipos
  const archetypesFieldArray = useFieldArray({
    control: form.control,
    name: "analysisResults.archetypes"
  });
  
  // Setup field arrays for initial products
  const productsFieldArray = useFieldArray({
    control: form.control,
    name: "initialProducts"
  });
  
  // State for managing file inputs in each product form
  const [productFiles, setProductFiles] = useState<Record<number, File | null>>({});

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      // Format dates if provided
      const formattedValues = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        // Remove the file objects from products since they'll be uploaded separately
        initialProducts: values.initialProducts ? values.initialProducts.map(product => ({
          ...product,
          file: undefined
        })) : undefined
      };

      const res = await apiRequest("POST", "/api/projects", formattedValues);
      const projectData = await res.json();
      
      // Si el proyecto se creó exitosamente y hay productos con imágenes, subir las imágenes
      if (projectData && projectData.id && values.initialProducts?.length) {
        const projectId = projectData.id;
        
        // Crear los productos uno por uno con sus imágenes
        for (let i = 0; i < values.initialProducts.length; i++) {
          const product = values.initialProducts[i];
          const file = productFiles[i];
          
          if (product.name) {
            // Crear FormData para enviar la imagen junto con los datos del producto
            const formData = new FormData();
            formData.append('name', product.name);
            if (product.description) formData.append('description', product.description);
            if (file) formData.append('image', file);
            
            // Crear producto con imagen
            await fetch(`/api/projects/${projectId}/products`, {
              method: 'POST',
              body: formData
            });
          }
        }
      }
      
      return projectData;
    },
    onSuccess: () => {
      toast({
        title: "Proyecto creado",
        description: "Tu nuevo proyecto ha sido creado exitosamente",
      });
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      // Reset form and close modal
      form.reset();
      setProductFiles({});
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error al crear proyecto",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    createProjectMutation.mutate(values);
  };

  // Clean form data and close modal
  const handleClose = () => {
    if (!createProjectMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Crear Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-8 mb-4">
                <TabsTrigger value="general" className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">General</span>
                </TabsTrigger>
                <TabsTrigger value="objetivos" className="flex flex-col items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Objetivos</span>
                </TabsTrigger>
                <TabsTrigger value="personas" className="flex flex-col items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Persona</span>
                </TabsTrigger>
                <TabsTrigger value="estrategias" className="flex flex-col items-center gap-1">
                  <Megaphone className="h-4 w-4" />
                  <span className="text-xs">Estrategias</span>
                </TabsTrigger>
                <TabsTrigger value="comunicacion" className="flex flex-col items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="text-xs">Comunicación</span>
                </TabsTrigger>
                <TabsTrigger value="mision" className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">MVV</span>
                </TabsTrigger>
                <TabsTrigger value="politicas" className="flex flex-col items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Políticas</span>
                </TabsTrigger>
                <TabsTrigger value="productos" className="flex flex-col items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-xs">Productos</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: General Information */}
              <TabsContent value="general" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Información General</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Proyecto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa el nombre del proyecto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa el nombre del cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingresa la descripción del proyecto" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Finalización</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el estado del proyecto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planning">Planeación</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="on_hold">En Pausa</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Objetivos generales de comunicación */}
              <TabsContent value="objetivos" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">1. Objetivos generales de comunicación</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.communicationObjectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivos generales de comunicación</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define los objetivos generales de comunicación para este proyecto" 
                            rows={6} 
                            {...field} 
                            value={field.value || ""}
                            className="min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Buyer Persona/Arquetipos */}
              <TabsContent value="personas" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">2. Buyer Persona, Arquetipos y perfiles de consumidores</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.buyerPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción General del Buyer Persona</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe la visión general del buyer persona objetivo" 
                            rows={4} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium">Arquetipos</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => archetypesFieldArray.append({ name: "", profile: "" })}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar Arquetipo</span>
                      </Button>
                    </div>
                    
                    <FormDescription>
                      Agrega aquí los diferentes arquetipos de consumidores, con su nombre y descripción del perfil.
                    </FormDescription>
                    
                    {archetypesFieldArray.fields.map((field, index) => (
                      <Card key={field.id} className="mb-4">
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">Arquetipo {index + 1}</CardTitle>
                            {archetypesFieldArray.fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => archetypesFieldArray.remove(index)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="py-0 space-y-3">
                          <FormField
                            control={form.control}
                            name={`analysisResults.archetypes.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Arquetipo</FormLabel>
                                <FormControl>
                                  <Input placeholder="ej. Madre Protectora, Héroe, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`analysisResults.archetypes.${index}.profile`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Perfil</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe este perfil de consumidor" 
                                    rows={3}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Estrategias de marketing */}
              <TabsContent value="estrategias" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">3. Estrategias de marketing de contenido y medios digitales</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.marketingStrategies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrategias de marketing de contenido</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define las estrategias de marketing de contenido" 
                            rows={4} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="text-md font-medium">Redes Sociales y Tipos de Contenido</h3>
                    <FormDescription>
                      Selecciona las redes sociales que utilizarás en este proyecto y los tipos de contenido para cada una.
                    </FormDescription>
                    
                    <div className="space-y-6">
                      {socialNetworksOptions.map((network, networkIndex) => (
                        <div key={network.name} className="space-y-3 p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <FormField
                                control={form.control}
                                name={`analysisResults.socialNetworks.${networkIndex}.selected`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox 
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="flex items-center">
                                      {network.icon}
                                      <FormLabel className="font-medium">{network.name}</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`analysisResults.socialNetworks.${networkIndex}.postsPerMonth`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                  <FormLabel className="text-sm whitespace-nowrap">
                                    Publicaciones por mes:
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="w-20"
                                      disabled={!form.watch(`analysisResults.socialNetworks.${networkIndex}.selected`)}
                                      {...field}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        field.onChange(isNaN(value) ? 0 : value);
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="pl-6">
                            <FormField
                              control={form.control}
                              name={`analysisResults.socialNetworks.${networkIndex}.contentTypes`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-2 gap-2">
                                    {network.contentTypes.map((contentType) => (
                                      <FormItem
                                        key={contentType}
                                        className="flex flex-row items-start space-x-2 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(contentType)}
                                            onCheckedChange={(checked) => {
                                              const currentValue = field.value || [];
                                              if (checked) {
                                                field.onChange([...currentValue, contentType]);
                                              } else {
                                                field.onChange(currentValue.filter(v => v !== contentType));
                                              }
                                            }}
                                            disabled={!form.watch(`analysisResults.socialNetworks.${networkIndex}.selected`)}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {contentType}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Líneas y estilo de comunicación */}
              <TabsContent value="comunicacion" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">4. Líneas y estilo de comunicación de la marca</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.brandCommunicationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Líneas y estilo de comunicación de la marca</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe las líneas de comunicación y el estilo que debe mantener la marca" 
                            rows={6} 
                            {...field} 
                            value={field.value || ""}
                            className="min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 6: Misión, visión y valores */}
              <TabsContent value="mision" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">5. Misión, visión y valores</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Misión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Define la misión de la marca o empresa"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visión</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Define la visión de la marca o empresa"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.coreValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valores</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Lista los valores fundamentales de la marca"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 7: Políticas de respuesta */}
              <TabsContent value="politicas" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">6. Políticas de respuesta positiva y negativa</h2>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.responsePolicyPositive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Política de respuesta positiva</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define las políticas para manejar respuestas positivas en redes sociales y otros canales" 
                            rows={4} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="analysisResults.responsePolicyNegative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Política de respuesta negativa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define las políticas para manejar respuestas negativas o críticas en redes sociales y otros canales" 
                            rows={4} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab 8: Productos */}
              <TabsContent value="productos" className="space-y-4 pt-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">7. Productos</h2>
                  <Separator />
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium">Productos Iniciales</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => productsFieldArray.append({ 
                          name: "", 
                          description: ""
                        })}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar Producto</span>
                      </Button>
                    </div>
                    
                    <FormDescription>
                      Agrega los productos iniciales relacionados con este proyecto.
                    </FormDescription>
                    
                    {productsFieldArray.fields.map((field, index) => (
                      <Card key={field.id} className="mb-4">
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">Producto {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                productsFieldArray.remove(index);
                                setProductFiles(prev => {
                                  const newFiles = {...prev};
                                  delete newFiles[index];
                                  return newFiles;
                                });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="py-0 space-y-3">
                          <FormField
                            control={form.control}
                            name={`initialProducts.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Producto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre del producto" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`initialProducts.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descripción del producto" 
                                    rows={3}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Los campos de SKU y precio se han eliminado ya que no son necesarios para el contexto de la IA */}
                          
                          <FormItem>
                            <FormLabel>Imagen del Producto</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setProductFiles(prev => ({
                                    ...prev,
                                    [index]: file
                                  }));
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Sube una imagen para este producto. La imagen se guardará cuando se cree el proyecto.
                            </FormDescription>
                          </FormItem>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex items-center justify-between gap-3 pt-4 border-t mt-6">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{selectedTab === "general" ? "1" : selectedTab === "objetivos" ? "2" : selectedTab === "personas" ? "3" : selectedTab === "estrategias" ? "4" : selectedTab === "comunicacion" ? "5" : selectedTab === "mision" ? "6" : selectedTab === "politicas" ? "7" : "8"}</span>
                <span>/</span>
                <span>8</span>
              </div>
              <div className="flex items-center gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creando..." : "Crear Proyecto"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}