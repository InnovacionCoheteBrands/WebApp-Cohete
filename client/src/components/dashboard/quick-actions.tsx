
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart3, Calendar, AlertTriangle, ArrowRight, Eye, CheckCircle } from "lucide-react";

export default function QuickActions() {
  const stats = [
    {
      title: "Proyectos Activos",
      count: "1",
      description: "Campañas de marketing actualmente activas",
      progress: "10%",
      total: "Total: 1",
      bgColor: "bg-slate-800",
      borderColor: "border-slate-600",
      textColor: "text-white",
      progressColor: "bg-blue-500",
      icon: <BarChart3 className="h-6 w-6" />,
      link: "/projects",
      buttonText: "Ver Todos los Proyectos",
      buttonIcon: <ArrowRight className="h-4 w-4" />
    },
    {
      title: "Calendarios Recientes",
      count: "0",
      description: "Calendarios de contenido generados recientemente",
      progress: "20%", 
      total: "Total: 0",
      bgColor: "bg-orange-600",
      borderColor: "border-orange-500",
      textColor: "text-white",
      progressColor: "bg-orange-400",
      icon: <Calendar className="h-6 w-6" />,
      link: "/calendar-creator",
      buttonText: "Ver Calendarios",
      buttonIcon: <Eye className="h-4 w-4" />
    },
    {
      title: "Tareas Pendientes", 
      count: "3",
      description: "Tareas que requieren tu atención inmediata",
      progress: "30%",
      total: "Total: 3", 
      bgColor: "bg-red-600",
      borderColor: "border-red-500",
      textColor: "text-white",
      progressColor: "bg-red-400",
      icon: <AlertTriangle className="h-6 w-6" />,
      link: "/task-manager",
      buttonText: "Ver Tareas",
      buttonIcon: <CheckCircle className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`${stat.bgColor} ${stat.borderColor} border-2 ${stat.textColor}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{stat.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{stat.count}</span>
                {stat.icon}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm opacity-90">
              {stat.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs opacity-75">
                <span>{stat.total}</span>
                <span>{stat.progress}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div 
                  className={`${stat.progressColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: stat.progress }}
                ></div>
              </div>
            </div>

            <Link href={stat.link}>
              <Button 
                variant="outline" 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
              >
                {stat.buttonIcon}
                {stat.buttonText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
