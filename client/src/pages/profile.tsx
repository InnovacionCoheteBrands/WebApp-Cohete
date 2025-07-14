import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, uploadFile } from "@/lib/queryClient";
import { Camera, Upload, User, Loader2, Settings, Plus, X, MapPin, Briefcase, Heart, Award, Lock, Activity, Bell, Shield, BarChart3, Calendar, Clock, CheckCircle2, Eye, EyeOff, Edit, Save, Trash2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Import avatars from assets
import astronaut1 from "@assets/Image_fx (81)_1750440002891.jpg";
import astronaut2 from "@assets/Image_fx (80)_1750440005597.jpg";
import astronaut3 from "@assets/Image_fx (78)_1750440024672.jpg";
import astronaut4 from "@assets/Image_fx (82)_1750440102531.jpg";
import astronaut5 from "@assets/Image_fx (76)_1750440109336.jpg";
import astronaut6 from "@assets/Image_fx (74)_1750440111516.jpg";

const preloadedAvatars = [
  { id: 1, name: "Astronauta Cibernetico", src: astronaut1 },
  { id: 2, name: "Astronauta Clásico", src: astronaut2 },
  { id: 3, name: "Astronauta Espacial", src: astronaut3 },
  { id: 4, name: "Astronauta Galáctico", src: astronaut4 },
  { id: 5, name: "Astronauta Oscuro", src: astronaut5 },
  { id: 6, name: "Astronauta Rosa", src: astronaut6 },
];

interface CustomField {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'email' | 'url' | 'tel';
}

interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  jobTitle: string;
  department: string;
  phoneNumber: string;
  customFields: CustomField[];
  isPrimary: boolean;
  role: string;
  createdAt: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    projectUpdates: boolean;
    taskReminders: boolean;
    weeklyReports: boolean;
  };
}

interface UserStats {
  projectsCreated: number;
  tasksCompleted: number;
  totalSchedules: number;
  totalCollaborations: number;
  profileCompleteness: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Schema for change password form
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La confirmación de contraseña es requerida"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<'text' | 'email' | 'url' | 'tel'>('text');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>("");
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<UserProfile>>({});

  // Fetch user profile
  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user"],
  });

  // Fetch user statistics
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    staleTime: 30000, // 30 seconds
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery<RecentActivity[]>({
    queryKey: ["/api/user/activity"],
    staleTime: 60000, // 1 minute
  });

  // Form for changing password
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      console.log("Ejecutando mutación con datos:", data);
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: (data) => {
      console.log("Mutación exitosa:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setPendingChanges({}); // Limpiar cambios pendientes
      setIsEditModalOpen(false); // Cerrar modal de edición
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error en mutación:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      return apiRequest("POST", "/api/profile/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contraseña cambiada",
        description: "Tu contraseña ha sido actualizada exitosamente",
      });
      setIsChangePasswordOpen(false);
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload cover image mutation
  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("coverImage", file);
      return uploadFile("/api/user/cover-image", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setCoverImagePreview("");
      setCoverImageFile(null);
      toast({
        title: "Imagen de portada actualizada",
        description: "La imagen se ha subido correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen de portada",
        variant: "destructive",
      });
    },
  });

  const handleAvatarSelect = (avatarSrc: string) => {
    setSelectedAvatar(avatarSrc);
    updateProfileMutation.mutate({ profileImage: avatarSrc });
    setIsAvatarDialogOpen(false);
  };

  const handleCustomImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profileImage', file);

        // Hacer la petición al endpoint con autenticación usando uploadFile
        const response = await uploadFile('/api/user/profile-image', formData);

        if (response.profileImage) {
          // Invalidar cache y actualizar UI
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          setIsAvatarDialogOpen(false);
          toast({
            title: "Imagen actualizada",
            description: "Tu foto de perfil se ha actualizado correctamente",
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo actualizar el perfil",
          variant: "destructive",
        });
      }
    }
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = () => {
    if (coverImageFile) {
      // En lugar de subir directamente, agregar a cambios pendientes
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        handleFieldUpdate('coverImage', imageData);
        toast({
          title: "Imagen preparada",
          description: "La imagen de portada se guardará al hacer clic en 'Guardar Cambios'",
        });
      };
      reader.readAsDataURL(coverImageFile);
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona una imagen válida.",
          variant: "destructive",
        });
        return;
      }

      // Actualizar imagen de perfil
      uploadProfileMutation.mutate(file);
    }
  };

  const handleFieldUpdate = (field: keyof UserProfile, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAllChanges = async () => {
    console.log("Cambios pendientes:", pendingChanges);
    console.log("Selected avatar:", selectedAvatar);
    
    // Crear objeto con todos los cambios, incluyendo la imagen seleccionada
    const allChanges = { ...pendingChanges };
    
    // Si hay una imagen seleccionada, incluirla en los cambios
    if (selectedAvatar) {
      allChanges.profileImage = selectedAvatar;
    }
    
    // Si hay una imagen de portada preparada, subirla primero
    if (coverImageFile) {
      try {
        const formData = new FormData();
        formData.append("coverImage", coverImageFile);
        const response = await uploadFile("/api/user/cover-image", formData);
        
        if (response.ok) {
          const result = await response.json();
          allChanges.coverImage = result.coverImage;
        }
      } catch (error) {
        console.error("Error uploading cover image:", error);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen de portada",
          variant: "destructive",
        });
        return;
      }
    }
    
    console.log("Todos los cambios a enviar:", allChanges);
    
    if (Object.keys(allChanges).length > 0) {
      updateProfileMutation.mutate(allChanges);
    } else {
      toast({
        title: "No hay cambios",
        description: "No se han realizado cambios para guardar",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  const calculateProfileCompleteness = () => {
    if (!user) return 0;
    
    const fields = [
      user.fullName,
      user.email,
      user.bio,
      user.profileImage,
      user.jobTitle,
      user.department,
      user.phoneNumber,
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
      const newField: CustomField = {
        id: Date.now().toString(),
        name: newFieldName,
        value: "",
        type: newFieldType,
      };
      const updatedFields = [...customFields, newField];
      setCustomFields(updatedFields);
      handleFieldUpdate('customFields', updatedFields);
      setNewFieldName("");
      setNewFieldType('text');
    }
  };

  const removeCustomField = (fieldId: string) => {
    const updatedFields = customFields.filter(field => field.id !== fieldId);
    setCustomFields(updatedFields);
    handleFieldUpdate('customFields', updatedFields);
  };

  const updateCustomField = (fieldId: string, value: string) => {
    const updatedFields = customFields.map(field =>
      field.id === fieldId ? { ...field, value } : field
    );
    setCustomFields(updatedFields);
    handleFieldUpdate('customFields', updatedFields);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Personaliza tu información personal y presenta tu perfil profesional</p>
          </div>
        </div>

        {/* Cover Image Section */}
        <Card>
          <CardContent className="p-0">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
              {user?.coverImage || coverImagePreview ? (
                <img
                  src={coverImagePreview || user?.coverImage}
                  alt="Imagen de portada"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
              )}


            </div>

            {/* Profile Picture */}
            <div className="relative -mt-16 ml-6 mb-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>


              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Proyectos Creados</p>
                  <p className="text-2xl font-bold">{userStats?.projectsCreated || 0}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tareas Completadas</p>
                  <p className="text-2xl font-bold">{userStats?.tasksCompleted || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cronogramas</p>
                  <p className="text-2xl font-bold">{userStats?.totalSchedules || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completitud</p>
                  <p className="text-2xl font-bold">{calculateProfileCompleteness()}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <Progress value={calculateProfileCompleteness()} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>

        {/* Modal de Edición de Perfil */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
              <div className="p-4">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="professional">Profesional</TabsTrigger>
                    <TabsTrigger value="images">Imágenes</TabsTrigger>
                  </TabsList>

                  {/* Personal Tab */}
                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Información Personal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="modal-fullName">Nombre Completo</Label>
                            <Input
                              id="modal-fullName"
                              defaultValue={user?.fullName}
                              onBlur={(e) => handleFieldUpdate('fullName', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-username">Nombre de Usuario</Label>
                            <Input
                              id="modal-username"
                              defaultValue={user?.username}
                              onBlur={(e) => handleFieldUpdate('username', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-email">Correo Electrónico</Label>
                            <Input
                              id="modal-email"
                              type="email"
                              defaultValue={user?.email}
                              onBlur={(e) => handleFieldUpdate('email', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-phoneNumber">Teléfono</Label>
                            <Input
                              id="modal-phoneNumber"
                              defaultValue={user?.phoneNumber}
                              onBlur={(e) => handleFieldUpdate('phoneNumber', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="modal-bio">Biografía</Label>
                          <Textarea
                            id="modal-bio"
                            placeholder="Cuéntanos sobre ti..."
                            defaultValue={user?.bio}
                            onBlur={(e) => handleFieldUpdate('bio', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Professional Tab */}
                  <TabsContent value="professional" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Información Profesional
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="modal-jobTitle">Cargo</Label>
                            <Input
                              id="modal-jobTitle"
                              placeholder="Ej: Gerente de Marketing"
                              defaultValue={user?.jobTitle}
                              onBlur={(e) => handleFieldUpdate('jobTitle', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-department">Departamento</Label>
                            <Input
                              id="modal-department"
                              placeholder="Ej: Marketing Digital"
                              defaultValue={user?.department}
                              onBlur={(e) => handleFieldUpdate('department', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Custom Fields */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Campos Personalizados</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newField: CustomField = {
                                  id: Date.now().toString(),
                                  name: '',
                                  value: '',
                                  type: 'text'
                                };
                                setCustomFields([...customFields, newField]);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Campo
                            </Button>
                          </div>

                          {customFields.map((field) => (
                            <div key={field.id} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Label htmlFor={`field-name-${field.id}`}>Nombre</Label>
                                <Input
                                  id={`field-name-${field.id}`}
                                  placeholder="Ej: LinkedIn"
                                  value={field.name}
                                  onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`field-value-${field.id}`}>Valor</Label>
                                <Input
                                  id={`field-value-${field.id}`}
                                  placeholder="Ej: linkedin.com/in/usuario"
                                  value={field.value}
                                  onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                />
                              </div>
                              <div className="w-24">
                                <Label htmlFor={`field-type-${field.id}`}>Tipo</Label>
                                <Select value={field.type} onValueChange={(value) => updateCustomField(field.id, 'type', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Texto</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                    <SelectItem value="tel">Teléfono</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeCustomField(field.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Images Tab */}
                  <TabsContent value="images" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          Imágenes de Perfil
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Cover Image */}
                        <div className="space-y-4">
                          <h3 className="font-medium">Imagen de Portada</h3>
                          <div className="relative group">
                            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                              {user?.coverImage || coverImagePreview ? (
                                <img
                                  src={coverImagePreview || user?.coverImage}
                                  alt="Imagen de portada"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
                              )}
                            </div>
                            {/* Overlay con botón de editar */}
                            {(user?.coverImage || coverImagePreview) && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setImageToEdit(coverImagePreview || user?.coverImage || "");
                                    setIsImageEditorOpen(true);
                                  }}
                                  className="text-white border-white bg-black/50 hover:bg-black/70"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverImageChange}
                              className="hidden"
                              id="cover-upload-modal"
                            />
                            <Label htmlFor="cover-upload-modal">
                              <Button size="sm" className="cursor-pointer" asChild>
                                <span>
                                  <Camera className="h-4 w-4 mr-2" />
                                  Cambiar Portada
                                </span>
                              </Button>
                            </Label>
                            {coverImagePreview && (
                              <Button
                                size="sm"
                                onClick={handleCoverImageUpload}
                                disabled={uploadCoverMutation.isPending}
                              >
                                {uploadCoverMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                Subir
                              </Button>
                            )}
                            {(user?.coverImage || coverImagePreview) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setImageToEdit(coverImagePreview || user?.coverImage || "");
                                  setIsImageEditorOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Profile Picture */}
                        <div className="space-y-4">
                          <h3 className="font-medium">Foto de Perfil</h3>
                          <div className="flex flex-col items-center gap-4">
                            {/* Vista previa más grande y cuadrada */}
                            <div className="relative group">
                              <div className="h-40 w-40 rounded-lg border-2 border-border bg-muted overflow-hidden">
                                {user?.profileImage ? (
                                  <img
                                    src={user.profileImage}
                                    alt="Foto de perfil"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <User className="h-20 w-20 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              {/* Overlay con botón de editar */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setIsAvatarDialogOpen(true)}
                                  className="text-white border-white bg-black/50 hover:bg-black/70"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                              </div>
                            </div>
                            
                            {/* Botones de acción */}
                            <div className="flex gap-2">
                              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Cambiar Foto
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Seleccionar Avatar</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-4 space-y-6">
                                    {/* Vista previa actual más grande */}
                                    <div className="flex justify-center">
                                      <div className="h-48 w-48 rounded-lg border-2 border-border bg-muted overflow-hidden">
                                        {user?.profileImage ? (
                                          <img
                                            src={user.profileImage}
                                            alt="Foto de perfil actual"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <User className="h-24 w-24 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Opción para subir imagen personalizada */}
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                      <div className="text-center">
                                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Subir imagen personalizada</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                          Sube tu propia foto de perfil (JPG, PNG, máx. 5MB)
                                        </p>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleCustomImageUpload}
                                          className="hidden"
                                          id="custom-avatar-upload-modal"
                                        />
                                        <Button asChild>
                                          <label htmlFor="custom-avatar-upload-modal" className="cursor-pointer">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Seleccionar archivo
                                          </label>
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Separador */}
                                    <div className="relative">
                                      <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                      </div>
                                      <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                          O elige un avatar predefinido
                                        </span>
                                      </div>
                                    </div>

                                    {/* Avatares predefinidos */}
                                    <div className="grid grid-cols-4 gap-4">
                                      {preloadedAvatars.map((avatar) => (
                                        <div
                                          key={avatar.id}
                                          className="cursor-pointer group relative overflow-hidden rounded-lg hover:scale-105 transition-transform"
                                          onClick={() => handleAvatarSelect(avatar.src)}
                                        >
                                          <img
                                            src={avatar.src}
                                            alt={avatar.name}
                                            className="w-full h-32 object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-sm font-medium text-center px-2">
                                              {avatar.name}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {user?.profileImage && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsAvatarDialogOpen(true)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Botón Guardar */}
              <div className="flex justify-end p-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveAllChanges}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Display Section */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.fullName || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nombre de Usuario</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.username || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Correo Electrónico</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.email || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.phoneNumber || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Biografía</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.bio || 'No especificado'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Cargo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.jobTitle || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.department || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Ubicación</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.location || 'No especificado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sitio Web</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {user?.website || 'No especificado'}
                  </div>
                </div>

                {/* Social Links Display */}
                {(user?.socialLinks?.linkedin || user?.socialLinks?.twitter || user?.socialLinks?.github) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Redes Sociales</Label>
                    <div className="space-y-1">
                      {user?.socialLinks?.linkedin && (
                        <div className="p-2 bg-muted rounded-md text-sm">
                          <span className="font-medium">LinkedIn:</span> {user.socialLinks.linkedin}
                        </div>
                      )}
                      {user?.socialLinks?.twitter && (
                        <div className="p-2 bg-muted rounded-md text-sm">
                          <span className="font-medium">Twitter:</span> {user.socialLinks.twitter}
                        </div>
                      )}
                      {user?.socialLinks?.github && (
                        <div className="p-2 bg-muted rounded-md text-sm">
                          <span className="font-medium">GitHub:</span> {user.socialLinks.github}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Fields Display */}
                {user?.customFields && user.customFields.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Campos Personalizados</Label>
                    <div className="space-y-1">
                      {user.customFields.map((field) => (
                        <div key={field.id} className="p-2 bg-muted rounded-md text-sm">
                          <span className="font-medium">{field.name}:</span> {field.value || 'No especificado'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>



          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Seguridad de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Cambiar Contraseña</h3>
                      <p className="text-sm text-muted-foreground">
                        Actualiza tu contraseña para mantener tu cuenta segura
                      </p>
                    </div>
                    <Button onClick={() => setIsChangePasswordOpen(true)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Tipo de Cuenta</h3>
                      <p className="text-sm text-muted-foreground">
                        Tu nivel de acceso en la plataforma
                      </p>
                    </div>
                    <Badge variant={user?.isPrimary ? "default" : "secondary"}>
                      {user?.isPrimary ? "Administrador" : "Usuario Estándar"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Miembro desde</h3>
                      <p className="text-sm text-muted-foreground">
                        Fecha de registro en la plataforma
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferencias de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificaciones por Email</h3>
                      <p className="text-sm text-muted-foreground">
                        Recibe actualizaciones importantes por correo electrónico
                      </p>
                    </div>
                    <Switch
                      checked={user?.preferences?.emailNotifications ?? true}
                      onCheckedChange={(checked) => 
                        handleFieldUpdate('preferences', { 
                          ...user?.preferences, 
                          emailNotifications: checked 
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Actualizaciones de Proyecto</h3>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones sobre cambios en tus proyectos
                      </p>
                    </div>
                    <Switch
                      checked={user?.preferences?.projectUpdates ?? true}
                      onCheckedChange={(checked) => 
                        handleFieldUpdate('preferences', { 
                          ...user?.preferences, 
                          projectUpdates: checked 
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Recordatorios de Tareas</h3>
                      <p className="text-sm text-muted-foreground">
                        Recordatorios sobre tareas pendientes y vencimientos
                      </p>
                    </div>
                    <Switch
                      checked={user?.preferences?.taskReminders ?? true}
                      onCheckedChange={(checked) => 
                        handleFieldUpdate('preferences', { 
                          ...user?.preferences, 
                          taskReminders: checked 
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Reportes Semanales</h3>
                      <p className="text-sm text-muted-foreground">
                        Resumen semanal de tu actividad y progreso
                      </p>
                    </div>
                    <Switch
                      checked={user?.preferences?.weeklyReports ?? false}
                      onCheckedChange={(checked) => 
                        handleFieldUpdate('preferences', { 
                          ...user?.preferences, 
                          weeklyReports: checked 
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay actividad reciente</p>
                      <p className="text-sm">Comienza creando proyectos y tareas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Fields Tab (moved from original) */}
          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Campos Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Custom Field */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Agregar Campo Personalizado</h3>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del campo (ej: LinkedIn, GitHub)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="tel">Teléfono</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addCustomField} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Custom Fields List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mis Campos Personalizados</h3>

                  {customFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No has agregado campos personalizados aún</p>
                      <p className="text-sm">Agrega información adicional como redes sociales, sitios web, etc.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">{field.name}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomField(field.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            type={field.type}
                            defaultValue={field.value}
                            onBlur={(e) => updateCustomField(field.id, e.target.value)}
                            placeholder={`Ingresa tu ${field.name.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal y profesional
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="professional">Profesional</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
            </TabsList>
            
            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input
                      value={pendingChanges.fullName || user?.fullName || ''}
                      onChange={(e) => handleFieldUpdate('fullName', e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label>Nombre de usuario</Label>
                    <Input
                      value={pendingChanges.username || user?.username || ''}
                      onChange={(e) => handleFieldUpdate('username', e.target.value)}
                      placeholder="Tu nombre de usuario"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={pendingChanges.phoneNumber || user?.phoneNumber || ''}
                      onChange={(e) => handleFieldUpdate('phoneNumber', e.target.value)}
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={pendingChanges.location || user?.location || ''}
                      onChange={(e) => handleFieldUpdate('location', e.target.value)}
                      placeholder="Tu ubicación"
                    />
                  </div>
                </div>
                <div>
                  <Label>Biografía</Label>
                  <Textarea
                    value={pendingChanges.bio || user?.bio || ''}
                    onChange={(e) => handleFieldUpdate('bio', e.target.value)}
                    placeholder="Cuéntanos sobre ti"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información Profesional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cargo</Label>
                    <Input
                      value={pendingChanges.jobTitle || user?.jobTitle || ''}
                      onChange={(e) => handleFieldUpdate('jobTitle', e.target.value)}
                      placeholder="Tu cargo o posición"
                    />
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <Input
                      value={pendingChanges.department || user?.department || ''}
                      onChange={(e) => handleFieldUpdate('department', e.target.value)}
                      placeholder="Tu departamento"
                    />
                  </div>
                  <div>
                    <Label>Sitio Web</Label>
                    <Input
                      value={pendingChanges.website || user?.website || ''}
                      onChange={(e) => handleFieldUpdate('website', e.target.value)}
                      placeholder="Tu sitio web profesional"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <Input
                      value={pendingChanges.socialLinks?.linkedin || user?.socialLinks?.linkedin || ''}
                      onChange={(e) => handleFieldUpdate('socialLinks', { 
                        ...pendingChanges.socialLinks, 
                        linkedin: e.target.value 
                      })}
                      placeholder="Tu perfil de LinkedIn"
                    />
                  </div>
                  <div>
                    <Label>GitHub</Label>
                    <Input
                      value={pendingChanges.socialLinks?.github || user?.socialLinks?.github || ''}
                      onChange={(e) => handleFieldUpdate('socialLinks', { 
                        ...pendingChanges.socialLinks, 
                        github: e.target.value 
                      })}
                      placeholder="Tu perfil de GitHub"
                    />
                  </div>
                  <div>
                    <Label>Twitter</Label>
                    <Input
                      value={pendingChanges.socialLinks?.twitter || user?.socialLinks?.twitter || ''}
                      onChange={(e) => handleFieldUpdate('socialLinks', { 
                        ...pendingChanges.socialLinks, 
                        twitter: e.target.value 
                      })}
                      placeholder="Tu perfil de Twitter"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Gestión de Imágenes</h3>
                
                {/* Profile Image Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Foto de Perfil</h4>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-lg border-2 border-border bg-muted overflow-hidden">
                        {(selectedAvatar || user?.profileImage) ? (
                          <img
                            src={selectedAvatar || user?.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Haz clic en la imagen para cambiar tu foto de perfil
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.querySelector('input[type="file"]')?.click()}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Cambiar Foto
                        </Button>
                        {user?.profileImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Aquí puedes agregar lógica para eliminar la imagen de perfil
                              toast({
                                title: "Funcionalidad pendiente",
                                description: "La eliminación de imagen se implementará próximamente",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preloaded Avatars Section */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Selecciona una imagen predefinida</h5>
                    <div className="grid grid-cols-6 gap-3">
                      {preloadedAvatars.map((avatar) => (
                        <div
                          key={avatar.id}
                          className="relative cursor-pointer group"
                          onClick={() => {
                            // Actualizar imagen de perfil con imagen predefinida
                            const imageUrl = avatar.src;
                            setSelectedAvatar(imageUrl);
                            handleFieldUpdate('profileImage', imageUrl);
                            toast({
                              title: "Imagen seleccionada",
                              description: `Has seleccionado: ${avatar.name}. Recuerda guardar los cambios.`,
                            });
                          }}
                        >
                          <div className="w-16 h-16 rounded-lg border-2 border-border bg-muted overflow-hidden hover:border-primary transition-colors">
                            <img
                              src={avatar.src}
                              alt={avatar.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en cualquier imagen para seleccionarla como tu foto de perfil
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Cover Image Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Imagen de Portada</h4>
                  <div className="space-y-4">
                    <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden border-2 border-dashed border-border">
                      {user?.coverImage || coverImagePreview ? (
                        <img
                          src={coverImagePreview || user?.coverImage}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <div className="text-center text-white">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-70" />
                            <p className="text-sm">Sin imagen de portada</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.querySelectorAll('input[type="file"]')[1]?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Cambiar Portada
                      </Button>
                      {coverImagePreview && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleCoverImageUpload}
                          disabled={uploadCoverMutation.isPending}
                        >
                          {uploadCoverMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Preparar Imagen
                            </>
                          )}
                        </Button>
                      )}
                      {(user?.coverImage || coverImagePreview) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCoverImagePreview(null);
                            setCoverImageFile(null);
                            // Aquí puedes agregar lógica para eliminar la imagen de portada del servidor
                            toast({
                              title: "Funcionalidad pendiente",
                              description: "La eliminación de imagen se implementará próximamente",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 1200x400 píxeles. Formatos: JPG, PNG, GIF (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Save Status */}
            {updateProfileMutation.isPending && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Guardando cambios...</span>
              </div>
            )}
          </Tabs>
          
          <div className="flex justify-end p-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAllChanges}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  
  {/* Change Password Dialog */}
  <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogDescription>
          Actualiza tu contraseña para mantener tu cuenta segura.
        </DialogDescription>
      </DialogHeader>
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña actual</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
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
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
  
  {/* Change Password Dialog */}
  <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogDescription>
          Actualiza tu contraseña para mantener tu cuenta segura.
        </DialogDescription>
      </DialogHeader>
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña actual</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
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
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>

      {/* Modal de edición de imagen */}
      <Dialog open={isImageEditorOpen} onOpenChange={setIsImageEditorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Imagen</DialogTitle>
            <DialogDescription>
              Ajusta la posición y el tamaño de la imagen usando los controles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Vista previa de la imagen */}
            <div className="flex justify-center">
              <div className="relative w-96 h-96 border-2 border-dashed border-muted-foreground rounded-lg overflow-hidden bg-muted">
                {imageToEdit && (
                  <div 
                    className="absolute inset-0 cursor-move"
                    style={{
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: 'center'
                    }}
                  >
                    <img
                      src={imageToEdit}
                      alt="Imagen para editar"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Controles de edición */}
            <div className="space-y-4">
              {/* Control de escala */}
              <div className="space-y-2">
                <Label>Tamaño: {Math.round(imageScale * 100)}%</Label>
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImageScale(Math.max(0.5, imageScale - 0.1))}
                  >
                    -
                  </Button>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImageScale(Math.min(2, imageScale + 0.1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Controles de posición */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posición horizontal</Label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={imagePosition.x}
                    onChange={(e) => setImagePosition({ ...imagePosition, x: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Posición vertical</Label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={imagePosition.y}
                    onChange={(e) => setImagePosition({ ...imagePosition, y: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageScale(1);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                >
                  Resetear
                </Button>
                <Button
                  onClick={() => {
                    setIsImageEditorOpen(false);
                    toast({
                      title: "Imagen editada",
                      description: "Los cambios se han aplicado correctamente",
                    });
                  }}
                >
                  Aplicar cambios
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}