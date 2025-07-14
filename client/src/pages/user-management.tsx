import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Loader2, Plus, Search, Trash2, UserCog, UserPlus, ShieldCheck, ShieldAlert, Key } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for creating new users
const createUserSchema = z.object({
  fullName: z.string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario debe tener máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  isPrimary: z.boolean().default(false),
  role: z.enum(['admin', 'manager', 'designer', 'content_creator', 'analyst']).default('content_creator'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Form schema for changing user password
const changePasswordSchema = z.object({
  newPassword: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Types for users
type User = {
  id: number;
  fullName: string;
  username: string;
  isPrimary: boolean;
  role?: string;
  createdAt: string;
};

const UserManagementPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  
  // Check if user is primary, redirect if not
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (!user.isPrimary) {
    return <Redirect to="/" />;
  }
  
  // Get the current user's ID
  const currentUserId = user?.id;
  
  // Query for fetching users
  const { data: users, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 30000, // 30 seconds
  });
  
  // Form for creating users
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      isPrimary: false,
      role: "content_creator",
    },
  });

  // Form for editing users
  const editForm = useForm<Partial<CreateUserFormValues>>({
    resolver: zodResolver(createUserSchema.partial()),
    defaultValues: {
      fullName: "",
      username: "",
      isPrimary: false,
      role: "content_creator",
    },
  });

  // Form for changing password
  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Mutation for creating users
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear usuario");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating users
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number, data: Partial<CreateUserFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar usuario");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario actualizado",
        description: "Los permisos del usuario han sido actualizados exitosamente",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar usuario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar usuario");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar usuario",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });
  
  // Mutation for changing user password
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number, newPassword: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/change-password`, { newPassword });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al cambiar contraseña");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contraseña cambiada",
        description: `La contraseña de ${data.targetUser} ha sido actualizada exitosamente`,
      });
      setIsChangePasswordDialogOpen(false);
      setChangePasswordUser(null);
      changePasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };
  
  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      fullName: user.fullName,
      username: user.username,
      isPrimary: user.isPrimary,
      role: user.role || "content_creator",
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const onEditSubmit = (data: Partial<CreateUserFormValues>) => {
    if (editingUser) {
      updateUserMutation.mutate({ 
        userId: editingUser.id, 
        data: {
          ...data,
          password: undefined // No enviar password al actualizar
        }
      });
    }
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };
  
  // Handle change password
  const handleChangePassword = (user: User) => {
    setChangePasswordUser(user);
    changePasswordForm.reset({
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangePasswordDialogOpen(true);
  };
  
  // Handle change password form submission
  const onChangePasswordSubmit = (data: ChangePasswordFormValues) => {
    if (changePasswordUser) {
      changePasswordMutation.mutate({ 
        userId: changePasswordUser.id, 
        newPassword: data.newPassword 
      });
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container py-8 mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios de Cohete Workflow
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </header>
      
      <Separator className="my-6" />
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-lg px-3 py-1">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            <span>Administradores: {users?.filter(user => user.isPrimary).length || 0}</span>
          </Badge>
          <Badge variant="outline" className="rounded-lg px-3 py-1">
            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
            <span>Estándar: {users?.filter(user => !user.isPrimary).length || 0}</span>
          </Badge>
          <Badge variant="outline" className="rounded-lg px-3 py-1">
            <UserCog className="mr-1 h-3.5 w-3.5" />
            <span>Total: {users?.length || 0}</span>
          </Badge>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando usuarios...</span>
        </div>
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <p className="text-xl font-semibold">Error al cargar usuarios</p>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Ha ocurrido un error al cargar los usuarios"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {user.fullName}
                        {user.isPrimary && (
                          <Badge className="ml-2" variant="default">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </div>
                    
                    <div className="flex gap-1">
                      {/* Botón de editar permisos */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600" 
                        onClick={() => handleEditUser(user)}
                        title="Editar permisos"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      
                      {/* Botón de cambiar contraseña */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-amber-600" 
                        onClick={() => handleChangePassword(user)}
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      
                      {/* No mostrar botón de eliminar para el usuario actual */}
                      {user.id !== currentUserId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => {
                            setDeleteUserId(user.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Fecha de creación:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Tipo:</span>
                      <span>{user.isPrimary ? "Administrador" : "Estándar"}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Rol:</span>
                      <span className="capitalize">{user.role || "No asignado"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-xl font-medium mb-2">No se encontraron usuarios</p>
              <p className="text-muted-foreground">
                {searchTerm ? "No hay resultados para tu búsqueda" : "No hay usuarios en el sistema"}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Dialog para crear usuario */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo usuario, selecciona su rol y tipo
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                      Solo letras, números y guiones bajos.
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
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Usuario Administrador</FormLabel>
                      <FormDescription>
                        Acceso a todas las funciones del sistema, incluida la gestión de usuarios.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol del Usuario</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="designer">Diseñador</SelectItem>
                        <SelectItem value="content_creator">Creador de Contenido</SelectItem>
                        <SelectItem value="analyst">Analista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El rol define los permisos y el acceso a las funciones del sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  disabled={createUserMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : "Crear usuario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar permisos de usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar permisos de usuario</DialogTitle>
            <DialogDescription>
              Modifica los permisos y rol de {editingUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de usuario" {...field} />
                    </FormControl>
                    <FormDescription>
                      Solo letras, números y guiones bajos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={editingUser?.id === currentUserId}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Usuario Administrador</FormLabel>
                      <FormDescription>
                        {editingUser?.id === currentUserId 
                          ? "No puedes modificar tus propios permisos de administrador."
                          : "Acceso a todas las funciones del sistema, incluida la gestión de usuarios."
                        }
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol del Usuario</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="designer">Diseñador</SelectItem>
                        <SelectItem value="content_creator">Creador de Contenido</SelectItem>
                        <SelectItem value="analyst">Analista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El rol define los permisos y el acceso a las funciones del sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    editForm.reset();
                  }} 
                  disabled={updateUserMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : "Actualizar permisos"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para cambiar contraseña de usuario */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Cambiar la contraseña de {changePasswordUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...changePasswordForm}>
            <form onSubmit={changePasswordForm.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Nueva contraseña" 
                        {...field} 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={changePasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirmar contraseña" 
                        {...field} 
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsChangePasswordDialogOpen(false);
                    setChangePasswordUser(null);
                    changePasswordForm.reset();
                  }} 
                  disabled={changePasswordMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : "Cambiar contraseña"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog para eliminar usuario */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente
              y perderá todo acceso a sus proyectos y asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : "Eliminar usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagementPage;