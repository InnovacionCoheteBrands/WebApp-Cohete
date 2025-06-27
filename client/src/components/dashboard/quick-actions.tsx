
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Calendar, BarChart3, Users, Settings, Zap } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Nuevo Proyecto",
      description: "Crear un proyecto desde cero",
      icon: <Plus className="h-5 w-5" />,
      href: "/projects?new=true",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Crear Calendario",
      description: "Generar calendario de contenido",
      icon: <Calendar className="h-5 w-5" />,
      href: "/calendar-creator",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Ver Analíticas",
      description: "Revisar métricas y rendimiento",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar equipo y permisos",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-lg text-white ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
