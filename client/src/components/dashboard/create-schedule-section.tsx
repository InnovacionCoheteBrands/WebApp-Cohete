import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarPlus, Clock } from "lucide-react";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendario Rápido */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Calendario Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Genera un calendario básico con pocas opciones en segundos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <div className="font-medium">Tiempo estimado</div>
              <div className="text-muted-foreground">1-2 minutos</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Opciones</div>
              <div className="text-muted-foreground">Básicas</div>
            </div>
          </div>

          <Link href="#crear-calendario-rapido" className="block">
            <Button className="w-full">
              <Clock className="mr-2 h-4 w-4" />
              Crear Calendario Rápido
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calendario Avanzado */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Calendario Avanzado</h3>
              <p className="text-sm text-muted-foreground">
                Control total sobre plataformas, tipos y distribución de contenido
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <div className="font-medium">Tiempo estimado</div>
              <div className="text-muted-foreground">5-10 minutos</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Opciones</div>
              <div className="text-muted-foreground">Avanzadas y detalladas</div>
            </div>
          </div>

          <Link href="/calendar-creator" className="block">
            <Button className="w-full" variant="secondary">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Crear Calendario Avanzado
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}