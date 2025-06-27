import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Calendar, BarChart3, Users, Settings, Zap, ArrowRight } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Nuevo Proyecto",
      description: "Crear un proyecto desde cero",
      icon: <Plus className="h-5 w-5" />,
      href: "/projects?new=true",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700"
    },
    {
      title: "Crear Calendario",
      description: "Generar calendario de contenido",
      icon: <Calendar className="h-5 w-5" />,
      href: "/calendar-creator",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "hover:from-green-600 hover:to-emerald-700"
    },
    {
      title: "Ver Analíticas",
      description: "Revisar métricas y rendimiento",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
      gradient: "from-purple-500 to-violet-600",
      hoverGradient: "hover:from-purple-600 hover:to-violet-700"
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar equipo y permisos",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      gradient: "from-orange-500 to-red-500",
      hoverGradient: "hover:from-orange-600 hover:to-red-600"
    }
  ];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-card dark:to-card/50 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="p-5">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white mb-4 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {action.description}
                  </p>
                  <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ir ahora
                    <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}