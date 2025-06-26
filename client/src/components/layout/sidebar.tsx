import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Rocket, 
  LayoutDashboard,
  Grid2X2,
  LineChart,
  Users,
  Settings,
  LogOut,
  X,
  ListChecks,
  Calendar,
  CalendarPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isPrimary = user?.isPrimary;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card/95 backdrop-blur-sm shadow-lg md:static md:z-0 transform transition-all duration-300 ease-in-out overflow-hidden",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        data-tour="main-navigation"
      >
        <div className="flex flex-col p-4 h-full overflow-hidden hide-scrollbar">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm transition-all duration-200 hover:shadow-md">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-tight text-primary">Cohete Workflow</h1>
              <p className="text-xs text-muted-foreground">Gestión de Marketing</p>
            </div>
            {/* Close button - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden interactive-element"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-1 flex-1 min-h-0">
            <NavItem 
              href="/" 
              icon={<LayoutDashboard className="mr-2 h-5 w-5" />} 
              label="Dashboard" 
              isActive={location === "/"} 
              onClick={onClose}
            />
            <NavItem 
              href="/projects" 
              icon={<Grid2X2 className="mr-2 h-5 w-5" />} 
              label="Proyectos" 
              isActive={location === "/projects" || (location.startsWith("/projects/") && !location.includes("/tasks"))} 
              onClick={onClose}
            />

            <NavItem 
              href="/calendar-creator" 
              icon={<CalendarPlus className="mr-2 h-5 w-5" />} 
              label="Calendario Avanzado" 
              isActive={location === "/calendar-creator"} 
              onClick={onClose}
            />
            {/* Temporalmente oculto hasta implementar integraciones con redes sociales */}
            {/* <NavItem 
              href="/analytics" 
              icon={<LineChart className="mr-2 h-5 w-5" />} 
              label="Analíticas" 
              isActive={location === "/analytics"} 
              onClick={onClose}
            /> */}
            <NavItem 
              href="/project-manager" 
              icon={<ListChecks className="mr-2 h-5 w-5" />} 
              label="Gestor de Proyectos" 
              isActive={location === "/project-manager"} 
              onClick={onClose}
            />

            {/* Admin section for Primary users only */}
            {isPrimary && (
              <div className="mt-3 border-t pt-3">
                <h2 className="mb-1 px-3 text-xs font-medium text-primary">
                  Administración
                </h2>
                <NavItem 
                  href="/users" 
                  icon={<Users className="mr-2 h-4 w-4" />} 
                  label="Gestión de Usuarios" 
                  isActive={location === "/users"} 
                  onClick={onClose}
                />
                <NavItem 
                  href="/settings" 
                  icon={<Settings className="mr-2 h-4 w-4" />} 
                  label="Configuración" 
                  isActive={location === "/settings"} 
                  onClick={onClose}
                />
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="border-t pt-3 mt-auto">
            <Link href="/profile">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-sm">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full", 
                      user?.isPrimary ? "bg-green-500" : "bg-primary"
                    )}></span>
                    Mi Perfil
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-md p-1 hover:bg-accent interactive-element opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden group",
          isActive
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground interactive-element"
        )}
        onClick={onClick}
      >
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary" />
        )}
        <div className="flex items-center w-full">
          <div className={cn(
            "mr-2", 
            isActive 
              ? "text-primary" 
              : "group-hover:text-primary transition-colors duration-200"
          )}>
            {icon}
          </div>
          <span className={isActive ? "" : "group-hover:text-foreground transition-colors duration-200"}>
            {label}
          </span>
          {isActive && (
            <div className="ml-auto">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
