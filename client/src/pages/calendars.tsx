import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarPlus, Calendar, ArrowRight } from "lucide-react";

export default function Calendars() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Calendarios de Contenido</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Elige el tipo de calendario que mejor se adapte a tus necesidades
        </p>
      </div>

      {/* Calendar Options */}
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl">
        {/* Calendario Rápido */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Calendario Rápido</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Genera un calendario básico con pocas opciones en segundos
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <div className="font-medium text-gray-700">⏱️ Tiempo estimado</div>
                <div className="text-muted-foreground">1-2 minutos</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700">⚙️ Opciones</div>
                <div className="text-muted-foreground">Básicas</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">✨ Características:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configuración automática</li>
                <li>• Plantillas prediseñadas</li>
                <li>• Ideal para comenzar rápidamente</li>
              </ul>
            </div>

            <Link href="/quick-calendar" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Clock className="mr-2 h-4 w-4" />
                Crear Calendario Rápido
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Calendario Avanzado */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-amber-200">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <CalendarPlus className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Calendario Avanzado</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control total sobre plataformas, tipos y distribución de contenido
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <div className="font-medium text-gray-700">⏱️ Tiempo estimado</div>
                <div className="text-muted-foreground">5-10 minutos</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700">⚙️ Opciones</div>
                <div className="text-muted-foreground">Avanzadas y detalladas</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">🎯 Características:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configuración personalizada por red social</li>
                <li>• Control de tipos de contenido</li>
                <li>• Distribución inteligente</li>
                <li>• Especificaciones técnicas detalladas</li>
              </ul>
            </div>

            <Link href="/calendar-creator" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Crear Calendario Avanzado
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-amber-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">💡 ¿Cuál elegir?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-700 mb-1">Calendario Rápido si:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Necesitas resultados inmediatos</li>
                    <li>• Tienes un proyecto simple</li>
                    <li>• Quieres una solución automatizada</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-amber-700 mb-1">Calendario Avanzado si:</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Necesitas control total</li>
                    <li>• Manejas múltiples plataformas</li>
                    <li>• Quieres especificaciones técnicas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}