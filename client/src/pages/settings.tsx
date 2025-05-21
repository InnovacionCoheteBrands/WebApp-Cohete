import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Save, RefreshCw, Sliders, Shield, Eye, AlertCircle, BellRing, Clock, LifeBuoy, PlayCircle } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import { useAppTourContext } from "@/hooks/use-app-tour";
import { Textarea } from "@/components/ui/textarea";

// Esquema para las configuraciones generales
const generalSettingsSchema = z.object({
  appName: z.string().min(1, {
    message: "El nombre de la aplicación es obligatorio.",
  }),
  language: z.string({
    required_error: "Por favor selecciona un idioma.",
  }),
  dateFormat: z.string({
    required_error: "Por favor selecciona un formato de fecha.",
  }),
  timeFormat: z.string({
    required_error: "Por favor selecciona un formato de hora.",
  }),
  weekStart: z.string({
    required_error: "Por favor selecciona el día de inicio de semana.",
  }),
});

// Esquema para las configuraciones de apariencia
const appearanceSettingsSchema = z.object({
  colorScheme: z.string(),
  theme: z.string(),
  fontSize: z.string(),
  reducedAnimations: z.boolean().default(false),
  highContrastMode: z.boolean().default(false),
});

// Esquema para las configuraciones de notificaciones
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  projectUpdates: z.boolean().default(true),
  commentMentions: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// Esquema para las configuraciones de seguridad
const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.string(),
  rememberDevice: z.boolean().default(true),
  loginNotifications: z.boolean().default(true),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { startTour } = useAppTourContext();
  const [isSaving, setIsSaving] = useState(false);

  // Formulario para configuraciones generales
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      appName: "Cohete Workflow",
      language: "es",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      weekStart: "monday",
    },
  });

  // Formulario para configuraciones de apariencia
  const appearanceForm = useForm<z.infer<typeof appearanceSettingsSchema>>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      colorScheme: "amber",
      theme: theme as string,
      fontSize: "medium",
      reducedAnimations: false,
      highContrastMode: false,
    },
  });

  // Formulario para configuraciones de notificaciones
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      commentMentions: true,
      marketingEmails: false,
    },
  });

  // Formulario para configuraciones de seguridad
  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: "30m",
      rememberDevice: true,
      loginNotifications: true,
    },
  });

  // Actualiza el formulario cuando cambia el tema
  useEffect(() => {
    appearanceForm.setValue("theme", theme);
  }, [theme, appearanceForm]);

  // Maneja cambios manuales en el selector de tema
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    appearanceForm.setValue("theme", newTheme);
  };

  // Función para guardar configuraciones generales
  function onGeneralSubmit(values: z.infer<typeof generalSettingsSchema>) {
    setIsSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "La configuración general se ha actualizado correctamente.",
      });
      console.log("Configuración general:", values);
    }, 800);
  }

  // Función para guardar configuraciones de apariencia
  function onAppearanceSubmit(values: z.infer<typeof appearanceSettingsSchema>) {
    setIsSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de apariencia se han actualizado correctamente.",
      });
      console.log("Configuración de apariencia:", values);
    }, 800);
  }

  // Función para guardar configuraciones de notificaciones
  function onNotificationSubmit(values: z.infer<typeof notificationSettingsSchema>) {
    setIsSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de notificaciones se han actualizado correctamente.",
      });
      console.log("Configuración de notificaciones:", values);
    }, 800);
  }

  // Función para guardar configuraciones de seguridad
  function onSecuritySubmit(values: z.infer<typeof securitySettingsSchema>) {
    setIsSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de seguridad se han actualizado correctamente.",
      });
      console.log("Configuración de seguridad:", values);
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Gestiona tus preferencias y configuración de la aplicación.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList data-tour="settings-tabs" className="bg-card dark:bg-card/90 border dark:border-gray-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">
            <Sliders className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">
            <Eye className="h-4 w-4 mr-2" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">
            <BellRing className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="help" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">
            <LifeBuoy className="h-4 w-4 mr-2" />
            Ayuda
          </TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajusta la configuración general de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="appName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la aplicación</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Este nombre se mostrará en el título de la página y en las notificaciones.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un idioma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en" disabled>English (Próximamente)</SelectItem>
                            <SelectItem value="pt" disabled>Português (Próximamente)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Idioma de la interfaz de usuario.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de fecha</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un formato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (31/12/2025)</SelectItem>
                              <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (12/31/2025)</SelectItem>
                              <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2025-12-31)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="timeFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formato de hora</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un formato" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="24h">24 horas (14:30)</SelectItem>
                              <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="weekStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inicio de semana</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un día" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monday">Lunes</SelectItem>
                            <SelectItem value="sunday">Domingo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Día en que comienza la semana en los calendarios.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Apariencia */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Personalización y Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia visual de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleThemeChange(value as "light" | "dark" | "system");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tema" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Oscuro</SelectItem>
                            <SelectItem value="system">Sistema (Automático)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Elige entre tema claro, oscuro o según tu sistema.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appearanceForm.control}
                    name="colorScheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Esquema de color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un esquema de color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="amber">Ámbar (Predeterminado)</SelectItem>
                            <SelectItem value="blue">Azul</SelectItem>
                            <SelectItem value="green">Verde</SelectItem>
                            <SelectItem value="purple">Púrpura</SelectItem>
                            <SelectItem value="red">Rojo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Color principal de la aplicación.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appearanceForm.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamaño de fuente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tamaño" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Pequeño</SelectItem>
                            <SelectItem value="medium">Medio (Predeterminado)</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Tamaño de texto en toda la aplicación.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="reducedAnimations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Reducir animaciones</FormLabel>
                            <FormDescription>
                              Minimiza las animaciones para mejor rendimiento y accesibilidad.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appearanceForm.control}
                      name="highContrastMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Modo de alto contraste</FormLabel>
                            <FormDescription>
                              Aumenta el contraste para mejorar la legibilidad.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibes notificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Canales de notificación</h3>
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificaciones por email</FormLabel>
                            <FormDescription>
                              Recibe notificaciones importantes por correo electrónico.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificaciones push</FormLabel>
                            <FormDescription>
                              Recibe alertas en tiempo real en el navegador.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tipos de notificaciones</h3>
                    <FormField
                      control={notificationForm.control}
                      name="taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recordatorios de tareas</FormLabel>
                            <FormDescription>
                              Recibe recordatorios sobre fechas límite y tareas asignadas.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="projectUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Actualizaciones de proyectos</FormLabel>
                            <FormDescription>
                              Recibe notificaciones cuando hay cambios en tus proyectos.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="commentMentions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Menciones en comentarios</FormLabel>
                            <FormDescription>
                              Recibe notificaciones cuando te mencionan en comentarios.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Emails de marketing</FormLabel>
                            <FormDescription>
                              Recibe información sobre nuevas funciones y actualizaciones.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y Privacidad</CardTitle>
              <CardDescription>
                Administra la seguridad de tu cuenta y configuración de privacidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Recomendación de seguridad</AlertTitle>
                    <AlertDescription>
                      Te recomendamos activar la autenticación de dos factores para una protección adicional de tu cuenta.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={securityForm.control}
                    name="twoFactorAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">Autenticación de dos factores</FormLabel>
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40">
                              Recomendado
                            </Badge>
                          </div>
                          <FormDescription>
                            Añade una capa adicional de seguridad a tu cuenta.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={securityForm.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiempo de inactividad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tiempo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15m">15 minutos</SelectItem>
                            <SelectItem value="30m">30 minutos</SelectItem>
                            <SelectItem value="1h">1 hora</SelectItem>
                            <SelectItem value="4h">4 horas</SelectItem>
                            <SelectItem value="never">Nunca cerrar sesión</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Tiempo de inactividad antes de cerrar sesión automáticamente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={securityForm.control}
                      name="rememberDevice"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recordar dispositivos</FormLabel>
                            <FormDescription>
                              Mantener sesión iniciada en dispositivos confiables.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="loginNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notificaciones de inicio de sesión</FormLabel>
                            <FormDescription>
                              Recibe notificaciones cuando se accede a tu cuenta desde un nuevo dispositivo.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sección de Ayuda */}
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Ayuda y Soporte</CardTitle>
              <CardDescription>
                Encuentra respuestas a tus preguntas y aprende a usar Cohete Workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal gap-2"
                  onClick={() => startTour('dashboard')}
                >
                  <PlayCircle className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Iniciar recorrido guiado</span>
                    <span className="text-xs text-muted-foreground">Explora las funciones principales de la aplicación</span>
                  </div>
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cómo crear un proyecto?</AccordionTrigger>
                  <AccordionContent>
                    Para crear un proyecto, ve a la sección "Proyectos", haz clic en el botón "Nuevo Proyecto" y completa el formulario con la información necesaria. Una vez creado, podrás añadir tareas, cronogramas y documentos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo generar un cronograma con IA?</AccordionTrigger>
                  <AccordionContent>
                    Puedes generar un cronograma con IA desde la sección "Crear Cronograma Rápido" en el Dashboard. Selecciona un proyecto, elige las plataformas y frecuencias, y haz clic en "Generar". La IA creará un cronograma completo con contenido adaptado a tus necesidades.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cómo gestionar usuarios y permisos?</AccordionTrigger>
                  <AccordionContent>
                    Si eres un usuario primario, puedes administrar usuarios desde la sección "Gestión de Usuarios". Allí podrás invitar nuevos miembros, asignar roles y gestionar permisos. Los usuarios secundarios tienen acceso limitado a ciertas funciones administrativas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cómo exportar cronogramas?</AccordionTrigger>
                  <AccordionContent>
                    Puedes exportar tus cronogramas en formato Excel o PDF desde la vista de detalle de cualquier cronograma. Busca los botones de exportación en la parte inferior del cronograma. Estos archivos son perfectos para compartir con tu equipo o clientes.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Contacto de soporte</h3>
                <p className="text-sm text-muted-foreground">
                  ¿No encuentras respuesta a tu pregunta? Ponte en contacto con nuestro equipo de soporte:
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    Enviar email de soporte
                  </Button>
                  <Button variant="outline">
                    Abrir chat de soporte
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Versión 1.0.3 • Última actualización: 10/05/2025
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}