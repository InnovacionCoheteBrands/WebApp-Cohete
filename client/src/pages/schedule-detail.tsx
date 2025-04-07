import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Schedule, ScheduleEntry } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Components
import { Loader2, Share2, Download, Copy, Clipboard, Calendar, Clock, ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ScheduleDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<number | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // Fetch schedule data
  const { data: schedule, isLoading, error } = useQuery<Schedule & { entries: ScheduleEntry[] }>({
    queryKey: [`/api/schedules/${id}`],
    refetchOnMount: true,
    // Aseguramos que se carguen los datos cada vez que se monta el componente
  });
  
  // Mutation para generar imagen
  const generateImageMutation = useMutation({
    mutationFn: async (entryId: number) => {
      setIsGeneratingImage(entryId);
      const response = await apiRequest("POST", `/api/schedule-entries/${entryId}/generate-image`, {});
      return response.json();
    },
    onSuccess: (data) => {
      // Actualiza la caché para reflejar la nueva imagen
      queryClient.invalidateQueries({ queryKey: [`/api/schedules/${id}`] });
      
      toast({
        title: "Imagen generada",
        description: "La imagen de referencia ha sido generada correctamente",
      });
      
      setImageDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error al generar imagen",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGeneratingImage(null);
    }
  });

  // Formatear fecha
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Copiar texto al portapapeles
  const copyToClipboard = (text: string | null, description: string) => {
    if (!text) {
      toast({
        title: "Error al copiar",
        description: "No hay texto para copiar",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(text);
    toast({
      title: "Texto copiado",
      description: `${description} copiado al portapapeles`,
    });
  };

  // Descargar la imagen
  const downloadImage = (url: string, title: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        toast({
          title: "Error al descargar",
          description: "No se pudo descargar la imagen",
          variant: "destructive"
        });
      });
  };
  
  // Manejar la generación o visualización de la imagen
  const handleImageAction = (entry: ScheduleEntry) => {
    setSelectedEntry(entry);
    if (!entry.referenceImageUrl) {
      generateImageMutation.mutate(entry.id);
    } else {
      setImageDialogOpen(true);
    }
  };
  
  // Regenerar una imagen existente
  const handleRegenerateImage = () => {
    if (selectedEntry) {
      generateImageMutation.mutate(selectedEntry.id);
    }
  };
  
  // Función para determinar el formato según la plataforma
  const getFormatByPlatform = (platform: string | null): string => {
    if (!platform) return 'Formato estándar';
    const formats: Record<string, string> = {
      'Instagram': 'Carrusel/Reels • 9:16 o 1:1',
      'Facebook': 'Imagen/Video • 16:9 o 1:1',
      'Twitter': 'Imagen/GIF • 16:9',
      'LinkedIn': 'Imagen/Artículo • 16:9 o 1:1',
      'TikTok': 'Video • 9:16 vertical',
      'YouTube': 'Video • 16:9 horizontal',
      'Pinterest': 'Pin • 2:3 vertical',
      'WhatsApp': 'Imagen/Video • 1:1 o 9:16'
    };
    
    return formats[platform] || 'Formato estándar';
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="h-[50vh] w-full flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-medium">Error al cargar el cronograma</h2>
        <p className="text-muted-foreground">
          No se pudo cargar la información del cronograma. Intente nuevamente más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{schedule.name}</h1>
          <p className="text-muted-foreground mt-1">
            Fecha de inicio: {formatDate(schedule.startDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open(`/api/schedules/${id}/download?format=excel`, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open(`/api/schedules/${id}/download?format=pdf`, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista de entradas */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Entradas ({schedule.entries.length})</CardTitle>
              <CardDescription>
                Lista de publicaciones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {schedule.entries.map((entry) => (
                    <Card 
                      key={entry.id}
                      className={`cursor-pointer transition-all ${selectedEntry?.id === entry.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm">{entry.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                <Share2 className="w-3 h-3 mr-1" />
                                {entry.platform}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(entry.postDate)}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {entry.postTime}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted/50 rounded-sm">
                                {getFormatByPlatform(entry.platform)}
                              </span>
                            </div>
                          </div>
                          {entry.referenceImageUrl && (
                            <img 
                              src={entry.referenceImageUrl} 
                              alt={entry.title}
                              className="w-14 h-14 object-cover rounded-md"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detalle de entrada seleccionada */}
        <div className="md:col-span-2">
          {selectedEntry ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedEntry.title}</CardTitle>
                    <CardDescription>
                      {selectedEntry.platform} • {formatDate(selectedEntry.postDate)} • {selectedEntry.postTime}
                    </CardDescription>
                  </div>
                  {selectedEntry.referenceImageUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadImage(selectedEntry.referenceImageUrl!, selectedEntry.title)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Imagen
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Formato de Publicación</h3>
                      <Badge variant="outline">{getFormatByPlatform(selectedEntry.platform)}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Texto en Diseño</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedEntry.copyIn, "Texto en diseño")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedEntry.copyIn}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Texto Descripción</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedEntry.copyOut, "Texto descripción")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedEntry.copyOut}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Instrucciones de Diseño</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedEntry.designInstructions, "Instrucciones de diseño")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedEntry.designInstructions}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Hashtags</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(selectedEntry.hashtags, "Hashtags")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedEntry.hashtags}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Imagen Referencia</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={isGeneratingImage === selectedEntry.id}
                      onClick={handleRegenerateImage}
                    >
                      {isGeneratingImage === selectedEntry.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generando...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          <span>Regenerar Imagen</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {selectedEntry.referenceImageUrl ? (
                    <div className="w-full flex justify-center">
                      <img 
                        src={selectedEntry.referenceImageUrl} 
                        alt={selectedEntry.title}
                        className="max-h-[300px] object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center bg-muted/30 border border-dashed rounded-lg h-[200px]">
                      <p className="text-muted-foreground mb-4">No hay imagen de referencia disponible</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isGeneratingImage === selectedEntry.id}
                        onClick={handleRegenerateImage}
                      >
                        {isGeneratingImage === selectedEntry.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            <span>Generar Imagen</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {selectedEntry.referenceImagePrompt && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-1">Prompt Generación</h4>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <p className="whitespace-pre-wrap">{selectedEntry.referenceImagePrompt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-muted rounded-lg p-6">
              <Clipboard className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Seleccione una entrada</h3>
              <p className="text-muted-foreground text-center mt-2">
                Haga clic en una entrada del cronograma para ver sus detalles completos
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo para mostrar imagen a pantalla completa */}
      {selectedEntry && (
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedEntry.title}</DialogTitle>
            </DialogHeader>
            
            {selectedEntry.referenceImageUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={selectedEntry.referenceImageUrl}
                  alt={selectedEntry.title}
                  className="max-h-[500px] object-contain rounded-lg"
                />
                <div className="mt-4 w-full">
                  <h4 className="text-sm font-medium mb-1">Prompt de Generación</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="whitespace-pre-wrap">{selectedEntry.referenceImagePrompt}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-center text-muted-foreground mb-4">
                  No hay imagen disponible para esta entrada.
                </p>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              {selectedEntry.referenceImageUrl && (
                <Button 
                  onClick={() => downloadImage(selectedEntry.referenceImageUrl!, selectedEntry.title)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Imagen
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setImageDialogOpen(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}