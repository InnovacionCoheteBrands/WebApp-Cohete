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
import { ProtectedRoute } from "./lib/protected-route";
import MainLayout from "./layouts/main-layout";
import { AuthProvider } from "./hooks/use-auth";
import CopilotButton from "@/components/copilot/copilot-button";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
          
          {/* Public routes */}
          <Route path="/auth" component={AuthPage} />
          
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
