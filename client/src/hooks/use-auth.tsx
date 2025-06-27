import { useState, useEffect, useContext, createContext, ReactNode, useCallback, useRef } from "react";

interface User {
  id: string;
  fullName: string;
  username: string;
  isPrimary: boolean;
  role: string;
  profileImage?: string;
  jobTitle?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authCheckRef = useRef<Promise<void> | null>(null);
  const lastAuthCheck = useRef<number>(0);

  const checkAuth = useCallback(async (force = false) => {
    // Evitar múltiples llamadas simultáneas
    if (authCheckRef.current && !force) {
      return authCheckRef.current;
    }

    // Cache durante 30 segundos
    const now = Date.now();
    if (!force && now - lastAuthCheck.current < 30000 && user) {
      return;
    }

    authCheckRef.current = (async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setError(null);
          lastAuthCheck.current = now;
        } else {
          setUser(null);
          if (response.status !== 401) {
            setError("Error de autenticación");
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
        authCheckRef.current = null;
      }
    })();

    return authCheckRef.current;
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        lastAuthCheck.current = Date.now();
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error de inicio de sesión");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error de conexión");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
      lastAuthCheck.current = 0;
    }
  };

  const refreshUser = async () => {
    await checkAuth(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}