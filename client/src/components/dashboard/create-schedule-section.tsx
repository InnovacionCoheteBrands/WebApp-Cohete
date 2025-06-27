import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarPlus, Clock } from "lucide-react";

export default function CreateScheduleSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendario Rápido */}
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-blue-500">
        <CardContent className="p-0">
          <div className="p-5 relative z-10">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mr-4 dark:bg-blue-500/20 dark:text-blue-300 dark:shadow-[0_0_10px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Calendario Rápido</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Genera un calendario básico con pocas opciones en segundos
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-blue-200 dark:group-hover:border-blue-800/30 transition-colors duration-300">
                <div className="font-medium dark:text-white flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Tiempo estimado
                </div>
                <div className="text-muted-foreground dark:text-slate-400 pl-5">1-2 minutos</div>
              </div>
              <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-blue-200 dark:group-hover:border-blue-800/30 transition-colors duration-300">
                <div className="font-medium dark:text-white flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Opciones
                </div>
                <div className="text-muted-foreground dark:text-slate-400 pl-5">Básicas</div>
              </div>
            </div>
          </div>
          <div className="mt-2 px-5 pb-5">
            <Link href="#crear-calendario-rapido" className="block w-full">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] h-11 font-medium relative overflow-hidden group">
                <span className="relative z-10 flex items-center">
                  Crear Calendario Rápido
                  <Clock className="ml-2 h-4 w-4" />
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-blue-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-blue-500/20"></div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Calendario Avanzado */}
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:border-[#2a3349] dark:shadow-[0_5px_20px_rgba(0,0,0,0.3)] dark:bg-[#1a1d2d] relative before:absolute before:top-0 before:h-1 before:w-full before:bg-amber-500">
        <CardContent className="p-0">
          <div className="p-5 relative z-10">
            <div className="flex items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mr-4 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[0_0_10px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform duration-300">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg tracking-tight dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">Calendario Avanzado</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Control total sobre plataformas, tipos y distribución de contenido
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-amber-200 dark:group-hover:border-amber-800/30 transition-colors duration-300">
                <div className="font-medium dark:text-white flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Tiempo estimado
                </div>
                <div className="text-muted-foreground dark:text-slate-400 pl-5">5-10 minutos</div>
              </div>
              <div className="space-y-1 text-sm p-3 rounded-lg bg-white/80 border border-gray-100 shadow-sm dark:bg-[#1e293b] dark:border-[#3e4a6d] group-hover:border-amber-200 dark:group-hover:border-amber-800/30 transition-colors duration-300">
                <div className="font-medium dark:text-white flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Opciones
                </div>
                <div className="text-muted-foreground dark:text-slate-400 pl-5">Avanzadas y detalladas</div>
              </div>
            </div>
          </div>
          <div className="mt-2 px-5 pb-5">
            <Link href="/calendar-creator" className="block w-full">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm dark:bg-amber-600 dark:hover:bg-amber-700 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] h-11 font-medium relative overflow-hidden group">
                <span className="relative z-10 flex items-center">
                  Crear Calendario Avanzado
                  <CalendarPlus className="ml-2 h-4 w-4" />
                </span>
                <div className="absolute inset-0 translate-y-[100%] bg-amber-600/20 transition-transform duration-300 group-hover:translate-y-[0%] dark:bg-amber-400/20"></div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}