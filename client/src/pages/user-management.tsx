import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  User, UserPlus, Key, Shield, UserCheck, UserX, Users, FilterX, Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/hooks/use-auth';

// Esquema para validación del formulario de usuario
const userSchema = z.object({
  fullName: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  username: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

// Componente principal de gestión de usuarios
const UserManagement = () => {
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Verificar que el usuario actual sea primario
  if (!currentUser?.isPrimary) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Shield className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
          <p className="text-muted-foreground mb-6">
            No tienes permisos para acceder a esta sección. Solo los usuarios primarios pueden gestionar usuarios.
          </p>
          <Button onClick={() => setLocation('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Consultar lista de usuarios
  const { data: users = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/users');
        return await res.json();
      } catch (error) {
        toast({
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios. Verifica tus permisos.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Crear nuevo usuario
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const res = await apiRequest('POST', '/api/admin/users', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsNewUserDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Formulario para nuevo usuario
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
    },
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
      <p className="text-muted-foreground mb-6">
        Administra los usuarios de la plataforma y sus permisos
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="h-3 w-3 mr-1" />
            {users.length} usuarios
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            {users.filter(u => u.isPrimary).length} administradores
          </Badge>
        </div>

        <Button
          variant="default"
          onClick={() => setIsNewUserDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <Card key={user.id} className={user.isPrimary ? "border-primary/30 bg-primary/5" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge variant={user.isPrimary ? "default" : "outline"}>
                    {user.isPrimary ? "Administrador" : "Usuario regular"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={user.isPrimary ? "bg-primary text-primary-foreground" : ""}>
                      {user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.fullName}</CardTitle>
                    <CardDescription className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {user.username}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Creado el: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                {/* No permitir eliminar el usuario actual ni si es el último administrador */}
                {user.id !== currentUser?.id && 
                  !(user.isPrimary && users.filter(u => u.isPrimary).length <= 1) && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive" 
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar este usuario?')) {
                        deleteUserMutation.mutate(user.id);
                      }
                    }}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo para crear nuevo usuario */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario para la plataforma
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
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
                    <FormDescription>
                      Este será el nombre de usuario para iniciar sesión
                    </FormDescription>
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
                        placeholder="Contraseña" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      La contraseña debe tener al menos 6 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewUserDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  )}
                  Crear Usuario
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;