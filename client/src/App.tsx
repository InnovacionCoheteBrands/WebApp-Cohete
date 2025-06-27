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
import QuickCalendar from "@/pages/quick-calendar";
import TaskManager from "@/pages/task-manager";
import TaskManagerPage from "@/pages/task-manager-page";
import ProjectManager from "@/pages/project-manager";
import UserManagement from "@/pages/user-management";
import Analytics from "@/pages/analytics";
import CreateAccount from "@/pages/create-account";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import CreatePrimaryUser from "@/pages/create-primary-user";
import Profile from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import ProjectImageAnalysisPage from "@/pages/project-image-analysis";
import { ProtectedRoute } from "./lib/protected-route";
import MainLayout from "./layouts/main-layout";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import CopilotButton from "@/components/copilot/copilot-button";
import { AppTourProvider } from "./hooks/use-app-tour";

function App() {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <AppTourProvider>
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
              <Switch>
                {/* Auth routes - no protection needed */}
                <Route path="/auth" component={AuthPage} />
                <Route path="/create-account" component={CreateAccount} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/create-primary-user" component={CreatePrimaryUser} />

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
                
                <Route path="/projects/:id/image-analysis">
                  {(params) => (
                    <ProtectedRoute>
                      <MainLayout>
                        <ProjectImageAnalysisPage projectId={parseInt(params.id)} />
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
                
                <Route path="/quick-calendar">
                  <ProtectedRoute>
                    <MainLayout>
                      <QuickCalendar />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                <Route path="/task-manager">
                  <ProtectedRoute>
                    <MainLayout>
                      <TaskManager />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                <Route path="/task-manager-page">
                  <ProtectedRoute>
                    <MainLayout>
                      <TaskManagerPage />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                <Route path="/project-manager">
                  <ProtectedRoute>
                    <MainLayout>
                      <ProjectManager />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>
                
                <Route path="/user-management">
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

                <Route path="/settings">
                  <ProtectedRoute>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                </Route>

                {/* 404 Not Found */}
                <Route component={NotFound} />
              </Switch>
              
              <CopilotButton />
              <Toaster />
            </div>
          </AppTourProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;