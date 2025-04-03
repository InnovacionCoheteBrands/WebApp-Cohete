import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Bot, SendHorizontal, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  projectId?: number;
  createdAt?: Date;
}

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Fetch all projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isOpen,
  });

  // Fetch chat history for selected project
  // Note: Using array format in queryKey for proper cache invalidation
  const { data: chatHistory, isLoading: isChatHistoryLoading } = useQuery({
    queryKey: ['/api/projects', selectedProject, 'chat'],
    enabled: isOpen && selectedProject !== null,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    placeholderData: [] as ChatMessage[]
  });

  // Update messages when chat history loads
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setChatMessages(chatHistory);
    } else if (selectedProject !== null) {
      // Reset chat if there's no history but a project is selected
      setChatMessages([
        {
          role: "assistant",
          content: "¡Hola! Soy Cohete Copilot. ¿En qué puedo ayudarte con este proyecto?"
        }
      ]);
    }
  }, [chatHistory, selectedProject]);

  // Mutation for sending chat messages
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; projectId: number }) => {
      try {
        // Usar apiRequest en lugar de fetch directo
        const response = await apiRequest("POST", "/api/chat", data);
        return await response.json();
      } catch (error) {
        console.error("Error en mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (responseData: ChatMessage) => {
      // Invalidate chat history query to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['/api/projects', selectedProject, 'chat'] 
      });
    },
    onError: (error) => {
      console.error("Error al enviar mensaje:", error);
      
      // Mostrar un mensaje más específico según el error
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        toast({
          title: "Error de autenticación",
          description: "Por favor, vuelve a iniciar sesión para continuar",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al enviar mensaje",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
      const scrollContainer = viewportRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(Number(projectId));
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedProject) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      projectId: selectedProject
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setMessage("");

    // Send message to API
    sendMessageMutation.mutate({
      message: message,
      projectId: selectedProject
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 z-50 h-full w-[400px] max-w-[90vw] bg-background shadow-xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Cohete Copilot</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Select value={selectedProject?.toString()} onValueChange={handleProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proyecto para consultar" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {selectedProject ? (
          <div className="flex flex-col h-[calc(100%-72px)]">
            <div className="flex-1 relative overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div ref={viewportRef} className="pb-4">
                  {isChatHistoryLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, index) => (
                        <Card
                          key={index}
                          className={`mb-3 p-3 max-w-[85%] ${
                            msg.role === "user"
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "mr-auto bg-muted"
                          }`}
                        >
                          {msg.content && msg.content.split("\n").map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>
                              {line}
                            </p>
                          ))}
                          {!msg.content && <p>No se pudo cargar el mensaje</p>}
                        </Card>
                      ))}
                      {sendMessageMutation.isPending && (
                        <Card className="mb-3 p-3 max-w-[85%] mr-auto bg-muted">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Pensando...</span>
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border-t mt-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu pregunta..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-[calc(100%-72px)] p-6">
            <Bot className="h-16 w-16 mb-4 text-primary opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
            <p className="text-muted-foreground">
              Elige un proyecto para comenzar una conversación con Cohete Copilot.
            </p>
          </div>
        )}
      </div>
    </>
  );
}