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
      const res = await apiRequest("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error de conexión" }));
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
      const res = await apiRequest("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
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

  // Esta función maneja la carga de imágenes de perfil
  const uploadProfileImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      // Enviar la imagen al endpoint
      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir la imagen");
      }

      const data = await response.json();
      
      // Actualizamos el perfil con la nueva URL de imagen
      await updateProfileMutation.mutateAsync({ profileImage: data.profileImage });
      
      toast({
        title: "Imagen actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });
      
      return data.profileImage;
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