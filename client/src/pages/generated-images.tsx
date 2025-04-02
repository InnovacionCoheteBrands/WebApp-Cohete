
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  createdAt: string;
  projectName: string;
}

export default function GeneratedImages() {
  const { data: images, isLoading, refetch } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
    staleTime: 30000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imágenes Generadas</h1>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images?.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.prompt} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" asChild>
                      <a href={image.url} download className="gap-2">
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Prompt: {image.prompt}</p>
                  <p className="text-sm text-muted-foreground">Proyecto: {image.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    Generada el: {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
