import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateProfile, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar el perfil");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      toast({
        title: "Perfil actualizado",
        description: "Tus datos de perfil se han actualizado correctamente",
      });
      
      // Actualizar la caché del usuario actual
      queryClient.setQueryData(["/api/user"], data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/profile/change-password", { currentPassword, newPassword });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al cambiar la contraseña");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Esta función podría manejar la carga de imágenes de perfil si se necesita
  const uploadProfileImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      // Simulamos un retraso para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 1000));

      // En una implementación real, aquí enviaríamos la imagen a un endpoint
      // y obtendríamos la URL de la imagen almacenada
      const imageUrl = URL.createObjectURL(file);
      
      // Actualizamos el perfil con la nueva URL de imagen
      await updateProfileMutation.mutateAsync({ profileImage: imageUrl });
      
      return imageUrl;
    } catch (error) {
      toast({
        title: "Error al subir imagen",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al subir la imagen",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    uploadProfileImage,
    isUpdating: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUploading,
    user
  };
}