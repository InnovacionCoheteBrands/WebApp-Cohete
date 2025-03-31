import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  SelectValue,
} from "@/components/ui/select";

interface ProjectAnalysisProps {
  project: any;
  isPrimary: boolean;
}

// Analysis schema for form validation
const analysisSchema = z.object({
  mission: z.string().optional(),
  vision: z.string().optional(),
  objectives: z.string().optional(),
  targetAudience: z.string().optional(),
  brandTone: z.string().optional(),
  keywords: z.string().optional(),
  coreValues: z.string().optional(),
});

export default function ProjectAnalysis({ project, isPrimary }: ProjectAnalysisProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get analysis data from project
  const analysisData = project?.analysis || {};

  // Initialize form with project analysis data
  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      mission: analysisData.mission || "",
      vision: analysisData.vision || "",
      objectives: analysisData.objectives || "",
      targetAudience: analysisData.targetAudience || "",
      brandTone: analysisData.brandTone || "",
      keywords: analysisData.keywords || "",
      coreValues: analysisData.coreValues || "",
    }
  });

  // Update analysis mutation
  const updateAnalysisMutation = useMutation({
    mutationFn: async (values: z.infer<typeof analysisSchema>) => {
      const res = await apiRequest("PATCH", `/api/projects/${project.id}/analysis`, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis updated",
        description: "Project analysis has been updated successfully",
      });
      // Invalidate project query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating analysis",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof analysisSchema>) => {
    updateAnalysisMutation.mutate(values);
  };

  // Check if analysis exists
  const hasAnalysis = analysisData && Object.keys(analysisData).length > 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Analysis</h2>
        {isPrimary && !isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Analysis</span>
          </Button>
        )}
        {isPrimary && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateAnalysisMutation.isPending}
            >
              {updateAnalysisMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {!hasAnalysis && !isEditing ? (
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
          <p className="text-muted-foreground mb-6">
            This project doesn't have any analysis information yet.
          </p>
          {isPrimary && (
            <Button onClick={() => setIsEditing(true)}>
              Add Project Analysis
            </Button>
          )}
        </div>
      ) : isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Client Information */}
              <Card>
                <CardContent className="pt-6">
                  <CardTitle className="mb-4 text-lg">Client Information</CardTitle>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Client Name</div>
                      <div className="mt-1">{project.client}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Project Duration</div>
                      <div className="mt-1">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} 
                        {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Project Description</div>
                      <div className="mt-1">{project.description || 'No description provided'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Positioning */}
              <Card>
                <CardContent className="pt-6">
                  <CardTitle className="mb-4 text-lg">Brand Positioning</CardTitle>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mission</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brand mission statement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vision</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brand vision statement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="coreValues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Core Values</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Transparency, Innovation, Quality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Objectives */}
              <Card>
                <CardContent className="pt-6">
                  <CardTitle className="mb-4 text-lg">Marketing Objectives</CardTitle>
                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter marketing objectives" 
                            rows={6} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Target Audience */}
              <Card>
                <CardContent className="pt-6">
                  <CardTitle className="mb-4 text-lg">Target Audience</CardTitle>
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your target audience" 
                            rows={6} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Content Strategy */}
              <Card className="lg:col-span-2">
                <CardContent className="pt-6">
                  <CardTitle className="mb-4 text-lg">Content Strategy</CardTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="brandTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Tone</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="funny">Funny/Humorous</SelectItem>
                              <SelectItem value="serious">Serious</SelectItem>
                              <SelectItem value="inspirational">Inspirational</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter comma-separated keywords" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Client Information */}
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3 text-lg">Client Information</CardTitle>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Client Name</div>
                  <div className="mt-1">{project.client}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Project Duration</div>
                  <div className="mt-1">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} 
                    {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Project Description</div>
                  <div className="mt-1">{project.description || 'No description provided'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Positioning */}
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3 text-lg">Brand Positioning</CardTitle>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Mission</div>
                  <div className="mt-1">{analysisData.mission || 'Not defined'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Vision</div>
                  <div className="mt-1">{analysisData.vision || 'Not defined'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Core Values</div>
                  <div className="mt-1">{analysisData.coreValues || 'Not defined'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Objectives */}
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3 text-lg">Marketing Objectives</CardTitle>
              <div className="space-y-2">
                {analysisData.objectives ? (
                  analysisData.objectives.split('\n').map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <path d="m9 11 3 3L22 4"></path>
                        </svg>
                      </div>
                      <div>{objective}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No objectives defined</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardContent className="pt-6">
              <CardTitle className="mb-3 text-lg">Target Audience</CardTitle>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Primary Audience</div>
                  <div className="mt-1">{analysisData.targetAudience || 'Not defined'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Themes & Keywords */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <CardTitle className="mb-3 text-lg">Content Themes & Keywords</CardTitle>
              <div className="mt-2 flex flex-wrap gap-1">
                {analysisData.keywords ? 
                  analysisData.keywords.split(',').map((keyword: string, index: number) => (
                    <Badge key={index} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {keyword.trim()}
                    </Badge>
                  )) : 
                  <div className="text-muted-foreground">No keywords defined</div>
                }
              </div>
              {analysisData.brandTone && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-muted-foreground">Brand Tone</div>
                  <div className="mt-1 capitalize">{analysisData.brandTone}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
