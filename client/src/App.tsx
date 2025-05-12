import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ScheduleDetail from "@/pages/schedule-detail";
import CalendarCreator from "@/pages/calendar-creator";
import TaskManager from "@/pages/task-manager";
import UserManagement from "@/pages/user-management";
import Analytics from "@/pages/analytics";
import CreateAccount from "@/pages/create-account";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import CreatePrimaryUser from "@/pages/create-primary-user";
import Profile from "@/pages/profile";
import { ProtectedRoute } from "./lib/protected-route";
import MainLayout from "./layouts/main-layout";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import CopilotButton from "@/components/copilot/copilot-button";
import { useAppTour, AppTourType } from "./hooks/use-app-tour";
import { createContext, useContext } from "react";

// Crear un contexto para el tour que pueda ser accedido desde cualquier componente
export type AppTourContextType = {
  startTour: (type?: AppTourType) => void;
  tourType: AppTourType;
  run: boolean;
  setRun: (run: boolean) => void;
};

export const AppTourContext = createContext<AppTourContextType | null>(null);

export const useAppTourContext = () => {
  const context = useContext(AppTourContext);
  if (!context) {
    throw new Error("useAppTourContext debe ser usado dentro de un AppTourProvider");
  }
  return context;
};

function AppContent() {
  return (
    <>
      <Switch>
        {/* Protected routes */}
        <Route path="/">
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/projects">
          <ProtectedRoute>
            <MainLayout>
              <Projects />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        <Route path="/projects/:id">
          {(params) => (
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetail id={parseInt(params.id)} />
              </MainLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/schedules/:id">
          {(params) => (
            <ProtectedRoute>
              <MainLayout>
                <ScheduleDetail id={parseInt(params.id)} />
              </MainLayout>
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/calendar-creator">
          <ProtectedRoute>
            <MainLayout>
              <CalendarCreator />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route path="/tasks">
          <ProtectedRoute>
            <MainLayout>
              <TaskManager />
            </MainLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/users">
          <ProtectedRoute>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/analytics">
          <ProtectedRoute>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/profile">
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/cohete_account" component={CreateAccount} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/create-user" component={CreatePrimaryUser} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
      {/* Copilot Button (visible on all protected routes) */}
      <Route path="*">
        {(params) => {
          // Don't show on auth page or not found
          if (params["*"] === "auth") return null;
          return <CopilotButton />;
        }}
      </Route>
    </>
  );
}

function AppTourProvider({ children }: { children: React.ReactNode }) {
  const { startTour, tourType, run, setRun, TourComponent } = useAppTour();
  
  return (
    <AppTourContext.Provider value={{ startTour, tourType, run, setRun }}>
      {children}
      <TourComponent />
    </AppTourContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppTourProvider>
            <AppContent />
          </AppTourProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
