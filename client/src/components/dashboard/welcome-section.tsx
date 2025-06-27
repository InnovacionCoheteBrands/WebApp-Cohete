import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Star, Rocket, TrendingUp, Users, Clock } from "lucide-react";
import { memo, useMemo } from "react";

interface User {
  id: string;
  fullName: string;
  username: string;
  isPrimary: boolean;
  jobTitle?: string;
  department?: string;
}

interface WelcomeSectionProps {
  user?: User;
}

const WelcomeSection = memo(function WelcomeSection({ user }: WelcomeSectionProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const stats = useMemo(() => [
    { label: "Proyectos", value: "12", icon: <TrendingUp className="h-4 w-4" />, color: "text-blue-500" },
    { label: "Equipos", value: "3", icon: <Users className="h-4 w-4" />, color: "text-green-500" },
    { label: "Pendientes", value: "8", icon: <Clock className="h-4 w-4" />, color: "text-orange-500" }
  ], []);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-background border-0 shadow-lg relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/15 to-transparent rounded-full translate-y-12 -translate-x-12" />

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {greeting}, {user?.fullName || user?.username || 'Usuario'}!
                </h1>
                <div className="flex items-center gap-2">
                  {user?.isPrimary && (
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Administrador
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {currentDate}
              </p>
              {user?.jobTitle && (
                <p className="text-sm">
                  {user.jobTitle} {user.department && `• ${user.department}`}
                </p>
              )}
            </div>
          </div>

          <div className="lg:text-right">
            <div className="flex items-center gap-1 text-primary mb-3 lg:justify-end">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-lg font-bold">Cohete Workflow</span>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-2 rounded-lg bg-background/50 ${stat.color} mb-1`}>
                    {stat.icon}
                  </div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default WelcomeSection;