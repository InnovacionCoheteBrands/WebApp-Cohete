import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import {
  Settings,
  User,
  Key,
  Bell,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

// Definimos el esquema para la configuración del usuario
const userSettingsSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Por favor, introduce un email válido"),
  language: z.enum(["es"], {
    required_error: "Por favor, selecciona un idioma",
  }).default("es"),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Debes introducir tu contraseña actual para cambiarla",
  path: ["currentPassword"]
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

// Definimos el esquema para la configuración de notificaciones
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  taskAssignmentNotifications: z.boolean().default(true),
  taskCompletionNotifications: z.boolean().default(true),
  commentNotifications: z.boolean().default(true),
  projectUpdatesNotifications: z.boolean().default(true),
  scheduleCreationNotifications: z.boolean().default(true),
});

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

// Definimos el esquema para la configuración de seguridad
const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.enum(["30min", "1hour", "4hours", "8hours", "never"]).default("4hours"),
});

type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;

// Definimos el esquema para la configuración de API
const apiSettingsSchema = z.object({
  apiKey: z.string().optional(),
  webhookUrl: z.string().url("Por favor, introduce una URL válida").optional().or(z.literal("")),
});

type ApiSettingsFormValues = z.infer<typeof apiSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);

  // Formularios
  const profileForm = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.username || "",
      language: "es",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationsForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      taskAssignmentNotifications: true,
      taskCompletionNotifications: true,
      commentNotifications: true,
      projectUpdatesNotifications: true,
      scheduleCreationNotifications: true,
    },
  });

  const securityForm = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: "4hours",
    },
  });

  const apiForm = useForm<ApiSettingsFormValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: "",
      webhookUrl: "",
    },
  });

  // Obtener configuración del usuario
  const { data: userSettings, isLoading: userSettingsLoading } = useQuery({
    queryKey: ['/api/settings/user'],
    enabled: !!user,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        profileForm.reset({
          fullName: data.fullName || user?.fullName || "",
          email: data.email || user?.username || "",
          language: data.language || "es",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    },
    onError: () => {
      // En caso de error, dejamos los valores default
    }
  });

  // Obtener configuración de notificaciones
  const { data: notificationSettings, isLoading: notificationSettingsLoading } = useQuery({
    queryKey: ['/api/settings/notifications'],
    enabled: !!user,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        notificationsForm.reset({
          emailNotifications: data.emailNotifications,
          taskAssignmentNotifications: data.taskAssignmentNotifications,
          taskCompletionNotifications: data.taskCompletionNotifications,
          commentNotifications: data.commentNotifications,
          projectUpdatesNotifications: data.projectUpdatesNotifications,
          scheduleCreationNotifications: data.scheduleCreationNotifications,
        });
      }
    },
    onError: () => {
      // En caso de error, dejamos los valores default
    }
  });

  // Obtener configuración de seguridad
  const { data: securitySettings, isLoading: securitySettingsLoading } = useQuery({
    queryKey: ['/api/settings/security'],
    enabled: !!user,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        securityForm.reset({
          twoFactorAuth: data.twoFactorAuth,
          sessionTimeout: data.sessionTimeout,
        });
      }
    },
    onError: () => {
      // En caso de error, dejamos los valores default
    }
  });

  // Obtener configuración de API
  const { data: apiSettings, isLoading: apiSettingsLoading } = useQuery({
    queryKey: ['/api/settings/api'],
    enabled: !!user,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        apiForm.reset({
          apiKey: data.apiKey,
          webhookUrl: data.webhookUrl,
        });
      }
    },
    onError: () => {
      // En caso de error, dejamos los valores default
    }
  });

  // Mutaciones para guardar configuración
  const profileMutation = useMutation({
    mutationFn: async (values: UserSettingsFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings/user', values);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar el perfil");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "La información de tu perfil ha sido actualizada con éxito.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: async (values: NotificationSettingsFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings/notifications', values);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar las notificaciones");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notificaciones actualizadas",
        description: "La configuración de notificaciones ha sido actualizada con éxito.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/notifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const securityMutation = useMutation({
    mutationFn: async (values: SecuritySettingsFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings/security', values);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar la seguridad");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Seguridad actualizada",
        description: "La configuración de seguridad ha sido actualizada con éxito.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/security'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const apiMutation = useMutation({
    mutationFn: async (values: ApiSettingsFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings/api', values);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar la configuración de API");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración de API actualizada",
        description: "La configuración de API ha sido actualizada con éxito.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/api'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler para generar nueva API key
  const handleGenerateApiKey = async () => {
    try {
      setIsGeneratingApiKey(true);
      const response = await apiRequest('POST', '/api/settings/generate-api-key', {});
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al generar la API key");
      }
      
      const data = await response.json();
      apiForm.setValue('apiKey', data.apiKey);
      
      toast({
        title: "API key generada",
        description: "Se ha generado una nueva API key. La anterior ha quedado invalidada.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/settings/api'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar la API key",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingApiKey(false);
    }
  };

  // Handler para cambiar el tema
  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setTheme(theme);
    toast({
      title: "Tema cambiado",
      description: `Tema cambiado a ${theme === "light" ? "claro" : theme === "dark" ? "oscuro" : "sistema"}.`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        {/* Encabezado de página */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-600 dark:bg-gradient-to-br dark:from-amber-500/30 dark:to-amber-600/30 dark:text-amber-400">
              <Settings className="h-6 w-6" />
            </span>
            Configuración
          </h1>
          <p className="text-muted-foreground mt-1 dark:text-slate-400">
            Administra las preferencias de tu cuenta y personaliza la aplicación
          </p>
        </div>

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-1 md:grid-cols-5 gap-2 dark:bg-[#1e293b] dark:border dark:border-[#3e4a6d]">
            <TabsTrigger value="perfil" className="flex items-center gap-2 dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="apariencia" className="flex items-center gap-2 dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center gap-2 dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2 dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 dark:data-[state=active]:bg-[#2a3349] dark:data-[state=active]:text-white dark:text-slate-400">
              <Key className="h-4 w-4" />
              <span className="hidden md:inline">API</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Información Personal
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Actualiza tu información personal y contraseña
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userSettingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(data => profileMutation.mutate(data))} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">Nombre completo</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator className="my-6 dark:bg-[#2a3349]" />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Cambiar contraseña</h3>
                        
                        <FormField
                          control={profileForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">Contraseña actual</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="dark:text-slate-300">Nueva contraseña</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="dark:text-slate-300">Confirmar contraseña</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="gap-2"
                          disabled={profileMutation.isPending}
                        >
                          {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Apariencia */}
          <TabsContent value="apariencia" className="space-y-6">
            <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Personalización de la Interfaz
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Personaliza la apariencia de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium dark:text-white">Tema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        className={`h-auto py-8 justify-center items-center flex-col gap-4 ${
                          theme === "light" 
                            ? "bg-amber-600 hover:bg-amber-700 text-white" 
                            : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                        }`}
                        onClick={() => handleThemeChange("light")}
                      >
                        <div className="w-full px-4">
                          <div className="h-24 rounded-md border dark:border-[#3e4a6d] bg-white dark:bg-white p-2 flex flex-col">
                            <div className="w-full rounded-sm h-3 mb-2 bg-amber-500"></div>
                            <div className="flex-1 flex gap-2">
                              <div className="w-10 h-10 rounded-sm bg-gray-200"></div>
                              <div className="flex-1 space-y-1">
                                <div className="w-full h-1 rounded-sm bg-gray-200"></div>
                                <div className="w-2/3 h-1 rounded-sm bg-gray-200"></div>
                                <div className="w-1/2 h-1 rounded-sm bg-gray-200"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">Modo Claro</span>
                      </Button>
                      
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        className={`h-auto py-8 justify-center items-center flex-col gap-4 ${
                          theme === "dark" 
                            ? "bg-amber-600 hover:bg-amber-700 text-white" 
                            : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                        }`}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <div className="w-full px-4">
                          <div className="h-24 rounded-md border dark:border-[#3e4a6d] bg-[#1a1d2d] dark:bg-[#1a1d2d] p-2 flex flex-col">
                            <div className="w-full rounded-sm h-3 mb-2 bg-amber-500 dark:bg-amber-500"></div>
                            <div className="flex-1 flex gap-2">
                              <div className="w-10 h-10 rounded-sm bg-[#2a3349] dark:bg-[#2a3349]"></div>
                              <div className="flex-1 space-y-1">
                                <div className="w-full h-1 rounded-sm bg-[#2a3349] dark:bg-[#2a3349]"></div>
                                <div className="w-2/3 h-1 rounded-sm bg-[#2a3349] dark:bg-[#2a3349]"></div>
                                <div className="w-1/2 h-1 rounded-sm bg-[#2a3349] dark:bg-[#2a3349]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">Modo Oscuro</span>
                      </Button>
                      
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        className={`h-auto py-8 justify-center items-center flex-col gap-4 ${
                          theme === "system" 
                            ? "bg-amber-600 hover:bg-amber-700 text-white" 
                            : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                        }`}
                        onClick={() => handleThemeChange("system")}
                      >
                        <div className="w-full px-4">
                          <div className="h-24 rounded-md border dark:border-[#3e4a6d] bg-gradient-to-r from-white to-[#1a1d2d] dark:from-white dark:to-[#1a1d2d] p-2 flex flex-col">
                            <div className="w-full rounded-sm h-3 mb-2 bg-amber-500"></div>
                            <div className="flex-1 flex gap-2">
                              <div className="w-10 h-10 rounded-sm bg-gradient-to-r from-gray-200 to-[#2a3349]"></div>
                              <div className="flex-1 space-y-1">
                                <div className="w-full h-1 rounded-sm bg-gradient-to-r from-gray-200 to-[#2a3349]"></div>
                                <div className="w-2/3 h-1 rounded-sm bg-gradient-to-r from-gray-200 to-[#2a3349]"></div>
                                <div className="w-1/2 h-1 rounded-sm bg-gradient-to-r from-gray-200 to-[#2a3349]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">Sistema</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-300/80">
                      El tema de sistema utilizará automáticamente el modo claro u oscuro según la configuración de tu sistema operativo.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notificaciones */}
          <TabsContent value="notificaciones" className="space-y-6">
            <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Preferencias de Notificaciones
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Configura cómo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationSettingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...notificationsForm}>
                    <form onSubmit={notificationsForm.handleSubmit(data => notificationsMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium dark:text-white">Notificaciones por email</h3>
                            <p className="text-sm text-muted-foreground dark:text-slate-400">Recibe actualizaciones por email</p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-4 dark:bg-[#2a3349]" />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="taskAssignmentNotifications"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Asignación de tareas</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Notificar cuando se te asigne una tarea</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="taskCompletionNotifications"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Completación de tareas</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Notificar cuando se complete una tarea</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="commentNotifications"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Comentarios</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Notificar cuando alguien comente en tus tareas</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="projectUpdatesNotifications"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Actualizaciones de proyectos</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Notificar sobre cambios en proyectos</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={notificationsForm.control}
                          name="scheduleCreationNotifications"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Creación de calendarios</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Notificar cuando se genere un nuevo calendario</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="gap-2"
                          disabled={notificationsMutation.isPending}
                        >
                          {notificationsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Seguridad */}
          <TabsContent value="seguridad" className="space-y-6">
            <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Seguridad de la Cuenta
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Configura los ajustes de seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securitySettingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(data => securityMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="twoFactorAuth"
                          render={({ field }) => (
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium dark:text-white">Autenticación de dos factores</h3>
                                <p className="text-sm text-muted-foreground dark:text-slate-400">Añade una capa adicional de seguridad a tu cuenta</p>
                              </div>
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="dark:data-[state=checked]:bg-amber-500"
                                  />
                                </FormControl>
                              </FormItem>
                            </div>
                          )}
                        />
                        
                        <Separator className="my-4 dark:bg-[#2a3349]" />
                        
                        <FormField
                          control={securityForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">Tiempo de expiración de sesión</FormLabel>
                              <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                                Configura cuánto tiempo debe pasar para que la sesión expire por inactividad
                              </FormDescription>
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant={field.value === "30min" ? "default" : "outline"}
                                  className={field.value === "30min" ? "bg-amber-600 hover:bg-amber-700" : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"}
                                  onClick={() => field.onChange("30min")}
                                >
                                  30 min
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "1hour" ? "default" : "outline"}
                                  className={field.value === "1hour" ? "bg-amber-600 hover:bg-amber-700" : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"}
                                  onClick={() => field.onChange("1hour")}
                                >
                                  1 hora
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "4hours" ? "default" : "outline"}
                                  className={field.value === "4hours" ? "bg-amber-600 hover:bg-amber-700" : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"}
                                  onClick={() => field.onChange("4hours")}
                                >
                                  4 horas
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "8hours" ? "default" : "outline"}
                                  className={field.value === "8hours" ? "bg-amber-600 hover:bg-amber-700" : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"}
                                  onClick={() => field.onChange("8hours")}
                                >
                                  8 horas
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "never" ? "default" : "outline"}
                                  className={field.value === "never" ? "bg-amber-600 hover:bg-amber-700" : "dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"}
                                  onClick={() => field.onChange("never")}
                                >
                                  Nunca
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="gap-2"
                          disabled={securityMutation.isPending}
                        >
                          {securityMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
            
            <Alert className="border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">Importante</AlertTitle>
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-300/80">
                La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta. Cuando está habilitada, se te pedirá un código de verificación además de tu contraseña durante el inicio de sesión.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Tab: API */}
          <TabsContent value="api" className="space-y-6">
            <Card className="dark:border-[#2a3349] dark:bg-[#1a1d2d]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Configuración de API
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Administra el acceso a la API de Cohete Workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiSettingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...apiForm}>
                    <form onSubmit={apiForm.handleSubmit(data => apiMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={apiForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">API Key</FormLabel>
                              <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                                Esta clave te permite acceder a la API de Cohete Workflow. Mantén esta clave segura.
                              </FormDescription>
                              <div className="flex mt-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    readOnly
                                    type="password"
                                    className="flex-1 dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="ml-2 gap-2 dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                  onClick={handleGenerateApiKey}
                                  disabled={isGeneratingApiKey}
                                >
                                  {isGeneratingApiKey ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                  Generar nueva
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiForm.control}
                          name="webhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-slate-300">URL de Webhook</FormLabel>
                              <FormDescription className="text-xs text-muted-foreground dark:text-slate-500">
                                Recibe notificaciones de eventos a esta URL
                              </FormDescription>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="https://ejemplo.com/webhook"
                                  className="dark:border-[#3e4a6d] dark:bg-[#1e293b] dark:text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-300/80">
                          Las API keys te permiten integrar Cohete Workflow con otros servicios y automatizar procesos. Nunca compartas tu API key públicamente.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="gap-2"
                          disabled={apiMutation.isPending}
                        >
                          {apiMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}