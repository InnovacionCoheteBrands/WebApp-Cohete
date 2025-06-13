import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Users, Zap, TrendingUp } from "lucide-react";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div 
      className="w-full bg-muted/30" 
      style={{ 
        minHeight: '100vh',
        height: 'auto',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      <div 
        className="container mx-auto py-8 px-4" 
        style={{ 
          height: 'auto',
          minHeight: '100vh',
          overflow: 'visible'
        }}
      >
        <div className="grid w-full max-w-5xl mx-auto grid-cols-1 md:grid-cols-2 gap-8" style={{ height: 'auto' }}>
          {/* Auth Card */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Rocket className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Cohete Workflow</CardTitle>
              <CardDescription>
                Inicia sesión con tu cuenta de Google para gestionar tus proyectos de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-6">
                    Accede a todas las funcionalidades de la plataforma con tu cuenta de Google
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 text-base"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
                    />
                  </svg>
                  {isLoading ? "Conectando..." : "Continuar con Google"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
              <p>
                Al continuar, aceptas los Términos de Servicio y la Política de Privacidad de Cohete Workflow.
              </p>
            </CardFooter>
          </Card>

          {/* Marketing Copy */}
          <div className="hidden md:flex flex-col justify-center">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">
                Impulsa tu Marketing Digital
              </h1>
              <p className="text-lg text-muted-foreground">
                Cohete Workflow es tu plataforma integral para gestionar proyectos de marketing digital 
                con herramientas avanzadas de inteligencia artificial y colaboración en tiempo real.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Automatización Inteligente</h3>
                    <p className="text-sm text-muted-foreground">
                      Genera contenido y cronogramas automáticamente con IA
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Colaboración en Equipo</h3>
                    <p className="text-sm text-muted-foreground">
                      Trabaja con tu equipo en tiempo real y mantén organizados todos los proyectos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Análisis y Métricas</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza el rendimiento de tus campañas y optimiza tus estrategias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}