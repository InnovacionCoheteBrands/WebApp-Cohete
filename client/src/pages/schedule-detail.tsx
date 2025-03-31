import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Schedule, ScheduleEntry } from "@shared/schema";

// Components
import { Loader2, Share2, Download, Copy, Clipboard, Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function ScheduleDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
  
  // Fetch schedule data
  const { data: schedule, isLoading, error } = useQuery<Schedule & { entries: ScheduleEntry[] }>({
    queryKey: [`/api/schedules/${id}`],
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
            onClick={() => window.open(`/api/schedules/${id}/download`, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Excel
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
                            <div className="flex items-center gap-2">
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
                <Tabs defaultValue="copyIn" className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="copyIn">Texto en Diseño</TabsTrigger>
                    <TabsTrigger value="copyOut">Texto Descripción</TabsTrigger>
                    <TabsTrigger value="designInstructions">Instrucciones</TabsTrigger>
                    <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="copyIn" className="space-y-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(selectedEntry.copyIn, "Texto en diseño")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <p className="whitespace-pre-wrap">{selectedEntry.copyIn}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="copyOut" className="space-y-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(selectedEntry.copyOut, "Texto descripción")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <p className="whitespace-pre-wrap">{selectedEntry.copyOut}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="designInstructions" className="space-y-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(selectedEntry.designInstructions, "Instrucciones de diseño")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <p className="whitespace-pre-wrap">{selectedEntry.designInstructions}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hashtags" className="space-y-4 mt-4">
                    <div className="p-4 bg-muted rounded-lg relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(selectedEntry.hashtags, "Hashtags")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <p className="whitespace-pre-wrap">{selectedEntry.hashtags}</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {selectedEntry.referenceImageUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Imagen Referencia</h3>
                    <div className="w-full flex justify-center">
                      <img 
                        src={selectedEntry.referenceImageUrl} 
                        alt={selectedEntry.title}
                        className="max-h-[300px] object-contain rounded-lg"
                      />
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-1">Prompt Generación</h4>
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <p className="whitespace-pre-wrap">{selectedEntry.referenceImagePrompt}</p>
                      </div>
                    </div>
                  </div>
                )}
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
    </div>
  );
}