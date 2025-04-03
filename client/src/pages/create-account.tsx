import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus, Key, Shield, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/hooks/use-auth';

// Esquema para validación del formulario de usuario primario
const primaryUserSchema = z.object({
  fullName: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  secretKey: z.string().min(1, {
    message: "La clave secreta es requerida",
  }),
});

type PrimaryUserFormValues = z.infer<typeof primaryUserSchema>;

// Componente para creación de cuenta de administrador
const CreateAccount = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Formulario para nuevo usuario primario
  const form = useForm<PrimaryUserFormValues>({
    resolver: zodResolver(primaryUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      secretKey: "",
    },
  });

  // Función para crear usuario primario
  const handleCreatePrimaryUser = async (data: PrimaryUserFormValues) => {
    setSubmitting(true);
    setError("");
    
    try {
      const res = await apiRequest('POST', '/api/create-primary-account', {
        fullName: data.fullName,
        username: data.username,
        password: data.password,
        secretKey: data.secretKey,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear la cuenta');
      }
      
      setSuccess(true);
      
      toast({
        title: "Cuenta creada exitosamente",
        description: "Tu cuenta de administrador ha sido creada. Ahora puedes iniciar sesión.",
      });
      
      // Redirigir a login después de un delay
      setTimeout(() => {
        setLocation('/auth');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
      toast({
        title: "Error al crear cuenta",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-2 gap-10 p-10">
        {/* Sección de información */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Crear cuenta de administrador</h1>
            <p className="text-muted-foreground">
              Esta es una página secreta para crear cuentas de administrador para Cohete Workflow.
              Necesitarás una clave secreta para poder crear una cuenta.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Acceso completo a todas las funciones</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>Capacidad para gestionar usuarios</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-5 w-5 text-primary" />
            <span>Administración de proyectos y recursos</span>
          </div>
        </div>
        
        {/* Formulario */}
        <div className="border rounded-lg p-8 shadow-sm">
          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Shield className="h-6 w-6 text-green-700" />
                </div>
                <h2 className="text-xl font-semibold">Cuenta creada exitosamente</h2>
                <p className="text-muted-foreground">
                  Tu cuenta de administrador ha sido creada. Serás redirigido al inicio de sesión.
                </p>
              </div>
              <Button className="w-full" onClick={() => setLocation('/auth')}>
                Ir al inicio de sesión
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreatePrimaryUser)} className="space-y-6">
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de usuario</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Contraseña segura" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clave secreta</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Clave secreta de administrador" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Esta clave es proporcionada por Cohete Brands AI
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  )}
                  Crear cuenta de administrador
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => setLocation('/auth')}
                  >
                    Volver al inicio de sesión
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;