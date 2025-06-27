import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Star, Rocket, Info } from "lucide-react";

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
  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 text-white">
      <CardContent className="p-8">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            PANEL DE CONTROL
          </Badge>

          <h1 className="text-4xl font-bold mb-4">
            ¡Hola, {user?.fullName?.split(' ')[0] || user?.username || 'Adrian'}!
          </h1>

          <p className="text-slate-300 text-lg mb-6 max-w-2xl">
            Crea, gestiona y organiza tus proyectos de marketing con flujos de trabajo potenciados por IA y programación de contenido.
          </p>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
            >
              <Info className="mr-2 h-4 w-4" />
              Recorrido Guiado
            </Button>

            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear Proyecto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}