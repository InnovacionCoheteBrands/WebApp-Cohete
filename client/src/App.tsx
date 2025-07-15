// ===== IMPORTACIONES DE ROUTING =====
// Wouter: Librería de routing ligera para React
import { Switch, Route } from "wouter";

// ===== IMPORTACIONES DE GESTIÓN DE ESTADO =====
// React Query: Para manejo de estado del servidor y cache
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

// ===== IMPORTACIONES DE COMPONENTES UI =====
// Toaster: Para mostrar notificaciones/mensajes
import { Toaster } from "@/components/ui/toaster";

// ===== IMPORTACIONES DE PÁGINAS =====
// Página 404 cuando no se encuentra la ruta
import NotFound from "@/pages/not-found";
// Páginas de autenticación
import AuthPage from "@/pages/auth-page";
import CreateAccount from "@/pages/create-account";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import CreatePrimaryUser from "@/pages/create-primary-user";
// Páginas principales de la aplicación
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ScheduleDetail from "@/pages/schedule-detail";
import CalendarCreator from "@/pages/calendar-creator";
import QuickCalendar from "@/pages/quick-calendar";
import TaskManager from "@/pages/task-manager";
import TaskManagerPage from "@/pages/task-manager-page";
import ProjectManager from "@/pages/project-manager";
import UserManagementPage from "@/pages/user-management";
import Analytics from "@/pages/analytics";
import Profile from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import ProjectImageAnalysisPage from "@/pages/project-image-analysis";
import Calendars from "@/pages/calendars";

// ===== IMPORTACIONES DE COMPONENTES Y PROVIDERS =====
// Componente para proteger rutas que requieren autenticación
import { ProtectedRoute } from "./lib/protected-route";
// Layout principal de la aplicación
import MainLayout from "./layouts/main-layout";
// Providers para contextos globales
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { AppTourProvider } from "./hooks/use-app-tour";
// Botón del asistente AI
import CopilotButton from "@/components/copilot/copilot-button";

// ===== COMPONENTE PRINCIPAL DE LA APLICACIÓN =====
function App() {
  console.log("App component rendering...");
  
  return (
    // ===== PROVIDERS ANIDADOS =====
    // QueryClientProvider: Proporciona el cliente de React Query a toda la app
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider: Maneja el sistema de temas (claro/oscuro/sistema) */}
      <ThemeProvider defaultTheme="light">
        {/* AuthProvider: Maneja el estado de autenticación del usuario */}
        <AuthProvider>
          {/* AppTourProvider: Maneja los tours guiados de la aplicación */}
          <AppTourProvider>
            {/* Container principal con altura mínima y color de fondo dinámico */}
            <div style={{ minHeight: '100vh', backgroundColor: 'hsl(220 14% 96%)' }}>
              {/* ===== SISTEMA DE ROUTING ===== */}
              {/* Switch: Renderiza solo la primera ruta que coincida */}
              <Switch>
                {/* ===== RUTAS DE AUTENTICACIÓN ===== */}
                {/* Estas rutas no requieren autenticación previa */}
                {/* Página principal de login/autenticación */}
                <Route path="/auth" component={AuthPage} />
                {/* Página para crear nueva cuenta de usuario */}
                <Route path="/create-account" component={CreateAccount} />
                {/* Página para solicitar recuperación de contraseña */}
                <Route path="/forgot-password" component={ForgotPassword} />
                {/* Página para restablecer contraseña con token */}
                <Route path="/reset-password" component={ResetPassword} />
                {/* Página especial para crear el primer usuario administrador */}
                <Route path="/create-primary-user" component={CreatePrimaryUser} />

                {/* ===== RUTAS PROTEGIDAS ===== */}
                {/* Todas estas rutas requieren autenticación válida */}
                
                {/* Ruta raíz: Dashboard principal de la aplicación */}
                <Route path="/">
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Página de listado de todos los proyectos */}
                <Route path="/projects">
                  <ProtectedRoute>
                    <MainLayout>
                      <Projects />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Página de detalle específico de un proyecto */}
                {/* Recibe el ID del proyecto como parámetro de URL */}
                <Route path="/projects/:id">
                  {(params) => (
                    <ProtectedRoute>
                      <MainLayout>
                        <ProjectDetail id={parseInt(params.id)} />
                      </MainLayout>
                    </ProtectedRoute>
                  )}
                </Route>
                
                {/* Página de detalle de un cronograma específico dentro de un proyecto */}
                {/* Recibe tanto el ID del proyecto como el ID del cronograma */}
                <Route path="/projects/:id/schedule/:scheduleId">
                  {(params) => (
                    <ProtectedRoute>
                      <MainLayout>
                        <ScheduleDetail 
                          projectId={parseInt(params.id)}
                          scheduleId={parseInt(params.scheduleId)}
                        />
                      </MainLayout>
                    </ProtectedRoute>
                  )}
                </Route>
                
                {/* Página de análisis de imágenes para un proyecto específico */}
                {/* Permite analizar imágenes de marketing usando IA */}
                <Route path="/projects/:id/image-analysis">
                  {(params) => (
                    <ProtectedRoute>
                      <MainLayout>
                        <ProjectImageAnalysisPage projectId={parseInt(params.id)} />
                      </MainLayout>
                    </ProtectedRoute>
                  )}
                </Route>
                
                {/* Página del creador de calendarios de contenido */}
                {/* Herramienta principal para generar cronogramas con IA */}
                <Route path="/calendar-creator">
                  <ProtectedRoute>
                    <MainLayout>
                      <CalendarCreator />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Página de calendarios */}
                {/* Página de selección entre calendario rápido y avanzado */}
                <Route path="/calendars">
                  <ProtectedRoute>
                    <MainLayout>
                      <Calendars />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Página de calendario rápido */}
                {/* Version simplificada del creador de calendarios */}
                <Route path="/quick-calendar">
                  <ProtectedRoute>
                    <MainLayout>
                      <QuickCalendar />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Gestión de tareas - versión principal */}
                <Route path="/task-manager">
                  <ProtectedRoute>
                    <MainLayout>
                      <TaskManager />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Gestión de tareas - página alternativa */}
                {/* Implementación diferente del gestor de tareas */}
                <Route path="/task-manager-page">
                  <ProtectedRoute>
                    <MainLayout>
                      <TaskManagerPage />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Gestión de proyectos - vista de administración */}
                {/* Herramientas avanzadas para gestionar proyectos */}
                <Route path="/project-manager">
                  <ProtectedRoute>
                    <MainLayout>
                      <ProjectManager />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                {/* Gestión de usuarios del sistema */}
                {/* Solo accesible para usuarios administradores */}
                <Route path="/users-management">
                  <ProtectedRoute>
                    <MainLayout>
                      <UserManagementPage />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>

                {/* Página de análisis y métricas */}
                {/* Dashboard con estadísticas de proyectos y rendimiento */}
                <Route path="/analytics">
                  <ProtectedRoute>
                    <MainLayout>
                      <Analytics />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>

                {/* Página de perfil de usuario */}
                {/* Configuración personal del usuario */}
                <Route path="/profile">
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>

                {/* Página de configuración general del sistema */}
                <Route path="/settings">
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>

                {/* ===== RUTA POR DEFECTO ===== */}
                {/* Página 404 - Se muestra cuando ninguna ruta coincide */}
                <Route component={NotFound} />
              </Switch>
              
              {/* ===== COMPONENTES GLOBALES ===== */}
              {/* Botón del asistente AI - Disponible en todas las páginas */}
              <CopilotButton />
              {/* Sistema de notificaciones toast - Muestra mensajes flotantes */}
              <Toaster />
            </div>
          </AppTourProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Exportación por defecto del componente principal
export default App;