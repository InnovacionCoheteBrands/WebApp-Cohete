import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarPlus, Calendar, ArrowRight } from "lucide-react";

export default function Calendars() {
  return (
    <div className="space-y-6 hide-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendarios de Contenido</h1>
          <p className="text-muted-foreground">
            Elige el tipo de calendario que mejor se adapte a tus necesidades
          </p>
        </div>
      </div>

      {/* Calendar Options */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendario Rápido */}
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 dark:text-white">Calendario Rápido</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Genera un calendario básico con pocas opciones en segundos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-sm">
                <div className="font-medium text-blue-700 dark:text-blue-400">Tiempo estimado</div>
                <div className="text-muted-foreground dark:text-slate-400">1-2 minutos</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-blue-700 dark:text-blue-400">Opciones</div>
                <div className="text-muted-foreground dark:text-slate-400">Básicas</div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-300 mb-2">Características:</div>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Configuración automática</li>
                <li>• Plantillas prediseñadas</li>
                <li>• Ideal para comenzar rápidamente</li>
                <li>• Perfecto para proyectos simples</li>
              </ul>
            </div>

            <Link href="/quick-calendar" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Crear Calendario Rápido
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-blue-700 transition-transform duration-300 group-hover:translate-y-[0%]"></div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Calendario Avanzado */}
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-amber-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                <CalendarPlus className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 dark:text-white">Calendario Avanzado</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Control total sobre plataformas, tipos y distribución de contenido
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-sm">
                <div className="font-medium text-amber-700 dark:text-amber-400">Tiempo estimado</div>
                <div className="text-muted-foreground dark:text-slate-400">5-10 minutos</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-amber-700 dark:text-amber-400">Opciones</div>
                <div className="text-muted-foreground dark:text-slate-400">Avanzadas</div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="font-medium text-amber-800 dark:text-amber-300 mb-2">Características:</div>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                <li>• Configuración personalizada por red social</li>
                <li>• Control de tipos de contenido</li>
                <li>• Distribución inteligente</li>
                <li>• Especificaciones técnicas detalladas</li>
              </ul>
            </div>

            <Link href="/calendar-creator" className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Crear Calendario Avanzado
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-amber-700 transition-transform duration-300 group-hover:translate-y-[0%]"></div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-[#65cef5]/10 dark:text-[#65cef5]">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">¿Cuál elegir?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Calendario Rápido
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">Ideal para:</div>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Resultados inmediatos</li>
                      <li>• Proyectos simples</li>
                      <li>• Soluciones automatizadas</li>
                      <li>• Pruebas rápidas</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Calendario Avanzado
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <div className="font-medium text-amber-800 dark:text-amber-300 mb-1">Ideal para:</div>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                      <li>• Control total</li>
                      <li>• Múltiples plataformas</li>
                      <li>• Especificaciones técnicas</li>
                      <li>• Proyectos complejos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}