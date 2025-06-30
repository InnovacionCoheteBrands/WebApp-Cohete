// ===== IMPORTACIONES PARA SISTEMA DE AUTENTICACIÓN =====
// React Context: Para compartir estado de autenticación en toda la app
import { createContext, ReactNode, useContext } from "react";
// TanStack Query: Para manejo de estados de servidor (carga, mutaciones, cache)
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
// Tipos del esquema compartido
import { InsertUser, User } from "@shared/schema";

// ===== TIPOS LOCALES =====
// Datos requeridos para el login
type LoginData = {
  username: string; // Nombre de usuario
  password: string; // Contraseña
};

// Utilidades para realizar peticiones HTTP
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
// Hook para mostrar notificaciones
import { useToast } from "@/hooks/use-toast";

// ===== DEFINICIÓN DEL CONTEXTO DE AUTENTICACIÓN =====
// Tipo que define toda la información y funciones disponibles en el contexto
type AuthContextType = {
  user: Omit<User, 'password'> | null; // Información del usuario (sin contraseña)
  isLoading: boolean; // Estado de carga
  error: Error | null; // Error de autenticación si existe
  loginMutation: UseMutationResult<Omit<User, 'password'>, Error, LoginData>; // Mutación para login
  logoutMutation: UseMutationResult<void, Error, void>; // Mutación para logout
  registerMutation: UseMutationResult<Omit<User, 'password'>, Error, InsertUser>; // Mutación para registro
};

// Crear contexto de React para compartir estado de autenticación
export const AuthContext = createContext<AuthContextType | null>(null);

// ===== COMPONENTE PROVEEDOR DE AUTENTICACIÓN =====
// Proporciona contexto de autenticación a todos los componentes hijos
export function AuthProvider({ children }: { children: ReactNode }) {
  // Hook para mostrar notificaciones toast
  const { toast } = useToast();
  
  // ===== QUERY PARA OBTENER USUARIO ACTUAL =====
  // Consulta el estado de autenticación del usuario
  const {
    data: user, // Datos del usuario autenticado
    error, // Error si falla la consulta
    isLoading, // Estado de carga
  } = useQuery<Omit<User, 'password'> | null, Error>({
    queryKey: ["/api/user"], // Clave única para el cache
    queryFn: getQueryFn({ on401: "returnNull" }), // Función que maneja respuestas 401 como null
  });

  // Log de debug para monitorear el estado de autenticación
  console.log("Auth state:", { user: user?.username, isLoading, error });

  // ===== MUTACIÓN DE LOGIN =====
  // Maneja el proceso de inicio de sesión
  const loginMutation = useMutation({
    // Función que ejecuta la petición de login
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    // Callback ejecutado cuando el login es exitoso
    onSuccess: (user: Omit<User, 'password'>) => {
      // Actualizar el cache con la información del usuario
      queryClient.setQueryData(["/api/user"], user);
      // Mostrar notificación de éxito
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    // Callback ejecutado cuando el login falla
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: Omit<User, 'password'>) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}