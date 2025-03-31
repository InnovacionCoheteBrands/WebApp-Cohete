import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Pencil } from "lucide-react";
import ProjectAnalysis from "@/components/projects/project-analysis";
import ProjectWorkflows from "@/components/projects/project-workflows";
import ProjectDocuments from "@/components/projects/project-documents";
import ProjectChat from "@/components/projects/project-chat";

interface ProjectDetailProps {
  id: number;
}

export default function ProjectDetail({ id }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("analysis");

  // Fetch project details with analysis
  const { 
    data: project, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/projects/${id}`],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading project",
      description: (error as Error).message,
      variant: "destructive",
    });
    navigate("/projects");
    return null;
  }

  if (!project) {
    return (
      <div className="p-4 border rounded-md bg-amber-50 text-amber-700 my-4">
        <p>Project not found</p>
        <Button variant="link" onClick={() => navigate("/projects")}>
          Return to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="border-b bg-card px-4 py-3 md:px-6 -mx-4 md:-mx-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/projects")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Schedule
            </Button>
            {user?.isPrimary && (
              <Button 
                variant="default" 
                size="sm"
                className="hidden sm:flex"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="analysis" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Project Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="workflows" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Workflows
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Chat
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="analysis" className="mt-0 pt-4">
            <ProjectAnalysis project={project} isPrimary={user?.isPrimary || false} />
          </TabsContent>
          
          <TabsContent value="workflows" className="mt-0 pt-4">
            <ProjectWorkflows projectId={id} />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 pt-4">
            <ProjectDocuments projectId={id} />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0 pt-4">
            <ProjectChat projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
