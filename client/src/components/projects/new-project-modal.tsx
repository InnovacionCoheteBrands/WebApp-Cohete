import { useState } from "react";
import { useForm } from "react-hook-form";
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
  FormMessage
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
import { FileText, Users, Megaphone, Palette, Target, MessageSquare } from "lucide-react";

// Create schema for the form
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client: z.string().min(1, "Client name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "planning", "completed", "on_hold"]).default("planning"),
  analysisResults: z.object({
    communicationObjectives: z.string().optional(),
    buyerPersona: z.string().optional(),
    marketingStrategies: z.string().optional(), 
    brandCommunicationStyle: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    coreValues: z.string().optional(),
    responsePolicy: z.string().optional()
  }).optional()
});

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
      analysisResults: {
        communicationObjectives: "",
        buyerPersona: "",
        marketingStrategies: "",
        brandCommunicationStyle: "",
        mission: "",
        vision: "",
        coreValues: "",
        responsePolicy: ""
      }
    }
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      // Format dates if provided
      const formattedValues = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      };

      const res = await apiRequest("POST", "/api/projects", formattedValues);
      return await res.json();
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
              <TabsList className="grid w-full grid-cols-7 mb-4">
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
                        <FormLabel>Buyer Persona, Arquetipos y perfiles de consumidores</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe detalladamente los buyer personas, arquetipos y perfiles de consumidores objetivo" 
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
                        <FormLabel>Estrategias de marketing de contenido y medios digitales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define las estrategias de marketing de contenido y cómo se implementarán en medios digitales" 
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
                    name="analysisResults.responsePolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Políticas de respuesta positiva y negativa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define las políticas para manejar respuestas positivas y negativas en redes sociales y otros canales" 
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
            </Tabs>
            
            <DialogFooter className="flex items-center justify-between gap-3 pt-4 border-t mt-6">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{selectedTab === "general" ? "1" : selectedTab === "objetivos" ? "2" : selectedTab === "personas" ? "3" : selectedTab === "estrategias" ? "4" : selectedTab === "comunicacion" ? "5" : selectedTab === "mision" ? "6" : "7"}</span>
                <span>/</span>
                <span>7</span>
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