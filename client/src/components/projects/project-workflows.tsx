import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MessageSquare, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ScheduleEntry {
  id: number;
  title: string;
  description: string;
  content: string;
  platform: string;
  postDate: string;
  postTime: string;
  hashtags: string;
  referenceImagePrompt?: string;
  referenceImageUrl?: string;
}

interface Schedule {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  specifications?: string;
  createdAt: string;
  entries: ScheduleEntry[];
}

interface ProjectWorkflowsProps {
  projectId: number;
}

export default function ProjectWorkflows({ projectId }: ProjectWorkflowsProps) {
  const { toast } = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<number | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Fetch schedules for the project
  const { data: schedules, isLoading, error } = useQuery<Schedule[]>({
    queryKey: [`/api/projects/${projectId}/schedules`],
    staleTime: 60000,
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/schedule-entries/${entryId}/generate-image`,
        {}
      );
      return await res.json();
    },
    onMutate: (entryId) => {
      setIsGeneratingImage(entryId);
    },
    onSuccess: (data) => {
      toast({
        title: "Image Generated",
        description: "Reference image has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/schedules`] });
      setSelectedEntry(data);
      setImageDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error generating image",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGeneratingImage(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <p>Error loading schedules: {(error as Error).message}</p>
      </div>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <h3 className="text-lg font-medium mb-2">No Schedules Available</h3>
        <p className="text-muted-foreground mb-6">
          There are no content schedules for this project yet.
        </p>
        <p className="text-sm text-muted-foreground">
          You can create a new schedule from the Dashboard's "Create Quick Schedule" section.
        </p>
      </div>
    );
  }

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleGenerateImage = (entry: ScheduleEntry) => {
    setSelectedEntry(entry);
    if (!entry.referenceImageUrl) {
      generateImageMutation.mutate(entry.id);
    } else {
      setImageDialogOpen(true);
    }
  };

  // Platform badges
  const getPlatformBadge = (platform: string) => {
    const platformColors: Record<string, string> = {
      Instagram: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Twitter: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
      LinkedIn: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      TikTok: "bg-black text-white dark:bg-gray-700 dark:text-gray-300",
      default: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300"
    };

    return (
      <Badge 
        variant="outline" 
        className={platformColors[platform] || platformColors.default}
      >
        {platform}
      </Badge>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Schedules</h2>
      </div>

      {selectedSchedule ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{selectedSchedule.name}</h3>
              <p className="text-sm text-muted-foreground">
                Created on {format(parseISO(selectedSchedule.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
              Back to All Schedules
            </Button>
          </div>

          {selectedSchedule.specifications && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Schedule Specifications</h4>
                <p className="text-sm text-muted-foreground">{selectedSchedule.specifications}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {selectedSchedule.entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    {getPlatformBadge(entry.platform)}
                  </div>
                  <CardDescription>
                    {format(parseISO(entry.postDate), "EEEE, MMMM d, yyyy")} at {entry.postTime}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  {entry.description && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Content</h4>
                    <div className="p-3 bg-muted/30 rounded-md text-sm">
                      {entry.content}
                    </div>
                  </div>
                  {entry.hashtags && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Hashtags</h4>
                      <div className="flex flex-wrap gap-1">
                        {entry.hashtags.split(/[\s,]+/).filter(Boolean).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t p-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    disabled={isGeneratingImage === entry.id}
                    onClick={() => handleGenerateImage(entry)}
                  >
                    {isGeneratingImage === entry.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        <span>{entry.referenceImageUrl ? "View Image" : "Generate Image"}</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{schedule.name}</CardTitle>
                <CardDescription>
                  Created {format(parseISO(schedule.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="text-sm text-muted-foreground mb-4">
                  {schedule.entries.length} content items
                </div>
                <div className="space-y-3">
                  {schedule.entries.slice(0, 2).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 rounded-md border p-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{entry.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {format(parseISO(entry.postDate), "MMM d, yyyy")} • {entry.platform}
                        </div>
                      </div>
                    </div>
                  ))}
                  {schedule.entries.length > 2 && (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      +{schedule.entries.length - 2} more items
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-3 border-t mt-4">
                <Button variant="outline" size="sm" onClick={() => handleViewSchedule(schedule)}>
                  View Schedule
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reference Image</DialogTitle>
            {selectedEntry?.referenceImagePrompt && (
              <DialogDescription>
                {selectedEntry.referenceImagePrompt}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedEntry?.referenceImageUrl ? (
            <div className="flex justify-center">
              <img 
                src={selectedEntry.referenceImageUrl} 
                alt={selectedEntry.title} 
                className="max-h-[400px] rounded-md object-contain" 
              />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
