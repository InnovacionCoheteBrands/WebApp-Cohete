import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarPlus, Clock, Zap, Settings, ArrowRight } from "lucide-react";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendario Rápido */}
      <Card className="group overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl text-foreground">Calendario Rápido</h3>
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Genera un calendario básico con pocas opciones en segundos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
            <div className="text-center">
              <div className="font-semibold text-blue-600 text-lg">1-2 min</div>
              <div className="text-xs text-muted-foreground">Tiempo estimado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 text-lg">Básicas</div>
              <div className="text-xs text-muted-foreground">Opciones</div>
            </div>
          </div>

          <Link href="#crear-calendario-rapido" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <Clock className="mr-2 h-4 w-4" />
              Crear Calendario Rápido
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calendario Avanzado */}
      <Card className="group overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CalendarPlus className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl text-foreground">Calendario Avanzado</h3>
                <Settings className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Control total sobre plataformas, tipos y distribución de contenido
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
            <div className="text-center">
              <div className="font-semibold text-amber-600 text-lg">5-10 min</div>
              <div className="text-xs text-muted-foreground">Tiempo estimado</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-amber-600 text-lg">Avanzadas</div>
              <div className="text-xs text-muted-foreground">Opciones</div>
            </div>
          </div>

          <Link href="/calendar-creator" className="block">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group text-white">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Crear Calendario Avanzado
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}