import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X } from "lucide-react";

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
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

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
        title: "Project created",
        description: "Your new project has been created successfully",
      });
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      // Reset form and close modal
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
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
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter project description" 
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
                    <FormLabel>Start Date</FormLabel>
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
                    <FormLabel>End Date (Optional)</FormLabel>
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
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Accordion
              type="single"
              collapsible
              value={isAnalysisOpen ? "analysis" : ""}
              onValueChange={(val) => setIsAnalysisOpen(val === "analysis")}
              className="border rounded-md"
            >
              <AccordionItem value="analysis" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium">
                  Initial Project Analysis (Optional)
                </AccordionTrigger>
                <AccordionContent className="border-t px-4 py-3 space-y-3">
                  {/* 1. Objetivos generales de comunicación */}
                  <FormField
                    control={form.control}
                    name="analysisResults.communicationObjectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivos generales de comunicación</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe los objetivos generales de comunicación" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 2. Buyer Persona, Arquetipos y perfiles de consumidores */}
                  <FormField
                    control={form.control}
                    name="analysisResults.buyerPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer Persona, Arquetipos y perfiles de consumidores</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe el buyer persona, arquetipos y perfiles de consumidores" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 3. Estrategias de marketing de contenido y medios digitales */}
                  <FormField
                    control={form.control}
                    name="analysisResults.marketingStrategies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrategias de marketing de contenido y medios digitales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe las estrategias de marketing de contenido y medios digitales" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 4. Líneas y estilo de comunicación de la marca */}
                  <FormField
                    control={form.control}
                    name="analysisResults.brandCommunicationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Líneas y estilo de comunicación de la marca</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe las líneas y estilo de comunicación de la marca" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 5. Misión, visión y valores */}
                  <div className="space-y-3 border rounded-md p-3">
                    <h3 className="font-medium">Misión, visión y valores</h3>
                    
                    <FormField
                      control={form.control}
                      name="analysisResults.mission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Misión</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingresa la misión de la marca" {...field} value={field.value || ""} />
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
                            <Input placeholder="Ingresa la visión de la marca" {...field} value={field.value || ""} />
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
                            <Input 
                              placeholder="Ingresa los valores fundamentales de la marca" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* 6. Políticas de respuesta positiva y negativa (Opcional) */}
                  <FormField
                    control={form.control}
                    name="analysisResults.responsePolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Políticas de respuesta positiva y negativa (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe las políticas de respuesta positiva y negativa" 
                            rows={3} 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <DialogFooter className="flex items-center justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
