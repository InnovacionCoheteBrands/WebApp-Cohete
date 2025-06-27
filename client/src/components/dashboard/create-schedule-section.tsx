import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarPlus, Clock } from "lucide-react";
import { CustomCard } from "@/components/ui/custom-card";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendario Rápido */}
      <CustomCard
        title="CALENDARIO RÁPIDO"
        icon={<Clock className="h-6 w-6 text-blue-400" />}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Genera un calendario básico con pocas opciones en segundos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 text-sm p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Tiempo estimado
              </div>
              <div className="text-slate-400 pl-6">1-2 minutos</div>
            </div>
            <div className="space-y-2 text-sm p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Opciones
              </div>
              <div className="text-slate-400 pl-6">Básicas</div>
            </div>
          </div>

          <Link href="#crear-calendario-rapido" className="block w-full">
            <Button className="w-full bg-blue-600 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 text-white h-11 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
              <span className="flex items-center">
                Crear Calendario Rápido
                <Clock className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </CustomCard>

      {/* Calendario Avanzado */}
      <CustomCard
        title="CALENDARIO AVANZADO"
        icon={<CalendarPlus className="h-6 w-6 text-amber-400" />}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Control total sobre plataformas, tipos y distribución de contenido
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 text-sm p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Tiempo estimado
              </div>
              <div className="text-slate-400 pl-6">5-10 minutos</div>
            </div>
            <div className="space-y-2 text-sm p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="font-medium text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Opciones
              </div>
              <div className="text-slate-400 pl-6">Avanzadas y detalladas</div>
            </div>
          </div>

          <Link href="/calendar-creator" className="block w-full">
            <Button className="w-full bg-amber-600 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-400 text-white h-11 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25">
              <span className="flex items-center">
                Crear Calendario Avanzado
                <CalendarPlus className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </CustomCard>
    </div>
  );
}