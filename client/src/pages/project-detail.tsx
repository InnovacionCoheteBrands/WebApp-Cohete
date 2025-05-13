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
import ProductList from "@/components/products/product-list";

interface ProjectDetailProps {
  id: number;
}

// Define interfaces outside of component to avoid recreation on each render
interface ProjectAnalysis {
  id: number;
  projectId: number;
  mission?: string;
  vision?: string;
  objectives?: string;
  targetAudience?: string;
  brandTone?: string;
  keywords?: string;
  coreValues?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectWithAnalysis {
  id: number;
  name: string;
  client: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  analysis?: ProjectAnalysis | null;
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
  } = useQuery<ProjectWithAnalysis>({
    queryKey: [`/api/projects/${id}`]
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error("Detailed project loading error:", error);
    toast({
      title: "Error al cargar el proyecto",
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

  // Asegurarse de que project no sea indefinido y tenga las propiedades necesarias
  const projectData = project || {
    name: 'Cargando...',
    client: '',
    description: '',
    analysis: null
  };

  console.log('Project render data:', projectData);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/projects")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{projectData.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Calendario
          </Button>
          {user?.isPrimary && (
            <Button 
              variant="default" 
              size="sm"
              className="hidden sm:flex"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar Proyecto
            </Button>
          )}
        </div>
      </div>

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
                value="products" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Productos
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
            <ProjectAnalysis project={projectData} isPrimary={user?.isPrimary || false} />
          </TabsContent>
          
          <TabsContent value="workflows" className="mt-0 pt-4">
            <ProjectWorkflows projectId={projectData.id} />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 pt-4">
            <ProjectDocuments projectId={projectData.id} />
          </TabsContent>
          
          <TabsContent value="products" className="mt-0 pt-4">
            <ProductList projectId={projectData.id} />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0 pt-4">
            <ProjectChat projectId={projectData.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}