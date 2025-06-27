
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, Settings, Calendar, Zap } from "lucide-react";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      {/* Calendario Rápido */}
      <Card className="bg-slate-800 border-slate-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>Calendario Rápido</span>
              </div>
              <p className="text-sm text-slate-400 font-normal mt-1">
                Genera un calendario básico con pocas opciones en segundos
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-slate-300 mb-4">
            <span>Tiempo estimado: 1-2 min</span>
            <span>Opciones: Básicas</span>
          </div>
          
          <Link href="#crear-calendario-rapido">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendarios
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Calendario Avanzado */}
      <Card className="bg-slate-800 border-slate-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>Calendario Avanzado</span>
              </div>
              <p className="text-sm text-slate-400 font-normal mt-1">
                Control total sobre plataformas, tipos y distribución de contenido
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-slate-300 mb-4">
            <span>Tiempo estimado: 5-10 min</span>
            <span>Opciones: Avanzadas</span>
          </div>
          
          <Link href="/calendar-creator">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendarios
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
