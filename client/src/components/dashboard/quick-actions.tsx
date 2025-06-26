import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Plus, 
  Calendar, 
  FileText, 
  BarChart3,
  Users,
  Settings 
} from "lucide-react";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Nuevo Proyecto",
      description: "Crear un nuevo proyecto",
      icon: Plus,
      onClick: () => setLocation("/projects"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Cronograma",
      description: "Generar cronograma IA",
      icon: Calendar,
      onClick: () => setLocation("/calendar-creator"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Gestor de Tareas",
      description: "Administrar tareas",
      icon: FileText,
      onClick: () => setLocation("/task-manager"),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Analytics",
      description: "Ver métricas y reportes",
      icon: BarChart3,
      onClick: () => setLocation("/analytics"),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Gestión de Usuarios",
      description: "Administrar equipo",
      icon: Users,
      onClick: () => setLocation("/user-management"),
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Configuración",
      description: "Ajustar preferencias",
      icon: Settings,
      onClick: () => setLocation("/settings"),
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-24 flex-col gap-2 p-4"
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}