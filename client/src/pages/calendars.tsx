import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarPlus, Calendar, ArrowRight, Zap, Target, Sparkles, Settings, CheckCircle } from "lucide-react";

export default function Calendars() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-amber-500 rounded-full text-white">
              <Calendar className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              Calendarios de Contenido
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Crea calendarios de contenido profesionales con inteligencia artificial
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full mx-auto"></div>
        </div>

        {/* Calendar Options */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Calendario Rápido */}
          <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/10"></div>
            <CardHeader className="pb-4 relative">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-500">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 text-gray-800">Calendario Rápido</CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Genera un calendario básico con pocas opciones en segundos
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-700 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Tiempo
                  </div>
                  <div className="text-blue-600 text-sm">1-2 minutos</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-700 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Opciones
                  </div>
                  <div className="text-blue-600 text-sm">Básicas</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Características
                </div>
                <div className="space-y-2">
                  {[
                    "Configuración automática",
                    "Plantillas prediseñadas",
                    "Ideal para comenzar rápidamente",
                    "Perfecto para proyectos simples"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/quick-calendar" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Clock className="mr-2 h-5 w-5" />
                  Crear Calendario Rápido
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Calendario Avanzado */}
          <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:scale-105 group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/10"></div>
            <CardHeader className="pb-4 relative">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover:shadow-amber-500/25 transition-shadow duration-500">
                  <CalendarPlus className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 text-gray-800">Calendario Avanzado</CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Control total sobre plataformas, tipos y distribución de contenido
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="font-semibold text-amber-700 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Tiempo
                  </div>
                  <div className="text-amber-600 text-sm">5-10 minutos</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="font-semibold text-amber-700 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Opciones
                  </div>
                  <div className="text-amber-600 text-sm">Avanzadas</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <div className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Características
                </div>
                <div className="space-y-2">
                  {[
                    "Configuración personalizada por red social",
                    "Control de tipos de contenido",
                    "Distribución inteligente",
                    "Especificaciones técnicas detalladas"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-amber-700">
                      <CheckCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/calendar-creator" className="block">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Crear Calendario Avanzado
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Info Section */}
        <Card className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-amber-50/50 border-0 shadow-xl backdrop-blur-sm max-w-5xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-amber-500 text-white shadow-lg">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">¿Cuál elegir?</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div className="font-bold text-blue-700 text-lg">Calendario Rápido</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="font-semibold text-blue-800 mb-2">Ideal para:</div>
                      <ul className="space-y-2">
                        {[
                          "Resultados inmediatos",
                          "Proyectos simples",
                          "Soluciones automatizadas",
                          "Pruebas rápidas"
                        ].map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-blue-700">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarPlus className="h-5 w-5 text-amber-600" />
                      <div className="font-bold text-amber-700 text-lg">Calendario Avanzado</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="font-semibold text-amber-800 mb-2">Ideal para:</div>
                      <ul className="space-y-2">
                        {[
                          "Control total",
                          "Múltiples plataformas",
                          "Especificaciones técnicas",
                          "Proyectos complejos"
                        ].map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-amber-700">
                            <CheckCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}