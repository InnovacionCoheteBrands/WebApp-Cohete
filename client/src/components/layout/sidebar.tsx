import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Rocket, 
  LayoutDashboard,
  Grid2X2,
  Image,
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
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card/95 backdrop-blur-sm shadow-lg md:static md:z-0 transform transition-all duration-300 ease-in-out dark:border-r-[#2a3349] dark-glow",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col space-y-4 p-4 h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gradient-to-br dark:from-[#2a6395] dark:to-[#1a3b62]">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight dark:text-[#65cef5]">Cohete Workflow</h1>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Gestión de Marketing</p>
            </div>
            {/* Close button - mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden interactive-element dark:hover:bg-[#2e3a54]"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
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
              isActive={location === "/projects" || location.startsWith("/projects/")} 
              onClick={onClose}
            />
            <NavItem 
              href="/images" 
              icon={<Image className="mr-2 h-5 w-5" />} 
              label="Imágenes Generadas" 
              isActive={location === "/images"} 
              onClick={onClose}
            />
            <NavItem 
              href="/calendar-creator" 
              icon={<CalendarPlus className="mr-2 h-5 w-5" />} 
              label="Calendario Avanzado" 
              isActive={location === "/calendar-creator"} 
              onClick={onClose}
            />
            <NavItem 
              href="/analytics" 
              icon={<LineChart className="mr-2 h-5 w-5" />} 
              label="Analíticas" 
              isActive={location === "/analytics"} 
              onClick={onClose}
            />
            <NavItem 
              href="/tasks" 
              icon={<ListChecks className="mr-2 h-5 w-5" />} 
              label="Gestor de Tareas" 
              isActive={location === "/tasks"} 
              onClick={onClose}
            />

            {/* Admin section for Primary users only */}
            {isPrimary && (
              <div className="mt-4 border-t pt-4 dark:border-t-[#2a3349]">
                <h2 className="mb-1 px-3 text-xs font-medium text-muted-foreground dark:text-[#65cef5]">
                  Administración
                </h2>
                <NavItem 
                  href="/users" 
                  icon={<Users className="mr-2 h-5 w-5" />} 
                  label="Gestión de Usuarios" 
                  isActive={location === "/users"} 
                  onClick={onClose}
                />
                <NavItem 
                  href="/settings" 
                  icon={<Settings className="mr-2 h-5 w-5" />} 
                  label="Configuración" 
                  isActive={location === "/settings"} 
                  onClick={onClose}
                />
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="mt-auto border-t pt-4 dark:border-t-[#2a3349]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-[#1e293b] dark:shadow-[0_0_10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.4)] dark:border dark:border-[#2a3349] dark:hover:border-[#3e4a6d]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground shadow-sm dark:from-[#2a6395] dark:to-[#1a3b62] dark:shadow-[0_0_10px_rgba(42,99,149,0.3)]">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[120px] dark:text-white">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 dark:text-slate-400">
                  <span className={cn(
                    "h-2 w-2 rounded-full", 
                    user?.isPrimary ? "bg-green-500 dark:bg-green-400 dark:shadow-[0_0_5px_rgba(74,222,128,0.5)]" : "bg-blue-500 dark:bg-[#65cef5] dark:shadow-[0_0_5px_rgba(101,206,245,0.5)]"
                  )}></span>
                  {user?.isPrimary ? 'Usuario Principal' : 'Usuario Secundario'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto rounded-md p-1.5 hover:bg-accent interactive-element dark:hover:bg-[#2e3a54] dark:text-slate-400 dark:hover:text-white"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
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
          "flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
          isActive
            ? "bg-accent text-accent-foreground shadow-sm dark:bg-[#1e293b] dark:text-white dark:shadow-[0_0_10px_rgba(0,0,0,0.2)]"
            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground interactive-element dark:text-slate-400 dark:hover:bg-[#1e293b]/70 dark:hover:text-white"
        )}
        onClick={onClick}
      >
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary dark:bg-[#65cef5] dark:shadow-[0_0_5px_rgba(101,206,245,0.5)]" />
        )}
        <div className="flex items-center w-full">
          <div className={cn(
            "mr-2", 
            isActive 
              ? "text-primary dark:text-[#65cef5]" 
              : "dark:group-hover:text-[#65cef5] transition-colors duration-200"
          )}>
            {icon}
          </div>
          <span className={isActive ? "" : "dark:group-hover:text-white transition-colors duration-200"}>
            {label}
          </span>
          {isActive && (
            <div className="ml-auto">
              <div className="h-2 w-2 rounded-full bg-primary dark:bg-[#65cef5] dark:shadow-[0_0_5px_rgba(101,206,245,0.5)]" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
