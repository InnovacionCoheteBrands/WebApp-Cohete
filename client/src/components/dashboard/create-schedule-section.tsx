import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarPlus, Clock, Zap, Settings } from "lucide-react";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendario Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Calendario Rápido
            <Zap className="h-4 w-4 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Genera un calendario básico con pocas opciones en segundos
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="font-semibold text-blue-600">1-2 min</div>
              <div className="text-xs text-muted-foreground">Tiempo estimado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Básicas</div>
              <div className="text-xs text-muted-foreground">Opciones</div>
            </div>
          </div>

          <Link href="#crear-calendario-rapido">
            <Button className="w-full" variant="default">
              <Clock className="mr-2 h-4 w-4" />
              Crear Calendario Rápido
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calendario Avanzado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-orange-500" />
            Calendario Avanzado
            <Settings className="h-4 w-4 text-orange-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Control total sobre plataformas, tipos y distribución de contenido
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="font-semibold text-orange-600">5-10 min</div>
              <div className="text-xs text-muted-foreground">Tiempo estimado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">Avanzadas</div>
              <div className="text-xs text-muted-foreground">Opciones</div>
            </div>
          </div>

          <Link href="/calendar-creator">
            <Button className="w-full" variant="default">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Crear Calendario Avanzado
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}