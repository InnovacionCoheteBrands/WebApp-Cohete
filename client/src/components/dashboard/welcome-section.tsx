import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface WelcomeSectionProps {
  user?: {
    fullName?: string;
    username?: string;
    role?: string;
    profileImage?: string;
    department?: string;
  };
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="text-lg">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {getGreeting()}, {user?.fullName || user?.username || "Usuario"}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Bienvenido a tu centro de control de Cohete Workflow
            </p>
            <div className="flex gap-2 mt-2">
              {user?.role && (
                <Badge variant="secondary">{user.role}</Badge>
              )}
              {user?.department && (
                <Badge variant="outline">{user.department}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}