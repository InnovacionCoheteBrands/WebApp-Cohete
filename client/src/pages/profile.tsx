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
import { apiRequest } from "@/lib/queryClient";
import { Camera, Upload, User, Loader2, Settings, Plus, X, MapPin, Briefcase, Heart, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
}

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

  // Fetch user profile
  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user"],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      return apiRequest("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Upload cover image mutation
  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("coverImage", file);
      return apiRequest("/api/user/cover-image", {
        method: "POST",
        body: formData,
      });
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
      uploadCoverMutation.mutate(coverImageFile);
    }
  };

  const handleFieldUpdate = (field: keyof UserProfile, value: any) => {
    updateProfileMutation.mutate({ [field]: value });
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

              {/* Cover Image Upload Button */}
              <div className="absolute top-4 right-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-upload"
                />
                <Label htmlFor="cover-upload">
                  <Button size="sm" className="cursor-pointer" asChild>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      Cambiar Portada
                    </span>
                  </Button>
                </Label>
              </div>

              {/* Upload Cover Button */}
              {coverImagePreview && (
                <div className="absolute bottom-4 right-4">
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
                </div>
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
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Profile Picture Change Button */}
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Avatar</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 p-4">
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
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="professional">Información Profesional</TabsTrigger>
            <TabsTrigger value="custom">Campos Personalizados</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
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
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      defaultValue={user?.fullName}
                      onBlur={(e) => handleFieldUpdate('fullName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      defaultValue={user?.username}
                      onBlur={(e) => handleFieldUpdate('username', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      onBlur={(e) => handleFieldUpdate('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Teléfono</Label>
                    <Input
                      id="phoneNumber"
                      defaultValue={user?.phoneNumber}
                      onBlur={(e) => handleFieldUpdate('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    placeholder="Cuéntanos sobre ti..."
                    defaultValue={user?.bio}
                    onBlur={(e) => handleFieldUpdate('bio', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-6">
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
                    <Label htmlFor="jobTitle">Cargo</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Ej: Gerente de Marketing"
                      defaultValue={user?.jobTitle}
                      onBlur={(e) => handleFieldUpdate('jobTitle', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      placeholder="Ej: Marketing Digital"
                      defaultValue={user?.department}
                      onBlur={(e) => handleFieldUpdate('department', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Fields Tab */}
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

        {/* Save Status */}
        {updateProfileMutation.isPending && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Guardando cambios...</span>
          </div>
        )}
      </div>
    </div>
  );
}