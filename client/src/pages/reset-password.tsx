import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Rocket, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], 
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Define form
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);

    // Verificar validez del token
    if (tokenParam) {
      verifyToken(tokenParam);
    } else {
      setIsVerifying(false);
      setIsTokenValid(false);
    }
  }, []);

  // Verificar validez del token
  const verifyToken = async (tokenValue: string) => {
    try {
      const response = await fetch(`/api/verify-reset-token/${tokenValue}`);
      const result = await response.json();
      
      setIsTokenValid(response.ok && result.valid);
    } catch (error) {
      setIsTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Éxito",
          description: "Tu contraseña ha sido restablecida con éxito",
        });
        
        // Redireccionar a la página de inicio de sesión después de 3 segundos
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
      } else {
        const result = await response.json();
        toast({
          title: "Error",
          description: result.message || "Ocurrió un error al restablecer tu contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un problema al conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar un estado de carga mientras verificamos el token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verificando...</CardTitle>
            <CardDescription>
              Estamos verificando la validez de tu solicitud
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Rocket className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
            <CardDescription>
              Crea una nueva contraseña para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isTokenValid ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Token inválido o expirado</AlertTitle>
                <AlertDescription>
                  El enlace que has seguido ha expirado o no es válido. Por favor, solicita un nuevo enlace para restablecer tu contraseña.
                </AlertDescription>
              </Alert>
            ) : isSubmitted ? (
              <Alert className="bg-primary/10 border-primary/20">
                <Check className="h-4 w-4 text-primary" />
                <AlertTitle>Contraseña restablecida</AlertTitle>
                <AlertDescription>
                  Tu contraseña ha sido restablecida con éxito. Serás redirigido a la página de inicio de sesión en unos segundos.
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth" className="flex items-center text-sm text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a inicio de sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}