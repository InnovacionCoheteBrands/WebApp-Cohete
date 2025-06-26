import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Sparkles, Clock, Target } from "lucide-react";

export default function CreateScheduleSection() {
  const [, setLocation] = useLocation();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Cronograma con IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Genera cronogramas inteligentes de contenido para redes sociales usando
            inteligencia artificial. Sube documentos de tu marca y deja que la IA
            cree el contenido perfecto.
          </p>
          
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Planificación automática</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Horarios optimizados</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Contenido personalizado</span>
            </div>
          </div>

          <Button 
            onClick={() => setLocation("/calendar-creator")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Crear Cronograma
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}