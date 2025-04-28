import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Settings, Key, Palette, Moon, Sun } from "lucide-react";
import { UpdateProfile } from "@shared/schema";
import { Redirect } from "wouter";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La confirmación de contraseña es requerida"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { 
    updateProfile, 
    changePassword, 
    isUpdating, 
    isChangingPassword, 
    uploadProfileImage,
    isUploading
  } = useProfile();
  const [activeTab, setActiveTab] = useState("general");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Si no hay usuario, redirigir a la página de inicio de sesión
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Formulario de información general
  const generalForm = useForm<UpdateProfile>({
    defaultValues: {
      fullName: user.fullName || "",
      bio: user.bio || "",
      jobTitle: user.jobTitle || "",
      department: user.department || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "content_creator",
    },
    resolver: zodResolver(z.object({
      fullName: z.string().min(1, "El nombre completo es requerido"),
      bio: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      phoneNumber: z.string().optional(),
      role: z.enum(["admin", "manager", "designer", "content_creator", "analyst"]).optional(),
    })),
  });

  // Formulario de preferencias
  const preferencesForm = useForm({
    defaultValues: {
      preferredLanguage: user.preferredLanguage || "es",
      theme: user.theme || "light",
    },
    resolver: zodResolver(z.object({
      preferredLanguage: z.string(),
      theme: z.string(),
    })),
  });

  // Formulario de contraseña
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(passwordFormSchema),
  });

  // Manejadores de envío de formulario
  const handleGeneralSubmit = (data: UpdateProfile) => {
    updateProfile(data);
  };

  const handlePreferencesSubmit = (data: { preferredLanguage: string; theme: string }) => {
    updateProfile(data);
  };

  const handlePasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    changePassword({ 
      currentPassword: data.currentPassword, 
      newPassword: data.newPassword 
    });
    passwordForm.reset();
  };

  // Manejador de carga de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (imageFile) {
      try {
        await uploadProfileImage(imageFile);
        setImageFile(null);
      } catch (error) {
        console.error("Error al subir imagen:", error);
      }
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de perfil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>Tu información personal y foto de perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={previewUrl || user.profileImage} />
                <AvatarFallback className="text-3xl">
                  {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1">
                <label htmlFor="profile-image" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Settings className="h-4 w-4" />
                  </div>
                  <input 
                    id="profile-image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            
            {imageFile && (
              <Button 
                onClick={handleImageUpload}
                disabled={isUploading}
                size="sm"
                className="mb-4"
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Imagen
              </Button>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-medium">{user.fullName}</h3>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="mt-2 inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'manager' ? 'Gestor' : 
                 user.role === 'designer' ? 'Diseñador' : 
                 user.role === 'analyst' ? 'Analista' : 'Creador de Contenido'}
              </div>
              {user.isPrimary && (
                <div className="mt-2 inline-block bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs px-2 py-1 rounded ml-2">
                  Usuario Principal
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Pestañas de edición de perfil */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>Actualiza tus datos personales y preferencias</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="general" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  Preferencias
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  Seguridad
                </TabsTrigger>
              </TabsList>
              
              {/* Contenido de la pestaña General */}
              <TabsContent value="general">
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(handleGeneralSubmit)} className="space-y-6">
                    <FormField
                      control={generalForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={generalForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografía</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Escribe una breve descripción sobre ti..."
                              className="resize-none"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {user.isPrimary && (
                      <FormField
                        control={generalForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="manager">Gestor</SelectItem>
                                <SelectItem value="designer">Diseñador</SelectItem>
                                <SelectItem value="content_creator">Creador de Contenido</SelectItem>
                                <SelectItem value="analyst">Analista</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Solo usuarios principales pueden cambiar su rol.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Cambios
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Contenido de la pestaña Preferencias */}
              <TabsContent value="preferences">
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                    <FormField
                      control={preferencesForm.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idioma</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un idioma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">Inglés</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={preferencesForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Tema Oscuro</FormLabel>
                              <FormDescription>
                                Cambiar entre tema claro y oscuro
                              </FormDescription>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Sun className="h-4 w-4" />
                                <Switch 
                                  checked={field.value === "dark"}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked ? "dark" : "light");
                                  }}
                                />
                                <Moon className="h-4 w-4" />
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar Preferencias
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Contenido de la pestaña Seguridad */}
              <TabsContent value="security">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña Actual</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            La contraseña debe tener al menos 6 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Cambiar Contraseña
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}