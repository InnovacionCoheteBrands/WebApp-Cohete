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
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Create Quick Schedule</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Project</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={projectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a project" />
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
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any specific requirements or notes..." 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isGenerating || createScheduleMutation.isPending}
                  >
                    {isGenerating || createScheduleMutation.isPending
                      ? "Generating Schedule..."
                      : "Generate Schedule"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="rounded-md border bg-muted p-4">
              <h3 className="mb-3 font-medium">Schedule Preview</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Select a project and specify details to generate a content schedule using AI.</p>
                <p>Your schedule will include:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Optimal posting times</li>
                  <li>Content themes and topics</li>
                  <li>Caption suggestions</li>
                  <li>Hashtag recommendations</li>
                  <li>Visual content ideas</li>
                </ul>
                <p className="mt-4 italic">
                  The AI will analyze your project data to create a tailored schedule that aligns with your marketing goals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de cronograma generado */}
      {generatedSchedule && generatedSchedule.entries.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Schedule: {generatedSchedule.name}
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`/schedules/${generatedSchedule.id}`, '_blank')}
                >
                  Ver Completo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=excel`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1" 
                  onClick={() => window.open(`/api/schedules/${generatedSchedule.id}/download?format=pdf`, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  PDF
                </Button>
                <Badge variant="outline" className="px-3 py-1">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                  {generatedSchedule.entries.length} posts
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[450px] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[250px]">Título</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Texto en Diseño</TableHead>
                    <TableHead className="text-right">Imagen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedSchedule.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Share2 className="w-3.5 h-3.5 mr-1" />
                          {entry.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(entry.postDate)}</TableCell>
                      <TableCell>{entry.postTime}</TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {entry.copyIn}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.referenceImageUrl ? (
                          <img 
                            src={entry.referenceImageUrl} 
                            alt={entry.title}
                            className="inline-block w-10 h-10 object-cover rounded-md"
                          />
                        ) : (
                          "Pendiente"
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
