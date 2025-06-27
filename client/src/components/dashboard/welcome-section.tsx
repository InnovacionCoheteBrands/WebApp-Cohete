import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Star, Rocket } from "lucide-react";

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

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {greeting}, {user?.fullName || user?.username || 'Usuario'}!
                </h1>
                <div className="flex items-center gap-2">
                  {user?.isPrimary && (
                    <Badge variant="default">
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
            <div className="flex items-center gap-1 text-primary mb-2 lg:justify-end">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-lg font-bold">Cohete Workflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema de gestión de proyectos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}