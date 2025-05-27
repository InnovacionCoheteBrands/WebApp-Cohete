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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Download, Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProjectAnalysis from "@/components/projects/project-analysis";
import ProjectWorkflows from "@/components/projects/project-workflows";
import ProjectDocuments from "@/components/projects/project-documents";
import ProjectChat from "@/components/projects/project-chat";
import ProductList from "@/components/products/product-list";
import ProjectViewContainer from "@/components/project/project-view-container";

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
  const [activeTab, setActiveTab] = useState("tasks");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    client: "",
    description: "",
    status: ""
  });

  // Mutation for updating project
  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/projects/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Proyecto actualizado",
        description: "Los datos del proyecto se han actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el proyecto.",
        variant: "destructive",
      });
    },
  });

  // Function to open edit dialog with current project data
  const handleEditProject = () => {
    if (projectData) {
      setEditFormData({
        name: projectData.name || "",
        client: projectData.client || "",
        description: projectData.description || "",
        status: projectData.status || "planning"
      });
      setIsEditDialogOpen(true);
    }
  };

  // Function to handle form submission
  const handleSaveProject = () => {
    updateProjectMutation.mutate(editFormData);
  };

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
              onClick={handleEditProject}
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
                value="tasks" 
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
              >
                Tareas
              </TabsTrigger>
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
          
          <TabsContent value="tasks" className="mt-0 pt-4">
            <ProjectViewContainer projectId={projectData.id} />
          </TabsContent>
          
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

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Cliente
              </Label>
              <Input
                id="client"
                value={editFormData.client}
                onChange={(e) => setEditFormData({...editFormData, client: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({...editFormData, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planificación</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="on_hold">En Pausa</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}