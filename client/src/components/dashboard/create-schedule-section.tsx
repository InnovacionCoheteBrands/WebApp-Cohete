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

const createScheduleSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  startDate: z.string().min(1, "Start date is required"),
  specifications: z.string().optional(),
});

export default function CreateScheduleSection() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

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
    onSuccess: (data) => {
      toast({
        title: "Schedule created",
        description: "Your content schedule has been successfully generated",
      });
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/schedules/recent"] });
      form.reset();
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

  return (
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
  );
}
